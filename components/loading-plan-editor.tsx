'use client'

import { useState, useMemo } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, ArrowUpDown, Check, X, AlertCircle, Circle } from 'lucide-react'
import type { LoadingPlanArtifactData, WellEntry, WellActionType } from '@/lib/types/chat'
import { cn } from '@/lib/utils'

interface LoadingPlanEditorProps {
    data: LoadingPlanArtifactData
    open: boolean
    onOpenChange: (open: boolean) => void
    onApprove?: (approvedWellIds: string[]) => void
    onReject?: () => void
}

type SortField = 'wellName' | 'fileName' | 'matchConfidence' | 'qualityScore'
type SortDirection = 'asc' | 'desc'

// Status icon component
function StatusIcon({ action }: { action: WellActionType }) {
    switch (action) {
        case 'link':
            return <span className="text-emerald-600">●</span>
        case 'create':
            return <span className="text-blue-600">○</span>
        case 'review':
            return <span className="text-amber-600">◐</span>
        case 'blocked':
            return <span className="text-gray-400">◌</span>
    }
}

export function LoadingPlanEditor({
    data,
    open,
    onOpenChange,
    onApprove,
    onReject
}: LoadingPlanEditorProps) {
    // Use empty arrays as fallbacks for optional data
    const readyWells = data.readyWells || []
    const reviewWells = data.reviewWells || []
    const blockedFiles = data.blockedFiles || []

    // Combine all wells for the table view
    const allWells = useMemo(() => [
        ...readyWells,
        ...reviewWells,
    ], [readyWells, reviewWells])

    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
        // Pre-select all ready wells
        return new Set(readyWells.map(w => w.id))
    })

    // Search and sort state
    const [searchQuery, setSearchQuery] = useState('')
    const [sortField, setSortField] = useState<SortField>('wellName')
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
    const [activeTab, setActiveTab] = useState('all')

    // Filter and sort wells
    const filteredWells = useMemo(() => {
        let wells = [...allWells]

        // Filter by tab
        if (activeTab === 'ready') {
            wells = wells.filter(w => w.action === 'link' || w.action === 'create')
        } else if (activeTab === 'review') {
            wells = wells.filter(w => w.action === 'review')
        }

        // Filter by search
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            wells = wells.filter(w =>
                w.wellName.toLowerCase().includes(q) ||
                w.fileName.toLowerCase().includes(q)
            )
        }

        // Sort
        wells.sort((a, b) => {
            let aVal: string | number = a[sortField] ?? ''
            let bVal: string | number = b[sortField] ?? ''

            if (typeof aVal === 'string') aVal = aVal.toLowerCase()
            if (typeof bVal === 'string') bVal = bVal.toLowerCase()

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
            return 0
        })

        return wells
    }, [allWells, activeTab, searchQuery, sortField, sortDirection])

    // Selection handlers
    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const selectAll = () => {
        const readyIds = filteredWells
            .filter(w => w.action !== 'blocked')
            .map(w => w.id)
        setSelectedIds(new Set(readyIds))
    }

    const selectNone = () => {
        setSelectedIds(new Set())
    }

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    // Stats - use counts from backend or fallback to array lengths
    const selectedCount = selectedIds.size
    const readyCount = data.readyCount ?? readyWells.length
    const reviewCount = data.reviewCount ?? reviewWells.length
    const blockedCount = data.blockedCount ?? blockedFiles.length

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] h-[90vh] flex flex-col p-0">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <DialogTitle className="text-lg font-semibold">
                        Review Loading Plan
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        {data.source} — {data.fileCount} files scanned
                    </p>
                </DialogHeader>

                {/* Summary bar */}
                <div className="px-6 py-3 border-b bg-muted/30 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <StatusIcon action="link" />
                            <span className="text-muted-foreground">Ready:</span>
                            <span className="font-medium">{readyCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusIcon action="review" />
                            <span className="text-muted-foreground">Review:</span>
                            <span className="font-medium">{reviewCount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusIcon action="blocked" />
                            <span className="text-muted-foreground">Blocked:</span>
                            <span className="font-medium">{blockedCount}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Quality:</span>
                        <span className={cn(
                            "font-semibold",
                            (data.overallQuality ?? 0) >= 80 ? "text-emerald-600" :
                                (data.overallQuality ?? 0) >= 60 ? "text-amber-600" : "text-red-600"
                        )}>
                            {data.overallQuality ?? 0}%
                        </span>
                    </div>
                </div>

                {/* Tabs and filters */}
                <div className="px-6 py-3 border-b shrink-0">
                    <div className="flex items-center justify-between gap-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="h-8">
                                <TabsTrigger value="all" className="text-xs px-3">
                                    All ({allWells.length})
                                </TabsTrigger>
                                <TabsTrigger value="ready" className="text-xs px-3">
                                    Ready ({readyCount})
                                </TabsTrigger>
                                <TabsTrigger value="review" className="text-xs px-3">
                                    Needs Review ({reviewCount})
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search wells..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-8 w-48 pl-8 text-xs"
                                />
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-7"
                                    onClick={selectAll}
                                >
                                    Select all
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-7"
                                    onClick={selectNone}
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <ScrollArea className="flex-1 px-6">
                    <Table>
                        <TableHeader className="sticky top-0 bg-background">
                            <TableRow>
                                <TableHead className="w-10">
                                    <Checkbox
                                        checked={selectedCount === filteredWells.filter(w => w.action !== 'blocked').length}
                                        onCheckedChange={(checked) => checked ? selectAll() : selectNone()}
                                    />
                                </TableHead>
                                <TableHead className="w-10"></TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => toggleSort('wellName')}
                                >
                                    <div className="flex items-center gap-1">
                                        Well
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => toggleSort('fileName')}
                                >
                                    <div className="flex items-center gap-1">
                                        File
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead>Curves</TableHead>
                                <TableHead>Depth</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead
                                    className="cursor-pointer hover:bg-muted/50 text-right"
                                    onClick={() => toggleSort('qualityScore')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        Quality
                                        <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead>Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredWells.map((well) => (
                                <TableRow
                                    key={well.id}
                                    className={cn(
                                        "transition-colors",
                                        selectedIds.has(well.id) && "bg-primary/[0.04]"
                                    )}
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.has(well.id)}
                                            onCheckedChange={() => toggleSelection(well.id)}
                                            disabled={well.action === 'blocked'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <StatusIcon action={well.action} />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {well.wellName}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {well.fileName}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-32">
                                        {well.curves && well.curves.length > 0 ? (
                                            <span title={well.curves.join(', ')}>
                                                {well.curves.slice(0, 4).join(', ')}
                                                {well.curves.length > 4 && ` +${well.curves.length - 4}`}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground/50">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {well.depthRange ? (
                                            <span>{well.depthRange.min.toFixed(0)}–{well.depthRange.max.toFixed(0)}m</span>
                                        ) : (
                                            <span className="text-muted-foreground/50">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs font-normal">
                                            {well.action === 'link' ? 'Link' :
                                                well.action === 'create' ? 'Create' :
                                                    well.action === 'review' ? 'Review' : 'Blocked'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={cn(
                                            "text-xs",
                                            well.qualityScore >= 80 ? "text-emerald-600" :
                                                well.qualityScore >= 60 ? "text-amber-600" : "text-red-600"
                                        )}>
                                            {well.qualityScore}%
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-40 truncate">
                                        {well.issue || (well.matchedWellName && `→ ${well.matchedWellName}`)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Blocked files section */}
                    {blockedFiles.length > 0 && (
                        <div className="mt-6 mb-4">
                            <h4 className="text-sm font-semibold mb-3">Cannot Process</h4>
                            <div className="space-y-2">
                                {blockedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <StatusIcon action="blocked" />
                                        <span className="font-medium">{file.fileName}</span>
                                        <span>— {file.reason}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 border-t shrink-0">
                    <div className="flex items-center justify-between w-full">
                        <p className="text-sm text-muted-foreground">
                            {selectedCount} of {allWells.length} wells selected
                        </p>
                        <div className="flex items-center gap-2">
                            <DialogClose asChild>
                                <Button variant="ghost" size="sm">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onReject?.()}
                            >
                                <X className="h-3.5 w-3.5 mr-1" />
                                Reject All
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => onApprove?.(Array.from(selectedIds))}
                                disabled={selectedCount === 0}
                            >
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Approve Selected ({selectedCount})
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
