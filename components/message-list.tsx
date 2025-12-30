"use client"

import type { ChatMessage, ArtifactSummary } from "@/lib/types/chat"
import { ArtifactCard } from "./artifact-card"
import { GoalTracker } from "./goal-tracker"
import { ThinkingStream } from "./thinking-stream"

interface MessageListProps {
  messages: ChatMessage[]
  onArtifactClick: (artifact: ArtifactSummary) => void
}

export function MessageList({ messages, onArtifactClick }: MessageListProps) {
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

          {message.role === "assistant" && (
            <div className="flex justify-center">
              <div className="space-y-3 max-w-3xl w-full">
                {/* Thinking stream - shows agent's reasoning */}
                {message.thinking && message.thinking.length > 0 && (
                  <ThinkingStream
                    thoughts={message.thinking}
                    isComplete={!message.isStreaming}
                    className="mb-2"
                  />
                )}

                {/* Error state */}
                {message.error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
                    <div className="flex items-start gap-2">
                      <span className="text-red-500">⚠️</span>
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">
                          {message.error.message}
                        </p>
                        {message.error.recoverable && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            You can try asking your question again.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Final message content - only show if not error */}
                {message.content && !message.error && (
                  <div className={`text-sm leading-relaxed ${
                    message.mode === 'conversational'
                      ? 'text-foreground'
                      : 'text-foreground/90'
                  }`}>
                    {message.content}
                  </div>
                )}

                {/* Goal tracker */}
                {message.goals && (
                  <GoalTracker goal={message.goals} />
                )}

                {/* Artifacts - shown for non-conversational modes */}
                {message.artifacts && message.artifacts.length > 0 &&
                 message.mode !== 'conversational' && (
                  <div className="space-y-2">
                    {message.artifacts.map((artifact, idx) => (
                      <ArtifactCard
                        key={idx}
                        artifact={artifact}
                        onSelect={onArtifactClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
