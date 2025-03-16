"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, X, ArrowRight, Command } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  className?: string
  expanded?: boolean
  onToggleExpand?: () => void
  placeholder?: string
}

export function SearchBar({
  className,
  expanded = false,
  onToggleExpand,
  placeholder = "Search data or ask a question...",
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Focus input when expanded
  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [expanded])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setQuery("")
      if (onToggleExpand) onToggleExpand()
    }
  }

  const handleClear = () => {
    setQuery("")
    inputRef.current?.focus()
  }

  return (
    <form
      onSubmit={handleSearch}
      className={cn(
        "relative flex items-center justify-center mx-auto transition-all duration-200 ease-in-out",
        expanded ? "w-full max-w-4xl" : "w-80",
        className,
      )}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "pl-9 pr-10 h-11 bg-background/50 border-input/50 hover:bg-background",
            "transition-colors duration-200",
            isFocused && "ring-1 ring-ring ring-offset-1 ring-offset-background bg-background border-input",
          )}
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear</span>
          </Button>
        )}
      </div>
      <Button 
        type="submit" 
        size="icon" 
        className="ml-2 h-11 w-11 shrink-0 transition-colors" 
        disabled={!query.trim()}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  )
}
