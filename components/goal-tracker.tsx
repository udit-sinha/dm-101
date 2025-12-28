'use client'

import { GoalView } from '@/lib/types/chat'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react'

interface GoalTrackerProps {
  goal: GoalView
}

const statusIcons = {
  pending: <Clock className="w-4 h-4 text-gray-400" />,
  in_progress: <Zap className="w-4 h-4 text-blue-500" />,
  completed: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  failed: <AlertCircle className="w-4 h-4 text-red-500" />,
}

const statusColors = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
}

export function GoalTracker({ goal }: GoalTrackerProps) {
  const totalGoals = goal.subGoals.length
  const completionPercentage = totalGoals > 0 ? (goal.completedCount / totalGoals) * 100 : 0
  const currentGoal = goal.subGoals[goal.currentIndex]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Goal Progress</CardTitle>
            <CardDescription>
              {goal.completedCount} of {totalGoals} sub-goals completed
            </CardDescription>
          </div>
          <Badge variant={goal.status === 'completed' ? 'default' : 'secondary'}>
            {goal.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-gray-600">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Current Goal Highlight */}
        {currentGoal && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-1">Current Goal</p>
            <p className="text-sm text-blue-800">{currentGoal.description}</p>
            <p className="text-xs text-blue-600 mt-2">Assigned to: {currentGoal.assignedAgent}</p>
          </div>
        )}

        {/* Sub-Goals List */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Sub-Goals</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {goal.subGoals.map((subGoal, index) => (
              <div
                key={subGoal.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  index === goal.currentIndex
                    ? 'bg-blue-50 border-blue-200'
                    : subGoal.status === 'completed'
                      ? 'bg-green-50 border-green-200'
                      : subGoal.status === 'failed'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="mt-1">{statusIcons[subGoal.status]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{subGoal.description}</p>
                    <span className="text-xs text-gray-500">#{subGoal.sequence}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Agent: {subGoal.assignedAgent}</p>
                  {subGoal.resultPreview && (
                    <p className="text-xs text-gray-700 mt-2 line-clamp-2">{subGoal.resultPreview}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      statusColors[subGoal.status]
                    }`}
                  >
                    {subGoal.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{goal.completedCount}</p>
            <p className="text-xs text-gray-600">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{totalGoals - goal.completedCount - goal.failedCount}</p>
            <p className="text-xs text-gray-600">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{goal.failedCount}</p>
            <p className="text-xs text-gray-600">Failed</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

