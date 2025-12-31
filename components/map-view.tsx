"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { LayerDrawer } from './layer-drawer'
import { SelectionToolbar, type DrawMode } from './selection-toolbar'
import { FeatureDetailsPanel } from './feature-details-panel'
import { AIInsightsPanel } from './ai-insights-panel'
import { DrawingCanvas } from './drawing-canvas'
import { ChevronUp, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Legend } from './legend'

const WELL_STATUS_ITEMS = [
    { label: 'Oil', color: '#22c55e' },
    { label: 'Gas', color: '#ef4444' },
    { label: 'Oil and Gas', color: '#8b5cf6' },
    { label: 'Dry Hole', color: '#6b7280' },
    { label: 'Plugged/Abandoned', color: '#f59e0b' },
    { label: 'Injection', color: '#3b82f6' },
    { label: 'Suspended', color: '#eab308' },
    { label: 'Other', color: '#9ca3af' }
]

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
    layerName?: string
}

export interface LayerConfig {
    id: string
    name: string
    type: 'fill' | 'line' | 'circle' | 'symbol'
    source: string
    sourceType: 'geojson' | 'pmtiles'
    dataUrl?: string  // URL to fetch GeoJSON data from
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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'

const DEFAULT_LAYERS: LayerConfig[] = [
    {
        id: 'polygons',
        name: 'Lease Blocks',
        type: 'fill',
        source: 'lease-blocks',
        sourceType: 'geojson',
        dataUrl: `${API_BASE_URL}/api/geojson/lease_blocks.geojson`,
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
        dataUrl: `${API_BASE_URL}/api/geojson/pipelines.geojson`,
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
        name: 'Wellbores',
        type: 'circle',
        source: 'wellbores',
        sourceType: 'pmtiles',
        dataUrl: `${API_BASE_URL}/api/pmtiles/wellbores.pmtiles`,
        // Important: layer name in the vector tile source. 
        // Tippecanoe uses the layer name passed with -l flag or default to filename basename "wellbores"
        sourceLayer: 'wellbores',
        visible: true,
        paint: {
            'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                4, 2.5,
                10, 4.5,
                14, 7
            ],
            'circle-color': [
                'match',
                ['get', 'status'],
                'Oil', '#22c55e',            // Green
                'Gas', '#ef4444',            // Red
                'Oil and Gas', '#8b5cf6',    // Purple
                'Dry Hole', '#6b7280',       // Gray
                'Plugged/Abandoned', '#f59e0b', // Orange
                'Injection', '#3b82f6',      // Blue
                'Suspended', '#eab308',      // Yellow
                '#9ca3af'                    // Default Gray
            ],
            'circle-stroke-color': '#000000',
            'circle-stroke-width': 0,
            'circle-stroke-opacity': 0
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
    const [drawMode, setDrawMode] = useState<DrawMode>('none')
    const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([])
    const [isDrawing, setIsDrawing] = useState(false)
    const [showDetailsPanel, setShowDetailsPanel] = useState(true)
    const [showAIPanel, setShowAIPanel] = useState(false)
    const [showLegend, setShowLegend] = useState(true)
    const [hiddenStatuses, setHiddenStatuses] = useState<string[]>([])
    const drawStartPoint = useRef<{ x: number; y: number } | null>(null)
    const drawCanvas = useRef<HTMLCanvasElement | null>(null)

    // Helper to get position classes for UI elements
    const getPositionClasses = (pos?: string, type: 'drawer' | 'toolbar' = 'toolbar') => {
        if (!pos) {
            return type === 'drawer' ? 'top-4 left-4' : 'top-4 right-4'
        }

        switch (pos) {
            case 'left': return 'top-4 left-4'
            case 'right': return 'top-4 right-4'
            case 'bottom': return 'bottom-20 left-4'
            case 'top-left': return 'top-4 left-4'
            case 'top-right': return 'top-4 right-4'
            case 'bottom-left': return 'bottom-20 left-4'
            case 'bottom-right': return 'bottom-20 right-4'
            default: return type === 'drawer' ? 'top-4 left-4' : 'top-4 right-4'
        }
    }

    // Saved map state to restore on selection cancel
    const savedMapState = useRef<{ center: [number, number]; zoom: number } | null>(null)

    // Refs to track current state for event handlers (closure fix)
    const drawModeRef = useRef<DrawMode>('none')
    const isDrawingRef = useRef(false)

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
    const handleDrawModeChange = (mode: DrawMode) => {
        setDrawMode(mode)
        drawModeRef.current = mode  // Update ref for event handlers
        setSelectedFeatures([])
    }

    // Toggle legend item visibility
    const toggleStatus = (status: string) => {
        setHiddenStatuses(prev => {
            const newHidden = prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
            return newHidden
        })
    }

    // Apply status filter when hiddenStatuses changes
    useEffect(() => {
        if (!map.current || !map.current.getLayer('points')) return

        const filter: any[] = ['!in', 'status', ...hiddenStatuses]

        try {
            // If Other is hidden, we might need more complex logic since 'status' might match nothing or fallback
            // But for now simple exclusion works if the data has 'status' property
            map.current.setFilter('points', hiddenStatuses.length > 0 ? (filter as any) : null)
        } catch (err) {
            console.error('Error setting filter:', err)
        }
    }, [hiddenStatuses])

    // Clear selection and restore previous map state
    const handleClearSelection = () => {
        setSelectedFeatures([])
        setDrawMode('none')
        drawModeRef.current = 'none'
        updateSelectionHighlight([])  // Clear highlight

        // Restore map to saved state before selection
        if (savedMapState.current && map.current) {
            map.current.flyTo({
                center: savedMapState.current.center,
                zoom: savedMapState.current.zoom,
                duration: 1000
            })
            savedMapState.current = null
        }
    }

    // Update blue highlight on selected features (all geometry types)
    const updateSelectionHighlight = (features: Feature[]) => {
        if (!map.current) return

        // Points (Wellbores) - Filter by UID or ID
        const pointFeatures = features.filter(f => f.geometry.type === 'Point')
        const pointIds = pointFeatures.map(f => f.properties.uid || f.id).filter(val => val !== undefined && val !== null)
        const pointFilter: any = pointIds.length > 0
            ? ['in', 'uid', ...pointIds]
            : ['in', 'uid', '']

        if (map.current.getLayer('selection-highlight-points')) {
            map.current.setFilter('selection-highlight-points', pointFilter)
        }

        // Lines/Polygons - Filter by Name (Legacy fallback)
        const nonPointFeatures = features.filter(f => f.geometry.type !== 'Point')
        const names = nonPointFeatures.map(f => f.properties.name || f.id).filter(Boolean)
        const nameFilter: any = names.length > 0
            ? ['in', 'name', ...names]
            : ['in', 'name', '']

        const nonPointLayers = [
            'selection-highlight-lines',
            'selection-highlight-polygons',
            'selection-highlight-polygons-outline'
        ]

        nonPointLayers.forEach(layerId => {
            if (map.current?.getLayer(layerId)) {
                map.current.setFilter(layerId, nameFilter)
            }
        })
    }

    // Zoom to a single feature
    const handleZoomToFeature = useCallback((feature: Feature) => {
        if (!map.current) return

        if (feature.geometry.type === 'Point') {
            const [lng, lat] = feature.geometry.coordinates
            map.current.flyTo({ center: [lng, lat], zoom: 10, duration: 1000 })
        }
    }, [])

    // Zoom to fit all selected features
    const handleZoomToAll = useCallback(() => {
        if (!map.current || selectedFeatures.length === 0) return

        const points = selectedFeatures
            .filter(f => f.geometry.type === 'Point')
            .map(f => f.geometry.coordinates)

        if (points.length === 0) return

        if (points.length === 1) {
            map.current.flyTo({ center: points[0] as [number, number], zoom: 8, duration: 1000 })
        } else {
            // Calculate bounds
            const lngs = points.map(p => p[0])
            const lats = points.map(p => p[1])
            const bounds = [
                [Math.min(...lngs), Math.min(...lats)],
                [Math.max(...lngs), Math.max(...lats)]
            ]
            map.current.fitBounds(bounds as [[number, number], [number, number]], {
                padding: 50,
                duration: 1000
            })
        }
    }, [selectedFeatures])

    // Handle completed draw selection
    const handleDrawComplete = useCallback((bounds: {
        startX: number; startY: number;
        endX: number; endY: number;
        type: 'rectangle' | 'circle'
    }) => {
        if (!map.current) return

        // Save current map state before selection (to restore on cancel)
        if (!savedMapState.current) {
            savedMapState.current = {
                center: map.current.getCenter().toArray() as [number, number],
                zoom: map.current.getZoom()
            }
        }

        console.log('Draw complete:', bounds.type)

        // Query rendered features within the bounding box of the selection
        // We use screen coordinates directly for the initial broad query
        const minX = Math.min(bounds.startX, bounds.endX)
        const maxX = Math.max(bounds.startX, bounds.endX)
        const minY = Math.min(bounds.startY, bounds.endY)
        const maxY = Math.max(bounds.startY, bounds.endY)

        const interactiveLayerIds = layers
            .filter(l => l.type !== 'symbol') // Exclude label layers
            .map(l => l.id)

        // Use the bounding box to get candidate features efficiently
        const candidates = map.current.queryRenderedFeatures(
            [[minX, minY], [maxX, maxY]],
            { layers: interactiveLayerIds }
        )

        // Helper to check if a point is strictly within the drawn shape (Screen Space)
        const isPointInShape = (screenPoint: maplibregl.Point): boolean => {
            if (bounds.type === 'rectangle') {
                return screenPoint.x >= minX && screenPoint.x <= maxX &&
                    screenPoint.y >= minY && screenPoint.y <= maxY
            } else if (bounds.type === 'circle') {
                const centerX = (bounds.startX + bounds.endX) / 2
                const centerY = (bounds.startY + bounds.endY) / 2
                // DrawingCanvas uses max dimension for radius (perfect circle)
                const radiusX = Math.abs(bounds.endX - bounds.startX) / 2
                const radiusY = Math.abs(bounds.endY - bounds.startY) / 2
                const radius = Math.max(radiusX, radiusY)

                const dx = screenPoint.x - centerX
                const dy = screenPoint.y - centerY
                return (dx * dx + dy * dy) <= (radius * radius)
            }
            return false
        }

        const filtered = candidates.filter(feature => {
            const geom = feature.geometry as any

            if (geom.type === 'Point') {
                const [lng, lat] = geom.coordinates
                const screenPoint = map.current!.project([lng, lat])
                return isPointInShape(screenPoint)
            } else if (geom.type === 'LineString') {
                // Check if any point of the line is within bounds
                return geom.coordinates.some((coord: number[]) => {
                    const screenPoint = map.current!.project([coord[0], coord[1]])
                    return isPointInShape(screenPoint)
                })
            } else if (geom.type === 'Polygon' || geom.type === 'MultiPolygon') {
                // Check if any vertex is within bounds
                const coords = geom.type === 'Polygon' ? geom.coordinates[0] : geom.coordinates[0][0]
                return coords.some((coord: number[]) => {
                    const screenPoint = map.current!.project([coord[0], coord[1]])
                    return isPointInShape(screenPoint)
                })
            }
            return false
        })


        // Create a map from source/layer ID to layer name
        const layerNameMap = new Map<string, string>()
        layers.forEach(l => layerNameMap.set(l.id, l.name))

        const uniqueFeatures = new Map<string, Feature>()
        filtered.forEach(f => {
            const id = f.id as string || f.properties?.name
            const sourceLayerId = (f as any).layer?.id || ''
            const layerName = layerNameMap.get(sourceLayerId) || (f.geometry.type === 'Point' ? 'Active Alerts' : f.geometry.type === 'LineString' ? 'Pipelines' : 'Lease Blocks')

            if (id && !uniqueFeatures.has(id)) {
                uniqueFeatures.set(id, {
                    id: id,
                    properties: f.properties || {},
                    geometry: f.geometry as any,
                    layerName: layerName
                })
            }
        })

        const results = Array.from(uniqueFeatures.values())
        console.log('Selected', results.length, 'features within drawn area')
        setSelectedFeatures(results)
        updateSelectionHighlight(results)  // Update blue highlight on map
        if (results.length > 0) {
            setShowDetailsPanel(true)  // Auto-show details panel
        }
        onDrawSelectionChange?.(results)
    }, [layers, onDrawSelectionChange])

    // Add sources dynamically based on layer configuration
    const addSources = () => {
        if (!map.current) return

        const uniqueSources = new Map<string, LayerConfig>()
        layers.forEach(layer => {
            // Only add source once per unique source ID
            if (!uniqueSources.has(layer.source) && layer.dataUrl) {
                uniqueSources.set(layer.source, layer)
            }
        })

        uniqueSources.forEach((layer, sourceId) => {
            if (map.current?.getSource(sourceId)) return

            if (layer.sourceType === 'geojson' && layer.dataUrl) {
                map.current?.addSource(sourceId, {
                    type: 'geojson',
                    data: layer.dataUrl,
                    promoteId: 'id'
                })
            } else if (layer.sourceType === 'pmtiles' && layer.dataUrl) {
                map.current?.addSource(sourceId, {
                    type: 'vector',
                    url: `pmtiles://${layer.dataUrl}`,
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

        // Add highlight layers for selection (blue fill/stroke for all geometry types)
        if (enableSelection) {
            // Point highlight layer
            if (!map.current.getLayer('selection-highlight-points')) {
                const pointLayer = layers.find(l => l.id === 'points')
                const pointSource = pointLayer?.source || 'wellbores'
                const pointSourceLayer = pointLayer?.sourceLayer

                const highlightLayerDef: any = {
                    id: 'selection-highlight-points',
                    type: 'circle',
                    source: pointSource,
                    filter: ['in', 'uid', ''],
                    paint: {
                        'circle-radius': [
                            'interpolate', ['linear'], ['zoom'],
                            4, 5.5,
                            10, 7.5,
                            14, 10
                        ],
                        'circle-color': '#3b82f6',  // Blue fill
                        'circle-opacity': 0.6,
                        'circle-stroke-color': '#1d4ed8',
                        'circle-stroke-width': 2,
                    },
                }

                if (pointSourceLayer) {
                    highlightLayerDef['source-layer'] = pointSourceLayer
                }

                map.current.addLayer(highlightLayerDef)
            }

            // Line highlight layer - must be on top
            if (!map.current.getLayer('selection-highlight-lines')) {
                // Find the main lines layer (not the outline)
                const lineLayer = layers.find(l => l.id === 'lines')
                const lineSource = lineLayer?.source || 'pipelines'
                map.current.addLayer({
                    id: 'selection-highlight-lines',
                    type: 'line',
                    source: lineSource,
                    filter: ['in', 'name', ''],
                    paint: {
                        'line-color': '#3b82f6',  // Blue
                        'line-width': 6,  // Thicker for visibility
                        'line-opacity': 1,
                    },
                })
            }

            // Polygon highlight layer
            if (!map.current.getLayer('selection-highlight-polygons')) {
                const polySource = layers.find(l => l.type === 'fill')?.source
                if (polySource) {
                    map.current.addLayer({
                        id: 'selection-highlight-polygons',
                        type: 'fill',
                        source: polySource,
                        filter: ['in', 'name', ''],
                        paint: {
                            'fill-color': '#3b82f6',  // Blue fill
                            'fill-opacity': 0.4,
                        },
                    })
                    // Add polygon outline
                    map.current.addLayer({
                        id: 'selection-highlight-polygons-outline',
                        type: 'line',
                        source: polySource,
                        filter: ['in', 'name', ''],
                        paint: {
                            'line-color': '#1d4ed8',
                            'line-width': 2,
                        },
                    })
                }
            }
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

                // Update highlight filter handled via state change -> useEffect? 
                // No, we handle it explicitly here via direct map manipulation for performance

                // For single click, we just call the update function with one feature
                if (map.current && map.current.getLayer('selection-highlight-points')) {
                    const uid = selectedFeat.properties.uid || selectedFeat.id
                    map.current.setFilter('selection-highlight-points', ['in', 'uid', uid])
                }

                // For other layers (fallback)
                if (feature.source !== 'wellbores') {
                    map.current.setFilter('selection-highlight-lines', ['in', 'name', feature.properties?.name || ''])
                    // ... others handled by updateSelectionHighlight called by setSelectedFeature?
                    // setSelectedFeature updates state. Does it trigger effect?
                    // No, map-view usually responds to state changes or direct calls.
                    // Here we call updateSelectionHighlight explicitly in other places.
                }

                // Actually, just call the shared function!
                updateSelectionHighlight([selectedFeat])
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
        <div className="relative flex h-full w-full overflow-hidden bg-background">
            {/* Map Container - fills available space */}
            <div className={cn("relative flex-1 h-full", showAIPanel && "w-[calc(100%-400px)]")}>
                <div ref={mapContainer} className="h-full w-full" />

                {/* Layer Drawer - floating morphing button/panel */}
                <LayerDrawer
                    visibleLayers={visibleLayers}
                    onToggleLayer={toggleLayer}
                    layers={layers}
                    baseStyle={baseStyle}
                    onBaseStyleChange={changeBaseStyle}
                    showLegend={showLegend}
                    onToggleLegend={() => setShowLegend(!showLegend)}
                    className={getPositionClasses(uiPositions.layerDrawer, 'drawer')}
                />

                {/* Drawing Canvas Overlay - for visual selection */}
                {enableDrawSelection && drawMode !== 'none' && (
                    <DrawingCanvas
                        isDrawing={isDrawing}
                        drawMode={drawMode}
                        onDrawComplete={handleDrawComplete}
                    />
                )}

                {/* Selection Toolbar + AI Button */}
                <div className={cn("absolute z-20 flex flex-col gap-1.5", getPositionClasses(uiPositions.drawToolbar, 'toolbar'))}>
                    {enableDrawSelection && (
                        <SelectionToolbar
                            drawMode={drawMode}
                            onModeChange={handleDrawModeChange}
                            onClear={handleClearSelection}
                            selectedCount={selectedFeatures.length}
                        />
                    )}

                    {/* AI Insights Button */}
                    <button
                        onClick={() => setShowAIPanel(!showAIPanel)}
                        className={cn(
                            "h-10 w-10 flex items-center justify-center rounded-md transition-all",
                            "border-2 shadow-lg backdrop-blur-md",
                            showAIPanel
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-white/30 bg-white/60 text-foreground hover:border-white/50 hover:bg-white/70"
                        )}
                        title="AI Insights"
                    >
                        <Sparkles className="h-4 w-4" />
                    </button>
                </div>

                {/* Legend - Bottom Center */}
                {showLegend && visibleLayers['points'] !== false && (
                    <Legend
                        items={WELL_STATUS_ITEMS}
                        hiddenItems={hiddenStatuses}
                        onToggleItem={toggleStatus}
                        onClose={() => setShowLegend(false)}
                    />
                )}

                {/* Toggle Feature Details Button - Bottom Right */}
                {selectedFeatures.length > 0 && (
                    <button
                        onClick={() => setShowDetailsPanel(!showDetailsPanel)}
                        className={cn(
                            "absolute right-4 bottom-6 z-20 h-10 w-10 flex items-center justify-center rounded-md transition-all",
                            "border-2 shadow-lg backdrop-blur-md",
                            showDetailsPanel
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-white/30 bg-white/60 text-foreground hover:border-white/50 hover:bg-white/70"
                        )}
                        title="Toggle feature details"
                    >
                        <ChevronUp className={cn("h-4 w-4 transition-transform", showDetailsPanel && "rotate-180")} />
                    </button>
                )}

                {/* Feature Details Bottom Panel */}
                {showDetailsPanel && selectedFeatures.length > 0 && (
                    <FeatureDetailsPanel
                        features={selectedFeatures}
                        onClose={() => {
                            setShowDetailsPanel(false)
                            handleClearSelection()
                        }}
                        onZoomTo={handleZoomToFeature}
                        onZoomToAll={handleZoomToAll}
                    />
                )}
            </div>

            {/* AI Insights Panel - Right side */}
            <AIInsightsPanel
                isOpen={showAIPanel}
                onClose={() => setShowAIPanel(false)}
                onQuerySubmit={(query) => {
                    console.log('AI Query:', query)
                    // TODO: Integrate with AI backend
                }}
            />
        </div>
    )
}

