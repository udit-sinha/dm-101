import { SourceMetadata } from '@/lib/types/chat'
import { Database, FileText, Filter } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'

interface SourceMetadataBadgeProps {
    metadata: SourceMetadata[]
}

export function SourceMetadataBadge({ metadata }: SourceMetadataBadgeProps) {
    if (!metadata || !Array.isArray(metadata) || metadata.length === 0) {
        return null
    }

    // For now, show first source (most queries have single source)
    const source = metadata[0]

    // Defensive: ensure source and its properties exist
    if (!source || typeof source !== 'object') {
        return null
    }

    const columnsUsed = source.columnsUsed || []
    const rowCount = source.rowCount || 0
    const sourceText = `${source.sourceFile || source.table || 'database'} | ${rowCount} row${rowCount !== 1 ? 's' : ''} | ${columnsUsed.length} column${columnsUsed.length !== 1 ? 's' : ''}`

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50/50 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100/50 transition-colors cursor-help">
                        <Database className="h-3.5 w-3.5 text-gray-500" />
                        <span className="font-medium">{sourceText}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-sm">
                    <div className="space-y-2 p-1">
                        <div className="flex items-center gap-2 text-xs">
                            <FileText className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-semibold">Data Source</span>
                        </div>

                        <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Table:</span>
                                <span className="font-mono font-medium">{source.table}</span>
                            </div>

                            {source.sourceFile && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">File:</span>
                                    <span className="font-mono text-xs">{source.sourceFile}</span>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <span className="text-gray-500">Rows:</span>
                                <span className="font-medium">{rowCount.toLocaleString()}</span>
                            </div>

                            {columnsUsed.length > 0 && (
                                <div>
                                    <div className="text-gray-500 mb-1">Columns used:</div>
                                    <div className="flex flex-wrap gap-1">
                                        {columnsUsed.map((col, idx) => (
                                            <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0">
                                                {col}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {source.queryFilter && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                        <Filter className="h-3 w-3" />
                                        <span>Filter applied:</span>
                                    </div>
                                    <code className="block text-[10px] bg-gray-100 px-2 py-1 rounded font-mono break-all">
                                        {source.queryFilter}
                                    </code>
                                </div>
                            )}
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
