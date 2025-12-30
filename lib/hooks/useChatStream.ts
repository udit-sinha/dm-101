'use client'

import { useReducer, useCallback, useRef, useEffect } from 'react'
import {
  ChatStreamState,
  ChatStreamAction,
  ChatStreamEvent,
  ChatMessage,
  isInitEvent,
  isStepEvent,
  isDoneEvent,
  isErrorEvent,
  ArtifactEventData,
  FeedbackEventData,
  GoalUpdateEventData,
  TokenEventData,
  ThinkingEventData,
  ThinkingItem,
  DoneEventData,
} from '@/lib/types/chat'

// Initial state
const initialState: ChatStreamState = {
  messages: [],
  conversationId: null,
  isConnected: false,
  isLoading: false,
  error: null,
}

// Reducer function
function chatStreamReducer(state: ChatStreamState, action: ChatStreamAction): ChatStreamState {
  switch (action.type) {
    case 'SEND_MESSAGE': {
      return {
        ...state,
        messages: [...state.messages, action.message],
        isLoading: true,
        error: null,
      }
    }

    case 'EVENT_RECEIVED': {
      const event = action.event
      const lastMessage = state.messages[state.messages.length - 1]

      if (!lastMessage || lastMessage.role !== 'assistant') {
        return state
      }

      // Update the last message based on event type
      if (isInitEvent(event)) {
        return {
          ...state,
          conversationId: event.data.conversationId,
          messages: state.messages.map((msg, idx) =>
            idx === state.messages.length - 1
              ? { ...msg, progress: event.data.initialSteps }
              : msg
          ),
        }
      }

      if (isStepEvent(event)) {
        return {
          ...state,
          messages: state.messages.map((msg, idx) =>
            idx === state.messages.length - 1
              ? {
                  ...msg,
                  progress: msg.progress?.map((step) =>
                    step.id === event.data.stepId
                      ? { ...step, status: event.data.status, details: event.data.details }
                      : step
                  ) || [],
                }
              : msg
          ),
        }
      }

      // Handle artifact events
      if (event.type === 'artifact') {
        const artifactData = event.data as ArtifactEventData
        return {
          ...state,
          messages: state.messages.map((msg, idx) =>
            idx === state.messages.length - 1
              ? {
                  ...msg,
                  artifacts: [...msg.artifacts, artifactData.artifact],
                }
              : msg
          ),
        }
      }

      // Handle feedback events
      if (event.type === 'feedback') {
        const feedbackData = event.data as FeedbackEventData
        return {
          ...state,
          messages: state.messages.map((msg, idx) =>
            idx === state.messages.length - 1
              ? {
                  ...msg,
                  feedback: feedbackData.feedback,
                }
              : msg
          ),
        }
      }

      // Handle thinking events (agent's reasoning stream)
      if (event.type === 'thinking') {
        const thinkingData = event.data as ThinkingEventData
        const newThought: ThinkingItem = {
          id: `thought-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: thinkingData.content,
          agentName: thinkingData.agentName,
          timestamp: Date.now(),
          subItems: thinkingData.subItems,
        }
        return {
          ...state,
          messages: state.messages.map((msg, idx) =>
            idx === state.messages.length - 1
              ? {
                  ...msg,
                  thinking: [...msg.thinking, newThought],
                }
              : msg
          ),
        }
      }

      // Handle goal update events
      if (event.type === 'goal_update') {
        const goalData = event.data as GoalUpdateEventData
        return {
          ...state,
          messages: state.messages.map((msg, idx) =>
            idx === state.messages.length - 1
              ? {
                  ...msg,
                  goals: goalData.goal,
                }
              : msg
          ),
        }
      }

      // Handle token events (streaming text) - currently not used in main flow
      if (event.type === 'token') {
        const tokenData = event.data as TokenEventData
        return {
          ...state,
          messages: state.messages.map((msg, idx) =>
            idx === state.messages.length - 1
              ? {
                  ...msg,
                  content: tokenData.isFinal
                    ? tokenData.token
                    : (msg.content || '') + tokenData.token,
                }
              : msg
          ),
        }
      }

      if (isDoneEvent(event)) {
        const doneData = event.data as DoneEventData
        return {
          ...state,
          messages: state.messages.map((msg, idx) =>
            idx === state.messages.length - 1
              ? {
                  ...msg,
                  isStreaming: false,
                  content: doneData.finalMessage,
                  mode: doneData.responseMode || 'conversational',
                  thinkingCollapsed: true, // Auto-collapse thinking when done
                  // Merge any final artifacts/feedback/goals from DONE event
                  artifacts: doneData.artifacts || msg.artifacts,
                  feedback: doneData.feedback || msg.feedback,
                  goals: doneData.goals || msg.goals,
                }
              : msg
          ),
          isLoading: false,
        }
      }

      if (isErrorEvent(event)) {
        return {
          ...state,
          messages: state.messages.map((msg, idx) =>
            idx === state.messages.length - 1
              ? {
                  ...msg,
                  isStreaming: false,
                  mode: 'error',
                  error: {
                    code: event.data.code,
                    message: event.data.message,
                    recoverable: event.data.recoverable,
                  },
                }
              : msg
          ),
          error: event.data.message,
          isLoading: false,
        }
      }

      return state
    }

    case 'CONNECTION_OPENED': {
      return {
        ...state,
        isConnected: true,
        error: null,
      }
    }

    case 'CONNECTION_CLOSED': {
      return {
        ...state,
        isConnected: false,
        isLoading: false,
      }
    }

    case 'CONNECTION_ERROR': {
      return {
        ...state,
        isConnected: false,
        error: action.error,
        isLoading: false,
      }
    }

    case 'RESET': {
      return initialState
    }

    default:
      return state
  }
}

// Hook
export function useChatStream() {
  const [state, dispatch] = useReducer(chatStreamReducer, initialState)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Send message and start streaming
  const sendMessage = useCallback(
    async (message: string, mode: 'research' | 'analytics', context?: string[]) => {
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date(),
        isStreaming: false,
        mode: 'conversational',
        thinking: [],
        thinkingCollapsed: false,
        artifacts: [],
      }

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        mode: 'conversational',
        thinking: [],
        thinkingCollapsed: false,
        artifacts: [],
      }

      dispatch({ type: 'SEND_MESSAGE', message: userMessage })
      dispatch({ type: 'SEND_MESSAGE', message: assistantMessage })

      try {
        // Get backend URL from environment or default to localhost
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

        // Call backend API to start streaming
        const streamUrl = `${backendUrl}/api/chat/stream`

        // Connect to SSE stream with POST request
        connectToStream(streamUrl, {
          message,
          mode,
          conversation_id: state.conversationId,
          context,
        })
      } catch (error) {
        dispatch({
          type: 'CONNECTION_ERROR',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    },
    [state.conversationId]
  )

  // Connect to SSE stream using fetch (since EventSource doesn't support POST)
  const connectToStream = useCallback(async (streamUrl: string, body: any) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      dispatch({ type: 'CONNECTION_OPENED' })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      // Store reader in ref for cancellation
      eventSourceRef.current = { close: () => reader.cancel() } as any

      // Read the stream
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          dispatch({ type: 'CONNECTION_CLOSED' })
          break
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true })

        // Split by lines and process SSE events
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = line.slice(6) // Remove 'data: ' prefix
              const chatEvent: ChatStreamEvent = JSON.parse(eventData)
              dispatch({ type: 'EVENT_RECEIVED', event: chatEvent })
            } catch (error) {
              console.error('Failed to parse event:', error, line)
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream connection error:', error)
      dispatch({
        type: 'CONNECTION_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }, [])

  // Cancel streaming
  const cancel = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    dispatch({ type: 'CONNECTION_CLOSED' })
  }, [])

  // Reset state
  const reset = useCallback(() => {
    cancel()
    dispatch({ type: 'RESET' })
  }, [cancel])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  return {
    state,
    sendMessage,
    cancel,
    reset,
  }
}

