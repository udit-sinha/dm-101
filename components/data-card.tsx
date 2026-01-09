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
        <Card ref={cardRef} className={`w-full overflow-hidden ${className || ''}`} data-data-card>
            {/* Header with title and actions */}
            <CardHeader className="py-2 px-3 border-b bg-muted/30 flex-row items-center justify-between space-y-0">
                <span className="text-xs font-medium text-muted-foreground">
                    {title || 'Data'}
                </span>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleCopy}
                        title="Copy to clipboard"
                    >
                        <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleExport}
                        title="Export as CSV"
                    >
                        <Download className="h-3 w-3" />
                    </Button>
                    {onExpand && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={onExpand}
                            title="Expand"
                        >
                            <Maximize2 className="h-3 w-3" />
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
    return <TableHeader className={`bg-muted/50 sticky top-0 ${className || ''}`} {...props} />
}

export function DataTableBody(props: React.HTMLAttributes<HTMLTableSectionElement>) {
    return <TableBody {...props} />
}

export function DataTableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
    return <TableRow className={`hover:bg-muted/30 ${className || ''}`} {...props} />
}

export function DataTableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
    return <TableHead className={`text-xs font-medium text-muted-foreground whitespace-nowrap px-3 py-2 h-8 ${className || ''}`} {...props} />
}

export function DataTableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
    return <TableCell className={`text-xs px-3 py-2 whitespace-nowrap ${className || ''}`} {...props} />
}
