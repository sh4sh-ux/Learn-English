import Dexie, { type EntityTable } from 'dexie'
import type { ActivityRecord, ConversationSession, DailySession, LearningRecord, ReviewRecord, SpeechAttempt, UserProfile, WeeklyCheckRecord } from './types'

type SettingRow = { key: string; value: UserProfile }

class NaroDatabase extends Dexie {
  settings!: EntityTable<SettingRow, 'key'>
  learning!: EntityTable<LearningRecord, 'expressionId'>
  reviews!: EntityTable<ReviewRecord, 'expressionId'>
  conversations!: EntityTable<ConversationSession, 'id'>
  dailySessions!: EntityTable<DailySession, 'id'>
  activities!: EntityTable<ActivityRecord, 'id'>
  weeklyChecks!: EntityTable<WeeklyCheckRecord, 'id'>
  speechAttempts!: EntityTable<SpeechAttempt, 'id'>

  constructor() {
    super('naro-learn-english')
    this.version(1).stores({
      settings: '&key',
      learning: '&expressionId, learnedAt, quizCorrect',
      reviews: '&expressionId, nextReviewAt',
      conversations: '&id, scenarioId, startedAt, completedAt'
    })
    this.version(2).stores({
      settings: '&key',
      learning: '&expressionId, learnedAt, quizCorrect',
      reviews: '&expressionId, nextReviewAt',
      conversations: '&id, scenarioId, startedAt, completedAt',
      dailySessions: '&id, localDate, updatedAt',
      activities: '&id, localDate, skill, type, contentId',
      weeklyChecks: '&id, week, completedAt'
    })
    this.version(3).stores({
      settings: '&key',
      learning: '&expressionId, learnedAt, quizCorrect',
      reviews: '&expressionId, nextReviewAt',
      conversations: '&id, scenarioId, startedAt, completedAt',
      dailySessions: '&id, localDate, updatedAt',
      activities: '&id, localDate, skill, type, contentId',
      weeklyChecks: '&id, week, completedAt',
      speechAttempts: '&id, localDate, contentId, recognitionStatus, createdAt'
    })
  }
}

export const db = new NaroDatabase()
