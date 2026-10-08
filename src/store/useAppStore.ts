import { create } from 'zustand'
import { db } from '../db'
import { createReview, masteryStatus, scheduleReview } from '../engine/review'
import { completeTask, createDailySession, pauseTask, restoreSession, startTask, tickTask, toLocalDateKey } from '../engine/daily'
import type { ActivityRecord, ActivityType, AppBackup, ConversationSession, DailyGoal, DailySession, LearningRecord, ReviewGrade, ReviewRecord, UserProfile, WeeklyCheckRecord } from '../types'

type StoreState = {
  profile: UserProfile | null
  learningRecords: LearningRecord[]
  reviews: ReviewRecord[]
  conversations: ConversationSession[]
  dailySessions: DailySession[]
  activities: ActivityRecord[]
  weeklyChecks: WeeklyCheckRecord[]
  hydrated: boolean
  storageError: string | null
  hydrate: () => Promise<void>
  saveProfile: (profile: UserProfile) => Promise<void>
  completeLearning: (record: LearningRecord) => Promise<void>
  saveConversation: (session: ConversationSession) => Promise<void>
  reviewExpression: (expressionId: string, grade: ReviewGrade) => Promise<void>
  exportData: () => AppBackup
  importData: (backup: AppBackup) => Promise<void>
  resetData: () => Promise<void>
  ensureTodaySession: (now?: Date) => Promise<DailySession>
  startDailyTask: (sessionId: string, taskId: string, now?: Date) => Promise<void>
  tickDailyTask: (sessionId: string, now?: Date) => Promise<void>
  pauseDailyTask: (sessionId: string, now?: Date) => Promise<void>
  completeDailyTask: (sessionId: string, taskId: string, now?: Date) => Promise<void>
  logActivity: (record: ActivityRecord) => Promise<void>
  changeDailyGoal: (goal: DailyGoal, now?: Date) => Promise<void>
}

const errorMessage = (error: unknown) => error instanceof Error && (error.name === 'QuotaExceededError' || error.message.toLowerCase().includes('quota'))
  ? '기기 저장 공간이 부족합니다. 백업 후 오래된 데이터를 정리해 주세요.'
  : '학습 기록을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'

const activityTypeByTask:Record<string,ActivityType>={review:'review',foundation:'grammar',shadowing:'listening',conversation:'conversation',literacy:'reading'}

