"use client"

import { useState, useCallback } from 'react'
import { X, MapIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MapView, Feature } from './map-view'
import 'maplibre-gl/dist/maplibre-gl.css'

export interface MapContextData {
    type: 'map'
    layerName: string      // e.g., "Wells"
    attribute: string      // e.g., "well_name"  
    values: string[]       // e.g., ["MR-1", "MR-2", "MR-3"]
    count: number
}

interface MapContextModalProps {
    onClose: () => void
    onAddContext: (context: MapContextData) => void
}

export function MapContextModal({ onClose, onAddContext }: MapContextModalProps) {
    const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>([])

    const handleDrawSelectionChange = useCallback((features: Feature[]) => {
        setSelectedFeatures(features)
    }, [])

    const handleAddToChat = useCallback((features: Feature[]) => {
        if (features.length === 0) return

        // Use WellName to match GeoJSON properties
        // TODO: Make this configurable from backend
        const CONTEXT_ATTRIBUTE = 'WellName'

        // Extract attribute values from features
        const values = features
            .map(f => f.properties?.[CONTEXT_ATTRIBUTE])
            .filter((v): v is string => v != null && v !== '')

        const contextData: MapContextData = {
            type: 'map',
            layerName: 'Wells',
            attribute: CONTEXT_ATTRIBUTE,
            values: values,
            count: values.length
        }

        onAddContext(contextData)
        onClose()
    }, [onAddContext, onClose])

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 !mt-0" style={{ marginTop: 0 }}>
            <div className="w-full max-w-5xl h-[85%] bg-card rounded-xl shadow-2xl overflow-hidden flex flex-col border">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-3 py-2">
                    <div className="flex items-center gap-2">
                        <MapIcon className="h-4 w-4 text-primary" />
                        <h2 className="text-sm font-semibold">Select Map Area</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedFeatures.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {selectedFeatures.length} features selected
                            </span>
                        )}
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </div>

                {/* Map Container */}
                <div className="flex-1 relative overflow-hidden">
                    <MapView
                        mode="selection"
                        onDrawSelectionChange={handleDrawSelectionChange}
                        onAddToChat={handleAddToChat}
                    />
                </div>
            </div>
        </div>
    )
}
