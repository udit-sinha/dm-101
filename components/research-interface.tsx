"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { ChatArea } from "./chat-area"
import { EmptyState } from "./empty-state"
import { X, Download } from "lucide-react"
import { useChatStream } from "@/lib/hooks/useChatStream"
import type { ArtifactSummary } from "@/lib/types/chat"
import { ArtifactPanel } from "./artifact-panel"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ResearchInterface() {
    const { state, sendMessage, cancel } = useChatStream()
    const [selectedArtifact, setSelectedArtifact] = useState<ArtifactSummary | null>(null)
    const [panelWidth, setPanelWidth] = useState(0) // Will be set on mount
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Initialize panel width to 50% of container on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            setPanelWidth(Math.floor(window.innerWidth / 2))
        }
    }, [])

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

        // Add listeners to document for reliable capture
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        // Prevent text selection while dragging
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

    return (
        <div ref={containerRef} className="flex flex-col h-screen bg-background overflow-hidden">
            {state.messages.length > 0 && (
                <div className="px-6 py-3 border-b shrink-0">
                    <h1 className="text-sm text-muted-foreground">How can I help you today?</h1>
                </div>
            )}

            <div className="flex flex-1 min-h-0 overflow-hidden">
                {/* Chat Area - flex-1 takes remaining space */}
                <main
                    className="flex-1 flex flex-col min-w-0 overflow-hidden bg-muted/40 relative"
                    style={{
                        // Use flex-basis to control width when artifact is open
                        flexBasis: selectedArtifact ? `calc(100% - ${panelWidth}px - 4px)` : '100%',
                        flexShrink: 0,
                        flexGrow: selectedArtifact ? 0 : 1,
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

                {/* Artifact Panel */}
                {selectedArtifact && (
                    <>
                        {/* Resizer Handle */}
                        <div
                            className={`w-1 flex-shrink-0 cursor-col-resize relative group ${isDragging ? 'bg-primary/40' : 'bg-border hover:bg-primary/20'
                                }`}
                            onMouseDown={handleMouseDown}
                            style={{ touchAction: 'none' }}
                        >
                            {/* Larger hit area */}
                            <div className="absolute inset-y-0 -left-2 -right-2 z-10" />
                            {/* Visual indicator */}
                            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-16 rounded-full transition-colors ${isDragging ? 'bg-primary' : 'bg-border group-hover:bg-primary/40'
                                }`} />
                        </div>

                        {/* Panel */}
                        <aside
                            className="bg-card border-l border-border flex flex-col overflow-hidden flex-shrink-0"
                            style={{ width: `${panelWidth}px` }}
                        >
                            {/* Header - simplified with just title */}
                            <div className="border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
                                <h2 className="text-base font-semibold truncate flex-1 min-w-0">
                                    {selectedArtifact.title}
                                </h2>
                                <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                                    <Button variant="ghost" size="icon" onClick={handleExportPDF} className="h-7 w-7">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedArtifact(null)} className="h-7 w-7">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Content - ScrollArea takes remaining height */}
                            <ScrollArea className="flex-1 min-h-0">
                                <div className="px-6 py-6 w-full">
                                    <ArtifactPanel artifact={selectedArtifact} />
                                </div>
                            </ScrollArea>
                        </aside>
                    </>
                )}
            </div>
        </div>
    )
}
