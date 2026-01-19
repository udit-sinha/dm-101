"use client"

import type { ChatMessage, ArtifactSummary } from "@/lib/types/chat"
import { ArtifactCard } from "./artifact-card"
import { ThinkingStream } from "./thinking-stream"
import { SourceMetadataBadge } from './source-metadata-badge'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DataCard } from "./data-card"
import { Sparkles, ChevronRight } from 'lucide-react'

interface MessageListProps {
    messages: ChatMessage[]
    onArtifactClick: (artifact: ArtifactSummary) => void
}

export function MessageList({ messages, onArtifactClick }: MessageListProps) {
    return (
        <div className="px-6 py-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message) => (
                    <div key={message.id} className="space-y-4">
                        {/* User Message */}
                        {message.role === "user" && (
                            <div className="flex justify-end">
                                <div className="bg-muted px-4 py-3 rounded-2xl max-w-lg">
                                    <p className="text-sm">{message.content}</p>
                                </div>
                            </div>
                        )}

                        {/* Assistant Message */}
                        {message.role === "assistant" && (
                            <div className="space-y-4">
                                {/* Thinking stream - shows agent's reasoning */}
                                {message.thinking && message.thinking.length > 0 && (
                                    <ThinkingStream
                                        thoughts={message.thinking}
                                        isComplete={!message.isStreaming}
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

                                {/* AI Response with avatar */}
                                {message.content && !message.error && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-3 overflow-hidden">
                                            {/* Main content - no heading, just the answer */}
                                            <div className={`text-sm leading-relaxed ${message.mode === 'conversational'
                                                ? 'text-foreground'
                                                : 'text-foreground/90'
                                                }`}>
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        table: ({ node, ...props }) => (
                                                            <DataCard title="Results" className="my-4">
                                                                <Table className="text-xs" {...props} />
                                                            </DataCard>
                                                        ),
                                                        thead: ({ node, ...props }) => (
                                                            <TableHeader className="bg-muted/50 sticky top-0" {...props} />
                                                        ),
                                                        tbody: ({ node, ...props }) => <TableBody {...props} />,
                                                        tr: ({ node, ...props }) => (
                                                            <TableRow className="hover:bg-muted/30" {...props} />
                                                        ),
                                                        th: ({ node, ...props }) => (
                                                            <TableHead className="text-xs font-medium text-muted-foreground whitespace-nowrap px-3 py-2 h-8" {...props} />
                                                        ),
                                                        td: ({ node, ...props }) => (
                                                            <TableCell className="text-xs px-3 py-2 whitespace-nowrap" {...props} />
                                                        ),
                                                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                        a: ({ node, ...props }) => <a className="text-primary underline underline-offset-4" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="my-2 list-disc pl-6" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="my-2 list-decimal pl-6" {...props} />,
                                                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>

                                            {/* Artifacts */}
                                            {message.artifacts && message.artifacts.length > 0 && (
                                                <div className="space-y-2 mt-4">
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
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
