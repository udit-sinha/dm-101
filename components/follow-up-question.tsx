"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

interface FollowUpQuestionProps {
  question: string
  onClick: (question: string) => void
}

export function FollowUpQuestion({ question, onClick }: FollowUpQuestionProps) {
  return (
    <Button
      variant="outline"
      className="h-auto justify-start px-3 py-2 text-left text-sm font-normal"
      onClick={() => onClick(question)}
    >
      <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
      <span className="line-clamp-1">{question}</span>
    </Button>
  )
}

