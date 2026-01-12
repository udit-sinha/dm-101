"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Plus,
    Trash2,
    Pin,
    PinOff,
    X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Session } from "@/lib/hooks/useSessions"

interface HistorySidebarProps {
    isOpen: boolean
    isPinned: boolean
    sessions: Session[]
    currentSessionId: number | null
    onClose: () => void
    onTogglePin: () => void
    onSelectSession: (sessionId: number) => void
    onNewChat: () => void
    onDeleteSession: (sessionId: number) => void
    isLoading?: boolean
    className?: string
}



export function HistorySidebar({
    isOpen,
    isPinned,
    sessions,
    currentSessionId,
    onClose,
    onTogglePin,
    onSelectSession,
    onNewChat,
    onDeleteSession,
    isLoading = false,
    className,
}: HistorySidebarProps) {
    const [hoveredId, setHoveredId] = useState<number | null>(null)

    if (!isOpen) return null

    return (
        <div
            className={cn(
                "absolute top-0 left-0 h-full bg-stone-50 dark:bg-zinc-900 border-r border-stone-200 dark:border-zinc-800 z-50",
                "w-64 flex flex-col transition-transform duration-200 ease-out",
                isOpen ? "translate-x-0" : "-translate-x-full",
                isPinned && "relative",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 shrink-0 h-14 border-b border-stone-200 dark:border-zinc-800">
                <h2 className="font-semibold text-sm text-stone-800 dark:text-zinc-200 tracking-tight">History</h2>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-stone-200/60 dark:hover:bg-zinc-800"
                        onClick={onTogglePin}
                        title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
                    >
                        {isPinned ? (
                            <PinOff className="h-3.5 w-3.5" />
                        ) : (
                            <Pin className="h-3.5 w-3.5" />
                        )}
                    </Button>
                    {!isPinned && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-stone-200/60 dark:hover:bg-zinc-800"
                            onClick={onClose}
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* New Chat Button */}
            <div className="px-3 py-3 shrink-0 border-b border-stone-100 dark:border-zinc-800/50">
                <Button
                    onClick={onNewChat}
                    className="w-full justify-center gap-2 h-9 bg-stone-800 dark:bg-zinc-100 hover:bg-stone-900 dark:hover:bg-white text-white dark:text-zinc-900 font-medium text-sm shadow-sm"
                    size="sm"
                >
                    <Plus className="h-4 w-4" />
                    New Chat
                </Button>
            </div>

            {/* Sessions List */}
            <ScrollArea className="flex-1">
                <div className="p-2">
                    {isLoading ? (
                        <div className="text-center text-stone-400 dark:text-zinc-500 text-xs py-8">
                            Loading...
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center text-stone-400 dark:text-zinc-500 text-xs py-8">
                            No conversations yet
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className={cn(
                                        "group relative flex items-center px-3 py-2.5 rounded-md cursor-pointer transition-colors",
                                        currentSessionId === session.id
                                            ? "bg-stone-200 dark:bg-zinc-800"
                                            : "hover:bg-stone-100 dark:hover:bg-zinc-800/50"
                                    )}
                                    onClick={() => onSelectSession(session.id)}
                                    onMouseEnter={() => setHoveredId(session.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                >
                                    <p className={cn(
                                        "text-sm leading-snug line-clamp-2 pr-6",
                                        currentSessionId === session.id
                                            ? "text-stone-900 dark:text-zinc-100 font-medium"
                                            : "text-stone-600 dark:text-zinc-400"
                                    )}>
                                        {session.title || "Untitled Conversation"}
                                    </p>

                                    {/* Delete button */}
                                    {hoveredId === session.id && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 absolute right-1.5 top-1/2 -translate-y-1/2"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onDeleteSession(session.id)
                                            }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
