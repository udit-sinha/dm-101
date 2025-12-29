"use client"

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MapControlsProps {
  baseStyle: 'dark' | 'satellite'
  onStyleChange: (style: 'dark' | 'satellite') => void
}

export function MapControls({ baseStyle, onStyleChange }: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      <div className="bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
        <Button
          variant={baseStyle === 'dark' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStyleChange('dark')}
          className="flex items-center gap-2"
        >
          <Moon className="h-4 w-4" />
          Dark
        </Button>
        <Button
          variant={baseStyle === 'satellite' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStyleChange('satellite')}
          className="flex items-center gap-2"
        >
          <Sun className="h-4 w-4" />
          Satellite
        </Button>
      </div>
    </div>
  )
}

