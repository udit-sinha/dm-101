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
    ResponseMode,
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
                    // Structured fields for grouped UI
                    stepNumber: thinkingData.stepNumber,
                    eventType: thinkingData.eventType,
                    topic: thinkingData.topic,
                    icon: thinkingData.icon,
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

                // NEW LOGIC: Parse structured JSON from backend
                let finalContent = doneData.finalMessage;
                let finalMode = doneData.responseMode || 'conversational';
                let newArtifacts = [];
                let sourceMetadata = []; // NEW: Extract source metadata

                try {
                    // Try to parse as structured JSON from backend
                    // Check if it looks like JSON first to avoid unnecessary parsing
                    if (finalContent.trim().startsWith('{') && finalContent.trim().endsWith('}')) {
                        const structured = JSON.parse(finalContent);

                        if (structured.mode && structured.chat_response) {
                            // It is our new structured format
                            finalContent = structured.chat_response;

                            // NEW: Extract source metadata and convert snake_case to camelCase
                            if (structured.source_metadata && Array.isArray(structured.source_metadata)) {
                                sourceMetadata = structured.source_metadata.map((m: any) => ({
                                    table: m.table,
                                    sourceFile: m.source_file,
                                    columnsUsed: m.columns_used || [],
                                    rowCount: m.row_count || 0,
                                    queryFilter: m.query_filter
                                }));
                            }

                            if (structured.mode === 'artifact' && structured.artifact_content) {
                                // Create an artifact for the side panel
                                // We use 'analytics' kind as a generic container for rich markdown reports
                                const reportArtifact = {
                                    kind: 'analytics', // Renders using ArtifactPanel which supports markdown in 'details'
                                    title: structured.artifact_title || 'Analysis Report',
                                    preview: structured.artifact_content.slice(0, 150) + '...',
                                    createdAt: Date.now(),
                                    data: {
                                        answer: structured.chat_response,
                                        details: structured.artifact_content, // Full markdown content
                                        code: null,
                                        sourceMetadata: sourceMetadata  // NEW: Pass to artifact
                                    }
                                };
                                newArtifacts.push(reportArtifact);
                                finalMode = 'deep_research'; // Trigger side panel opening if configured
                            } else {
                                finalMode = 'conversational';
                            }
                        }
                    }
                } catch (e) {
                    // Not JSON, use as is
                    // console.debug('Content was not JSON', e);
                }

                return {
                    ...state,
                    messages: state.messages.map((msg, idx) =>
                        idx === state.messages.length - 1
                            ? {
                                ...msg,
                                isStreaming: false,
                                content: finalContent,
                                mode: finalMode,
                                thinkingCollapsed: true,
                                artifacts: [...msg.artifacts, ...(doneData.artifacts || []), ...newArtifacts],
                                feedback: doneData.feedback || msg.feedback,
                                goals: doneData.goals || msg.goals,
                                sourceMetadata: sourceMetadata,  // NEW: Add to message
                            }
                            : msg
                    ),
                    isLoading: false,
                };
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

        case 'LOAD_SESSION': {
            return {
                ...initialState,
                messages: action.messages,
                conversationId: action.conversationId,
            }
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
        async (message: string, mode: 'research' | 'analytics', context?: any[]) => {
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

    // Polling interval ref for cleanup
    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    // Stop any active polling
    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current)
            pollingRef.current = null
        }
    }, [])

    // Check for pending messages on session load
    const checkPendingMessages = useCallback(async (sessionId: number) => {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
        try {
            const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}/pending`)
            if (!response.ok) return null
            const data = await response.json()
            return data
        } catch (error) {
            console.error('Failed to check pending messages:', error)
            return null
        }
    }, [])

    // Poll for message completion - self-contained, doesn't call loadSession to avoid loops
    const pollForCompletion = useCallback((sessionId: number, messageId: number) => {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

        // Clear any existing polling first
        stopPolling()

        pollingRef.current = setInterval(async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/messages/${messageId}`)
                if (!response.ok) {
                    stopPolling()
                    return
                }

                const message = await response.json()

                // Check if terminal state reached
                if (message.status === 'completed' || message.status === 'failed' || message.status === 'cancelled') {
                    // IMPORTANT: Stop polling FIRST
                    stopPolling()

                    // Fetch fresh session data and update state directly (avoids loadSession loop)
                    try {
                        const sessionResp = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}`)
                        if (sessionResp.ok) {
                            const session = await sessionResp.json()
                            // Parse messages and dispatch
                            const messages: ChatMessage[] = (session.messages || []).map((msg: any, idx: number) => {
                                let content = msg.content
                                let mode: ResponseMode = ResponseMode.conversational

                                if (msg.role === 'assistant' && content) {
                                    try {
                                        if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
                                            const parsed = JSON.parse(content)
                                            if (parsed.chat_response) content = parsed.chat_response
                                            if (parsed.mode) mode = parsed.mode as ResponseMode
                                        }
                                    } catch { /* Not JSON */ }
                                }

                                const artifacts = (msg.artifacts || []).map((a: any) => ({
                                    kind: a.kind || 'analytics',
                                    title: a.title || 'Untitled',
                                    preview: a.preview || '',
                                    content: a.content || a.data?.answer || '',
                                    data: a.data || {},
                                    createdAt: a.created_at || Date.now()
                                }))

                                return {
                                    id: `msg-${msg.id || idx}`,
                                    role: msg.role as 'user' | 'assistant',
                                    content,
                                    timestamp: new Date(msg.timestamp),
                                    isStreaming: false,
                                    mode,
                                    thinking: [],
                                    thinkingCollapsed: true,
                                    artifacts,
                                }
                            })
                            dispatch({ type: 'LOAD_SESSION', conversationId: sessionId, messages })
                        }
                    } catch (e) {
                        console.error('Failed to refresh session after poll:', e)
                    }
                }
            } catch (error) {
                console.error('Polling error:', error)
                stopPolling()
            }
        }, 2000)
    }, [stopPolling])

    // Cancel a background task
    const cancelBackgroundTask = useCallback(async (sessionId: number, messageId: number) => {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
        try {
            stopPolling()
            const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}/tasks/${messageId}/cancel`, {
                method: 'POST'
            })
            return response.ok
        } catch (error) {
            console.error('Failed to cancel task:', error)
            return false
        }
    }, [stopPolling])

    // Load a session by ID from the backend
    const loadSession = useCallback(async (sessionId: number) => {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

        // Close any existing EventSource connection to prevent cross-chat leakage
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
            eventSourceRef.current = null
        }

        // Also stop any legacy polling
        stopPolling()

        try {
            const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}`)
            if (!response.ok) throw new Error('Failed to load session')
            const session = await response.json()

            // Convert backend messages to ChatMessage format
            const messages: ChatMessage[] = (session.messages || []).map((msg: any, idx: number) => {
                let content = msg.content
                let mode: ResponseMode = ResponseMode.conversational
                const isProcessing = msg.status === 'processing' || msg.status === 'pending'

                // For assistant messages, check if content is structured JSON
                if (msg.role === 'assistant' && content && !isProcessing) {
                    try {
                        // Check if it looks like JSON
                        if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
                            const parsed = JSON.parse(content)
                            // Extract chat_response if it's our structured format
                            if (parsed.chat_response) {
                                content = parsed.chat_response
                            }
                            // Extract mode if available
                            if (parsed.mode) {
                                mode = parsed.mode as ResponseMode
                            }
                        }
                    } catch {
                        // Not JSON, use content as-is
                    }
                }

                // Parse artifacts from the API response
                const artifacts = (msg.artifacts || []).map((a: any) => ({
                    kind: a.kind || 'analytics',
                    title: a.title || 'Untitled',
                    preview: a.preview || '',
                    content: a.content || a.data?.answer || a.data?.markdown || '',  // Include content for display
                    data: a.data || {},
                    createdAt: a.created_at || Date.now()
                }))

                return {
                    id: `msg-${msg.id || idx}`,
                    role: msg.role as 'user' | 'assistant',
                    content: isProcessing ? '' : content,  // Empty for processing - stream will populate
                    timestamp: new Date(msg.timestamp),
                    isStreaming: isProcessing,  // Shows loading indicator for processing messages
                    mode,
                    thinking: [],
                    thinkingCollapsed: true,
                    artifacts,
                    messageId: msg.id,
                    status: msg.status,
                }
            })

            dispatch({ type: 'LOAD_SESSION', conversationId: sessionId, messages })

            // Check for in-progress tasks and subscribe to their stream
            const processingMsg = session.messages?.find((m: any) =>
                m.status === 'processing' || m.status === 'pending'
            )

            if (processingMsg) {
                // Connect to the subscribe endpoint for stream resume
                subscribeToTask(sessionId, processingMsg.id)
            }
        } catch (error) {
            console.error('Failed to load session:', error)
        }
    }, [])

    // Subscribe to an in-progress task's SSE stream (for resume)
    const subscribeToTask = useCallback((sessionId: number, messageId: number) => {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

        // Close any existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
        }

        const url = `${BACKEND_URL}/api/sessions/${sessionId}/tasks/${messageId}/subscribe`
        const eventSource = new EventSource(url)
        eventSourceRef.current = eventSource

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)

                // Construct ChatStreamEvent and dispatch as EVENT_RECEIVED
                const streamEvent: ChatStreamEvent = {
                    type: data.type,
                    data: data.data,
                    timestamp: Date.now()
                }

                dispatch({ type: 'EVENT_RECEIVED', event: streamEvent })

                // Close connection on terminal events
                if (data.type === 'done' || data.type === 'error') {
                    eventSource.close()
                    eventSourceRef.current = null
                }
            } catch (e) {
                console.error('Failed to parse SSE event:', e)
            }
        }

        eventSource.onerror = () => {
            console.error('SSE subscription error')
            eventSource.close()
            eventSourceRef.current = null
            dispatch({ type: 'CONNECTION_ERROR', error: 'Lost connection to stream' })
        }
    }, [])

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
        loadSession,
        subscribeToTask,
    }
}
