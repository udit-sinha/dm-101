"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ThinkingItem } from "@/lib/types/chat"

interface ThinkingStep {
    stepNumber: number
    topic: string
    thoughts: string[]
    isComplete: boolean
}

interface ThinkingStreamProps {
    thoughts: ThinkingItem[]
    isComplete: boolean
    className?: string
}

export function ThinkingStream({ thoughts, isComplete, className }: ThinkingStreamProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    // Group flat ThinkingItems into steps
    const steps = useMemo(() => {
        const stepMap = new Map<number, ThinkingStep>()

        for (const item of thoughts) {
            const stepNum = item.stepNumber ?? 0

            if (!stepMap.has(stepNum)) {
                stepMap.set(stepNum, {
                    stepNumber: stepNum,
                    topic: item.topic || item.content || "Processing...",
                    thoughts: [],
                    isComplete: false,
                })
            }

            const step = stepMap.get(stepNum)!

            if (item.eventType === "start" && item.topic) {
                step.topic = item.topic
            } else if (item.eventType === "content" && item.content) {
                step.thoughts.push(item.content)
            } else if (item.eventType === "complete") {
                step.isComplete = true
            } else if (item.content && !item.eventType) {
                step.thoughts.push(item.content)
            }
        }

        return Array.from(stepMap.values()).sort((a, b) => a.stepNumber - b.stepNumber)
    }, [thoughts])

    // Mark all complete when stream is done
    const finalSteps = useMemo(() => {
        if (isComplete) {
            return steps.map(s => ({ ...s, isComplete: true }))
        }
        return steps
    }, [steps, isComplete])

    // Get last 4 thought lines (not topics) for collapsed view
    const tailLines = useMemo(() => {
        const allThoughts: string[] = []
        for (const step of finalSteps) {
            allThoughts.push(...step.thoughts)
        }
        return allThoughts.slice(-4)
    }, [finalSteps])

    // Current active step - always show the LAST step (most recent)
    const activeStep = finalSteps[finalSteps.length - 1]

    if (thoughts.length === 0) return null

    // For collapsed view: get last completed + current step
    const completedSteps = finalSteps.filter(s => s.isComplete)
    const currentStep = finalSteps.find(s => !s.isComplete)
    const lastCompletedStep = completedSteps[completedSteps.length - 1]

    return (
        <div className={cn("thinking-stream", className)}>
            {/* Collapsed View - Just current step */}
            {!isExpanded && (
                <div
                    onClick={() => setIsExpanded(true)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                    {!isComplete && activeStep ? (
                        <div className="space-y-1.5">
                            {/* Heading with Shimmer Fade + Chevron Right */}
                            <div className="flex justify-between items-center gap-2">
                                <motion.div
                                    className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground via-muted-foreground/80 to-foreground"
                                    animate={{
                                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    style={{
                                        backgroundSize: "200% auto",
                                    }}
                                >
                                    {activeStep.topic}
                                </motion.div>
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            </div>

                            {/* Tail - last 4 thought lines (aligned with heading) */}
                            {tailLines.length > 0 && (
                                <div className="space-y-0.5 text-xs text-muted-foreground/70">
                                    {tailLines.map((line, idx) => (
                                        <p key={idx} className="truncate leading-relaxed">{line}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                            <span>{finalSteps.length} steps completed</span>
                            <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                        </div>
                    )}
                </div>
            )}

            {/* Expanded View - Timeline with dots */}
            {isExpanded && (
                <div className="space-y-0">
                    {/* Header with collapse toggle */}
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="w-full flex items-center justify-between gap-2 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors p-1 rounded-sm hover:bg-muted/50"
                    >
                        <span>Thinking Process</span>
                        <ChevronRight className="w-3.5 h-3.5 rotate-[270deg]" />
                    </button>

                    {/* Timeline */}
                    <div className="relative ml-2">
                        {finalSteps.map((step, idx) => (
                            <div key={step.stepNumber} className="relative flex gap-3 pb-4 last:pb-0">
                                {/* Vertical line */}
                                {idx < finalSteps.length - 1 && (
                                    <div className="absolute left-[5px] top-4 bottom-0 w-px bg-border" />
                                )}

                                {/* Dot - hollow when incomplete, filled when complete */}
                                <div className="relative z-10 mt-1 flex-shrink-0">
                                    {step.isComplete ? (
                                        <div className="w-2.5 h-2.5 rounded-full bg-foreground" />
                                    ) : (
                                        <motion.div
                                            className="w-2.5 h-2.5 rounded-full border-2 border-foreground bg-background"
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                    {/* Topic */}
                                    <div className={cn(
                                        "text-sm font-medium",
                                        step.isComplete ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {step.topic}
                                    </div>

                                    {/* Thoughts */}
                                    {step.thoughts.length > 0 && (
                                        <div className="mt-1 space-y-1">
                                            {step.thoughts.map((thought, tidx) => (
                                                <p
                                                    key={tidx}
                                                    className="text-xs text-muted-foreground leading-relaxed"
                                                >
                                                    {thought}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Loading indicator when processing */}
                    {!isComplete && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1.5 ml-7 mt-2"
                        >
                            <motion.span
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
                                className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                            />
                            <motion.span
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
                                className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                            />
                            <motion.span
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
                                className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                            />
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    )
}
