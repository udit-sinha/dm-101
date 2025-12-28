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

      if (isDoneEvent(event)) {
        return {
          ...state,
          messages: state.messages.map((msg, idx) =>
            idx === state.messages.length - 1
              ? {
                  ...msg,
                  isStreaming: false,
                  artifacts: event.data.artifacts,
                  feedback: event.data.feedback,
                  goals: event.data.goals,
                }
              : msg
          ),
          isLoading: false,
        }
      }

      if (isErrorEvent(event)) {
        return {
          ...state,
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
        mode,
        timestamp: Date.now(),
        isStreaming: false,
      }

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: '',
        mode,
        timestamp: Date.now(),
        isStreaming: true,
      }

      dispatch({ type: 'SEND_MESSAGE', message: userMessage })
      dispatch({ type: 'SEND_MESSAGE', message: assistantMessage })

      try {
        // Call API to start streaming
        const response = await fetch('/api/chat/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            mode,
            conversationId: state.conversationId,
            context,
          }),
        })

        if (!response.ok) throw new Error('Failed to start chat')

        const data = await response.json()
        connectToStream(data.streamUrl)
      } catch (error) {
        dispatch({
          type: 'CONNECTION_ERROR',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    },
    [state.conversationId]
  )

  // Connect to EventSource stream
  const connectToStream = useCallback((streamUrl: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const eventSource = new EventSource(streamUrl)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      dispatch({ type: 'CONNECTION_OPENED' })
    }

    eventSource.onmessage = (event) => {
      try {
        const chatEvent: ChatStreamEvent = JSON.parse(event.data)
        dispatch({ type: 'EVENT_RECEIVED', event: chatEvent })
      } catch (error) {
        console.error('Failed to parse event:', error)
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
      dispatch({ type: 'CONNECTION_CLOSED' })
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

