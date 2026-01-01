/**
 * Example usage of the modular MapView component
 *
 * The MapView component now accepts dynamic layer configuration,
 * base map styles, and selection callbacks for a fully modular implementation.
 *
 * Note: The LayerConfig schema uses snake_case properties to match the
 * backend configuration format (e.g., data_url, source_type, source_layer).
 */

import { MapView, LayerConfig } from './map-view'

// Example 1: Using default configuration (backward compatible)
// When no layers are provided, MapView fetches config from /api/layers
export function MapViewDefault() {
  return <MapView />
}

// Example 2: Custom layers with dynamic configuration
export function MapViewCustom() {
  const customLayers: LayerConfig[] = [
    {
      id: 'lease-blocks',
      name: 'Lease Blocks',
      type: 'fill',
      data_url: '/api/geojson/lease_blocks.geojson',
      source_type: 'geojson',
      visible: true,
      paint: {
        'fill-color': '#22c55e',
        'fill-opacity': 0.4,
      },
      zIndex: 1,
    },
    {
      id: 'pipelines',
      name: 'Pipelines',
      type: 'line',
      data_url: '/api/geojson/pipelines.geojson',
      source_type: 'geojson',
      visible: true,
      paint: {
        'line-color': '#ef4444',
        'line-width': 3,
      },
      zIndex: 2,
    },
    {
      id: 'alerts',
      name: 'Active Alerts',
      type: 'circle',
      data_url: '/api/geojson/alerts.geojson',
      source_type: 'geojson',
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
      id: 'wellbores-pmtiles',
      name: 'Wellbores (PMTiles)',
      type: 'circle',
      data_url: '/api/pmtiles/wellbores.pmtiles',
      source_type: 'pmtiles',
      source_layer: 'wellbores',
      visible: true,
      paint: {
        'circle-radius': 5,
        'circle-color': '#22c55e',
      },
      zIndex: 1,
    },
  ]

  return <MapView layers={pmtilesLayers} />
}

