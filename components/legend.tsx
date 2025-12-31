import React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LegendProps {
    items: { label: string; color: string }[]
    hiddenItems: string[]
    onToggleItem: (label: string) => void
    onClose: () => void
    className?: string
}

export function Legend({ items, hiddenItems, onToggleItem, onClose, className }: LegendProps) {
    return (
        <div
            className={cn(
                "absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3",
                "px-4 py-2 rounded-full border border-white/10",
                "bg-black/60 shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-bottom-4",
                className
            )}
        >
            <div className="flex items-center gap-4 px-1">
                {items.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => onToggleItem(item.label)}
                        className={cn(
                            "flex items-center gap-2 text-xs font-medium transition-all hover:scale-105",
                            hiddenItems.includes(item.label)
                                ? "opacity-40 grayscale"
                                : "opacity-100"
                        )}
                        title={hiddenItems.includes(item.label) ? `Show ${item.label}` : `Hide ${item.label}`}
                    >
                        <div
                            className="h-3 w-3 rounded-full shadow-sm"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-white drop-shadow-sm whitespace-nowrap">{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="h-4 w-px bg-white/20 mx-1" />

            <button
                onClick={onClose}
                className="text-white/50 hover:text-white transition-colors"
                title="Hide Legend"
            >
                <X size={14} />
            </button>
        </div>
    )
}
