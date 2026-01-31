'use client'

import type { ArtifactSummary, BlockComment, ArtifactFeedback, LoadingPlanArtifactData } from '@/lib/types/chat'
import { ArtifactPanel } from './artifact-panel'
import { BlockFeedbackPopover } from './block-feedback'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, Send, ChevronDown, ChevronUp, Trash2, Layers, Pencil, Check } from 'lucide-react'
import { useState, useCallback, useId, useEffect, useRef } from 'react'

interface ArtifactFeedbackPanelProps {
    artifact: ArtifactSummary
    onClose?: () => void
    onExport?: () => void
    onSubmitFeedback?: (feedback: ArtifactFeedback) => void
    onLoadingPlanApprove?: (wellIds: string[]) => void
    onLoadingPlanReject?: () => void
}

interface SelectedBlock {
    blockId: string
    blockPath: string
    content: string
    element: HTMLElement
}

export function ArtifactFeedbackPanel({
    artifact,
    onClose,
    onExport,
    onSubmitFeedback,
    onLoadingPlanApprove,
    onLoadingPlanReject,
}: ArtifactFeedbackPanelProps) {
    const instanceId = useId()
    const contentRef = useRef<HTMLDivElement>(null)

    // Feedback state
    const [blockComments, setBlockComments] = useState<Map<string, BlockComment>>(new Map())
    const [generalComment, setGeneralComment] = useState('')
    const [selectedBlock, setSelectedBlock] = useState<SelectedBlock | null>(null)
    const [showFeedbackPopover, setShowFeedbackPopover] = useState(false)
    const [commentsExpanded, setCommentsExpanded] = useState(true)

    // Loading plan editor state
    const [editorOpen, setEditorOpen] = useState(false)

    const commentCount = blockComments.size
    const hasComments = commentCount > 0 || generalComment.trim().length > 0

    // Check if this is a loading plan artifact
    const isLoadingPlan = artifact.kind === 'loading-plan'
    const lpData = isLoadingPlan ? (artifact.data as LoadingPlanArtifactData) : null

    // Apply hover/click handlers to blocks (always enabled)
    useEffect(() => {
        if (!contentRef.current) return

        const container = contentRef.current

        // Find all selectable elements (paragraphs, headings, tables, lists)
        const selectableSelector = 'p, h1, h2, h3, h4, h5, h6, table, ul, ol'
        const elements = container.querySelectorAll(selectableSelector)

        const handleMouseEnter = (e: Event) => {
            const el = e.currentTarget as HTMLElement
            const blockId = el.dataset.feedbackBlockId || ''

            // Show subtle gray bg and inject comment icon
            if (!blockComments.has(blockId)) {
                el.style.backgroundColor = 'hsl(var(--muted) / 0.5)'
                el.style.borderRadius = '4px'
            }
            el.style.cursor = 'pointer'
            el.style.position = 'relative'

            // Add comment icon on right
            if (!el.querySelector('.feedback-icon')) {
                const icon = document.createElement('span')
                icon.className = 'feedback-icon'
                icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v6"/><path d="M9 10h6"/></svg>`
                icon.style.cssText = 'position:absolute;right:4px;top:4px;padding:4px;background:hsl(var(--muted));border-radius:4px;color:hsl(var(--muted-foreground));display:flex;align-items:center;justify-content:center;'
                el.appendChild(icon)
            }
        }

        const handleMouseLeave = (e: Event) => {
            const el = e.currentTarget as HTMLElement
            const blockId = el.dataset.feedbackBlockId || ''

            // Remove hover styles (keep if has comment)
            if (!blockComments.has(blockId)) {
                el.style.backgroundColor = ''
                el.style.borderRadius = ''
            }

            // Remove icon
            const icon = el.querySelector('.feedback-icon')
            if (icon) icon.remove()
        }

        const handleClick = (e: Event) => {
            e.stopPropagation()
            const el = e.currentTarget as HTMLElement

            // Generate a block ID based on element type and position
            const tagName = el.tagName.toLowerCase()
            const siblings = Array.from(container.querySelectorAll(tagName))
            const index = siblings.indexOf(el)
            const blockId = `${instanceId}-${tagName}-${index}`
            const blockPath = `${artifact.kind}.${tagName}.${index}`

            // Get text content for context
            const content = el.textContent || '[Content]'

            // Store the block ID on the element for later reference
            el.dataset.feedbackBlockId = blockId

            setSelectedBlock({ blockId, blockPath, content, element: el })
            setShowFeedbackPopover(true)
        }

        elements.forEach((el) => {
            el.addEventListener('mouseenter', handleMouseEnter)
            el.addEventListener('mouseleave', handleMouseLeave)
            el.addEventListener('click', handleClick)
        })

        return () => {
            elements.forEach((el) => {
                el.removeEventListener('mouseenter', handleMouseEnter)
                el.removeEventListener('mouseleave', handleMouseLeave)
                el.removeEventListener('click', handleClick)
                // Reset styles
                const htmlEl = el as HTMLElement
                htmlEl.style.backgroundColor = ''
                htmlEl.style.cursor = ''
                htmlEl.style.position = ''
                const icon = htmlEl.querySelector('.feedback-icon')
                if (icon) icon.remove()
            })
        }
    }, [instanceId, artifact.kind, blockComments])

    // Highlight blocks with existing comments
    useEffect(() => {
        if (!contentRef.current) return

        // First reset all blocks
        const container = contentRef.current
        container.querySelectorAll('[data-feedback-block-id]').forEach(el => {
            const htmlEl = el as HTMLElement
            if (!blockComments.has(htmlEl.dataset.feedbackBlockId || '')) {
                htmlEl.style.backgroundColor = ''
                htmlEl.style.borderLeft = ''
                htmlEl.style.paddingLeft = ''
            }
        })

        // Then highlight commented blocks
        blockComments.forEach((comment) => {
            const el = contentRef.current?.querySelector(`[data-feedback-block-id="${comment.blockId}"]`)
            if (el) {
                const htmlEl = el as HTMLElement
                htmlEl.style.backgroundColor = 'hsl(var(--primary) / 0.08)'
                htmlEl.style.borderLeft = '3px solid hsl(var(--primary) / 0.5)'
                htmlEl.style.paddingLeft = '8px'
                htmlEl.style.borderRadius = '4px'
            }
        })
    }, [blockComments])

    const handleAddComment = useCallback((comment: string) => {
        if (!selectedBlock) return

        const newComment: BlockComment = {
            blockId: selectedBlock.blockId,
            blockPath: selectedBlock.blockPath,
            blockContent: selectedBlock.content.slice(0, 500),
            comment,
            timestamp: Date.now()
        }

        setBlockComments(prev => {
            const updated = new Map(prev)
            updated.set(selectedBlock.blockId, newComment)
            return updated
        })

        setSelectedBlock(null)
        setShowFeedbackPopover(false)
    }, [selectedBlock])

    const handleDeleteComment = useCallback((blockId?: string) => {
        const targetId = blockId || selectedBlock?.blockId
        if (!targetId) return

        setBlockComments(prev => {
            const updated = new Map(prev)
            updated.delete(targetId)
            return updated
        })

        // Reset visual highlight for this block
        if (contentRef.current) {
            const el = contentRef.current.querySelector(`[data-feedback-block-id="${targetId}"]`)
            if (el) {
                const htmlEl = el as HTMLElement
                htmlEl.style.backgroundColor = ''
                htmlEl.style.borderLeft = ''
                htmlEl.style.paddingLeft = ''
            }
        }

        setSelectedBlock(null)
        setShowFeedbackPopover(false)
    }, [selectedBlock])

    const handleSubmitFeedback = useCallback(() => {
        if (!hasComments) return

        const feedback: ArtifactFeedback = {
            artifactId: String(artifact.createdAt),  // Use createdAt as unique ID
            artifactKind: artifact.kind,
            artifactTitle: artifact.title,
            blockComments: Array.from(blockComments.values()),
            generalComment: generalComment.trim() || undefined,
            timestamp: Date.now()
        }

        onSubmitFeedback?.(feedback)

        // Reset state
        setBlockComments(new Map())
        setGeneralComment('')
    }, [artifact.kind, artifact.title, blockComments, generalComment, hasComments, onSubmitFeedback])

    return (
        <div className="flex flex-col h-full">
            {/* Single header with Artifact title, action buttons, and X button */}
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50 h-14 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Layers className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-semibold text-sm">Artifact</span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Loading plan specific buttons */}
                    {isLoadingPlan && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditorOpen(true)}
                                className="h-8 text-xs"
                            >
                                <Pencil className="h-3 w-3 mr-1.5" />
                                Review
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => {
                                    // Approve all ready wells
                                    const readyIds = lpData?.readyWells?.map(w => w.id) || []
                                    onLoadingPlanApprove?.(readyIds)
                                }}
                                className="h-8 text-xs"
                            >
                                <Check className="h-3 w-3 mr-1.5" />
                                Approve ({lpData?.readyCount ?? lpData?.readyWells?.length ?? 0})
                            </Button>
                        </>
                    )}
                    {/* Extraction/Ingestion report buttons */}
                    {artifact.kind === 'extraction-report' && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditorOpen(true)}
                                className="h-8 text-xs"
                            >
                                <Pencil className="h-3 w-3 mr-1.5" />
                                Review
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => {
                                    // Approve the extraction report - proceed to loading
                                    onLoadingPlanApprove?.([])
                                }}
                                className="h-8 text-xs"
                            >
                                <Check className="h-3 w-3 mr-1.5" />
                                Approve
                            </Button>
                        </>
                    )}
                    {hasComments && (
                        <Button
                            size="sm"
                            onClick={handleSubmitFeedback}
                            className="h-8"
                        >
                            <Send className="h-3.5 w-3.5 mr-1.5" />
                            Submit
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content area - uses the ORIGINAL ArtifactPanel for proper styling */}
            <ScrollArea className="flex-1 min-h-0">
                <div ref={contentRef} className="px-6 py-4 w-full">
                    <ArtifactPanel
                        artifact={artifact}
                        openEditor={editorOpen}
                        onEditorOpenChange={setEditorOpen}
                        onLoadingPlanApprove={onLoadingPlanApprove}
                        onLoadingPlanReject={onLoadingPlanReject}
                    />
                </div>
            </ScrollArea>

            {/* Comments summary footer (only when comments exist) */}
            {commentCount > 0 && (
                <div className="border-t p-3 bg-muted/20 shrink-0">
                    <button
                        onClick={() => setCommentsExpanded(!commentsExpanded)}
                        className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground w-full"
                    >
                        {commentsExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {commentCount} comment{commentCount !== 1 ? 's' : ''}
                    </button>
                    {commentsExpanded && (
                        <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto">
                            {Array.from(blockComments.values()).map(comment => (
                                <div
                                    key={comment.blockId}
                                    className="text-xs p-2 bg-background rounded border group relative"
                                >
                                    <div className="text-muted-foreground italic truncate text-[10px] pr-6">
                                        "{comment.blockContent.slice(0, 40)}..."
                                    </div>
                                    <div className="mt-0.5 text-foreground pr-6">
                                        {comment.comment}
                                    </div>
                                    {/* Delete button */}
                                    <button
                                        onClick={() => handleDeleteComment(comment.blockId)}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                        title="Delete comment"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* General comment input */}
                    <div className="mt-2">
                        <Textarea
                            value={generalComment}
                            onChange={(e) => setGeneralComment(e.target.value)}
                            placeholder="General comment (optional)..."
                            className="min-h-[40px] text-xs resize-none"
                        />
                    </div>
                </div>
            )}

            {/* Block feedback popover */}
            {showFeedbackPopover && selectedBlock && (
                <BlockFeedbackPopover
                    blockId={selectedBlock.blockId}
                    blockPath={selectedBlock.blockPath}
                    blockContent={selectedBlock.content}
                    existingComment={blockComments.get(selectedBlock.blockId)}
                    isOpen={showFeedbackPopover}
                    onClose={() => {
                        setShowFeedbackPopover(false)
                        setSelectedBlock(null)
                    }}
                    onSubmit={handleAddComment}
                    onDelete={() => handleDeleteComment()}
                />
            )}
        </div>
    )
}
