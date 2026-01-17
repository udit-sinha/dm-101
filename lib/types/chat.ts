// =============================================================================
// PROGRESS & STATUS TYPES
// =============================================================================

export type ProgressStatus = "pending" | "in-progress" | "completed" | "error"

export interface ProgressStep {
    id: string
    title: string
    status: ProgressStatus
    details?: string
    documents?: string[]
    startedAt?: number
    completedAt?: number
}

// =============================================================================
// ARTIFACT TYPES
// =============================================================================

export type ArtifactKind =
    | "analytics"
    | "research"
    | "data-quality"
    | "entity-resolution"
    | "goal-plan"

export interface Source {
    title: string
    url?: string
    snippet?: string
    score?: number
}

export interface ResolvedEntity {
    input: string
    matched: string[]
    confidence: number
}

export interface AnalyticsArtifactData {
    answer: string
    details: string
    code?: string
    datasetsUsed?: string[]
    rowCount?: number
    executionTimeMs?: number
    sourceMetadata?: SourceMetadata[]  // NEW: Source attribution for artifact panel
}

export interface ResearchArtifactData {
    answer: string
    sources: Source[]
}

export interface DataQualityArtifactData {
    summary: string
    markdown: string
    generatedCode?: string
    artifactId?: number
    issuesFound: number
    columnsAnalyzed: number
}

export interface EntityResolutionArtifactData {
    query: string
    resolvedEntities: ResolvedEntity[]
}

export interface GoalPlanArtifactData {
    originalQuery: string
    isSimple: boolean
    subGoals: SubGoalView[]
}

export type ArtifactData =
    | AnalyticsArtifactData
    | ResearchArtifactData
    | DataQualityArtifactData
    | EntityResolutionArtifactData
    | GoalPlanArtifactData

export interface ArtifactSummary {
    kind: ArtifactKind
    title: string
    preview: string
    data: ArtifactData
    createdAt: number
}

// =============================================================================
// BLOCK-LEVEL FEEDBACK TYPES
// =============================================================================

export interface BlockComment {
    blockId: string           // Unique identifier for the block (e.g., "block-1")
    blockPath: string         // Path like "research.paragraph.2" or "analytics.table.1"
    blockContent: string      // The actual content of the block (for context)
    comment: string           // User's feedback comment
    timestamp: number
}

export interface ArtifactFeedback {
    artifactId?: string           // Unique ID of the artifact (createdAt timestamp)
    artifactKind: ArtifactKind
    artifactTitle: string
    blockComments: BlockComment[]   // Section-specific feedback
    generalComment?: string          // Overall feedback (optional)
    timestamp: number
}

// =============================================================================
// FEEDBACK & GOAL TYPES
// =============================================================================

export interface AgentFeedbackView {
    answered: string[]
    unanswered: string[]
    suggestedNext: string[]
    iterationCount?: number
    reasoning?: string
}

export type GoalStatusType = "pending" | "in_progress" | "completed" | "failed"

export interface SubGoalView {
    id: string
    description: string
    assignedAgent: string
    status: GoalStatusType
    sequence: number
    resultPreview?: string
}

export interface GoalView {
    status: GoalStatusType
    isSimple: boolean
    currentIndex: number
    subGoals: SubGoalView[]
    completedCount: number
    failedCount: number
}

// =============================================================================
// STREAMING EVENT TYPES
// =============================================================================

export type ChatStreamEventType =
    | "init"
    | "step_start"
    | "step_complete"
    | "step_error"
    | "thinking"
    | "token"
    | "artifact"
    | "goal_update"
    | "feedback"
    | "done"
    | "error"

export interface ChatStreamEvent {
    type: ChatStreamEventType
    timestamp: number
    data: ChatStreamEventData
}

// =============================================================================
// EVENT DATA PAYLOADS
// =============================================================================

export interface InitEventData {
    runId: string
    conversationId: number
    initialSteps: ProgressStep[]
}

export interface StepEventData {
    stepId: string
    title?: string
    status: ProgressStatus
    details?: string
    documents?: string[]
}

