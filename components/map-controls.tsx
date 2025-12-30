"use client"

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MapStyle {
  id: string
  name: string
  url: string
}

interface MapControlsProps {
  baseStyle: string
  onStyleChange: (style: string) => void
  styles?: MapStyle[]
}

export function MapControls({ baseStyle, onStyleChange, styles }: MapControlsProps) {
  // Default styles if not provided
  const defaultStyles: MapStyle[] = [
    { id: 'dark', name: 'Dark', url: '/styles/dark.json' },
    { id: 'satellite', name: 'Satellite', url: '/styles/satellite.json' },
  ]

  const displayStyles = styles || defaultStyles

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
        {displayStyles.map((style) => (
          <Button
            key={style.id}
            variant={baseStyle === style.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStyleChange(style.id)}
            className="flex items-center gap-2"
          >
            {style.id === 'dark' && <Moon className="h-4 w-4" />}
            {style.id === 'satellite' && <Sun className="h-4 w-4" />}
            {style.name}
          </Button>
        ))}
      </div>
    </div>
  )
}

