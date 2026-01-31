"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { ChatArea } from "./chat-area"
import { EmptyState } from "./empty-state"
import { X, Download, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatStream } from "@/lib/hooks/useChatStream"
import { useSessions } from "@/lib/hooks/useSessions"
import type { ArtifactSummary, ArtifactFeedback } from "@/lib/types/chat"
import { ArtifactFeedbackPanel } from "./artifact-feedback-panel"
import { HistorySidebar } from "./history-sidebar"
import { Button } from "@/components/ui/button"

export function ResearchInterface() {
    const { state, sendMessage, cancel, loadSession, reset } = useChatStream()
    const { sessions, isLoading: isLoadingSessions, fetchSessions, deleteSession } = useSessions()

    const [selectedArtifact, setSelectedArtifact] = useState<ArtifactSummary | null>(null)
    const [panelWidth, setPanelWidth] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // History sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSidebarPinned, setIsSidebarPinned] = useState(false)

    // Track previous loading state to detect when streaming completes
    const prevIsLoadingRef = useRef(state.isLoading)
    const prevConversationIdRef = useRef(state.conversationId)

    // Initialize panel width to 50% of container on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            setPanelWidth(Math.floor(window.innerWidth / 2))
        }
    }, [])

    // URL-based session persistence: Read session from URL on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search)
            const sessionParam = params.get('session')
            if (sessionParam) {
                const sessionId = parseInt(sessionParam, 10)
                if (!isNaN(sessionId) && sessionId !== state.conversationId) {
                    console.log('[ResearchInterface] Loading session from URL:', sessionId)
                    loadSession(sessionId)
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Only run on mount

    // URL-based session persistence: Update URL when conversationId changes
    useEffect(() => {
        if (typeof window !== "undefined" && state.conversationId) {
            // Only update URL if conversation ID changed and is valid
            if (state.conversationId !== prevConversationIdRef.current) {
                const url = new URL(window.location.href)
                url.searchParams.set('session', state.conversationId.toString())
                window.history.replaceState({}, '', url.toString())
                console.log('[ResearchInterface] Updated URL with session:', state.conversationId)
            }
        }
        prevConversationIdRef.current = state.conversationId
    }, [state.conversationId])

    // Refresh sessions when streaming completes (to get updated titles)
    useEffect(() => {
        if (prevIsLoadingRef.current && !state.isLoading) {
            // Streaming just completed - refresh sessions to get updated title
            fetchSessions()
        }
        prevIsLoadingRef.current = state.isLoading
    }, [state.isLoading, fetchSessions])

    // Reset artifact panel when conversation changes (switching chats or starting new)
    useEffect(() => {
        setSelectedArtifact(null)
    }, [state.conversationId])

    const handleSubmit = async (data: { message: string; mode?: string; context?: any[] }) => {
        await sendMessage(
            data.message,
            (data.mode as 'research' | 'analytics') || 'research',
            data.context
        )
    }

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    // Use document-level mouse events for smoother dragging
    useEffect(() => {
        if (!isDragging) return

        const handleMouseMove = (e: MouseEvent) => {
            e.preventDefault()
            const newWidth = window.innerWidth - e.clientX
            const minWidth = 350
            const maxWidth = window.innerWidth * 0.65

            if (newWidth >= minWidth && newWidth <= maxWidth) {
                setPanelWidth(newWidth)
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        document.body.style.userSelect = 'none'
        document.body.style.cursor = 'col-resize'

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            document.body.style.userSelect = ''
            document.body.style.cursor = ''
        }
    }, [isDragging])

    const handleExportPDF = () => {
        const printContent = document.getElementById("artifact-content")
        if (!printContent) return

        const printWindow = window.open("", "", "width=800,height=600")
        if (!printWindow) return

        printWindow.document.write(`
            <html>
                <head>
                    <title>${selectedArtifact?.title || 'Research Results'} - Export</title>
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; line-height: 1.6; color: #333; }
                        h1 { font-size: 24px; margin-bottom: 8px; }
                        h2 { font-size: 20px; margin-top: 24px; margin-bottom: 12px; }
                        h3 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
                        h4 { font-size: 16px; margin-top: 16px; margin-bottom: 8px; }
                        p { margin-bottom: 12px; color: #666; }
                        ul { margin-left: 20px; }
                        li { margin-bottom: 8px; }
                        hr { border: none; border-top: 1px solid #e5e5e5; margin: 24px 0; }
                        .badge { display: inline-block; padding: 4px 12px; background: #f0f4ff; border-radius: 4px; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #4a5568; margin-bottom: 12px; }
                    </style>
                </head>
                <body>
                    <div class="badge">${selectedArtifact?.kind?.toUpperCase() || 'RESEARCH'}</div>
                    <h1>${selectedArtifact?.title || 'Research Results'}</h1>
                    ${printContent.innerHTML}
                </body>
            </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 250)
    }

    // Session management handlers
    const handleToggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const handleCloseSidebar = () => {
        if (!isSidebarPinned) {
            setIsSidebarOpen(false)
        }
    }

    const handleTogglePin = () => {
        setIsSidebarPinned(!isSidebarPinned)
    }

    const handleSelectSession = async (sessionId: number) => {
        if (loadSession) {
            await loadSession(sessionId)
        }
        if (!isSidebarPinned) {
            setIsSidebarOpen(false)
        }
    }

    const handleNewChat = () => {
        reset()
        // Clear session from URL when starting new chat
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href)
            url.searchParams.delete('session')
            window.history.replaceState({}, '', url.toString())
        }
        if (!isSidebarPinned) {
            setIsSidebarOpen(false)
        }
    }

    const handleDeleteSession = async (sessionId: number) => {
        const success = await deleteSession(sessionId)
        if (success && state.conversationId === sessionId) {
            reset()
        }
    }

    const handleSendMessage = async (message: string, mode: 'research' | 'analytics', context?: any[]) => {
        await sendMessage(message, mode, context)
        fetchSessions()
    }

    // Handle feedback submission from artifact panel
    const handleFeedbackSubmit = useCallback(async (feedback: ArtifactFeedback) => {
        // Construct a feedback message for the agent
        const feedbackParts: string[] = []

        if (feedback.blockComments.length > 0) {
            feedbackParts.push(`Please refine the following sections based on my feedback:`)
            feedback.blockComments.forEach((comment, idx) => {
                feedbackParts.push(`\n${idx + 1}. Section: "${comment.blockContent.slice(0, 100)}..."\n   Feedback: ${comment.comment}`)
            })
        }

        if (feedback.generalComment) {
            feedbackParts.push(`\n\nGeneral feedback: ${feedback.generalComment}`)
        }

        const feedbackMessage = feedbackParts.join('')

        // Send the feedback as a new message to trigger agent refinement
        await sendMessage(
            feedbackMessage,
            feedback.artifactKind === 'analytics' ? 'analytics' : 'research',
            [{ type: 'artifact_feedback', data: feedback }] // Pass feedback as context
        )

        // Close the artifact panel after submitting feedback
        setSelectedArtifact(null)
    }, [sendMessage])

    // Get the current session title
    const currentSessionTitle = state.conversationId
        ? sessions.find(s => s.id === state.conversationId)?.title
        : null

    return (
        <div ref={containerRef} className="flex flex-col h-screen bg-background overflow-hidden">
            {/* Header with burger menu */}
            <div className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 z-30">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleToggleSidebar}
                    title="Chat history"
                >
                    <Menu className="h-5 w-5" />
                </Button>
                {state.messages.length > 0 && (
                    <h1 className="text-sm text-muted-foreground truncate max-w-md">
                        {currentSessionTitle || "New Conversation"}
                    </h1>
                )}
            </div>

            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* History Sidebar - Pinned mode uses flexbox, unpinned uses absolute */}
                {isSidebarPinned && isSidebarOpen && (
                    <HistorySidebar
                        isOpen={isSidebarOpen}
                        isPinned={isSidebarPinned}
                        sessions={sessions}
                        currentSessionId={state.conversationId}
                        onClose={handleCloseSidebar}
                        onTogglePin={handleTogglePin}
                        onSelectSession={handleSelectSession}
                        onNewChat={handleNewChat}
                        onDeleteSession={handleDeleteSession}
                        isLoading={isLoadingSessions}
                        className="shrink-0"
                    />
                )}

                {/* Chat Area Container - relative for unpinned sidebar positioning */}
                <div className="flex-1 flex min-w-0 overflow-hidden relative">
                    {/* Unpinned History Sidebar - Overlays on top */}
                    {!isSidebarPinned && (
                        <HistorySidebar
                            isOpen={isSidebarOpen}
                            isPinned={isSidebarPinned}
                            sessions={sessions}
                            currentSessionId={state.conversationId}
                            onClose={handleCloseSidebar}
                            onTogglePin={handleTogglePin}
                            onSelectSession={handleSelectSession}
                            onNewChat={handleNewChat}
                            onDeleteSession={handleDeleteSession}
                            isLoading={isLoadingSessions}
                        />
                    )}

                    {/* Chat Area */}
                    <main
                        className="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/40 relative"
                        style={{
                            flexBasis: selectedArtifact ? `calc(100% - ${panelWidth}px - 4px)` : '100%',
                            transition: isDragging ? 'none' : 'flex-basis 0.3s ease-in-out'
                        }}
                    >
                        {state.messages.length === 0 ? (
                            <EmptyState onSubmit={handleSubmit} />
                        ) : (
                            <ChatArea
                                messages={state.messages}
                                onSubmit={handleSubmit}
                                onArtifactClick={setSelectedArtifact}
                                isLoading={state.isLoading}
                                onCancel={cancel}
                            />
                        )}
                    </main>

                    {state.messages.length > 0 && selectedArtifact && (
                        <>
                            {/* Resizer Handle */}
                            <div
                                className={cn(
                                    "w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-10",
                                    isDragging && "bg-primary/50"
                                )}
                                onMouseDown={handleMouseDown}
                            />

                            {/* Artifact Panel */}
                            <aside
                                className="flex flex-col bg-card border-l border-border shadow-lg transition-all duration-300 ease-in-out"
                                style={{
                                    width: panelWidth,
                                    opacity: 1,
                                    overflow: 'hidden'
                                }}
                            >
                                <ArtifactFeedbackPanel
                                    artifact={selectedArtifact}
                                    onClose={() => setSelectedArtifact(null)}
                                    onSubmitFeedback={handleFeedbackSubmit}
                                />
                            </aside>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
