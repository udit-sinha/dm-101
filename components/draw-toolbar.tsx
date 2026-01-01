"use client"

import { useState } from 'react'
import { MousePointer, Square, Circle, Pencil, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type DrawMode = 'none' | 'rectangle' | 'circle' | 'polygon'

interface DrawToolbarProps {
    drawMode: DrawMode
    onModeChange: (mode: DrawMode) => void
    onClear: () => void
    selectedCount: number
}

export function DrawToolbar({ drawMode, onModeChange, onClear, selectedCount }: DrawToolbarProps) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-2 flex flex-col gap-1">
            <Button
                variant={drawMode === 'none' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onModeChange('none')}
                className="justify-start gap-2"
                title="Select Mode"
            >
                <MousePointer className="h-4 w-4" />
                <span className="text-xs">Select</span>
            </Button>

            <Button
                variant={drawMode === 'rectangle' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onModeChange('rectangle')}
                className="justify-start gap-2"
                title="Draw Rectangle"
            >
                <Square className="h-4 w-4" />
                <span className="text-xs">Rectangle</span>
            </Button>

            <Button
                variant={drawMode === 'circle' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onModeChange('circle')}
                className="justify-start gap-2"
                title="Draw Circle"
            >
                <Circle className="h-4 w-4" />
                <span className="text-xs">Circle</span>
            </Button>

            <Button
                variant={drawMode === 'polygon' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onModeChange('polygon')}
                className="justify-start gap-2"
                title="Draw Polygon"
            >
                <Pencil className="h-4 w-4" />
                <span className="text-xs">Polygon</span>
            </Button>

            {selectedCount > 0 && (
                <>
                    <div className="border-t my-1" />
                    <div className="text-xs text-center text-gray-600 py-1">
                        {selectedCount} selected
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="justify-start gap-2 text-red-500 hover:text-red-600"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-xs">Clear</span>
                    </Button>
                </>
            )}
        </div>
    )
}
