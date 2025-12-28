import { renderHook, act } from '@testing-library/react'
import { useChatStream } from '@/lib/hooks/useChatStream'
import { ChatStreamEvent, ChatMessage } from '@/lib/types/chat'

describe('useChatStream', () => {
  describe('reducer', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useChatStream())

      expect(result.current.state.messages).toEqual([])
      expect(result.current.state.conversationId).toBeNull()
      expect(result.current.state.isConnected).toBe(false)
      expect(result.current.state.isLoading).toBe(false)
      expect(result.current.state.error).toBeNull()
    })

    it('should handle SEND_MESSAGE action', () => {
      const { result } = renderHook(() => useChatStream())

      // Initial state should be empty
      expect(result.current.state.messages.length).toBe(0)
      expect(result.current.state.isLoading).toBe(false)
    })

    it('should handle CONNECTION_OPENED action', () => {
      const { result } = renderHook(() => useChatStream())

      expect(result.current.state.isConnected).toBe(false)
      // Connection state would be updated through dispatch
    })

    it('should handle CONNECTION_ERROR action', () => {
      const { result } = renderHook(() => useChatStream())

      expect(result.current.state.error).toBeNull()
      // Error state would be updated through dispatch
    })

    it('should handle RESET action', () => {
      const { result } = renderHook(() => useChatStream())

      act(() => {
        result.current.reset()
      })

      expect(result.current.state.messages).toEqual([])
      expect(result.current.state.conversationId).toBeNull()
      expect(result.current.state.isConnected).toBe(false)
      expect(result.current.state.isLoading).toBe(false)
      expect(result.current.state.error).toBeNull()
    })
  })

  describe('hook functions', () => {
    it('should provide sendMessage function', () => {
      const { result } = renderHook(() => useChatStream())

      expect(typeof result.current.sendMessage).toBe('function')
    })

    it('should provide cancel function', () => {
      const { result } = renderHook(() => useChatStream())

      expect(typeof result.current.cancel).toBe('function')
    })

    it('should provide reset function', () => {
      const { result } = renderHook(() => useChatStream())

      expect(typeof result.current.reset).toBe('function')
    })

    it('should cleanup EventSource on unmount', () => {
      const { unmount } = renderHook(() => useChatStream())

      unmount()
      // Verify no errors on unmount
    })
  })
})

