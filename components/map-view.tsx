"use client"

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MapControls } from './map-controls'
import { LayerPanel } from './layer-panel'
import { FeatureDetails } from './feature-details'

export interface Feature {
  id: string
  properties: Record<string, any>
  geometry: {
    type: string
    coordinates: any
  }
}

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [baseStyle, setBaseStyle] = useState<'dark' | 'satellite'>('dark')
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
    polygons: true,
    lines: true,
    points: true,
  })

  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize PMTiles protocol
    let protocol = new Protocol()
    maplibregl.addProtocol('pmtiles', protocol.tile)

    // Create map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: baseStyle === 'dark'
        ? 'https://demotiles.maplibre.org/style.json'
        : 'https://demotiles.maplibre.org/style.json',
      center: [-100.5, 35.5],
      zoom: 6,
      pitch: 0,
      bearing: 0,
    })

    // Add sources
    map.current.on('load', () => {
      if (!map.current) return

      // PMTiles source
      map.current.addSource('pmtiles', {
        type: 'vector',
        url: 'pmtiles://http://localhost:5000/api/pmtiles/data.pmtiles',
      })

      // GeoJSON source
      map.current.addSource('geojson', {
        type: 'geojson',
        data: 'http://localhost:5000/api/geojson/alerts.geojson',
      })

      // Add layers
      addLayers()
      setupInteractivity()
    })

    return () => {
      if (map.current) {
        map.current.remove()
      }
      maplibregl.removeProtocol('pmtiles')
    }
  }, [])

  const addLayers = () => {
    if (!map.current) return

    // Polygon layer
    map.current.addLayer({
      id: 'polygons',
      type: 'fill',
      source: 'pmtiles',
      'source-layer': 'polygons',
      paint: {
        'fill-color': '#088',
        'fill-opacity': 0.5,
      },
    })

    // Line layer
    map.current.addLayer({
      id: 'lines',
      type: 'line',
      source: 'pmtiles',
      'source-layer': 'lines',
      paint: {
        'line-color': '#088',
        'line-width': 2,
      },
    })

    // Points layer
    map.current.addLayer({
      id: 'points',
      type: 'circle',
      source: 'geojson',
      paint: {
        'circle-radius': 6,
        'circle-color': '#ff6b6b',
      },
    })
  }

  const setupInteractivity = () => {
    if (!map.current) return

    // Hover effect
    map.current.on('mousemove', ['polygons', 'lines', 'points'], () => {
      map.current!.getCanvas().style.cursor = 'pointer'
    })

    map.current.on('mouseleave', ['polygons', 'lines', 'points'], () => {
      map.current!.getCanvas().style.cursor = ''
    })

    // Click to select
    map.current.on('click', ['polygons', 'lines', 'points'], (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0]
        setSelectedFeature({
          id: feature.id as string,
          properties: feature.properties || {},
          geometry: feature.geometry as any,
        })
      }
    })

    // Click empty space to deselect
    map.current.on('click', (e) => {
      const features = map.current!.queryRenderedFeatures({ layers: ['polygons', 'lines', 'points'] })
      if (features.length === 0) {
        setSelectedFeature(null)
      }
    })
  }

  const toggleLayer = (layerId: string) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layerId]: !prev[layerId],
    }))

    if (map.current) {
      map.current.setLayoutProperty(
        layerId,
        'visibility',
        visibleLayers[layerId] ? 'none' : 'visible'
      )
    }
  }

  const changeBaseStyle = (style: 'dark' | 'satellite') => {
    setBaseStyle(style)
    // In a real implementation, you would change the map style
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-black">
      <div ref={mapContainer} className="flex-1" />
      <MapControls baseStyle={baseStyle} onStyleChange={changeBaseStyle} />
      <LayerPanel visibleLayers={visibleLayers} onToggleLayer={toggleLayer} />
      {selectedFeature && <FeatureDetails feature={selectedFeature} onClose={() => setSelectedFeature(null)} />}
    </div>
  )
}

