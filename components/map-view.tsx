"use client"

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapControls } from './map-controls'
import { LayerDrawer } from './layer-drawer'
import { FeatureDetails } from './feature-details'
import { DrawToolbar } from './draw-toolbar'
import { SelectionResults } from './selection-results'

// Dynamically import maplibre-gl to avoid SSR issues
let maplibregl: any = null
let Protocol: any = null

const loadMapLibre = async () => {
    if (!maplibregl) {
        const ml = await import('maplibre-gl')
        maplibregl = ml.default
    }
    if (!Protocol) {
        const pt = await import('pmtiles')
        Protocol = pt.Protocol
    }
}

export interface Feature {
    id: string
    properties: Record<string, any>
    geometry: {
        type: string
        coordinates: any
    }
}

export interface LayerConfig {
    id: string
    name: string
    type: 'fill' | 'line' | 'circle' | 'symbol'
    source: string
    sourceType: 'geojson' | 'pmtiles'
    sourceLayer?: string
    visible: boolean
    paint?: Record<string, any>
    layout?: Record<string, any>
    zIndex?: number
}

export interface UIPositionConfig {
    layerDrawer?: 'left' | 'right' | 'bottom'
    drawToolbar?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    mapControls?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export interface MapViewProps {
    layers?: LayerConfig[]
    baseMapConfigs?: {
        styles: Array<{ id: string; name: string; url: string }>
        defaultStyle: string
    }
    enableSelection?: boolean
    enableDrawSelection?: boolean
    onSelectionChange?: (features: Feature[]) => void
    onFeatureSelect?: (feature: Feature) => void
    onDrawSelectionChange?: (features: Feature[]) => void
    center?: [number, number]
    zoom?: number
    uiPositions?: UIPositionConfig
}

// Default layer configuration for backward compatibility
const DEFAULT_LAYERS: LayerConfig[] = [
    {
        id: 'polygons',
        name: 'Lease Blocks',
        type: 'fill',
        source: 'lease-blocks',
        sourceType: 'geojson',
        visible: true,
        paint: {
            'fill-color': [
                'case',
                ['==', ['get', 'status'], 'Producing'], '#22c55e',
                ['==', ['get', 'status'], 'Development'], '#f59e0b',
                ['==', ['get', 'status'], 'Exploration'], '#3b82f6',
                '#6b7280'
            ],
            'fill-opacity': 0.4,
        },
        zIndex: 1,
    },
    {
        id: 'polygons-outline',
        name: 'Lease Blocks Outline',
        type: 'line',
        source: 'lease-blocks',
        sourceType: 'geojson',
        visible: true,
        paint: {
            'line-color': '#ffffff',
            'line-width': 1,
            'line-opacity': 0.6
        },
        zIndex: 2,
    },
    {
        id: 'lines',
        name: 'Pipelines',
        type: 'line',
        source: 'pipelines',
        sourceType: 'geojson',
        visible: true,
        paint: {
            'line-color': [
                'case',
                ['==', ['get', 'type'], 'Oil Export'], '#ef4444',
                ['==', ['get', 'type'], 'Gas Export'], '#8b5cf6',
                ['==', ['get', 'type'], 'Interfield'], '#06b6d4',
                '#f59e0b'
            ],
            'line-width': 3,
        },
        zIndex: 3,
    },
    {
        id: 'points',
        name: 'Active Alerts',
        type: 'circle',
        source: 'alerts',
        sourceType: 'geojson',
        visible: true,
        paint: {
            'circle-radius': [
                'case',
                ['==', ['get', 'severity'], 'High'], 10,
                ['==', ['get', 'severity'], 'Medium'], 8,
                6
            ],
            'circle-color': [
                'case',
                ['==', ['get', 'severity'], 'High'], '#ef4444',
                ['==', ['get', 'severity'], 'Medium'], '#f59e0b',
                ['==', ['get', 'severity'], 'Low'], '#22c55e',
                '#6b7280'
            ],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
        },
        zIndex: 4,
    },
]

const DEFAULT_BASE_MAP_CONFIGS = {
    styles: [
        { id: 'dark', name: 'Dark/Analytical', url: '/styles/dark.json' },
        { id: 'satellite', name: 'Satellite', url: '/styles/satellite.json' },
    ],
    defaultStyle: 'dark',
}

export function MapView({
    layers = DEFAULT_LAYERS,
    baseMapConfigs = DEFAULT_BASE_MAP_CONFIGS,
    enableSelection = true,
    enableDrawSelection = true,
    onSelectionChange,
    onFeatureSelect,
    onDrawSelectionChange,
    center = [-90.0, 27.5],
    zoom = 5,
    uiPositions = {
        layerDrawer: 'left',
        drawToolbar: 'top-right',
        mapControls: 'top-right'
    }
}: MapViewProps = {}) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<maplibregl.Map | null>(null)
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
    const [baseStyle, setBaseStyle] = useState<'dark' | 'satellite'>(baseMapConfigs.defaultStyle as 'dark' | 'satellite')
    const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>(
        layers.reduce((acc, layer) => ({ ...acc, [layer.id]: layer.visible }), {})
    )
    const [drawMode, setDrawMode] = useState<'none' | 'rectangle' | 'circle' | 'polygon'>('none')
    const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([])
    const [isDrawing, setIsDrawing] = useState(false)
    const drawStartPoint = useRef<{ x: number; y: number } | null>(null)
    const drawCanvas = useRef<HTMLCanvasElement | null>(null)

