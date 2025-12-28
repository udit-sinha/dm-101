'use client'

import { AgentFeedbackView } from '@/lib/types/chat'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, HelpCircle, Lightbulb } from 'lucide-react'
import { useState } from 'react'

interface AgentFeedbackProps {
  feedback: AgentFeedbackView
  onSuggestedNext?: (suggestion: string) => void
}

export function AgentFeedback({ feedback, onSuggestedNext }: AgentFeedbackProps) {
  const [expandedSection, setExpandedSection] = useState<'answered' | 'unanswered' | 'suggested' | null>(null)

  const toggleSection = (section: 'answered' | 'unanswered' | 'suggested') => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Feedback</CardTitle>
        {feedback.iterationCount && (
          <CardDescription>Iteration {feedback.iterationCount}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Answered Questions */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('answered')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-sm">Answered Questions</p>
                <p className="text-xs text-gray-600">{feedback.answered.length} items</p>
              </div>
            </div>
            <span className={`text-gray-400 transition-transform ${expandedSection === 'answered' ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {expandedSection === 'answered' && (
            <div className="border-t bg-green-50 p-4 space-y-2">
              {feedback.answered.length > 0 ? (
                feedback.answered.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">No answered questions yet</p>
              )}
            </div>
          )}
        </div>

        {/* Unanswered Questions */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('unanswered')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-orange-600" />
              <div className="text-left">
                <p className="font-medium text-sm">Unanswered Questions</p>
                <p className="text-xs text-gray-600">{feedback.unanswered.length} items</p>
              </div>
            </div>
            <span className={`text-gray-400 transition-transform ${expandedSection === 'unanswered' ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {expandedSection === 'unanswered' && (
            <div className="border-t bg-orange-50 p-4 space-y-2">
              {feedback.unanswered.length > 0 ? (
                feedback.unanswered.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">All questions answered!</p>
              )}
            </div>
          )}
        </div>

        {/* Suggested Next Steps */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('suggested')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-sm">Suggested Next Steps</p>
                <p className="text-xs text-gray-600">{feedback.suggestedNext.length} suggestions</p>
              </div>
            </div>
            <span className={`text-gray-400 transition-transform ${expandedSection === 'suggested' ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {expandedSection === 'suggested' && (
            <div className="border-t bg-blue-50 p-4 space-y-2">
              {feedback.suggestedNext.length > 0 ? (
                feedback.suggestedNext.map((suggestion, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{suggestion}</p>
                      {onSuggestedNext && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 text-xs"
                          onClick={() => onSuggestedNext(suggestion)}
                        >
                          Try This
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">No suggestions at this time</p>
              )}
            </div>
          )}
        </div>

        {/* Reasoning */}
        {feedback.reasoning && (
          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-xs font-medium text-gray-600 mb-2">REASONING</p>
            <p className="text-sm text-gray-700">{feedback.reasoning}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