export interface ThinkingEventData {
    agentName: string
    content: string
    subItems?: string[]
}

// Thinking item for the thinking stream
export interface ThinkingItem {
    id: string
    content: string
    agentName: string
    timestamp: number
    subItems?: string[]
}

// Response mode determines how to display the response
export enum ResponseMode {
    conversational = "conversational",
    deep_research = "deep_research",
    data_quality = "data_quality",
    analytics = "analytics",
    error = "error",
}

// NEW: Source metadata for data provenance
export interface SourceMetadata {
    table: string
    sourceFile?: string
    columnsUsed: string[]
    rowCount: number
    queryFilter?: string
}

export interface TokenEventData {
    token: string
    isFinal: boolean
}

export interface ArtifactEventData {
    artifact: ArtifactSummary
}

export interface GoalUpdateEventData {
    goal: GoalView
}

export interface FeedbackEventData {
    feedback: AgentFeedbackView
}

export interface DoneEventData {
    finalMessage: string
    artifacts: ArtifactSummary[]
    feedback?: AgentFeedbackView
    goals?: GoalView
    nextSteps?: string[]
    responseMode?: ResponseMode
}

export interface ErrorEventData {
    code: string
    message: string
    recoverable: boolean
    retryAfterMs?: number
}

export type ChatStreamEventData =
    | InitEventData
    | StepEventData
    | ThinkingEventData
    | TokenEventData
    | ArtifactEventData
    | GoalUpdateEventData
    | FeedbackEventData
    | DoneEventData
    | ErrorEventData

// =============================================================================
// CHAT MESSAGE TYPE
// =============================================================================

export interface ChatMessage {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
    conversationId?: number

    // Streaming state (assistant messages only)
    isStreaming: boolean

    // Mode-aware rendering
    mode: ResponseMode

    // Thinking stream (shows agent's reasoning)
    thinking: ThinkingItem[]
    thinkingCollapsed: boolean

    // Artifacts
    artifacts: ArtifactSummary[]

    // Error state
    error?: {
        code: string
        message: string
        recoverable: boolean
    }

    // Legacy support
    progress?: ProgressStep[]
    feedback?: AgentFeedbackView
    goals?: GoalView
    suggestions?: string[]

    // NEW: Source metadata for data provenance
    sourceMetadata?: SourceMetadata[]
}

// =============================================================================
// HOOK STATE TYPES
// =============================================================================

export interface ChatStreamState {
    messages: ChatMessage[]
    conversationId: number | null
    isConnected: boolean
    isLoading: boolean
    error: string | null
}

export type ChatStreamAction =
    | { type: "SEND_MESSAGE"; message: ChatMessage }
    | { type: "EVENT_RECEIVED"; event: ChatStreamEvent }
    | { type: "CONNECTION_OPENED" }
    | { type: "CONNECTION_CLOSED" }
    | { type: "CONNECTION_ERROR"; error: string }
    | { type: "RESET" }
    | { type: "LOAD_SESSION"; conversationId: number; messages: ChatMessage[] }

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

export interface ChatStartRequest {
    message: string
    mode: "research" | "analytics"
    conversationId?: number
    context?: string[]  // Additional file paths
}

export interface ChatStartResponse {
    runId: string
    streamUrl: string
}

// =============================================================================
// TYPE GUARD HELPERS
// =============================================================================

export function isInitEvent(event: ChatStreamEvent): event is ChatStreamEvent & { data: InitEventData } {
    return event.type === 'init'
}

export function isStepEvent(event: ChatStreamEvent): event is ChatStreamEvent & { data: StepEventData } {
    return ['step_start', 'step_complete', 'step_error'].includes(event.type)
}

export function isDoneEvent(event: ChatStreamEvent): event is ChatStreamEvent & { data: DoneEventData } {
    return event.type === 'done'
}

export function isErrorEvent(event: ChatStreamEvent): event is ChatStreamEvent & { data: ErrorEventData } {
    return event.type === 'error'
}

