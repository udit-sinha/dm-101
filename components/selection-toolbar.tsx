"use client"

import { MousePointer, Square, Circle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DrawMode = 'none' | 'rectangle' | 'circle' | 'polygon'

interface SelectionToolbarProps {
    drawMode: DrawMode
    onModeChange: (mode: DrawMode) => void
    onClear: () => void
    selectedCount: number
}

const tools = [
    { id: 'rectangle' as DrawMode, icon: Square, label: 'Rectangle Select' },
    { id: 'circle' as DrawMode, icon: Circle, label: 'Circle Select' },
]

export function SelectionToolbar({ drawMode, onModeChange, onClear, selectedCount }: SelectionToolbarProps) {
    return (
        <div className="flex flex-col gap-1.5">
            {tools.map((tool) => {
                const Icon = tool.icon
                const isActive = drawMode === tool.id

                return (
                    <button
                        key={tool.id}
                        onClick={() => onModeChange(isActive ? 'none' : tool.id)}
                        className={cn(
                            "h-10 w-10 flex items-center justify-center rounded-md transition-all",
                            "border-2 shadow-lg backdrop-blur-md",
                            isActive
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-white/30 bg-white/60 text-foreground hover:border-white/50 hover:bg-white/70"
                        )}
                        title={tool.label}
                    >
                        <Icon className="h-4 w-4" />
                    </button>
                )
            })}

            {selectedCount > 0 && (
                <div className="mt-1 flex items-center justify-center">
                    <span className="text-[10px] font-bold bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full shadow-lg backdrop-blur-md">
                        {selectedCount}
                    </span>
                </div>
            )}
        </div>
    )
}
