"use client"

import type React from "react"

import { useState } from "react"
import { ChatArea } from "./chat-area"
import { EmptyState } from "./empty-state"
import { X } from "lucide-react"

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

  const simulateProgress = (messageId: string) => {
    const steps: ProgressStep[] = [
      { id: "1", title: "Analyzing query", status: "pending" },
      {
        id: "2",
        title: "Searching relevant sources",
        status: "pending",
        documents: [
          "research-paper-2024.pdf",
          "market-analysis-report.pdf",
          "data-trends-summary.csv",
          "industry-overview.docx",
        ],
      },
      { id: "3", title: "Processing data", status: "pending" },
      { id: "4", title: "Generating insights", status: "pending" },
    ]

    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, progress: steps } : msg)))

    steps.forEach((step, index) => {
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === messageId && msg.progress) {
              const updatedSteps = msg.progress.map((s) =>
                s.id === step.id ? { ...s, status: "in-progress" as const } : s,
              )
              return { ...msg, progress: updatedSteps }
            }
            return msg
          }),
        )

        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === messageId && msg.progress) {
                const updatedSteps = msg.progress.map((s) =>
                  s.id === step.id
                    ? { ...s, status: "completed" as const, details: `${s.title} completed successfully` }
                    : s,
                )
                return { ...msg, progress: updatedSteps }
              }
              return msg
            }),
          )

          if (index === steps.length - 1) {
            setTimeout(() => {
              setMessages((prev) => [
                ...prev,
                {
                  id: (Date.now() + 1).toString(),
                  role: "assistant",
                  content: "Based on my analysis, here are the key insights from your data...",
                  artifact: {
                    type: "Analysis Result",
                    content: "Sample analysis output with findings and recommendations.",
                  },
                },
              ])
            }, 500)
          }
        }, 1000)
      }, index * 2000)
    })
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
                ])
                simulateProgress(messageId)
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
                ])
                simulateProgress(messageId)
              }}
              onArtifactClick={setSelectedArtifact}
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
