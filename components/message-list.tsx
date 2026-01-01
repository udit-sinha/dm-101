"use client"

import { CheckCircle2, Loader2, Circle, ChevronRight, ChevronDown, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useState } from "react"

interface ProgressStep {
  id: string
  title: string
  status: "pending" | "in-progress" | "completed" | "error"
  details?: string
  documents?: string[]
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  progress?: ProgressStep[]
  artifact?: { type: string; content: string }
}

interface MessageListProps {
  messages: Message[]
  onArtifactClick: (artifact: { type: string; content: string }) => void
}

export function MessageList({ messages, onArtifactClick }: MessageListProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(stepId)) {
        next.delete(stepId)
      } else {
        next.add(stepId)
      }
      return next
    })
  }

  const getStatusIcon = (status: ProgressStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
      case "in-progress":
        return <Loader2 className="h-3.5 w-3.5 animate-spin" />
      default:
        return <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />
    }
  }

  return (
    <div className="px-6 py-6 space-y-6">
      {messages.map((message) => (
        <div key={message.id} className="space-y-3">
          {message.role === "user" && (
            <div className="flex justify-center">
              <div className="max-w-3xl w-full flex justify-end">
                <div className="rounded-2xl bg-muted/60 text-foreground px-4 py-3 inline-block max-w-2xl">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            </div>
          )}

          {message.progress && message.progress.length > 0 && (
            <div className="flex justify-center">
              <div className="space-y-2 text-sm max-w-3xl w-full">
                {message.progress.map((step) => {
                  const hasChildren = step.documents && step.documents.length > 0
                  const isExpanded = expandedSteps.has(step.id)
                  const showChildren = hasChildren && (step.status === "in-progress" || isExpanded)

                  return (
                    <div key={step.id} className="space-y-2">
                      <div
                        className={`flex items-start gap-2 py-1 ${hasChildren ? "cursor-pointer hover:text-foreground transition-colors" : ""}`}
                        onClick={() => hasChildren && toggleStep(step.id)}
                      >
                        {getStatusIcon(step.status)}
                        <span className="text-muted-foreground text-xs flex-1">{step.title}</span>
                        {hasChildren && (
                          <span className="text-muted-foreground/60">
                            {showChildren ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          </span>
                        )}
                      </div>
                      {showChildren && (
                        <div className="ml-6 max-h-32 overflow-y-auto space-y-1 pr-2">
                          {step.documents!.map((doc, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground/70">
                              <FileText className="h-3 w-3 flex-shrink-0" />
                              <span>{doc}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {message.role === "assistant" && (
            <div className="flex justify-center">
              <div className="space-y-3 max-w-3xl w-full">
                <p className="text-sm leading-relaxed text-foreground/90">{message.content}</p>

                {message.artifact && (
                  <Card
                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors border-l-2 border-l-foreground"
                    onClick={() => onArtifactClick(message.artifact!)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">{message.artifact.type}</div>
                        <div className="text-sm line-clamp-2">{message.artifact.content}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
