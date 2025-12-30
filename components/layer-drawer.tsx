"use client"

import { useState } from 'react'
import { Layers, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface LayerConfig {
    id: string
    name: string
    type: string
}

interface LayerDrawerProps {
    visibleLayers: Record<string, boolean>
    onToggleLayer: (layerId: string) => void
    layers?: LayerConfig[]
}

const DEFAULT_LAYER_CONFIG: LayerConfig[] = [
    { id: 'polygons', name: 'Lease Blocks', type: 'Polygons' },
    { id: 'lines', name: 'Pipelines', type: 'Lines' },
    { id: 'points', name: 'Active Alerts', type: 'Points' },
]

const LAYER_COLORS: Record<string, string> = {
    'polygons': '#22c55e',
    'lines': '#ef4444',
    'points': '#f59e0b',
}

export function LayerDrawer({ visibleLayers, onToggleLayer, layers }: LayerDrawerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const displayLayers = layers || DEFAULT_LAYER_CONFIG

    return (
        <div className="flex flex-col gap-2">
            {/* Toggle Button */}
            <Button
                variant="secondary"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 w-10 rounded-full shadow-lg bg-white hover:bg-gray-100"
            >
                <Layers className="h-5 w-5" />
            </Button>

            {/* Drawer Panel */}
            <div
                className={`bg-white rounded-lg shadow-xl transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'
                    }`}
                style={{ width: '280px' }}
            >
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-sm text-gray-900">Map Layers</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {displayLayers.map((layer) => (
                            <div
                                key={layer.id}
                                className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50"
                            >
                                <Checkbox
                                    id={layer.id}
                                    checked={visibleLayers[layer.id] ?? true}
                                    onCheckedChange={() => onToggleLayer(layer.id)}
                                />
                                <div
                                    className="w-4 h-4 rounded"
                                    style={{ backgroundColor: LAYER_COLORS[layer.id] || '#6b7280' }}
                                />
                                <div className="flex-1">
                                    <Label htmlFor={layer.id} className="text-sm cursor-pointer font-medium">
                                        {layer.name}
                                    </Label>
                                    <p className="text-xs text-gray-500">{layer.type}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 pt-4 border-t">
                        <h4 className="text-xs font-medium text-gray-500 mb-2">LEGEND</h4>
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span>High Severity / Oil Export</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span>Medium Severity</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span>Low Severity / Producing</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500" />
                                <span>Gas Export</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                                <span>Interfield</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
