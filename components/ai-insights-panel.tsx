"use client"

import { useState } from 'react'
import { Sparkles, X, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export interface AIInsightsPanelProps {
    isOpen: boolean
    onClose: () => void
    onQuerySubmit?: (query: string) => void
    responses?: { role: 'user' | 'assistant'; content: string }[]
    isLoading?: boolean
    className?: string
    analyticalMapping?: Record<string, any>
}

export function AIInsightsPanel({
    isOpen,
    onClose,
    onQuerySubmit,
    responses = [],
    isLoading = false,
    className,
    analyticalMapping
}: AIInsightsPanelProps) {
    const [query, setQuery] = useState('')

    const handleSubmit = () => {
        if (!query.trim()) return
        onQuerySubmit?.(query)
        setQuery('')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    if (!isOpen) return null

    const analyticsColumn = analyticalMapping?.['analytics-column']

    return (
        <div className={cn(
            "w-[400px] border-l border-border bg-card shadow-2xl flex flex-col h-full",
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-accent/50 px-4 py-4 shrink-0">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">AI Insights</h2>
                </div>
                <Button size="icon" variant="ghost" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4">
                {responses.length === 0 ? (
                    <div className="rounded-lg border border-border bg-accent/20 p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Ask about your data</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Try asking:</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                {analyticsColumn ? (
                                    <>
                                        <li>Analyze the distribution of {analyticsColumn}</li>
                                        <li>Summarize findings based on {analyticsColumn}</li>
                                        <li>What are the top values for {analyticsColumn}?</li>
                                    </>
                                ) : (
                                    <>
                                        <li>What's the average depth of selected wells?</li>
                                        <li>Which platforms have the highest production?</li>
                                        <li>Show me trends in the last 30 days</li>
                                    </>
                                )}
                                <li>Summarize the selected features</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {responses.map((msg, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "rounded-lg p-3 text-sm",
                                    msg.role === 'user'
                                        ? "bg-primary/10 text-foreground ml-8"
                                        : "bg-accent text-foreground mr-8"
                                )}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="bg-accent text-foreground mr-8 rounded-lg p-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="animate-pulse">Thinking...</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-4 shrink-0">
                <div className="flex gap-2">
                    <Textarea
                        placeholder="Ask about the selected features..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[80px] resize-none flex-1"
                        disabled={isLoading}
                    />
                </div>
                <Button
                    onClick={handleSubmit}
                    className="w-full mt-2"
                    disabled={!query.trim() || isLoading}
                >
                    <Send className="mr-2 h-4 w-4" />
                    Generate Insights
                </Button>
            </div>
        </div>
    )
}
