"use client"

import { Feature } from './map-view'
import { X, Download, FileJson } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SelectionResultsProps {
    features: Feature[]
    onClose: () => void
    onZoomTo: (feature: Feature) => void
}

export function SelectionResults({ features, onClose, onZoomTo }: SelectionResultsProps) {
    const handleExportCSV = () => {
        if (features.length === 0) return

        // Get all unique property keys
        const keys = new Set<string>()
        features.forEach(f => Object.keys(f.properties).forEach(k => keys.add(k)))
        const headers = ['id', ...Array.from(keys)]

        // Create CSV content
        const rows = features.map(f => {
            return headers.map(h => {
                if (h === 'id') return f.id
                const val = f.properties[h]
                return typeof val === 'string' && val.includes(',') ? `"${val}"` : val ?? ''
            }).join(',')
        })

        const csv = [headers.join(','), ...rows].join('\n')

        // Download
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `selection_${features.length}_features.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleExportGeoJSON = () => {
        if (features.length === 0) return

        const geojson = {
            type: 'FeatureCollection',
            features: features.map(f => ({
                type: 'Feature',
                id: f.id,
                properties: f.properties,
                geometry: f.geometry,
            })),
        }

        const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `selection_${features.length}_features.geojson`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="w-80 bg-white rounded-lg shadow-xl">
            <div className="p-3 border-b flex items-center justify-between">
                <h3 className="font-semibold text-sm">
                    Selected Features ({features.length})
                </h3>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <ScrollArea className="h-64">
                <div className="p-2 space-y-2">
                    {features.map((feature, idx) => (
                        <div
                            key={feature.id || idx}
                            className="p-2 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => onZoomTo(feature)}
                        >
                            <div className="font-medium text-gray-900">
                                {feature.properties.name || feature.id || `Feature ${idx + 1}`}
                            </div>
                            <div className="text-xs text-gray-500">
                                {feature.properties.type || feature.geometry.type}
                                {feature.properties.severity && ` • ${feature.properties.severity}`}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-2 border-t flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={handleExportCSV}
                >
                    <Download className="h-3 w-3 mr-1" />
                    CSV
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={handleExportGeoJSON}
                >
                    <FileJson className="h-3 w-3 mr-1" />
                    GeoJSON
                </Button>
            </div>
        </div>
    )
}
