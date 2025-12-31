"use client"

import { useState } from 'react'
import { Layers, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LayerConfig {
    id: string
    name: string
    description?: string
    type?: string
    color?: string
    enabled?: boolean
}

export interface LayerDrawerProps {
    visibleLayers: Record<string, boolean>
    onToggleLayer: (layerId: string) => void
    layers?: LayerConfig[]
    baseStyle?: string
    onBaseStyleChange?: (style: string) => void
    showLegend?: boolean
    onToggleLegend?: () => void
    className?: string
}

const DEFAULT_LAYER_CONFIG: LayerConfig[] = [
    { id: 'polygons', name: 'Lease Blocks', description: 'Oil & gas lease areas', color: '#22c55e' },
    { id: 'lines', name: 'Pipelines', description: 'Pipeline network', color: '#ef4444' },
    { id: 'points', name: 'Active Alerts', description: 'Platform alerts', color: '#f59e0b' },
]

export function LayerDrawer({
    visibleLayers,
    onToggleLayer,
    layers,
    baseStyle,
    onBaseStyleChange,
    showLegend,
    onToggleLegend,
    className
}: LayerDrawerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const displayLayers = layers || DEFAULT_LAYER_CONFIG

    return (
        <div className={cn("absolute z-30", className)}>
            {/* Button - always visible */}
            {!isOpen && (
                <div
                    className="w-10 h-10 bg-card/95 backdrop-blur-xl shadow-2xl border border-white/20 rounded-lg cursor-pointer hover:scale-105 transition-transform flex items-center justify-center text-foreground"
                    onClick={() => setIsOpen(true)}
                >
                    <Layers className="h-4 w-4" />
                </div>
            )}

            {/* Expanded panel - uses scale for diagonal growth */}
            {isOpen && (
                <div
                    className="w-72 bg-card/95 backdrop-blur-xl shadow-2xl border border-white/20 rounded-xl overflow-hidden origin-top-left animate-in zoom-in-75 duration-200"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50 bg-accent/30">
                        <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-primary" />
                            <h2 className="text-sm font-semibold text-foreground">Layers</h2>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
                        >
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Layers List */}
                    <div className="p-2.5 max-h-64 overflow-y-auto">
                        <div className="space-y-1">
                            {displayLayers.map((layer) => {
                                const isEnabled = visibleLayers[layer.id] ?? true
                                const color = layer.color || '#6b7280'

                                return (
                                    <div
                                        key={layer.id}
                                        className={cn(
                                            "flex items-center justify-between rounded-lg px-2.5 py-2 transition-all cursor-pointer",
                                            isEnabled
                                                ? "bg-primary/10 border border-primary/30"
                                                : "hover:bg-accent/50 border border-transparent"
                                        )}
                                        onClick={(e) => { e.stopPropagation(); onToggleLayer(layer.id); }}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="h-3 w-3 rounded-full shadow-sm ring-1 ring-white/20"
                                                style={{ backgroundColor: color }}
                                            />
                                            <span className="text-xs font-medium text-foreground">{layer.name}</span>
                                        </div>
                                        {/* Modern toggle */}
                                        <div
                                            className={cn(
                                                "relative h-5 w-9 rounded-full transition-colors",
                                                isEnabled ? "bg-primary" : "bg-muted"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                                                    isEnabled ? "translate-x-4" : "translate-x-0.5"
                                                )}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Legend Toggle */}
                    {onToggleLegend && (
                        <div className="border-t border-border/50 p-2.5 bg-accent/10">
                            <div
                                className="flex items-center justify-between rounded-lg px-2.5 py-2 transition-all cursor-pointer hover:bg-accent/50"
                                onClick={(e) => { e.stopPropagation(); onToggleLegend(); }}
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="h-3 w-3 rounded-md bg-white/20 shadow-sm ring-1 ring-white/10" />
                                    <span className="text-xs font-medium text-foreground">Show Legend</span>
                                </div>
                                <div
                                    className={cn(
                                        "relative h-5 w-9 rounded-full transition-colors",
                                        showLegend ? "bg-primary" : "bg-muted"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                                            showLegend ? "translate-x-4" : "translate-x-0.5"
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Base Map Selector */}
                    {onBaseStyleChange && (
                        <div className="border-t border-border/50 p-2.5 bg-accent/20">
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Base Map</p>
                            <div className="flex gap-1.5">
                                {[
                                    { id: 'dark', label: 'Dark', bg: 'bg-slate-900' },
                                    { id: 'satellite', label: 'Satellite', bg: 'bg-emerald-700' },
                                ].map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={(e) => { e.stopPropagation(); onBaseStyleChange(style.id); }}
                                        className={cn(
                                            "flex-1 rounded-lg p-1.5 transition-all border",
                                            baseStyle === style.id
                                                ? "border-primary bg-primary/10 ring-1 ring-primary/50"
                                                : "border-border hover:border-primary/50"
                                        )}
                                    >
                                        <div className={cn("h-6 rounded", style.bg)} />
                                        <p className="text-[9px] font-medium text-center mt-1">{style.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
