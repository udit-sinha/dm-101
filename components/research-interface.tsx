"use client"

import type React from "react"

import { useState } from "react"
import { ChatArea } from "./chat-area"
import { EmptyState } from "./empty-state"
import { X } from "lucide-react"
import { useChatStream, type StreamEvent } from "@/hooks/use-chat-stream"

interface ProgressStep {
  id: string
  title: string
  status: "pending" | "in-progress" | "completed" | "error"
  details?: string
  documents?: string[]
}

export function ResearchInterface() {
  const [messages, setMessages] = useState<
    Array<{
      id: string
      role: "user" | "assistant"
      content: string
      progress?: ProgressStep[]
      artifact?: { type: string; content: string }
    }>
  >([])
  const [selectedArtifact, setSelectedArtifact] = useState<{ type: string; content: string } | null>(null)
  const [panelWidth, setPanelWidth] = useState(typeof window !== "undefined" ? window.innerWidth / 2 : 800)
  const [isDragging, setIsDragging] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<number | undefined>()

  const { sendMessage: streamMessage, cancel: cancelStream, isLoading } = useChatStream({
    onProgress: (event: StreamEvent) => {
      if (event.type === "progress") {
        const lastMsg = messages[messages.length - 1]
        if (lastMsg?.role === "assistant") {
          setMessages((prev) => {
            const updated = [...prev]
            const lastIndex = updated.length - 1
            if (!updated[lastIndex].progress) {
              updated[lastIndex].progress = []
            }
            const existingStep = updated[lastIndex].progress?.find((s) => s.title === event.data.step)
            if (existingStep) {
              existingStep.status = event.data.status as any
            } else {
              updated[lastIndex].progress?.push({
                id: Date.now().toString(),
                title: event.data.step,
                status: event.data.status as any,
              })
            }
            return updated
          })
        }
      }
    },
    onContent: (text: string) => {
      setMessages((prev) => {
        const updated = [...prev]
        const lastIndex = updated.length - 1
        if (updated[lastIndex]?.role === "assistant") {
          updated[lastIndex].content = text
        }
        return updated
      })
    },
    onArtifact: (artifact) => {
      setMessages((prev) => {
        const updated = [...prev]
        const lastIndex = updated.length - 1
        if (updated[lastIndex]?.role === "assistant") {
          updated[lastIndex].artifact = artifact
        }
        return updated
      })
    },
    onComplete: (conversationId) => {
      setCurrentConversationId(conversationId)
    },
  })

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
      {messages.length > 0 && (
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
          {messages.length === 0 ? (
            <EmptyState
              onSubmit={(data) => {
                const messageId = Date.now().toString()
                setMessages([
                  {
                    id: messageId,
                    role: "user",
                    content: data.message,
                  },
                  {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "",
                  },
                ])
                streamMessage(data.message, currentConversationId)
              }}
            />
          ) : (
            <ChatArea
              messages={messages}
              onSubmit={(data) => {
                const messageId = Date.now().toString()
                setMessages((prev) => [
                  ...prev,
                  {
                    id: messageId,
                    role: "user",
                    content: data.message,
                  },
                  {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: "",
                  },
                ])
                streamMessage(data.message, currentConversationId)
              }}
              onArtifactClick={setSelectedArtifact}
              isLoading={isLoading}
              onCancel={cancelStream}
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

            <div className="bg-background border-l flex flex-col overflow-hidden" style={{ width: `${panelWidth}px` }} data-testid="artifact-panel">
              <div className="flex items-center justify-between px-6 py-3 border-b shrink-0">
                <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {selectedArtifact.type}
                </h2>
                <button
                  onClick={() => setSelectedArtifact(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors rounded-sm hover:bg-muted p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="text-sm leading-relaxed">{selectedArtifact.content}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
