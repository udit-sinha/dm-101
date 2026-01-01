"use client"

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Feature {
  id: string
  properties: Record<string, any>
  geometry: {
    type: string
    coordinates: any
  }
}

interface FeatureDetailsProps {
  feature: Feature
  onClose: () => void
}

export function FeatureDetails({ feature, onClose }: FeatureDetailsProps) {
  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 w-80 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Feature Details</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 uppercase">ID</p>
          <p className="text-sm font-mono">{feature.id}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase">Geometry Type</p>
          <p className="text-sm">{feature.geometry.type}</p>
        </div>

        {Object.entries(feature.properties).length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase mb-2">Properties</p>
            <div className="space-y-2">
              {Object.entries(feature.properties).map(([key, value]) => (
                <div key={key} className="border-t pt-2">
                  <p className="text-xs text-gray-600">{key}</p>
                  <p className="text-sm font-medium">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

