"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import { LayerDrawer } from './layer-drawer'
import { SelectionToolbar, type DrawMode } from './selection-toolbar'
import { FeatureDetailsPanel } from './feature-details-panel'
import { AIInsightsPanel } from './ai-insights-panel'
import { DrawingCanvas } from './drawing-canvas'
import { ChevronUp, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Legend } from './legend'

// Type declarations for dynamically loaded modules
interface MapLibreGL {
    Map: new (options: Record<string, unknown>) => MapInstance
    Popup: new (options?: Record<string, unknown>) => PopupInstance
    addProtocol: (name: string, handler: unknown) => void
    removeProtocol: (name: string) => void
}

interface MapInstance {
    on: (event: string, layersOrCallback: unknown, callback?: unknown) => void
    once: (event: string, callback: unknown) => void
    remove: () => void
    getLayer: (id: string) => unknown
    getSource: (id: string) => unknown
    addSource: (id: string, source: Record<string, unknown>) => void
    addLayer: (layer: Record<string, unknown>) => void
    setLayoutProperty: (layerId: string, property: string, value: unknown) => void
    setFilter: (layerId: string, filter: unknown) => void
    setStyle: (style: string) => void
    getCanvas: () => HTMLCanvasElement
    queryRenderedFeatures: (pointOrBox?: unknown, options?: Record<string, unknown>) => MapFeature[]
    project: (lngLat: [number, number]) => { x: number; y: number }
    getCenter: () => { toArray: () => [number, number] }
    getZoom: () => number
    flyTo: (options: Record<string, unknown>) => void
    fitBounds: (bounds: [[number, number], [number, number]], options?: Record<string, unknown>) => void
}

interface PopupInstance {
    setLngLat: (lngLat: { lng: number; lat: number }) => PopupInstance
    setHTML: (html: string) => PopupInstance
    addTo: (map: MapInstance) => PopupInstance
    remove: () => void
}

interface MapFeature {
    id?: string | number
    properties?: Record<string, unknown>
    geometry: {
        type: string
        coordinates: unknown
    }
    layer?: { id: string }
}

// Dynamically import maplibre-gl to avoid SSR issues
let maplibregl: MapLibreGL | null = null
let Protocol: { new(): { tile: unknown } } | null = null

