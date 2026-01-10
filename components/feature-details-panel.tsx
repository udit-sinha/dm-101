"use client"

import { useState, useRef, useEffect, useMemo } from 'react'
import { X, GripHorizontal, Download, Share2, SearchIcon, TableIcon, BarChart3, MessageSquarePlus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Feature {
    id: string
    properties: Record<string, any>
    geometry: {
        type: string
        coordinates: any
    }
    layerName?: string
}

export interface FeatureDetailsPanelProps {
    features: Feature[]
    onClose: () => void
    onZoomTo?: (feature: Feature) => void
    onZoomToAll?: () => void
    className?: string
    initialHeight?: number
    minHeight?: number
    maxHeight?: number
    /** Show "Add to Chat" button for selection mode */
    showAddToChat?: boolean
    /** Callback when user clicks "Add to Chat" */
    onAddToChat?: (features: Feature[]) => void
}

// Group features by layer name
function groupFeaturesByType(features: Feature[]) {
    const groups: Record<string, Feature[]> = {}

    features.forEach(f => {
        // Use layerName for tab naming (like 'Lease Blocks', 'Pipelines', 'Active Alerts')
        const key = f.layerName || (f.geometry.type === 'Point' ? 'Points' : f.geometry.type === 'LineString' ? 'Lines' : 'Polygons')

        if (!groups[key]) {
            groups[key] = []
        }
        groups[key].push(f)
    })

    return groups
}

export function FeatureDetailsPanel({
    features,
    onClose,
    onZoomTo,
    onZoomToAll,
    className,
    initialHeight = 40,
    minHeight = 20,
    maxHeight = 80,
    showAddToChat = false,
    onAddToChat
}: FeatureDetailsPanelProps) {
    const [panelHeight, setPanelHeight] = useState(initialHeight)
    const [isDragging, setIsDragging] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'table' | 'chart'>('table')
    const [selectedRow, setSelectedRow] = useState<string | null>(null)
    const panelRef = useRef<HTMLDivElement>(null)

    // Group features by type
    const groupedFeatures = useMemo(() => groupFeaturesByType(features), [features])
    const tabKeys = Object.keys(groupedFeatures)
    const [activeTab, setActiveTab] = useState(tabKeys[0] || '')

    // Update activeTab when features change
    useEffect(() => {
        if (tabKeys.length > 0 && !tabKeys.includes(activeTab)) {
            setActiveTab(tabKeys[0])
        }
    }, [features, tabKeys, activeTab])

    // Handle drag resize
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return
            const containerHeight = window.innerHeight
            const newHeight = ((containerHeight - e.clientY) / containerHeight) * 100
            if (newHeight >= minHeight && newHeight <= maxHeight) {
                setPanelHeight(newHeight)
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, minHeight, maxHeight])

    const handleDragStart = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleExportCSV = () => {
        const activeFeatures = groupedFeatures[activeTab] || []
        if (activeFeatures.length === 0) return

        const keys = new Set<string>()
        activeFeatures.forEach(f => Object.keys(f.properties).forEach(k => keys.add(k)))
        const headers = ['id', ...Array.from(keys)]
        const rows = activeFeatures.map(f => {
            return headers.map(h => {
                if (h === 'id') return f.id
                const val = f.properties[h]
                return typeof val === 'string' && val.includes(',') ? `"${val}"` : val ?? ''
            }).join(',')
        })
        const csv = [headers.join(','), ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${activeTab}_${activeFeatures.length}_features.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleRowClick = (feature: Feature) => {
        setSelectedRow(feature.id)
        onZoomTo?.(feature)
    }

    const handleClose = () => {
        onZoomToAll?.()
        onClose()
    }

    // Get all unique property keys for a group
    const getPropertyKeys = (group: Feature[]) => {
        const keys = new Set<string>()
        group.forEach(f => Object.keys(f.properties).forEach(k => keys.add(k)))
        return Array.from(keys).filter(k => !['id', 'geometry'].includes(k))
    }

    // Filter features by search
    const filterFeatures = (group: Feature[]) => {
        if (!searchQuery) return group
        return group.filter(f => {
            const name = f.properties.name || f.id || ''
            return name.toLowerCase().includes(searchQuery.toLowerCase())
        })
    }

    const renderValue = (key: string, value: any) => {
        if (value === null || value === undefined) return '-'

        if (key === 'severity' || key === 'status' || key === 'quality') {
            const isPositive = ['High', 'Active', 'Good'].includes(value)
            const isNeutral = ['Medium', 'Pending'].includes(value)
            return (
                <span className={cn(
                    "inline-block rounded px-1.5 py-0.5 text-[10px] font-medium",
                    isPositive
                        ? "bg-green-500/20 text-green-700"
                        : isNeutral
                            ? "bg-yellow-500/20 text-yellow-700"
                            : "bg-gray-500/20 text-gray-600"
                )}>
                    {value}
                </span>
            )
        }

        return String(value)
    }

    // Render table for a group of features
    const renderTable = (group: Feature[], showHeader: boolean = true) => {
        const filtered = filterFeatures(group)
        const propertyKeys = getPropertyKeys(group).slice(0, 5)  // Show first 5 columns

        return (
            <table className="w-full text-xs">
                {showHeader && (
                    <thead className="sticky top-0 bg-accent/50">
                        <tr className="border-b border-border">
                            <th className="px-2 py-1 text-left font-semibold">Name</th>
                            {propertyKeys.map(key => (
                                <th key={key} className="px-2 py-1 text-left font-semibold capitalize">
                                    {key.replace(/_/g, ' ')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody>
                    {filtered.map((feature, idx) => (
                        <tr
                            key={feature.id || idx}
                            onClick={() => handleRowClick(feature)}
                            className={cn(
                                "border-b border-border/50 hover:bg-accent/50 cursor-pointer transition-colors",
                                idx % 2 === 0 && "bg-accent/20",
                                selectedRow === feature.id && "bg-primary/20 ring-1 ring-primary"
                            )}
                        >
                            <td className="px-2 py-1 font-medium">
                                {feature.properties.name || feature.id || `Feature ${idx + 1}`}
                            </td>
                            {propertyKeys.map(key => (
                                <td key={key} className="px-2 py-1">
                                    {renderValue(key, feature.properties[key])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        )
    }

    // Calculate summary stats
    const totalFeatures = features.length
    const summaryParts = tabKeys.map(k => `${groupedFeatures[k].length} ${k}`)

    return (
        <div
            ref={panelRef}
            className={cn(
                "absolute left-0 right-0 bottom-0 z-30 border-t border-border bg-card shadow-2xl animate-in slide-in-from-bottom",
                className
            )}
            style={{ height: `${panelHeight}%` }}
        >
            {/* Drag Handle Header */}
            <div
                className="flex h-6 cursor-ns-resize items-center justify-between bg-accent/50 px-3"
                onMouseDown={handleDragStart}
            >
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    {summaryParts.map((part, i) => (
                        <span key={i}>
                            {i > 0 && <span className="mx-1">|</span>}
                            <span className="font-semibold">{part}</span>
                        </span>
                    ))}
                </div>
                <div className="flex items-center gap-1">
                    <GripHorizontal className="h-3 w-3 text-muted-foreground" />
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            handleClose()
                        }}
                        className="flex items-center justify-center h-5 w-5 hover:bg-accent/80 rounded"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex h-[calc(100%-24px)] flex-col">
                {/* Toolbar with Tabs */}
                <div className="flex items-center justify-between gap-2 border-b border-border bg-accent/20 px-3 py-1.5">
                    {/* Tabs */}
                    <div className="flex gap-1">
                        {tabKeys.map(key => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={cn(
                                    "rounded px-3 py-1 text-xs font-medium transition-colors",
                                    activeTab === key
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
                                )}
                            >
                                {key} ({groupedFeatures[key]?.length || 0})
                            </button>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        {/* Search */}
                        <div className="relative">
                            <SearchIcon className="absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-6 w-32 rounded border border-border bg-background pl-6 pr-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        {/* View Toggle */}
                        <button
                            onClick={() => setViewMode(viewMode === 'table' ? 'chart' : 'table')}
                            className={cn(
                                "rounded p-1 text-xs transition-colors",
                                viewMode === 'chart'
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent"
                            )}
                            title={viewMode === 'table' ? 'Chart View' : 'Table View'}
                        >
                            {viewMode === 'table' ? <BarChart3 className="h-3.5 w-3.5" /> : <TableIcon className="h-3.5 w-3.5" />}
                        </button>

                        {/* Export */}
                        <button
                            onClick={handleExportCSV}
                            className="rounded p-1 text-xs text-muted-foreground hover:bg-accent"
                            title="Export CSV"
                        >
                            <Download className="h-3.5 w-3.5" />
                        </button>

                        {/* Share */}
                        <button
                            onClick={() => console.log('Share selection')}
                            className="rounded p-1 text-xs text-muted-foreground hover:bg-accent"
                            title="Share Selection"
                        >
                            <Share2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Add to Chat - Only shown in selection mode */}
                        {showAddToChat && onAddToChat && (
                            <button
                                onClick={() => onAddToChat(features)}
                                className="flex items-center gap-1.5 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                                title="Add selection to chat context"
                            >
                                <MessageSquarePlus className="h-3.5 w-3.5" />
                                Add to Chat
                            </button>
                        )}
                    </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-auto p-2">
                    {viewMode === 'table' ? (
                        renderTable(groupedFeatures[activeTab] || [])
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <div className="text-center">
                                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <p className="mt-2 text-xs text-muted-foreground">{activeTab} Distribution Chart</p>
                                <p className="mt-1 text-[10px] text-muted-foreground/70">Chart visualization coming soon</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