export const useAppStore = create<StoreState>((set, get) => ({
  profile:null, learningRecords:[], reviews:[], conversations:[], dailySessions:[], activities:[], weeklyChecks:[], hydrated:false, storageError:null,
  hydrate: async () => {
    try {
      const [profileRow, learningRecords, reviews, conversations,storedSessions,activities,weeklyChecks] = await Promise.all([
        db.settings.get('profile'), db.learning.toArray(), db.reviews.toArray(), db.conversations.toArray(),db.dailySessions.toArray(),db.activities.toArray(),db.weeklyChecks.toArray()
      ])
      const profile = profileRow?.value ? { ...profileRow.value, activeMode:profileRow.value.activeMode ?? 'general' as const } : null
      if(profileRow?.value && !profileRow.value.activeMode) await db.settings.put({key:'profile',value:profile!})
      const normalizedReviews=reviews.map(review=>({...review,masteryStatus:masteryStatus(review),successfulRecalls:review.successfulRecalls??review.correctCount}))
      if(normalizedReviews.length)await db.reviews.bulkPut(normalizedReviews)
      const dailySessions=storedSessions.map(restoreSession)
      await db.dailySessions.bulkPut(dailySessions)
      set({ profile, learningRecords, reviews:normalizedReviews, conversations, dailySessions,activities,weeklyChecks,hydrated:true, storageError:null })
    } catch (error) { set({ hydrated:true, storageError:errorMessage(error) }) }
  },
  saveProfile: async (profile) => {
    try { await db.settings.put({ key:'profile', value:profile }); set({ profile, storageError:null }) }
    catch (error) { set({ storageError:errorMessage(error) }); throw error }
  },
  completeLearning: async (record) => {
    try {
      const existing = get().reviews.find((item) => item.expressionId === record.expressionId)
      const base = createReview(record.expressionId)
      const review = existing ? scheduleReview(existing,record.quizCorrect?'good':'hard') : {...base,correctCount:record.quizCorrect?1:0,incorrectCount:record.quizCorrect?0:1,easeFactor:record.quizCorrect?base.easeFactor:2.3,masteryStatus:record.quizCorrect?'learning' as const:'review_needed' as const,successfulRecalls:record.quizCorrect?1:0}
      await db.transaction('rw', db.learning, db.reviews, async () => { await db.learning.put(record); await db.reviews.put(review) })
      set((state) => ({ learningRecords:[...state.learningRecords.filter((item) => item.expressionId !== record.expressionId),record], reviews:[...state.reviews.filter((item) => item.expressionId !== review.expressionId),review], storageError:null }))
    } catch (error) { set({ storageError:errorMessage(error) }); throw error }
  },
  saveConversation: async (session) => {
    try {
      const existingReviews = get().reviews
      const newReviews = session.savedExpressionIds.filter((id) => !existingReviews.some((item) => item.expressionId === id)).map((id) => createReview(id))
      await db.transaction('rw', db.conversations, db.reviews, async () => { await db.conversations.put(session); if(newReviews.length) await db.reviews.bulkPut(newReviews) })
      set((state) => ({ conversations:[...state.conversations.filter((item) => item.id !== session.id),session], reviews:[...state.reviews,...newReviews], storageError:null }))
    }
    catch (error) { set({ storageError:errorMessage(error) }); throw error }
  },
  reviewExpression: async (expressionId, grade) => {
    const current = get().reviews.find((item) => item.expressionId === expressionId) ?? createReview(expressionId)
    const updated = scheduleReview(current, grade)
    try { await db.reviews.put(updated); set((state) => ({ reviews:[...state.reviews.filter((item) => item.expressionId !== expressionId),updated], storageError:null })) }
    catch (error) { set({ storageError:errorMessage(error) }); throw error }
  },
  exportData: () => ({ version:2, exportedAt:new Date().toISOString(), profile:get().profile, learningRecords:get().learningRecords, reviews:get().reviews, conversations:get().conversations,dailySessions:get().dailySessions,activities:get().activities,weeklyChecks:get().weeklyChecks }),
  importData: async (backup) => {
    if (![1,2].includes(backup.version) || !Array.isArray(backup.learningRecords) || !Array.isArray(backup.reviews)) throw new Error('지원하지 않는 백업 파일입니다.')
    const dailySessions=(backup.dailySessions??[]).map(restoreSession);const activities=backup.activities??[];const weeklyChecks=backup.weeklyChecks??[]
    await db.transaction('rw', [db.settings, db.learning, db.reviews, db.conversations,db.dailySessions,db.activities,db.weeklyChecks], async () => {
      await Promise.all([db.learning.clear(),db.reviews.clear(),db.conversations.clear(),db.dailySessions.clear(),db.activities.clear(),db.weeklyChecks.clear()])
      if (backup.profile) await db.settings.put({ key:'profile',value:backup.profile }); else await db.settings.delete('profile')
      await db.learning.bulkPut(backup.learningRecords); await db.reviews.bulkPut(backup.reviews); await db.conversations.bulkPut(backup.conversations)
      await db.dailySessions.bulkPut(dailySessions);await db.activities.bulkPut(activities);await db.weeklyChecks.bulkPut(weeklyChecks)
    })
    const profile=backup.profile?{...backup.profile,activeMode:backup.profile.activeMode??'general' as const}:null
    if(profile) await db.settings.put({key:'profile',value:profile})
    set({ profile,learningRecords:backup.learningRecords,reviews:backup.reviews,conversations:backup.conversations,dailySessions,activities,weeklyChecks,storageError:null })
  },
  resetData: async () => {
    await db.transaction('rw', [db.settings, db.learning, db.reviews, db.conversations,db.dailySessions,db.activities,db.weeklyChecks], async () => Promise.all([db.settings.clear(),db.learning.clear(),db.reviews.clear(),db.conversations.clear(),db.dailySessions.clear(),db.activities.clear(),db.weeklyChecks.clear()]))
    set({ profile:null,learningRecords:[],reviews:[],conversations:[],dailySessions:[],activities:[],weeklyChecks:[],storageError:null })
  },
  ensureTodaySession:async(now=new Date())=>{const id=toLocalDateKey(now);const existing=get().dailySessions.find(item=>item.id===id)??await db.dailySessions.get(id);if(existing)return existing;const goal=get().profile?.dailyGoal??60;const session=createDailySession(goal,now);await db.dailySessions.put(session);set(state=>({dailySessions:[...state.dailySessions,session]}));return session},
  startDailyTask:async(sessionId,taskId,now=new Date())=>{const current=get().dailySessions.find(item=>item.id===sessionId);if(!current)return;const updated=startTask(current,taskId,now);await db.dailySessions.put(updated);set(state=>({dailySessions:state.dailySessions.map(item=>item.id===sessionId?updated:item)}))},
  tickDailyTask:async(sessionId,now=new Date())=>{const current=get().dailySessions.find(item=>item.id===sessionId);if(!current)return;const updated=tickTask(current,now);if(updated===current)return;await db.dailySessions.put(updated);set(state=>({dailySessions:state.dailySessions.map(item=>item.id===sessionId?updated:item)}))},
  pauseDailyTask:async(sessionId,now=new Date())=>{const current=get().dailySessions.find(item=>item.id===sessionId);if(!current)return;const updated=pauseTask(current,now);await db.dailySessions.put(updated);set(state=>({dailySessions:state.dailySessions.map(item=>item.id===sessionId?updated:item)}))},
  completeDailyTask:async(sessionId,taskId,now=new Date())=>{const current=get().dailySessions.find(item=>item.id===sessionId);if(!current)return;const previous=current.tasks.find(item=>item.id===taskId);const updated=completeTask(current,taskId,now);const task=updated.tasks.find(item=>item.id===taskId);if(!task)return;const seconds=Math.max(0,task.accumulatedSeconds-(previous?.status==='completed'?task.accumulatedSeconds:0));const records:ActivityRecord[]=previous?.status==='completed'?[]:task.skills.map(skill=>({id:`${sessionId}-${taskId}-${skill}`,localDate:updated.localDate,sessionId,taskId,type:activityTypeByTask[task.kind],skill,durationSeconds:Math.round(seconds/task.skills.length),attempts:1,hintsUsed:0,createdAt:now.toISOString()}));await db.transaction('rw',db.dailySessions,db.activities,async()=>{await db.dailySessions.put(updated);if(records.length)await db.activities.bulkPut(records)});set(state=>({dailySessions:state.dailySessions.map(item=>item.id===sessionId?updated:item),activities:[...state.activities.filter(item=>!records.some(record=>record.id===item.id)),...records]}))},
  logActivity:async(record)=>{await db.activities.put(record);set(state=>({activities:[...state.activities.filter(item=>item.id!==record.id),record]}))},
  changeDailyGoal:async(goal,now=new Date())=>{const profile=get().profile;if(!profile)return;const updatedProfile={...profile,dailyGoal:goal};const id=toLocalDateKey(now);const current=get().dailySessions.find(item=>item.id===id);let updatedSession:DailySession|undefined;if(current){const template=createDailySession(goal,now);updatedSession={...current,goalMinutes:goal,updatedAt:now.toISOString(),tasks:template.tasks.map(next=>{const previous=current.tasks.find(item=>item.kind===next.kind);return previous?{...next,id:previous.id,accumulatedSeconds:previous.accumulatedSeconds,status:previous.status,lastTickAt:previous.lastTickAt}:next})}}await db.transaction('rw',db.settings,db.dailySessions,async()=>{await db.settings.put({key:'profile',value:updatedProfile});if(updatedSession)await db.dailySessions.put(updatedSession)});set(state=>({profile:updatedProfile,dailySessions:updatedSession?state.dailySessions.map(item=>item.id===id?updatedSession!:item):state.dailySessions}))}
}))
