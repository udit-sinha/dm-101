'use client'

import type { ArtifactSummary, AnalyticsArtifactData, ResearchArtifactData, DataQualityArtifactData, EntityResolutionArtifactData, LoadingPlanArtifactData, ExtractionReportArtifactData } from '@/lib/types/chat'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DataCard } from './data-card'
import { Copy, Building2, MapPin, Table as TableIcon, Code, Database, FileText, Pencil, Check, X, FileSearch, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Separator } from '@/components/ui/separator'
import { LoadingPlanEditor } from './loading-plan-editor'
import { ExtractionReportEditor } from './extraction-report-editor'

interface ArtifactPanelProps {
    artifact: ArtifactSummary
    onClose?: () => void
    onExport?: () => void
    // Loading plan specific props - allow external control
    openEditor?: boolean
    onEditorOpenChange?: (open: boolean) => void
    onLoadingPlanApprove?: (wellIds: string[]) => void
    onLoadingPlanReject?: () => void
}



export function ArtifactPanel({
    artifact,
    onClose,
    onExport,
    openEditor,
    onEditorOpenChange,
    onLoadingPlanApprove,
    onLoadingPlanReject
}: ArtifactPanelProps) {
    const [copied, setCopied] = useState(false)
    // Use external control if provided, otherwise internal state
    const [internalEditorOpen, setInternalEditorOpen] = useState(false)
    const editorOpen = openEditor ?? internalEditorOpen
    const setEditorOpen = onEditorOpenChange ?? setInternalEditorOpen

    const copyToClipboard = () => {
        const text = JSON.stringify(artifact.data, null, 2)
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Custom table components for markdown rendering
    const tableComponents = {
        table: ({ node, ...props }: any) => (
            <div className="not-prose grid grid-cols-1 w-full my-4">
                <DataCard title="Data Results">
                    <Table className="text-xs" {...props} />
                </DataCard>
            </div>
        ),
        thead: ({ node, ...props }: any) => (
            <TableHeader className="bg-muted/30 sticky top-0" {...props} />
        ),
        tbody: ({ node, ...props }: any) => <TableBody {...props} />,
        tr: ({ node, ...props }: any) => (
            <TableRow className="border-primary/10 hover:bg-primary/[0.04] transition-colors" {...props} />
        ),
        th: ({ node, ...props }: any) => (
            <TableHead className="text-xs font-semibold text-foreground whitespace-nowrap px-3 py-2 h-8" {...props} />
        ),
        td: ({ node, ...props }: any) => (
            <TableCell className="text-xs text-muted-foreground px-3 py-2 whitespace-nowrap" {...props} />
        ),
    }

    const renderContent = () => {
        const data = artifact.data

        switch (artifact.kind) {
            case 'analytics': {
                const analyticsData = data as AnalyticsArtifactData
                return (
                    <div className="space-y-5">
                        {/* Main answer text - flows directly */}
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {analyticsData.answer}
                        </p>

                        {/* Data with table */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <TableIcon className="h-4 w-4 text-primary" />
                                <h4 className="text-sm font-semibold text-foreground">Data</h4>
                            </div>
                            <div className="text-sm prose prose-sm max-w-none dark:prose-invert border-l-2 border-primary/20 pl-4">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={tableComponents}
                                >
                                    {analyticsData.details}
                                </ReactMarkdown>
                            </div>
                        </div>

                        {/* Code block */}
                        {analyticsData.code && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Code className="h-4 w-4 text-primary" />
                                    <h4 className="text-sm font-semibold text-foreground">SQL Query</h4>
                                </div>
                                <div className="border rounded-lg bg-muted/30 overflow-hidden border-l-2 border-primary/20">
                                    <div className="overflow-x-auto">
                                        <pre className="p-3 text-xs font-mono">
                                            <code>{analyticsData.code}</code>
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Datasets */}
                        {analyticsData.datasetsUsed && analyticsData.datasetsUsed.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Database className="h-4 w-4 text-primary" />
                                    <h4 className="text-sm font-semibold text-foreground">Datasets Used</h4>
                                </div>
                                <div className="flex flex-wrap gap-1.5 border-l-2 border-primary/20 pl-4">
                                    {analyticsData.datasetsUsed.map((ds) => (
                                        <Badge key={ds} variant="secondary" className="text-xs">
                                            {ds}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Execution time */}
                        {analyticsData.executionTimeMs && (
                            <p className="text-xs text-muted-foreground">
                                Execution time: {analyticsData.executionTimeMs}ms
                            </p>
                        )}
                    </div>
                )
            }

            case 'research': {
                const researchData = data as ResearchArtifactData
                return (
                    <div className="space-y-5">
                        {/* Markdown content - directly shows research findings */}
                        <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    ...tableComponents,
                                    h1: ({ node, ...props }) => <h2 className="text-base font-semibold text-foreground mt-6 mb-3" {...props} />,
                                    h2: ({ node, ...props }) => <h3 className="text-base font-semibold text-foreground mt-6 mb-3" {...props} />,
                                    h3: ({ node, ...props }) => <h4 className="text-sm font-semibold text-foreground mt-5 mb-2" {...props} />,
                                    h4: ({ node, ...props }) => <h5 className="text-sm font-medium text-foreground mt-4 mb-2" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="space-y-2 text-sm my-3 list-disc pl-5" {...props} />,
                                    li: ({ node, ...props }) => <li className="text-muted-foreground leading-relaxed" {...props} />,
                                    p: ({ node, ...props }) => <p className="text-muted-foreground mb-3 text-sm leading-relaxed" {...props} />,
                                    strong: ({ node, ...props }) => <span className="font-semibold text-foreground" {...props} />,
                                }}
                            >
                                {researchData.answer}
                            </ReactMarkdown>
                        </div>

                        {/* Sources */}
                        {researchData.sources && researchData.sources.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="text-sm font-semibold text-foreground mb-3">Sources</h4>
                                    <div className="space-y-2">
                                        {researchData.sources.map((source, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm">
                                                <Building2 className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <span className="font-medium text-foreground">{source.title}</span>
                                                    {source.url && (
                                                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs block truncate">
                                                            {source.url}
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )
            }

            case 'data-quality': {
                const dqData = data as DataQualityArtifactData
                return (
                    <div className="space-y-5">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-2">Summary</h3>
                            <p className="text-sm text-muted-foreground">{dqData.summary}</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="border rounded-lg p-3 bg-muted/20">
                                <p className="text-xs text-muted-foreground">Issues Found</p>
                                <p className="text-lg font-semibold">{dqData.issuesFound}</p>
                            </div>
                            <div className="border rounded-lg p-3 bg-muted/20">
                                <p className="text-xs text-muted-foreground">Columns Analyzed</p>
                                <p className="text-lg font-semibold">{dqData.columnsAnalyzed}</p>
                            </div>
                        </div>

                        <Separator />

                        {/* Report */}
                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Report</h4>
                            <div className="border rounded-lg bg-muted/20 p-4 text-sm prose prose-sm max-w-none">
                                {dqData.markdown}
                            </div>
                        </div>
                    </div>
                )
            }

            case 'entity-resolution': {
                const erData = data as EntityResolutionArtifactData
                return (
                    <div className="space-y-5">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-2">Query</h3>
                            <p className="text-sm text-muted-foreground">{erData.query}</p>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="text-sm font-semibold text-foreground mb-3">Resolved Entities</h4>
                            <div className="space-y-2">
                                {erData.resolvedEntities.map((entity, idx) => (
                                    <div key={idx} className="border rounded-lg p-3 bg-muted/10">
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <span className="font-medium text-sm">{entity.input}</span>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Matched: {entity.matched.join(', ')}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Confidence: {(entity.confidence * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            case 'loading-plan': {
                const lpData = data as LoadingPlanArtifactData
                return (
                    <div className="space-y-5">
                        {/* Render the markdown content - this is the flexible, agent-generated summary */}
                        <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    ...tableComponents,
                                    h1: ({ node, ...props }) => <h2 className="text-base font-semibold text-foreground mt-6 mb-3" {...props} />,
                                    h2: ({ node, ...props }) => <h3 className="text-base font-semibold text-foreground mt-6 mb-3" {...props} />,
                                    h3: ({ node, ...props }) => <h4 className="text-sm font-semibold text-foreground mt-5 mb-2" {...props} />,
                                    p: ({ node, ...props }) => <p className="text-muted-foreground mb-3 text-sm leading-relaxed" {...props} />,
                                    strong: ({ node, ...props }) => <span className="font-semibold text-foreground" {...props} />,
                                    li: ({ node, ...props }) => <li className="text-muted-foreground leading-relaxed" {...props} />,
                                }}
                            >
                                {lpData.markdownContent}
                            </ReactMarkdown>
                        </div>

                        {/* Editor modal - triggered from header buttons */}
                        <LoadingPlanEditor
                            data={lpData}
                            open={editorOpen}
                            onOpenChange={setEditorOpen}
                            onApprove={(ids) => {
                                setEditorOpen(false)
                                onLoadingPlanApprove?.(ids)
                            }}
                            onReject={() => {
                                setEditorOpen(false)
                                onLoadingPlanReject?.()
                            }}
                        />
                    </div>
                )
            }

            case 'extraction-report': {
                const erData = data as ExtractionReportArtifactData
                return (
                    <div className="space-y-5">
                        {/* Markdown content with styled tables */}
                        <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    ...tableComponents,
                                    h1: ({ node, ...props }) => <h2 className="text-base font-semibold text-foreground mt-6 mb-3" {...props} />,
                                    h2: ({ node, ...props }) => <h3 className="text-base font-semibold text-foreground mt-6 mb-3" {...props} />,
                                    h3: ({ node, ...props }) => <h4 className="text-sm font-semibold text-foreground mt-5 mb-2" {...props} />,
                                    p: ({ node, ...props }) => <p className="text-muted-foreground mb-3 text-sm leading-relaxed" {...props} />,
                                    strong: ({ node, ...props }) => <span className="font-semibold text-foreground" {...props} />,
                                    li: ({ node, ...props }) => <li className="text-muted-foreground leading-relaxed" {...props} />,
                                }}
                            >
                                {erData.markdownContent}
                            </ReactMarkdown>
                        </div>

                        {/* Editor modal */}
                        <ExtractionReportEditor
                            data={erData}
                            open={editorOpen}
                            onOpenChange={setEditorOpen}
                            onApprove={() => {
                                setEditorOpen(false)
                                // Proceed to loading phase
                            }}
                            onReject={() => {
                                setEditorOpen(false)
                            }}
                        />
                    </div>
                )
            }

            default:
                return <p className="text-sm text-muted-foreground">No preview available</p>
        }
    }

    return (
        <div id="artifact-content" className="space-y-5 min-w-0">
            {renderContent()}
        </div>
    )
}