    // Get the style URL for the current base style
    const getStyleUrl = (style: string) => {
        const styleConfig = baseMapConfigs.styles.find(s => s.id === style)
        return styleConfig?.url || baseMapConfigs.styles[0].url
    }

    // Query features within a bounding box
    const queryFeaturesInBounds = async (bounds: { minLng: number; minLat: number; maxLng: number; maxLat: number }) => {
        if (!map.current) return []

        const interactiveLayers = layers.filter(l => l.type !== 'symbol').map(l => l.id)
        const features = map.current.queryRenderedFeatures({ layers: interactiveLayers })

        // Filter features within bounds
        const filtered = features.filter(feature => {
            if (feature.geometry.type === 'Point') {
                const [lng, lat] = feature.geometry.coordinates
                return lng >= bounds.minLng && lng <= bounds.maxLng && lat >= bounds.minLat && lat <= bounds.maxLat
            }
            return true // For now, include all non-point features
        })

        return filtered.map(f => ({
            id: f.id as string,
            properties: f.properties || {},
            geometry: f.geometry as any
        }))
    }

    // Handle draw mode changes
    const handleDrawModeChange = (mode: 'none' | 'rectangle' | 'circle' | 'polygon') => {
        setDrawMode(mode)
        setSelectedFeatures([])
    }

    // Clear selection
    const handleClearSelection = () => {
        setSelectedFeatures([])
        setDrawMode('none')
    }

    // Add sources dynamically based on layer configuration
    const addSources = () => {
        if (!map.current) return

        const uniqueSources = new Map<string, LayerConfig>()
        layers.forEach(layer => {
            if (!uniqueSources.has(layer.source)) {
                uniqueSources.set(layer.source, layer)
            }
        })

        uniqueSources.forEach((layer, sourceId) => {
            if (map.current?.getSource(sourceId)) return

            if (layer.sourceType === 'geojson') {
                map.current?.addSource(sourceId, {
                    type: 'geojson',
                    data: layer.source,
                    promoteId: 'id'
                })
            } else if (layer.sourceType === 'pmtiles') {
                map.current?.addSource(sourceId, {
                    type: 'vector',
                    url: `pmtiles://${layer.source}`,
                })
            }
        })
    }

    useEffect(() => {
        if (!mapContainer.current) return

        const initMap = async () => {
            await loadMapLibre()

            if (!maplibregl) return

            // Initialize PMTiles protocol
            const protocol = new Protocol()
            maplibregl.addProtocol('pmtiles', protocol.tile)

            // Create map
            map.current = new maplibregl.Map({
                container: mapContainer.current,
                style: getStyleUrl(baseStyle),
                center: center,
                zoom: zoom,
                pitch: 0,
                bearing: 0,
            })

            // Add sources and layers on map load
            if (map.current) {
                map.current.on('load', () => {
                    if (!map.current) return
                    addSources()
                    addLayers()
                    if (enableSelection) {
                        setupInteractivity()
                    }
                    if (enableDrawSelection) {
                        setupDrawSelection()
                    }
                })
            }
        }

        initMap()

        return () => {
            if (map.current) {
                map.current.remove()
            }
            if (maplibregl) {
                maplibregl.removeProtocol('pmtiles')
            }
        }
    }, [])

