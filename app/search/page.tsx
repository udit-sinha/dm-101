"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { SearchResult } from "@/components/search-result"
import { FollowUpQuestion } from "@/components/follow-up-question"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight, SearchIcon } from "lucide-react"
import { TopNav } from "@/components/top-nav"

// Mock data for demonstration
const mockSources = [
  {
    id: "1",
    title: "Customer Data Collection",
    url: "/data-collections?collection=col-1",
    snippet:
      "Contains customer information and demographics with 1,245 records including names, emails, and locations.",
    type: "database" as const,
  },
  {
    id: "2",
    title: "Sales Overview Dashboard",
    url: "/dashboards?dashboard=dash-1",
    snippet: "Key sales metrics and performance indicators showing revenue trends and customer acquisition costs.",
    type: "dashboard" as const,
  },
  {
    id: "3",
    title: "Marketing Assets",
    url: "/data-collections?collection=col-4",
    snippet: "Marketing materials and assets including campaign documents and brand guidelines.",
    type: "document" as const,
  },
]

const mockFollowUpQuestions = [
  "How many active customers do we have?",
  "What's the average revenue per customer?",
  "Show me the top 5 customers by revenue",
  "Compare sales performance between Q1 and Q2",
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string
      query: string
      answer: string
      sources: typeof mockSources
      timestamp: string
    }>
  >([])
  const [isSearching, setIsSearching] = useState(false)

  // Simulate search when query changes from URL
  useEffect(() => {
    if (initialQuery && !searchResults.length) {
      handleSearch(initialQuery)
    }
  }, [initialQuery])

  const handleSearch = async (searchQuery: string) => {
    setIsSearching(true)

    // Simulate API call delay
    setTimeout(() => {
      const newResult = {
        id: Date.now().toString(),
        query: searchQuery,
        answer: `Based on the data available, there are several insights related to "${searchQuery}". The customer data shows a total of 1,245 records with varying demographics. Sales trends indicate a positive growth trajectory with seasonal variations. The marketing assets collection contains relevant campaign materials that might be useful for further analysis.`,
        sources: mockSources,
        timestamp: new Date().toLocaleTimeString(),
      }

      setSearchResults((prev) => [newResult, ...prev])
      setIsSearching(false)
      setQuery("")
    }, 1500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      handleSearch(query)
    }
  }

  const handleFollowUpQuestion = (question: string) => {
    setQuery(question)
    handleSearch(question)
  }

  return (
    <>
      <TopNav title="Search" />

      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="mb-8">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search data or ask a question..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              <Button type="submit" disabled={!query.trim() || isSearching}>
                {isSearching ? "Searching..." : "Search"}
                {!isSearching && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </div>

          {isSearching && (
            <SearchResult
              query={query}
              answer=""
              sources={[]}
              timestamp={new Date().toLocaleTimeString()}
              isLoading={true}
            />
          )}

          {searchResults.length > 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mockFollowUpQuestions.map((question, index) => (
                  <FollowUpQuestion key={index} question={question} onClick={handleFollowUpQuestion} />
                ))}
              </div>

              <div className="space-y-6">
                {searchResults.map((result) => (
                  <SearchResult
                    key={result.id}
                    query={result.query}
                    answer={result.answer}
                    sources={result.sources}
                    timestamp={result.timestamp}
                  />
                ))}
              </div>
            </div>
          )}

          {!isSearching && searchResults.length === 0 && initialQuery && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <SearchIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-medium mb-2">No results found</h2>
              <p className="text-muted-foreground max-w-md">
                We couldn't find any results for "{initialQuery}". Try adjusting your search terms or ask a
                different question.
              </p>
            </div>
          )}

          {!isSearching && searchResults.length === 0 && !initialQuery && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <SearchIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-medium mb-2">Search your data</h2>
              <p className="text-muted-foreground max-w-md">
                Ask questions about your data collections, dashboards, and documents to get instant insights.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
