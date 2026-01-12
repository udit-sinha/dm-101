'use client'

import { useState, useCallback, useEffect } from 'react'

// Session type from backend
export interface Session {
    id: number
    title: string | null
    status: string
    created_at: string
    updated_at: string
    message_count: number
}

// Session message type
export interface SessionMessage {
    id: number
    role: 'user' | 'assistant'
    content: string
    timestamp: string
}

// Session with messages
export interface SessionWithMessages extends Session {
    messages: SessionMessage[]
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

/**
 * Hook for managing session history.
 * Provides functions to fetch, create, and delete sessions.
 */
export function useSessions() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch all sessions
    const fetchSessions = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch(`${BACKEND_URL}/api/sessions`)
            if (!response.ok) throw new Error('Failed to fetch sessions')
            const data = await response.json()
            setSessions(data.sessions || [])
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error')
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Create a new session
    const createSession = useCallback(async (title?: string): Promise<Session | null> => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            })
            if (!response.ok) throw new Error('Failed to create session')
            const session = await response.json()
            await fetchSessions() // Refresh list
            return session
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error')
            return null
        }
    }, [fetchSessions])

    // Get a session with messages
    const getSession = useCallback(async (sessionId: number): Promise<SessionWithMessages | null> => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}`)
            if (!response.ok) throw new Error('Failed to fetch session')
            return await response.json()
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error')
            return null
        }
    }, [])

    // Delete a session
    const deleteSession = useCallback(async (sessionId: number): Promise<boolean> => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}`, {
                method: 'DELETE',
            })
            if (!response.ok) throw new Error('Failed to delete session')
            await fetchSessions() // Refresh list
            return true
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error')
            return false
        }
    }, [fetchSessions])

    // Fetch sessions on mount
    useEffect(() => {
        fetchSessions()
    }, [fetchSessions])

    return {
        sessions,
        isLoading,
        error,
        fetchSessions,
        createSession,
        getSession,
        deleteSession,
    }
}