    const addLayers = () => {
        if (!map.current) return

        // Sort layers by zIndex for proper rendering order
        const sortedLayers = [...layers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

        sortedLayers.forEach(layerConfig => {
            // Skip if layer already exists
            if (map.current?.getLayer(layerConfig.id)) return

            const layerDef: any = {
                id: layerConfig.id,
                type: layerConfig.type,
                source: layerConfig.source,
            }

            if (layerConfig.sourceLayer) {
                layerDef['source-layer'] = layerConfig.sourceLayer
            }

            if (layerConfig.paint) {
                layerDef.paint = layerConfig.paint
            }

            if (layerConfig.layout) {
                layerDef.layout = layerConfig.layout
            }

            try {
                map.current?.addLayer(layerDef)
            } catch (error) {
                console.warn(`Failed to add layer ${layerConfig.id}:`, error)
            }
        })

        // Add highlight layer for selection if enabled
        if (enableSelection && !map.current.getLayer('highlight')) {
            map.current.addLayer({
                id: 'highlight',
                type: 'circle',
                source: 'alerts',
                filter: ['==', ['get', 'id'], ''],
                paint: {
                    'circle-radius': 14,
                    'circle-color': 'transparent',
                    'circle-stroke-color': '#00ffff',
                    'circle-stroke-width': 3,
                },
            })
        }
    }

    const setupInteractivity = () => {
        if (!map.current) return

        const interactiveLayers = layers.filter(l => l.type !== 'symbol').map(l => l.id)
        if (interactiveLayers.length === 0) return

        // Create a popup for hover tooltips
        const popup = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 15
        })

        // Hover effect with tooltip
        map.current.on('mousemove', interactiveLayers, (e: any) => {
            if (!map.current) return
            map.current.getCanvas().style.cursor = 'pointer'

            if (e.features && e.features.length > 0) {
                const feature = e.features[0]
                const props = feature.properties || {}
                const layerConfig = layers.find(l => l.id === feature.layer.id)

                // Build tooltip content - show first few properties
                let content = `<strong>${props.name || props.block_name || 'Feature'}</strong>`
                if (layerConfig?.name) {
                    content += `<br/><small>${layerConfig.name}</small>`
                }

                popup.setLngLat(e.lngLat)
                    .setHTML(content)
                    .addTo(map.current)
            }
        })

        map.current.on('mouseleave', interactiveLayers, () => {
            if (!map.current) return
            map.current.getCanvas().style.cursor = ''
            popup.remove()
        })

        // Click to select
        map.current.on('click', interactiveLayers, (e: any) => {
            if (e.features && e.features.length > 0) {
                const feature = e.features[0]
                const selectedFeat: Feature = {
                    id: feature.id as string,
                    properties: feature.properties || {},
                    geometry: feature.geometry as any,
                }
                setSelectedFeature(selectedFeat)
                onFeatureSelect?.(selectedFeat)

                // Update highlight filter
                if (map.current && map.current.getLayer('highlight')) {
                    map.current.setFilter('highlight', ['==', ['get', 'name'], feature.properties?.name || ''])
                }
            }
        })

