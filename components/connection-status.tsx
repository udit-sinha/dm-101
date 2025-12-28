'use client'

import { Badge } from '@/components/ui/badge'
import { Loader2, Wifi, WifiOff, AlertCircle } from 'lucide-react'

interface ConnectionStatusProps {
  isConnected: boolean
  isLoading: boolean
  error?: string | null
}

export function ConnectionStatus({ isConnected, isLoading, error }: ConnectionStatusProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
        <span className="text-xs text-red-700 font-medium">Connection Error</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
        <Loader2 className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
        <span className="text-xs text-blue-700 font-medium">Connecting...</span>
      </div>
    )
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
        <Wifi className="w-4 h-4 text-green-600 flex-shrink-0" />
        <span className="text-xs text-green-700 font-medium">Connected</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
      <WifiOff className="w-4 h-4 text-gray-600 flex-shrink-0" />
      <span className="text-xs text-gray-700 font-medium">Disconnected</span>
    </div>
  )
}