const loadMapLibre = async () => {
    if (!maplibregl) {
        // @ts-expect-error - Dynamic import for SSR compatibility
        const ml = await import('maplibre-gl')
        maplibregl = ml.default as unknown as MapLibreGL
    }
    if (!Protocol) {
        // @ts-expect-error - Dynamic import for SSR compatibility
        const pt = await import('pmtiles')
        Protocol = pt.Protocol as { new(): { tile: unknown } }
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

export interface TooltipField {
    field: string
    label: string
    unit?: string
    priority?: number
}

export interface AnalyticalMapping {
    'analytics-column'?: string
    'colorscheme-included'?: boolean
}

export interface LegendItem {
    label: string
    color: string
}

export interface LayerConfig {
    id: string
    name: string
    type: 'fill' | 'line' | 'circle' | 'symbol'
    source_type: 'geojson' | 'pmtiles'
    data_url?: string
    source_layer?: string
    visible: boolean
    paint?: Record<string, any>
    layout?: Record<string, any>
    zIndex?: number
    tooltip_fields?: TooltipField[]
    analytical_mapping?: AnalyticalMapping
    legend_items?: LegendItem[]
    legend_column?: string
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

const DEFAULT_BASE_MAP_CONFIGS = {
    styles: [
        { id: 'dark', name: 'Dark/Analytical', url: '/styles/dark.json' },
        { id: 'satellite', name: 'Satellite', url: '/styles/satellite.json' },
    ],
    defaultStyle: 'dark',
}

export function MapView({
    layers: initialLayers,
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
    const map = useRef<MapInstance | null>(null)
    const [layers, setLayers] = useState<LayerConfig[]>(initialLayers || [])
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
    const [baseStyle, setBaseStyle] = useState<'dark' | 'satellite'>(baseMapConfigs.defaultStyle as 'dark' | 'satellite')
    const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({})
    const [drawMode, setDrawMode] = useState<DrawMode>('none')
    const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([])
    const [isDrawing, setIsDrawing] = useState(false)
    const [showDetailsPanel, setShowDetailsPanel] = useState(false)
    const [showAIPanel, setShowAIPanel] = useState(false)
    const [showLegend, setShowLegend] = useState(true)
    const [hiddenStatuses, setHiddenStatuses] = useState<string[]>([])
    const drawStartPoint = useRef<{ x: number; y: number } | null>(null)
    const drawCanvas = useRef<HTMLCanvasElement | null>(null)

    // Fetch layers from API
    useEffect(() => {
        if (initialLayers) return

        const fetchLayers = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/layers`)
                const data = await response.json()
                if (data.layers) {
                    setLayers(data.layers)
                    setVisibleLayers(
                        data.layers.reduce((acc: any, layer: LayerConfig) => ({ ...acc, [layer.id]: layer.visible }), {})
                    )
                }
            } catch (error) {
                console.error('Failed to fetch map layers:', error)
            }
        }

        fetchLayers()
    }, [initialLayers])

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
        const filtered = features.filter((feature: MapFeature) => {
            if (feature.geometry.type === 'Point') {
                const coords = feature.geometry.coordinates as [number, number]
                const [lng, lat] = coords
                return lng >= bounds.minLng && lng <= bounds.maxLng && lat >= bounds.minLat && lat <= bounds.maxLat
            }
            return true // For now, include all non-point features
        })

        return filtered.map((f: MapFeature) => ({
            id: f.id as string,
            properties: (f.properties || {}) as Record<string, unknown>,
            geometry: f.geometry
        }))
    }

    // Handle draw mode changes
    const handleDrawModeChange = (mode: DrawMode) => {
        setDrawMode(mode)
        drawModeRef.current = mode  // Update ref for event handlers
        setSelectedFeatures([])

        // Save current map state before starting selection if we haven't already
        if (mode !== 'none' && !savedMapState.current && map.current) {
            savedMapState.current = {
                center: map.current.getCenter().toArray() as [number, number],
                zoom: map.current.getZoom()
            }
        }
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
        if (!map.current) return

        layers.forEach(layer => {
            if (layer.legend_items && layer.legend_column && map.current && map.current.getLayer(layer.id)) {
                const filter: any[] = ['!in', layer.legend_column, ...hiddenStatuses]
                try {
                    map.current?.setFilter(layer.id, hiddenStatuses.length > 0 ? (filter as any) : null)
                } catch (err) {
                    console.error(`Error setting filter for layer ${layer.id}:`, err)
                }
            }
        })
    }, [hiddenStatuses, layers])

    // Clear selection and restore previous map state
    const handleClearSelection = () => {
        setSelectedFeatures([])
        setShowDetailsPanel(false)
        setDrawMode('none')
        drawModeRef.current = 'none'
        updateSelectionHighlight([])  // Clear highlight

        // Reset cursor
        if (map.current) {
            map.current.getCanvas().style.cursor = 'default'
        }

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

        // Points (Wellbores) - Filter by ID
        const pointFeatures = features.filter(f => f.geometry.type === 'Point')
        const pointIds = pointFeatures.map(f => f.id).filter(val => val !== undefined && val !== null)
        const pointFilter: any = pointIds.length > 0
            ? ['in', ['id'], ['literal', pointIds]]
            : ['in', ['id'], ['literal', []]]

        if (map.current.getLayer('selection-highlight-points')) {
            map.current.setFilter('selection-highlight-points', pointFilter)
        }

        // Lines/Polygons - Filter by ID
        const nonPointFeatures = features.filter(f => f.geometry.type !== 'Point')
        const nonPointIds = nonPointFeatures.map(f => f.id).filter(val => val !== undefined && val !== null)
        const nonPointFilter: any = nonPointIds.length > 0
            ? ['in', ['id'], ['literal', nonPointIds]]
            : ['in', ['id'], ['literal', []]]

        const nonPointLayers = [
            'selection-highlight-lines',
            'selection-highlight-polygons',
            'selection-highlight-polygons-outline'
        ]

        nonPointLayers.forEach(layerId => {
            if (map.current?.getLayer(layerId)) {
                map.current.setFilter(layerId, nonPointFilter)
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

        console.log('Draw complete:', bounds.type)

        // Query rendered features within the bounding box of the selection
        // We use screen coordinates directly for the initial broad query
        let queryMinX, queryMaxX, queryMinY, queryMaxY;

        if (bounds.type === 'rectangle') {
            queryMinX = Math.min(bounds.startX, bounds.endX)
            queryMaxX = Math.max(bounds.startX, bounds.endX)
            queryMinY = Math.min(bounds.startY, bounds.endY)
            queryMaxY = Math.max(bounds.startY, bounds.endY)
        } else {
            // Circle: start is center, end is radius point
            const radius = Math.sqrt(
                Math.pow(bounds.endX - bounds.startX, 2) + 
                Math.pow(bounds.endY - bounds.startY, 2)
            )
            queryMinX = bounds.startX - radius
            queryMaxX = bounds.startX + radius
            queryMinY = bounds.startY - radius
            queryMaxY = bounds.startY + radius
        }

        const interactiveLayerIds = layers
            .filter(l => l.type !== 'symbol' && visibleLayers[l.id]) // Exclude label layers and hidden layers
            .map(l => l.id)

        // Use the bounding box to get candidate features efficiently
        const candidates = map.current.queryRenderedFeatures(
            [[queryMinX, queryMinY], [queryMaxX, queryMaxY]],
            { layers: interactiveLayerIds }
        )

        // Helper to check if a point is strictly within the drawn shape (Screen Space)
        const isPointInShape = (screenPoint: { x: number; y: number }): boolean => {
            if (bounds.type === 'rectangle') {
                return screenPoint.x >= queryMinX && screenPoint.x <= queryMaxX &&
                    screenPoint.y >= queryMinY && screenPoint.y <= queryMaxY
            } else if (bounds.type === 'circle') {
                const centerX = bounds.startX
                const centerY = bounds.startY
                const dx = bounds.endX - bounds.startX
                const dy = bounds.endY - bounds.startY
                const radius = Math.sqrt(dx * dx + dy * dy)

                const distDx = screenPoint.x - centerX
                const distDy = screenPoint.y - centerY
                return (distDx * distDx + distDy * distDy) <= (radius * radius)
            }
            return false
        }

        const filtered = candidates.filter((feature: MapFeature) => {
            const geom = feature.geometry

            if (geom.type === 'Point') {
                const coords = geom.coordinates as [number, number]
                const [lng, lat] = coords
                const screenPoint = map.current!.project([lng, lat])
                return isPointInShape(screenPoint)
            } else if (geom.type === 'LineString') {
                // Check if any point of the line is within bounds
                const lineCoords = geom.coordinates as [number, number][]
                return lineCoords.some((coord: number[]) => {
                    const screenPoint = map.current!.project([coord[0], coord[1]] as [number, number])
                    return isPointInShape(screenPoint)
                })
            } else if (geom.type === 'Polygon' || geom.type === 'MultiPolygon') {
                // Check if any vertex is within bounds
                const polyCoords = geom.coordinates as number[][][] | number[][][][]
                const coords = geom.type === 'Polygon'
                    ? (polyCoords as number[][][])[0]
                    : (polyCoords as number[][][][])[0][0]
                return coords.some((coord: number[]) => {
                    const screenPoint = map.current!.project([coord[0], coord[1]] as [number, number])
                    return isPointInShape(screenPoint)
                })
            }
            return false
        })

        // Create a map from source/layer ID to layer name
        const layerNameMap = new Map<string, string>()
        layers.forEach(l => layerNameMap.set(l.id, l.name))

        const uniqueFeatures = new Map<string, Feature>()
        filtered.forEach((f: MapFeature, idx: number) => {
            // Try to find a unique ID from various possible fields
            const id = String(f.id !== undefined ? f.id : (f.properties?.uid || f.properties?.id || f.properties?.name || `feat-${idx}`))
            const sourceLayerId = f.layer?.id || ''
            const layerName = layerNameMap.get(sourceLayerId) || 'Unknown Layer'

            if (!uniqueFeatures.has(id)) {
                uniqueFeatures.set(id, {
                    id: id,
                    properties: (f.properties || {}) as Record<string, unknown>,
                    geometry: f.geometry,
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
        if (!map.current || layers.length === 0) return

        const uniqueSources = new Map<string, LayerConfig>()
        layers.forEach(layer => {
            const sourceId = layer.id // Using layer.id as sourceId for simplicity if not specified
            if (!uniqueSources.has(sourceId) && layer.data_url) {
                uniqueSources.set(sourceId, layer)
            }
        })

        uniqueSources.forEach((layer, sourceId) => {
            if (map.current?.getSource(sourceId)) return

            // Ensure data_url is absolute if it starts with /api
            const absoluteUrl = layer.data_url?.startsWith('/api') 
                ? `${API_BASE_URL}${layer.data_url}` 
                : layer.data_url

            if (layer.source_type === 'geojson' && absoluteUrl) {
                map.current?.addSource(sourceId, {
                    type: 'geojson',
                    data: absoluteUrl,
                    promoteId: 'id'
                })
            } else if (layer.source_type === 'pmtiles' && absoluteUrl) {
                map.current?.addSource(sourceId, {
                    type: 'vector',
                    url: `pmtiles://${absoluteUrl}`,
                })
            }
        })
    }

    useEffect(() => {
        if (!mapContainer.current) return

        const initMap = async () => {
            await loadMapLibre()

            if (!maplibregl || !Protocol) return

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
                attributionControl: false,
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
    }, [layers]) // Re-init or update when layers are loaded

    const addLayers = () => {
        if (!map.current || layers.length === 0) return

        // Sort layers by zIndex for proper rendering order
        const sortedLayers = [...layers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))

        sortedLayers.forEach(layerConfig => {
            // Skip if layer already exists
            if (map.current?.getLayer(layerConfig.id)) return

            const layerDef: any = {
                id: layerConfig.id,
                type: layerConfig.type,
                source: layerConfig.id, // Using layer.id as sourceId
            }

            if (layerConfig.source_layer) {
                layerDef['source-layer'] = layerConfig.source_layer
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
            const pointLayer = layers.find(l => l.type === 'circle')
            if (pointLayer && !map.current.getLayer('selection-highlight-points')) {
                const highlightLayerDef: any = {
                    id: 'selection-highlight-points',
                    type: 'circle',
                    source: pointLayer.id,
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

                if (pointLayer.source_layer) {
                    highlightLayerDef['source-layer'] = pointLayer.source_layer
                }

                map.current.addLayer(highlightLayerDef)
            }

            // Line highlight layer - must be on top
            const lineLayer = layers.find(l => l.type === 'line')
            if (lineLayer && !map.current.getLayer('selection-highlight-lines')) {
                map.current.addLayer({
                    id: 'selection-highlight-lines',
                    type: 'line',
                    source: lineLayer.id,
                    filter: ['in', 'name', ''],
                    paint: {
                        'line-color': '#3b82f6',  // Blue
                        'line-width': 6,  // Thicker for visibility
                        'line-opacity': 1,
                    },
                })
            }

            // Polygon highlight layer
            const fillLayer = layers.find(l => l.type === 'fill')
            if (fillLayer && !map.current.getLayer('selection-highlight-polygons')) {
                map.current.addLayer({
                    id: 'selection-highlight-polygons',
                    type: 'fill',
                    source: fillLayer.id,
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
                    source: fillLayer.id,
                    filter: ['in', 'name', ''],
                    paint: {
                        'line-color': '#1d4ed8',
                        'line-width': 2,
                    },
                })
            }
        }
    }

    const setupInteractivity = () => {
        if (!map.current || layers.length === 0 || !maplibregl) return

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

                // Build dynamic tooltip content based on config
                let content = `<div class="p-2 min-w-[150px]">`
                
                if (layerConfig?.tooltip_fields && layerConfig.tooltip_fields.length > 0) {
                    // Sort by priority if available
                    const sortedFields = [...layerConfig.tooltip_fields].sort((a, b) => (a.priority || 99) - (b.priority || 99))
                    
                    content += `<div class="font-bold border-b border-border pb-1 mb-1 text-sm">${props[sortedFields[0].field] || 'Feature Details'}</div>`
                    
                    sortedFields.slice(1).forEach(field => {
                        const val = props[field.field]
                        if (val !== undefined && val !== null) {
                            content += `<div class="flex justify-between gap-4 text-xs">
                                <span class="text-muted-foreground">${field.label}:</span>
                                <span class="font-medium">${val}${field.unit ? ' ' + field.unit : ''}</span>
                            </div>`
                        }
                    })
                } else {
                    // Fallback to default name/status
                    content += `<div class="font-bold text-sm">${props.name || props.block_name || props.well_name || 'Feature'}</div>`
                    if (props.status) {
                        content += `<div class="text-xs text-muted-foreground">${props.status}</div>`
                    }
                }
                
                content += `</div>`

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
                updateSelectionHighlight([selectedFeat])
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
                {(() => {
                    if (!showLegend) return null;
                    const legendLayer = [...layers]
                        .filter(l => visibleLayers[l.id] && l.legend_items)
                        .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))[0];
                    
                    if (!legendLayer) return null;
                    
                    return (
                        <Legend
                            key={`legend-${legendLayer.id}`}
                            items={legendLayer.legend_items!}
                            hiddenItems={hiddenStatuses}
                            onToggleItem={toggleStatus}
                            onClose={() => setShowLegend(false)}
                        />
                    );
                })()}
            </div>

            {/* AI Insights Panel - Right side */}
            <AIInsightsPanel
                isOpen={showAIPanel}
                onClose={() => setShowAIPanel(false)}
                analyticalMapping={(() => {
                    const activeLayer = layers.find(l => visibleLayers[l.id] && l.analytical_mapping)
                    return activeLayer?.analytical_mapping
                })()}
                onQuerySubmit={(query) => {
                    console.log('AI Query:', query)
                    // TODO: Integrate with AI backend
                }}
            />

            {/* Feature Details Panel - Bottom */}
            {showDetailsPanel && selectedFeatures.length > 0 && (
                <FeatureDetailsPanel
                    features={selectedFeatures}
                    onClose={handleClearSelection}
                    onZoomTo={handleZoomToFeature}
                />
            )}
        </div>
    )
}

