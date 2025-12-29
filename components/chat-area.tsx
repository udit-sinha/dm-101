"use client"

import { PromptForm } from "./prompt-form"
import { MessageList } from "./message-list"
import { useEffect, useRef } from "react"

type AgentMode = "auto" | "fast" | "research" | "data-quality"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  progress?: any
  artifact?: { type: string; content: string }
}

interface ChatAreaProps {
  messages: Message[]
  onSubmit: (data: { message: string; mode: AgentMode; context: any[] }) => void
  onArtifactClick: (artifact: { type: string; content: string }) => void
  isLoading?: boolean
  onCancel?: () => void
}

export function ChatArea({ messages, onSubmit, onArtifactClick, isLoading, onCancel }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
        <MessageList messages={messages} onArtifactClick={onArtifactClick} />
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 shrink-0">
        <div className="max-w-3xl mx-auto">
          <PromptForm onSubmit={onSubmit} isLoading={isLoading} onCancel={onCancel} />
        </div>
      </div>
    </div>
  )
}
