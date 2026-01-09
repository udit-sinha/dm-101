"use client"

import { ChatInput } from "./chat-input"
import { MessageList } from "./message-list"
import { useEffect, useRef } from "react"
import type { ChatMessage, ArtifactSummary } from "@/lib/types/chat"

type AgentMode = "auto" | "fast" | "research" | "data-quality"

interface ChatAreaProps {
    messages: ChatMessage[]
    onSubmit: (data: { message: string; mode?: AgentMode; context?: any[] }) => void
    onArtifactClick: (artifact: ArtifactSummary) => void
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

            {/* Compact Chat Input at bottom */}
            <ChatInput onSubmit={onSubmit} isLoading={isLoading} onCancel={onCancel} />
        </div>
    )
}
