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
import { Search, Check, X, AlertTriangle, CheckCircle2, FileText, Layers } from 'lucide-react'
import type { ExtractionReportArtifactData, ExtractedWellEntry, ExtractedTopEntry, ExtractedLogEntry } from '@/lib/types/chat'
import { cn } from '@/lib/utils'

interface ExtractionReportEditorProps {
    data: ExtractionReportArtifactData
    open: boolean
    onOpenChange: (open: boolean) => void
    onApprove?: () => void
    onReject?: () => void
}

// Status icon component
function StatusIcon({ status }: { status: string }) {
    switch (status) {
        case 'ok':
        case 'matched':
            return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        case 'warning':
        case 'unmatched':
            return <AlertTriangle className="h-4 w-4 text-amber-500" />
        case 'error':
            return <X className="h-4 w-4 text-red-500" />
        default:
            return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    }
}

export function ExtractionReportEditor({
    data,
    open,
    onOpenChange,
    onApprove,
    onReject
}: ExtractionReportEditorProps) {
    // Use empty arrays as fallbacks
    const wellHeaders = data.wellHeaders || []
    const wellTops = data.wellTops || []
    const logHeaders = data.logHeaders || []

    // Search state
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState('wells')

    // Filter wells by search
    const filteredWells = useMemo(() => {
        if (!searchQuery) return wellHeaders
        const q = searchQuery.toLowerCase()
        return wellHeaders.filter(w =>
            w.wellName.toLowerCase().includes(q) ||
            (w.uwi && w.uwi.toLowerCase().includes(q)) ||
            (w.operator && w.operator.toLowerCase().includes(q))
        )
    }, [wellHeaders, searchQuery])

    // Filter tops by search
    const filteredTops = useMemo(() => {
        if (!searchQuery) return wellTops
        const q = searchQuery.toLowerCase()
        return wellTops.filter(t =>
            t.wellName.toLowerCase().includes(q) ||
            t.formation.toLowerCase().includes(q)
        )
    }, [wellTops, searchQuery])

    // Filter logs by search
    const filteredLogs = useMemo(() => {
        if (!searchQuery) return logHeaders
        const q = searchQuery.toLowerCase()
        return logHeaders.filter(l =>
            l.fileName.toLowerCase().includes(q) ||
            l.wellName.toLowerCase().includes(q)
        )
    }, [logHeaders, searchQuery])

    // Stats
    const wellsOk = wellHeaders.filter(w => w.status === 'ok').length
    const wellsWarning = wellHeaders.filter(w => w.status === 'warning').length
    const logsMatched = logHeaders.filter(l => l.status === 'matched').length
    const logsUnmatched = logHeaders.filter(l => l.status === 'unmatched').length

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] max-h-[90vh] h-[90vh] flex flex-col p-0">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <DialogTitle className="text-lg font-semibold">
                        Review Extraction Report
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        {data.source} — Review and correct extracted data before proceeding
                    </p>
                </DialogHeader>

                {/* Summary bar */}
                <div className="px-6 py-3 border-b bg-muted/30 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span className="text-muted-foreground">Wells OK:</span>
                            <span className="font-medium">{wellsOk}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <span className="text-muted-foreground">Needs Attention:</span>
                            <span className="font-medium">{wellsWarning}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-blue-600" />
                            <span className="text-muted-foreground">Tops:</span>
                            <span className="font-medium">{wellTops.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Logs:</span>
                            <span className="font-medium">{logsMatched}/{logHeaders.length} matched</span>
                        </div>
                    </div>
                </div>

                {/* Tabs and filters */}
                <div className="px-6 py-3 border-b shrink-0">
                    <div className="flex items-center justify-between gap-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="h-8">
                                <TabsTrigger value="wells" className="text-xs px-3">
                                    Well Headers ({wellHeaders.length})
                                </TabsTrigger>
                                <TabsTrigger value="tops" className="text-xs px-3">
                                    Well Tops ({wellTops.length})
                                </TabsTrigger>
                                <TabsTrigger value="logs" className="text-xs px-3">
                                    Log Headers ({logHeaders.length})
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 w-48 pl-8 text-xs"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1 px-6">
                    {activeTab === 'wells' && (
                        <Table>
                            <TableHeader className="sticky top-0 bg-background">
                                <TableRow>
                                    <TableHead className="w-10"></TableHead>
                                    <TableHead>Well Name</TableHead>
                                    <TableHead>UWI</TableHead>
                                    <TableHead>Operator</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Issue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredWells.map((well) => (
                                    <TableRow
                                        key={well.id}
                                        className={cn(
                                            "transition-colors",
                                            well.status === 'warning' && "bg-amber-50/50"
                                        )}
                                    >
                                        <TableCell>
                                            <StatusIcon status={well.status} />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {well.wellName}
                                        </TableCell>
                                        <TableCell className={cn(
                                            "text-xs",
                                            !well.uwi && "text-muted-foreground/50"
                                        )}>
                                            {well.uwi || '—'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs">
                                            {well.operator || '—'}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {well.sourceFile}
                                            {well.sourcePage && <span className="ml-1">p{well.sourcePage}</span>}
                                        </TableCell>
                                        <TableCell className="text-xs text-amber-600 max-w-48 truncate">
                                            {well.issue || ''}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredWells.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            No well headers extracted
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}

                    {activeTab === 'tops' && (
                        <Table>
                            <TableHeader className="sticky top-0 bg-background">
                                <TableRow>
                                    <TableHead>Well</TableHead>
                                    <TableHead>Formation</TableHead>
                                    <TableHead className="text-right">MD (m)</TableHead>
                                    <TableHead className="text-right">TVD (m)</TableHead>
                                    <TableHead>Source</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTops.map((top, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell className="font-medium">{top.wellName}</TableCell>
                                        <TableCell>{top.formation}</TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            {top.md?.toFixed(1) || '—'}
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            {top.tvd?.toFixed(1) || '—'}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {top.sourceFile} {top.sourcePage}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredTops.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                            No formation tops extracted
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}

                    {activeTab === 'logs' && (
                        <Table>
                            <TableHeader className="sticky top-0 bg-background">
                                <TableRow>
                                    <TableHead className="w-10"></TableHead>
                                    <TableHead>File</TableHead>
                                    <TableHead>Well</TableHead>
                                    <TableHead>Curves</TableHead>
                                    <TableHead>Depth Range</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.map((log, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>
                                            <StatusIcon status={log.status} />
                                        </TableCell>
                                        <TableCell className="font-medium text-xs">
                                            {log.fileName}
                                        </TableCell>
                                        <TableCell>{log.wellName}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground max-w-32">
                                            {log.curves.length > 0 ? (
                                                <span title={log.curves.join(', ')}>
                                                    {log.curves.slice(0, 4).join(', ')}
                                                    {log.curves.length > 4 && ` +${log.curves.length - 4}`}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground/50">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                            {log.depthMin && log.depthMax ? (
                                                <span>{log.depthMin.toFixed(0)}–{log.depthMax.toFixed(0)}m</span>
                                            ) : (
                                                <span className="text-muted-foreground/50">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs font-normal">
                                                {log.status === 'matched' ? 'Matched' :
                                                    log.status === 'unmatched' ? 'Unmatched' : 'Error'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredLogs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            No log files found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </ScrollArea>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 border-t shrink-0">
                    <div className="flex items-center justify-between w-full">
                        <p className="text-sm text-muted-foreground">
                            {wellsWarning > 0
                                ? `${wellsWarning} item(s) need attention before proceeding`
                                : 'All extractions validated'
                            }
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
                                Reject
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => onApprove?.()}
                            >
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Approve & Continue
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
