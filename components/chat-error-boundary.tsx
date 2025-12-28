'use client'

import React, { ReactNode, ReactElement } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface ChatErrorBoundaryProps {
  children: ReactNode
  onRetry?: () => void
}

interface ChatErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ChatErrorBoundary extends React.Component<ChatErrorBoundaryProps, ChatErrorBoundaryState> {
  constructor(props: ChatErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ChatErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chat Error Boundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    this.props.onRetry?.()
  }

  render(): ReactElement {
    if (this.state.hasError) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <CardTitle className="text-red-900">Something went wrong</CardTitle>
                <CardDescription className="text-red-700 mt-1">
                  An error occurred while processing your request
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {this.state.error && (
              <div className="bg-white border border-red-200 rounded p-3">
                <p className="text-xs font-mono text-red-600 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={this.handleRetry}
                variant="default"
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Reload Page
              </Button>
            </div>

            <p className="text-xs text-gray-600">
              If the problem persists, please refresh the page or contact support.
            </p>
          </CardContent>
        </Card>
      )
    }

    return this.props.children as ReactElement
  }
}

