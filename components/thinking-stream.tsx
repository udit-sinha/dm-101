"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ThinkingItem } from "@/lib/types/chat"

interface ThinkingStreamProps {
  thoughts: ThinkingItem[]
  isComplete: boolean
  className?: string
}

export function ThinkingStream({ thoughts, isComplete, className }: ThinkingStreamProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  // Auto-collapse when complete
  useEffect(() => {
    if (isComplete && thoughts.length > 0) {
      // Keep expanded for a moment so user can see final state
      const timer = setTimeout(() => {
        setIsExpanded(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isComplete, thoughts.length])

  if (thoughts.length === 0) return null

  // Show only latest thought when collapsed
  const visibleThoughts = isExpanded ? thoughts : thoughts.slice(-1)

  return (
    <div className={cn("thinking-stream", className)}>
      {/* Collapse toggle when we have multiple thoughts */}
      {thoughts.length > 1 && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-1 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          <span>{isExpanded ? 'Hide thinking' : `Show ${thoughts.length} steps`}</span>
        </button>
      )}
      
      {/* Thinking items */}
      <AnimatePresence mode="popLayout">
        {visibleThoughts.map((thought, idx) => (
          <motion.div
            key={thought.id}
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-2 py-1">
              {/* Thinking indicator */}
              <span className="mt-0.5">
                {isComplete ? (
                  <span className="text-green-500 text-sm">✓</span>
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                )}
              </span>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "text-sm leading-relaxed",
                  isComplete ? "text-muted-foreground" : "text-foreground"
                )}>
                  {thought.content}
                </span>
                
                {/* Sub-items for detailed steps */}
                {thought.subItems && thought.subItems.length > 0 && (
                  <div className="mt-1 ml-2 space-y-0.5">
                    {thought.subItems.map((item, subIdx) => (
                      <div 
                        key={subIdx} 
                        className="text-xs text-muted-foreground flex items-start gap-1"
                      >
                        <span className="text-muted-foreground/50">├─</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Typing indicator when processing */}
      {!isComplete && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-1.5 ml-5 mt-1"
        >
          <motion.span 
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
            className="w-1.5 h-1.5 rounded-full bg-blue-400" 
          />
          <motion.span 
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-blue-400" 
          />
          <motion.span 
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
            className="w-1.5 h-1.5 rounded-full bg-blue-400" 
          />
        </motion.div>
      )}
    </div>
  )
}

