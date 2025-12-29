"use client"

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface LayerPanelProps {
  visibleLayers: Record<string, boolean>
  onToggleLayer: (layerId: string) => void
}

const LAYER_NAMES: Record<string, string> = {
  polygons: 'Lease Blocks',
  lines: 'Pipelines',
  points: 'Active Alerts',
}

export function LayerPanel({ visibleLayers, onToggleLayer }: LayerPanelProps) {
  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 w-64">
      <h3 className="font-semibold text-sm mb-3">Layers</h3>
      <div className="space-y-3">
        {Object.entries(LAYER_NAMES).map(([layerId, layerName]) => (
          <div key={layerId} className="flex items-center space-x-2">
            <Checkbox
              id={layerId}
              checked={visibleLayers[layerId] ?? true}
              onCheckedChange={() => onToggleLayer(layerId)}
            />
            <Label htmlFor={layerId} className="text-sm cursor-pointer">
              {layerName}
            </Label>
          </div>
        ))}
      </div>
    </div>
  )
}