        // Click empty space to deselect
        map.current.on('click', (e: any) => {
            const features = map.current!.queryRenderedFeatures(e.point, { layers: interactiveLayers })
            if (features.length === 0) {
                setSelectedFeature(null)
                if (map.current && map.current.getLayer('highlight')) {
                    map.current.setFilter('highlight', ['==', ['get', 'name'], ''])
                }
            }
        })
    }

    const setupDrawSelection = () => {
        if (!map.current) return

        // Handle mouse down for drawing
        map.current.on('mousedown', (e: any) => {
            if (drawMode === 'none') return
            setIsDrawing(true)
            drawStartPoint.current = { x: e.originalEvent.clientX, y: e.originalEvent.clientY }
        })

        // Handle mouse up for drawing
        map.current.on('mouseup', async (e: any) => {
            if (!isDrawing || drawMode === 'none' || !drawStartPoint.current) return
            setIsDrawing(false)

            const endPoint = { x: e.originalEvent.clientX, y: e.originalEvent.clientY }
            const startLngLat = map.current!.unproject([drawStartPoint.current.x, drawStartPoint.current.y])
            const endLngLat = map.current!.unproject([endPoint.x, endPoint.y])

            // Query features within bounds
            const bounds = {
                minLng: Math.min(startLngLat.lng, endLngLat.lng),
                maxLng: Math.max(startLngLat.lng, endLngLat.lng),
                minLat: Math.min(startLngLat.lat, endLngLat.lat),
                maxLat: Math.max(startLngLat.lat, endLngLat.lat),
            }

            const features = await queryFeaturesInBounds(bounds)
            setSelectedFeatures(features)
            onDrawSelectionChange?.(features)
            drawStartPoint.current = null
        })
    }

    const toggleLayer = (layerId: string) => {
        setVisibleLayers(prev => ({
            ...prev,
            [layerId]: !prev[layerId],
        }))

        if (map.current) {
            try {
                if (map.current.getLayer(layerId)) {
                    map.current.setLayoutProperty(
                        layerId,
                        'visibility',
                        visibleLayers[layerId] ? 'none' : 'visible'
                    )
                }
            } catch (error) {
                console.warn('Could not toggle layer:', layerId, error)
            }
        }
    }

    const changeBaseStyle = (style: string) => {
        setBaseStyle(style as 'dark' | 'satellite')
        if (map.current) {
            map.current.setStyle(getStyleUrl(style))
            // Use 'idle' event instead of 'style.load' for more reliable layer addition
            map.current.once('idle', () => {
                if (!map.current) return

                console.log('Style changed to:', style, '- re-adding layers')

                try {
                    addSources()
                    addLayers()
                    if (enableSelection) {
                        setupInteractivity()
                    }
                    console.log('Layers re-added successfully')
                } catch (error) {
                    console.error('Error re-adding layers after style change:', error)
                }
            })
        }
    }

    return (
        <div className="relative h-full w-full overflow-hidden bg-black">
            <div ref={mapContainer} className="h-full w-full" />

            {/* Map Controls - Top Right */}
            <div className="absolute top-4 right-4 z-20">
                <MapControls
                    baseStyle={baseStyle}
                    onStyleChange={changeBaseStyle}
                    styles={baseMapConfigs.styles}
                />
            </div>

            {/* Layer Drawer - Left Corner (Inside Map) */}
            <div className="absolute left-4 top-4 z-20">
                <LayerDrawer
                    visibleLayers={visibleLayers}
                    onToggleLayer={toggleLayer}
                    layers={layers}
                />
            </div>

            {/* Draw Toolbar - Top Right (Below Map Controls) */}
            {enableDrawSelection && (
                <div className="absolute top-4 right-64 z-20">
                    <DrawToolbar
                        drawMode={drawMode}
                        onModeChange={handleDrawModeChange}
                        onClear={handleClearSelection}
                        selectedCount={selectedFeatures.length}
                    />
                </div>
            )}

            {/* Selection Results - Top Right */}
            {selectedFeatures.length > 0 && (
                <div className="absolute top-4 right-4 z-20">
                    <SelectionResults
                        features={selectedFeatures}
                        onClose={handleClearSelection}
                        onZoomTo={(feature) => {
                            if (map.current && feature.geometry.type === 'Point') {
                                const [lng, lat] = feature.geometry.coordinates
                                map.current.flyTo({ center: [lng, lat], zoom: 10 })
                            }
                        }}
                    />
                </div>
            )}

            {/* Feature Details Modal */}
            {selectedFeature && <FeatureDetails feature={selectedFeature} onClose={() => setSelectedFeature(null)} />}
        </div>
    )
}

