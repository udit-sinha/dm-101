"use client"

import Image from 'next/image'

interface MapStyle {
    id: string
    name: string
    url: string
}

interface BaseMapSelectorProps {
    baseStyle: string
    onStyleChange: (style: string) => void
    styles?: MapStyle[]
}

// Preview images for base maps (using data URIs for simplicity)
const STYLE_PREVIEWS: Record<string, { gradient: string; label: string }> = {
    dark: {
        gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        label: 'Dark'
    },
    satellite: {
        gradient: 'linear-gradient(135deg, #2d5016 0%, #1a3a0a 50%, #0d2b0d 100%)',
        label: 'Satellite'
    }
}

export function BaseMapSelector({ baseStyle, onStyleChange, styles }: BaseMapSelectorProps) {
    const defaultStyles: MapStyle[] = [
        { id: 'dark', name: 'Dark', url: '/styles/dark.json' },
        { id: 'satellite', name: 'Satellite', url: '/styles/satellite.json' },
    ]

    const displayStyles = styles || defaultStyles

    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-2">
            <div className="text-xs font-medium text-gray-500 mb-2 px-1">Base Map</div>
            <div className="flex gap-2">
                {displayStyles.map((style) => {
                    const preview = STYLE_PREVIEWS[style.id] || STYLE_PREVIEWS.dark
                    const isActive = baseStyle === style.id

                    return (
                        <button
                            key={style.id}
                            onClick={() => onStyleChange(style.id)}
                            className={`relative group cursor-pointer transition-all duration-200 ${isActive ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1'
                                }`}
                        >
                            {/* Preview Rectangle */}
                            <div
                                className="w-16 h-12 rounded-md overflow-hidden"
                                style={{ background: preview.gradient }}
                            >
                                {/* Simulated map features */}
                                <div className="w-full h-full relative">
                                    {style.id === 'dark' && (
                                        <>
                                            <div className="absolute top-2 left-2 w-3 h-0.5 bg-gray-400 opacity-60" />
                                            <div className="absolute top-4 left-3 w-2 h-0.5 bg-gray-400 opacity-60" />
                                            <div className="absolute bottom-3 right-2 w-1.5 h-1.5 rounded-full bg-blue-400 opacity-80" />
                                        </>
                                    )}
                                    {style.id === 'satellite' && (
                                        <>
                                            <div className="absolute top-2 left-2 w-3 h-3 bg-green-600/30 rounded-sm" />
                                            <div className="absolute bottom-2 right-2 w-2 h-2 bg-blue-400/50 rounded-full" />
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Label */}
                            <div className={`text-xs text-center mt-1 font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'
                                }`}>
                                {style.name}
                            </div>

                            {/* Active indicator */}
                            {isActive && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
