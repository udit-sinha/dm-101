"use client"

import type React from "react"

import { useState } from "react"
import { ChatArea } from "./chat-area"
import { EmptyState } from "./empty-state"
import { X } from "lucide-react"
import { useChatStream } from "@/lib/hooks/useChatStream"
import type { ArtifactSummary } from "@/lib/types/chat"

export function ResearchInterface() {
  const { state, sendMessage, cancel } = useChatStream()
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactSummary | null>(null)
  const [panelWidth, setPanelWidth] = useState(typeof window !== "undefined" ? window.innerWidth / 2 : 800)
  const [isDragging, setIsDragging] = useState(false)

  const handleSubmit = async (data: { message: string; mode?: string; context?: any[] }) => {
    // Send message using the hook
    await sendMessage(
      data.message,
      (data.mode as 'research' | 'analytics') || 'research',
      data.context
    )
  }

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newWidth = window.innerWidth - e.clientX
      const minWidth = window.innerWidth * 0.25
      const maxWidth = window.innerWidth * 0.75
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setPanelWidth(newWidth)
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header - only show when there are messages */}
      {state.messages.length > 0 && (
        <div className="px-6 py-3 border-b shrink-0">
          <h1 className="text-sm text-muted-foreground">How can I help you today?</h1>
        </div>
      )}

      {/* Main content area with resizable panels */}
      <div className="flex flex-1 overflow-hidden" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
        <div
          className="flex flex-col transition-all overflow-hidden"
          style={{
            width: selectedArtifact ? `calc(100% - ${panelWidth}px)` : "100%",
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
        </div>

        {selectedArtifact && (
          <>
            <div
              className="w-1 bg-border hover:bg-foreground/20 cursor-col-resize transition-colors relative group"
              onMouseDown={handleMouseDown}
            >
              <div className="absolute inset-y-0 -left-1 -right-1" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 bg-border group-hover:bg-foreground/40 rounded-full transition-colors" />
            </div>

            <div className="bg-background border-l flex flex-col overflow-hidden" style={{ width: `${panelWidth}px` }}>
              <div className="flex items-center justify-between px-6 py-3 border-b shrink-0">
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {selectedArtifact.kind}
                </h2>
                <button
                  onClick={() => setSelectedArtifact(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors rounded-sm hover:bg-muted p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className="text-lg font-semibold mb-2">{selectedArtifact.title}</h3>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{selectedArtifact.preview}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
