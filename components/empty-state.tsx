"use client"
import { PromptForm } from "./prompt-form"

interface EmptyStateProps {
  onSubmit: (data: { message: string; mode: "fast" | "research"; context: any[] }) => void
}

export function EmptyState({ onSubmit }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 w-full">
      <div className="max-w-3xl w-full space-y-6 -mt-20">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-medium tracking-tight text-balance">Research Assistant</h1>
          <p className="text-sm text-muted-foreground">Generate insights from your data</p>
        </div>

        <PromptForm onSubmit={onSubmit} />
      </div>
    </div>
  )
}
