'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Copy, Maximize2 } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface DataCardProps {
    title?: string
    children: React.ReactNode
    className?: string
    onExport?: () => void
    onCopy?: () => void
    onExpand?: () => void
}

export function DataCard({ title, children, className, onExport, onCopy, onExpand }: DataCardProps) {
    const cardRef = React.useRef<HTMLDivElement>(null)

    const handleCopy = () => {
        // Get table text content for copying
        const tableElement = cardRef.current?.querySelector('table')
        if (tableElement) {
            const text = tableElement.textContent || ''
            navigator.clipboard.writeText(text)
        }
        onCopy?.()
    }

    const handleExport = () => {
        // Export as CSV
        const tableElement = cardRef.current?.querySelector('table')
        if (tableElement) {
            const rows = tableElement.querySelectorAll('tr')
            let csv = ''
            rows.forEach(row => {
                const cells = row.querySelectorAll('th, td')
                const rowData = Array.from(cells).map(cell => `"${cell.textContent?.replace(/"/g, '""') || ''}"`)
                csv += rowData.join(',') + '\n'
            })
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${title || 'data'}.csv`
            a.click()
            URL.revokeObjectURL(url)
        }
        onExport?.()
    }

    return (
        <Card ref={cardRef} className={`w-full overflow-hidden border-primary/20 bg-primary/[0.02] ${className || ''}`} data-data-card>
            {/* Header with title and actions */}
            <CardHeader className="py-2 px-3 border-b border-border bg-muted/50 flex-row items-center justify-end space-y-0">
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-secondary/50 transition-colors rounded-md"
                        onClick={handleCopy}
                        title="Copy to clipboard"
                    >
                        <Copy className="h-3 w-3 text-muted-foreground" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-secondary/50 transition-colors rounded-md"
                        onClick={handleExport}
                        title="Export as CSV"
                    >
                        <Download className="h-3 w-3 text-muted-foreground" />
                    </Button>
                    {onExpand && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-secondary/50 transition-colors rounded-md"
                            onClick={onExpand}
                            title="Expand"
                        >
                            <Maximize2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            {/* Content - scrollable table area */}
            <CardContent className="p-0">
                <div className="w-full overflow-x-auto overflow-y-auto max-h-[300px]">
                    {children}
                </div>
            </CardContent>
        </Card>
    )
}

// Re-export table components for easy use with custom styling
export function DataTable({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
    return <Table className={`text-xs ${className || ''}`} {...props} />
}

export function DataTableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
    return <TableHeader className={`bg-muted/30 sticky top-0 ${className || ''}`} {...props} />
}

export function DataTableBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
    return <TableBody {...props} />
}

export function DataTableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
    return <TableRow className={`border-primary/10 hover:bg-primary/[0.04] transition-colors ${className || ''}`} {...props} />
}

export function DataTableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
    return <TableHead className={`text-xs font-semibold text-foreground whitespace-nowrap px-3 py-2 h-8 ${className || ''}`} {...props} />
}

export function DataTableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
    return <TableCell className={`text-xs text-muted-foreground px-3 py-2 whitespace-nowrap ${className || ''}`} {...props} />
}
