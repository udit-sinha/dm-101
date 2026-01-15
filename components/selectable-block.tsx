'use client'

import { cn } from '@/lib/utils'
import { MessageSquare, MessageSquarePlus } from 'lucide-react'
import { ReactNode, useState } from 'react'

interface SelectableBlockProps {
    blockId: string
    blockPath: string
    children: ReactNode
    content: string
    hasComment?: boolean
    isSelected?: boolean
    onSelect?: (blockId: string, blockPath: string, content: string) => void
    onViewComment?: (blockId: string) => void
    className?: string
}

export function SelectableBlock({
    blockId,
    blockPath,
    children,
    content,
    hasComment = false,
    isSelected = false,
    onSelect,
    onViewComment,
    className
}: SelectableBlockProps) {
    const [isHovered, setIsHovered] = useState(false)

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (hasComment && onViewComment) {
            onViewComment(blockId)
        } else if (onSelect) {
            onSelect(blockId, blockPath, content)
        }
    }

    return (
        <div
            className={cn(
                'relative group transition-all duration-150 cursor-pointer rounded-sm',
                // Hover state - subtle highlight
                isHovered && !isSelected && 'bg-primary/5',
                // Selected state
                isSelected && 'bg-primary/10 ring-1 ring-primary/30',
                // Has comment indicator
                hasComment && 'border-l-2 border-primary/50 pl-2',
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
            data-block-id={blockId}
            data-block-path={blockPath}
        >
            {/* Content */}
            {children}

            {/* Comment indicator - Google Docs style */}
            <div
                className={cn(
                    'absolute -right-1 top-0 opacity-0 transition-opacity duration-150',
                    (isHovered || hasComment) && 'opacity-100'
                )}
            >
                {hasComment ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onViewComment?.(blockId)
                        }}
                        className="p-1 rounded bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                        title="View comment"
                    >
                        <MessageSquare className="h-3 w-3" />
                    </button>
                ) : (
                    <button
                        onClick={handleClick}
                        className="p-1 rounded bg-muted/80 text-muted-foreground shadow-sm hover:bg-muted"
                        title="Add comment"
                    >
                        <MessageSquarePlus className="h-3 w-3" />
                    </button>
                )}
            </div>
        </div>
    )
}
