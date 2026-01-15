'use client'

import { BlockComment } from '@/lib/types/chat'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { X, Send, Trash2, Edit2, Check } from 'lucide-react'
import { useState } from 'react'

interface BlockFeedbackPopoverProps {
    blockId: string
    blockPath: string
    blockContent: string
    existingComment?: BlockComment
    isOpen: boolean
    onClose: () => void
    onSubmit: (comment: string) => void
    onDelete?: () => void
    triggerRef?: React.RefObject<HTMLElement>
}

export function BlockFeedbackPopover({
    blockId,
    blockPath,
    blockContent,
    existingComment,
    isOpen,
    onClose,
    onSubmit,
    onDelete,
}: BlockFeedbackPopoverProps) {
    const [comment, setComment] = useState(existingComment?.comment || '')
    const [isEditing, setIsEditing] = useState(!existingComment)

    const handleSubmit = () => {
        if (comment.trim()) {
            onSubmit(comment.trim())
            onClose()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit()
        }
        if (e.key === 'Escape') {
            onClose()
        }
    }

    // Truncate content for display
    const displayContent = blockContent.length > 100
        ? blockContent.slice(0, 100) + '...'
        : blockContent

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50" onClick={onClose}>
            <div
                className="absolute bg-popover border rounded-lg shadow-lg p-4 w-80 max-w-[90vw]"
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground">
                        {existingComment ? 'Comment' : 'Add Comment'}
                    </span>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded"
                    >
                        <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                </div>

                {/* Selected content preview */}
                <div className="mb-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground italic line-clamp-2">
                    "{displayContent}"
                </div>

                {/* Comment input or display */}
                {isEditing ? (
                    <>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Add your feedback..."
                            className="min-h-[80px] text-sm resize-none mb-3"
                            autoFocus
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                                ⌘+Enter to submit
                            </span>
                            <div className="flex gap-2">
                                {existingComment && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    onClick={handleSubmit}
                                    disabled={!comment.trim()}
                                >
                                    <Send className="h-3 w-3 mr-1" />
                                    {existingComment ? 'Update' : 'Add'}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="p-3 bg-muted/30 rounded mb-3 text-sm">
                            {existingComment?.comment}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit2 className="h-3 w-3 mr-1" />
                                Edit
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

// Inline comment badge shown in the margin
interface CommentBadgeProps {
    count: number
    onClick: () => void
}

export function CommentBadge({ count, onClick }: CommentBadgeProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1 px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-xs font-medium transition-colors"
        >
            <span>{count}</span>
            <span>comment{count !== 1 ? 's' : ''}</span>
        </button>
    )
}
