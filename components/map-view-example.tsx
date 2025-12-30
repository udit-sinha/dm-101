/**
 * Example usage of the modular MapView component
 * 
 * The MapView component now accepts dynamic layer configuration,
 * base map styles, and selection callbacks for a fully modular implementation.
 */

import { MapView, LayerConfig } from './map-view'

// Example 1: Using default configuration (backward compatible)
export function MapViewDefault() {
  return <MapView />
}

// Example 2: Custom layers with dynamic configuration
export function MapViewCustom() {
  const customLayers: LayerConfig[] = [
    {
      id: 'polygons',
      name: 'Lease Blocks',
      type: 'fill',
      source: 'http://localhost:5002/api/geojson/lease_blocks.geojson',
      sourceType: 'geojson',
      visible: true,
      paint: {
        'fill-color': '#22c55e',
        'fill-opacity': 0.4,
      },
      zIndex: 1,
    },
    {
      id: 'lines',
      name: 'Pipelines',
      type: 'line',
      source: 'http://localhost:5002/api/geojson/pipelines.geojson',
      sourceType: 'geojson',
      visible: true,
      paint: {
        'line-color': '#ef4444',
        'line-width': 3,
      },
      zIndex: 2,
    },
    {
      id: 'points',
      name: 'Active Alerts',
      type: 'circle',
      source: 'http://localhost:5002/api/geojson/alerts.geojson',
      sourceType: 'geojson',
      visible: true,
      paint: {
        'circle-radius': 8,
        'circle-color': '#f59e0b',
      },
      zIndex: 3,
    },
  ]

  return (
    <MapView
      layers={customLayers}
      enableSelection={true}
      onFeatureSelect={(feature) => {
        console.log('Selected feature:', feature)
      }}
    />
  )
}

// Example 3: With custom base map styles
export function MapViewCustomStyles() {
  const customLayers: LayerConfig[] = [
    // ... layer config
  ]

  const customBaseMapConfigs = {
    styles: [
      { id: 'dark', name: 'Dark/Analytical', url: '/styles/dark.json' },
      { id: 'satellite', name: 'Satellite', url: '/styles/satellite.json' },
      { id: 'light', name: 'Light', url: '/styles/light.json' },
    ],
    defaultStyle: 'dark',
  }

  return (
    <MapView
      layers={customLayers}
      baseMapConfigs={customBaseMapConfigs}
      center={[-90.0, 27.5]}
      zoom={5}
    />
  )
}

// Example 4: With PMTiles support
export function MapViewWithPMTiles() {
  const pmtilesLayers: LayerConfig[] = [
    {
      id: 'pmtiles-polygons',
      name: 'Large Polygon Dataset',
      type: 'fill',
      source: 'data/large-dataset.pmtiles',
      sourceType: 'pmtiles',
      sourceLayer: 'polygons',
      visible: true,
      paint: {
        'fill-color': '#22c55e',
        'fill-opacity': 0.4,
      },
      zIndex: 1,
    },
  ]

  return <MapView layers={pmtilesLayers} />
}

