import {
  ChatStreamEvent,
  ProgressStep,
  ArtifactSummary,
  AgentFeedbackView,
  GoalView,
} from '@/lib/types/chat'

/**
 * Mock event generator for development and testing
 * Yields realistic SSE events in sequence
 */
export function* mockStreamEvents(): Generator<ChatStreamEvent> {
  const now = Date.now()

  // 1. Init event
  yield {
    type: 'init',
    timestamp: now,
    data: {
      runId: 'run-123-mock',
      conversationId: 1,
      initialSteps: [
        {
          id: 'planning',
          title: 'Planning',
          status: 'pending',
          details: 'Analyzing query and planning approach',
        },
        {
          id: 'research',
          title: 'Research',
          status: 'pending',
          details: 'Gathering relevant information',
        },
        {
          id: 'analysis',
          title: 'Analysis',
          status: 'pending',
          details: 'Analyzing findings',
        },
        {
          id: 'synthesis',
          title: 'Synthesis',
          status: 'pending',
          details: 'Synthesizing results',
        },
      ],
    },
  }

  // 2. Step start - Planning
  yield {
    type: 'step_start',
    timestamp: now + 100,
    data: {
      stepId: 'planning',
      status: 'in-progress',
      details: 'Breaking down the query into sub-goals',
    },
  }

  // 3. Thinking event
  yield {
    type: 'thinking',
    timestamp: now + 200,
    data: {
      agentName: 'PlanningAgent',
      content: 'The user is asking about data quality. I should check for missing values, duplicates, and data type issues.',
    },
  }

  // 4. Step complete - Planning
  yield {
    type: 'step_complete',
    timestamp: now + 500,
    data: {
      stepId: 'planning',
      status: 'completed',
      details: 'Created 3 sub-goals for analysis',
    },
  }

  // 5. Step start - Research
  yield {
    type: 'step_start',
    timestamp: now + 600,
    data: {
      stepId: 'research',
      status: 'in-progress',
      details: 'Scanning dataset for quality issues',
    },
  }

  // 6. Artifact event - Data Quality Report
  yield {
    type: 'artifact',
    timestamp: now + 1000,
    data: {
      artifact: {
        kind: 'data-quality',
        title: 'Data Quality Report',
        preview: 'Found 5 issues in dataset: 2 missing values, 1 duplicate row, 2 type mismatches',
        data: {
          summary: 'Data quality analysis complete',
          markdown: '# Data Quality Report\n\n## Issues Found\n- 2 missing values in age column\n- 1 duplicate row\n- 2 type mismatches',
          issuesFound: 5,
          columnsAnalyzed: 12,
        },
        createdAt: now + 1000,
      },
    },
  }

  // 7. Step complete - Research
  yield {
    type: 'step_complete',
    timestamp: now + 1500,
    data: {
      stepId: 'research',
      status: 'completed',
      details: 'Data quality assessment complete',
    },
  }

  // 8. Step start - Analysis
  yield {
    type: 'step_start',
    timestamp: now + 1600,
    data: {
      stepId: 'analysis',
      status: 'in-progress',
      details: 'Analyzing root causes',
    },
  }

  // 9. Token events (simulating streaming text)
  const tokens = ['The', ' dataset', ' has', ' several', ' quality', ' issues', ' that', ' need', ' attention', '.']
  for (let i = 0; i < tokens.length; i++) {
    yield {
      type: 'token',
      timestamp: now + 1700 + i * 50,
      data: {
        token: tokens[i],
        isFinal: i === tokens.length - 1,
      },
    }
  }

  // 10. Step complete - Analysis
  yield {
    type: 'step_complete',
    timestamp: now + 2500,
    data: {
      stepId: 'analysis',
      status: 'completed',
      details: 'Analysis complete',
    },
  }

  // 11. Step start - Synthesis
  yield {
    type: 'step_start',
    timestamp: now + 2600,
    data: {
      stepId: 'synthesis',
      status: 'in-progress',
      details: 'Preparing final recommendations',
    },
  }

  // 12. Feedback event
  yield {
    type: 'feedback',
    timestamp: now + 3000,
    data: {
      feedback: {
        answered: ['What are the quality issues?', 'How many issues were found?'],
        unanswered: ['What is the root cause?'],
        suggestedNext: ['Would you like to see the data cleaning script?', 'Should we investigate the duplicate row?'],
        iterationCount: 1,
      },
    },
  }

  // 13. Step complete - Synthesis
  yield {
    type: 'step_complete',
    timestamp: now + 3500,
    data: {
      stepId: 'synthesis',
      status: 'completed',
      details: 'All steps completed',
    },
  }

  // 14. Done event
  yield {
    type: 'done',
    timestamp: now + 3600,
    data: {
      finalMessage: 'Analysis complete. Found 5 quality issues in your dataset.',
      artifacts: [
        {
          kind: 'data-quality',
          title: 'Data Quality Report',
          preview: 'Found 5 issues in dataset',
          data: {
            summary: 'Data quality analysis complete',
            markdown: '# Data Quality Report\n\n## Issues Found\n- 2 missing values\n- 1 duplicate row\n- 2 type mismatches',
            issuesFound: 5,
            columnsAnalyzed: 12,
          },
          createdAt: now + 1000,
        },
      ],
      feedback: {
        answered: ['What are the quality issues?'],
        unanswered: [],
        suggestedNext: ['View cleaning recommendations'],
      },
      nextSteps: ['Review the data quality report', 'Apply recommended fixes'],
    },
  }
}

/**
 * Helper to consume mock events with delay
 * Useful for testing and development
 */
export async function consumeMockEvents(
  onEvent: (event: ChatStreamEvent) => void,
  delayMs: number = 100
): Promise<void> {
  const generator = mockStreamEvents()

  for (const event of generator) {
    onEvent(event)
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }
}

