export type Level = '왕초보' | '초급' | '초중급' | '중급'
export type Goal = '여행' | '일상 회화' | '업무' | '자기계발'
export type DailyGoal = 5 | 10 | 15 | 20 | 30 | 45 | 60 | 90
export type CEFRLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
export type LanguageSkill = 'reading' | 'listening' | 'speaking' | 'writing'
export type LearningMode = 'general' | 'toefl'
export type ContentKind = 'expression' | 'conversation' | 'reading' | 'listening' | 'speaking' | 'writing' | 'exam-practice'
export type DailyTaskKind = 'review' | 'foundation' | 'shadowing' | 'conversation' | 'literacy'
export type TaskStatus = 'not_started' | 'active' | 'completed'
export type ActivityType = 'review' | 'vocabulary' | 'grammar' | 'listening' | 'speaking_repeat' | 'speaking_recall' | 'speaking_respond' | 'reading' | 'writing' | 'conversation' | 'weekly_check'
export type MasteryStatus = 'new' | 'learning' | 'review_needed' | 'provisional_mastery' | 'long_term_confirmed'

export interface UserProfile {
  name: string
  goal: Goal
  level: Level
  dailyGoal: DailyGoal
  interests: string[]
  voiceRate: number
  saveConversationText: boolean
  activeMode: LearningMode
  createdAt: string
}

export interface Expression {
  id: string
  english: string
  korean: string
  example: string
  exampleKorean: string
  level: Level
  category: string
  tags: string[]
  practiceSentence: string
  scenarioId: string
  cefrLevel: CEFRLevel
  skills: LanguageSkill[]
}

export interface LearningPathStage {
  id: string
  cefrRange: CEFRLevel[]
  title: string
  description: string
  mode: LearningMode
  skills: LanguageSkill[]
  status: 'available' | 'planned'
  outcomes: string[]
  grammarFocus: string[]
  expressionGoals: string[]
  taskSummary: Record<LanguageSkill,string>
  reviewPolicy: string
  exitAssessment: string
}

export interface CurriculumDay {
  day: number
  title: string
  objective: string
  expressionIds: string[]
  listeningTask: string
  speakingTask: string
  readingTask: string
  writingTask: string
}

export interface CurriculumWeek {
  week: number
  cefrTarget: CEFRLevel
  title: string
  objective: string
  grammar: string[]
  expressions: string[]
  reviewFocus: string
  weeklyCheck: string
  status: 'available' | 'planned'
  days: CurriculumDay[]
}

export interface DailyTask {
  id: string
  kind: DailyTaskKind
  title: string
  description: string
  targetMinutes: number
  accumulatedSeconds: number
  status: TaskStatus
  contentId?: string
  route: string
  skills: LanguageSkill[]
  lastTickAt?: string
}

export interface DailySession {
  id: string
  localDate: string
  goalMinutes: number
  tasks: DailyTask[]
  activeTaskId: string | null
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface ActivityRecord {
  id: string
  localDate: string
  sessionId?: string
  taskId?: string
  contentId?: string
  type: ActivityType
  skill: LanguageSkill
  durationSeconds: number
  attempts: number
  correct?: boolean
  hintsUsed: number
  createdAt: string
}

export interface WeeklyCheckRecord {
  id: string
  week: number
  completedAt: string
  answersCorrect: number
  answersTotal: number
  notes?: string
}

export interface UnifiedContentRef {
  id: string
  kind: ContentKind
  mode: LearningMode
  cefrLevel: CEFRLevel
  skills: LanguageSkill[]
  source: 'naro-original'
  reviewable: boolean
}

export type ReviewGrade = 'hard' | 'good' | 'easy'
export interface ReviewRecord {
  expressionId: string
  firstLearnedAt: string
  lastReviewedAt: string
  nextReviewAt: string
  reviewCount: number
  correctCount: number
  incorrectCount: number
  difficulty: ReviewGrade
  interval: number
  easeFactor: number
  masteryStatus?: MasteryStatus
  successfulRecalls?: number
}

export interface LearningRecord {
  expressionId: string
  learnedAt: string
  completedSteps: number
  quizCorrect: boolean
  mode?: LearningMode
  skillsPracticed?: LanguageSkill[]
}

export interface IntentPattern {
  intent: string
  patterns: string[]
  requiredSlots?: Record<string, string[]>
}

export interface ConversationTransition {
  intent: string
  nextNodeId: string | null
  feedback: string
  naturalAlternative?: string
  politeAlternative?: string
  saveExpressionId?: string
}

export interface ConversationNode {
  id: string
  tutorEnglish: string
  tutorKorean: string
  acceptedIntents: IntentPattern[]
  hints: string[]
  suggestedAnswers: string[]
  transitions: ConversationTransition[]
  fallbackNodeId?: string
}

export interface ConversationScenario {
  id: string
  category: string
  level: Level
  title: string
  description: string
  startNodeId: string
  nodes: ConversationNode[]
}

export interface ConversationMessage {
  role: 'tutor' | 'user'
  english: string
  korean?: string
}

export interface ConversationSession {
  id: string
  scenarioId: string
  startedAt: string
  completedAt?: string
  currentNodeId: string | null
  completedNodes: string[]
  messages: ConversationMessage[]
  savedExpressionIds: string[]
}

export interface ConversationFeedback {
  status: 'matched' | 'uncertain'
  recognizedText: string
  matchedIntent: string | null
  message: string
  naturalAlternative?: string
  politeAlternative?: string
  nextNodeId: string | null
  saveExpressionId?: string
}

export interface AppBackup {
  version: 1 | 2
  exportedAt: string
  profile: UserProfile | null
  learningRecords: LearningRecord[]
  reviews: ReviewRecord[]
  conversations: ConversationSession[]
  dailySessions?: DailySession[]
  activities?: ActivityRecord[]
  weeklyChecks?: WeeklyCheckRecord[]
}

export interface ConversationEngine {
  startSession(scenario: ConversationScenario): ConversationSession
  sendMessage(session: ConversationSession, scenario: ConversationScenario, message: string): { session: ConversationSession; feedback: ConversationFeedback }
  getFeedback(session: ConversationSession): string
  endSession(session: ConversationSession): ConversationSession
}
