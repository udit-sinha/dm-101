"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, ThumbsUp, ThumbsDown, Copy, MessageSquare, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface Source {
  id: string
  title: string
  url: string
  snippet: string
  type: "document" | "database" | "dashboard" | "app" | "web"
}

interface SearchResultProps {
  query: string
  answer: string
  sources: Source[]
  timestamp: string
  isLoading?: boolean
}

export function SearchResult({ query, answer, sources, timestamp, isLoading = false }: SearchResultProps) {
  const [activeTab, setActiveTab] = useState<string>("answer")
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(answer)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="mb-6 border-muted/30">
      <CardContent className="p-4 pt-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="AI" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Query: {query}</p>
                <span className="text-xs text-muted-foreground">{timestamp}</span>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="answer">Answer</TabsTrigger>
                  <TabsTrigger value="sources" className="relative">
                    Sources
                    <Badge className="ml-2 h-5 px-1.5 text-xs">{sources.length}</Badge>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="answer" className="mt-4 space-y-4">
                  {isLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                      <div className="h-4 w-11/12 animate-pulse rounded bg-muted"></div>
                      <div className="h-4 w-4/5 animate-pulse rounded bg-muted"></div>
                      <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <p>{answer}</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="sources" className="mt-4">
                  <div className="space-y-3">
                    {sources.map((source) => (
                      <div key={source.id} className="rounded-md border p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2">
                              {source.type}
                            </Badge>
                            <h4 className="font-medium">{source.title}</h4>
                          </div>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={source.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                              <span className="sr-only">Open source</span>
                            </a>
                          </Button>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{source.snippet}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t bg-muted/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ThumbsUp className="h-4 w-4" />
            <span className="sr-only">Helpful</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ThumbsDown className="h-4 w-4" />
            <span className="sr-only">Not helpful</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", copied && "text-green-500")}
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
            <span className="sr-only">Copy</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
            <MessageSquare className="h-3.5 w-3.5" />
            Follow-up
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More options</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

