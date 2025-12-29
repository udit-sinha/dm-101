import { useState, useCallback, useRef } from "react"

export interface StreamEvent {
  type: "progress" | "content" | "artifact" | "error" | "complete"
  data: Record<string, any>
}

export interface UseChatStreamOptions {
  onProgress?: (event: StreamEvent) => void
  onContent?: (text: string) => void
  onArtifact?: (artifact: { type: string; content: string }) => void
  onError?: (error: string) => void
  onComplete?: (conversationId: number) => void
}

const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response

      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.statusText}`)
      }

      // Retry on server errors (5xx)
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.statusText}`)
      }

      return response
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))

      if (attempt < maxRetries) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error("Failed to fetch after retries")
}

export function useChatStream(options: UseChatStreamOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (message: string, conversationId?: number) => {
      setIsLoading(true)
      setError(null)
      abortControllerRef.current = new AbortController()

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

        const response = await fetchWithRetry(
          `${apiUrl}/api/chat/stream`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message,
              conversation_id: conversationId,
              mode: "auto",
            }),
            signal: abortControllerRef.current.signal,
          },
          MAX_RETRIES
        )

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error("No response body")

        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (!line.trim()) continue

            try {
              const event: StreamEvent = JSON.parse(line)
              options.onProgress?.(event)

              if (event.type === "content") {
                options.onContent?.(event.data.text)
              } else if (event.type === "artifact") {
                options.onArtifact?.(event.data)
              } else if (event.type === "error") {
                setError(event.data.message)
                options.onError?.(event.data.message)
              } else if (event.type === "complete") {
                options.onComplete?.(event.data.conversation_id)
              }
            } catch (e) {
              console.error("Failed to parse event:", line, e)
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          const errorMsg = err.message
          setError(errorMsg)
          options.onError?.(errorMsg)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [options]
  )

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsLoading(false)
  }, [])

  return { sendMessage, cancel, isLoading, error }
}

