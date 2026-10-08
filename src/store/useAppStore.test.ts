import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db'
import type { AppBackup, ConversationSession, UserProfile } from '../types'
import { useAppStore } from './useAppStore'

const profile: UserProfile={name:'학습자',goal:'일상 회화',level:'왕초보',dailyGoal:10,interests:['카페'],voiceRate:.9,saveConversationText:true,activeMode:'general',createdAt:'2026-01-01T00:00:00.000Z'}

beforeEach(async()=>{
  await db.open()
  await Promise.all([db.settings.clear(),db.learning.clear(),db.reviews.clear(),db.conversations.clear(),db.dailySessions.clear(),db.activities.clear(),db.weeklyChecks.clear()])
  useAppStore.setState({profile:null,learningRecords:[],reviews:[],conversations:[],dailySessions:[],activities:[],weeklyChecks:[],hydrated:false,storageError:null})
})

describe('IndexedDB 학습 기록',()=>{
  it('온보딩 설정을 저장하고 새 상태로 다시 불러온다',async()=>{await useAppStore.getState().saveProfile(profile);useAppStore.setState({profile:null,hydrated:false});await useAppStore.getState().hydrate();expect(useAppStore.getState().profile).toEqual(profile);expect(useAppStore.getState().hydrated).toBe(true)})
  it('기존 프로필에는 일반 학습 모드를 자동으로 추가한다',async()=>{const legacy={...profile} as Partial<UserProfile>;delete legacy.activeMode;await db.settings.put({key:'profile',value:legacy as UserProfile});await useAppStore.getState().hydrate();expect(useAppStore.getState().profile?.activeMode).toBe('general');expect((await db.settings.get('profile'))?.value.activeMode).toBe('general')})
  it('학습 완료를 중복 없이 저장하고 복습을 등록한다',async()=>{const record={expressionId:'greet-hello',learnedAt:'2026-01-01T00:00:00.000Z',completedSteps:7,quizCorrect:true};await useAppStore.getState().completeLearning(record);await useAppStore.getState().completeLearning({...record,learnedAt:'2026-01-02T00:00:00.000Z'});expect(await db.learning.count()).toBe(1);expect(await db.reviews.count()).toBe(1)})
  it('회화에서 저장한 표현을 같은 복습 목록에 연결한다',async()=>{const session:ConversationSession={id:'session-1',scenarioId:'cafe-order',startedAt:'2026-01-01T00:00:00.000Z',completedAt:'2026-01-01T00:05:00.000Z',currentNodeId:null,completedNodes:['1'],messages:[],savedExpressionIds:['cafe-coffee']};await useAppStore.getState().saveConversation(session);expect(await db.conversations.count()).toBe(1);expect(await db.reviews.get('cafe-coffee')).toBeTruthy()})
  it('JSON 백업 구조를 복원한다',async()=>{const backup:AppBackup={version:1,exportedAt:'2026-01-02T00:00:00.000Z',profile,learningRecords:[],reviews:[],conversations:[]};await useAppStore.getState().importData(backup);expect(useAppStore.getState().profile?.dailyGoal).toBe(10);expect((await db.settings.get('profile'))?.value.goal).toBe('일상 회화')})
  it('Daily 진행 상태를 저장하고 새로고침 때 실행 상태만 정지한다',async()=>{await useAppStore.getState().saveProfile({...profile,dailyGoal:60});const now=new Date(2026,0,4,9,0,0);const session=await useAppStore.getState().ensureTodaySession(now);await useAppStore.getState().startDailyTask(session.id,session.tasks[0].id,now);await useAppStore.getState().tickDailyTask(session.id,new Date(now.getTime()+5000));useAppStore.setState({dailySessions:[],hydrated:false});await useAppStore.getState().hydrate();const restored=useAppStore.getState().dailySessions[0];expect(restored.activeTaskId).toBeNull();expect(restored.tasks[0].accumulatedSeconds).toBe(5)})
  it('목표 시간을 바꿔도 오늘의 누적 진행을 보존한다',async()=>{await useAppStore.getState().saveProfile({...profile,dailyGoal:60});const now=new Date(2026,0,5,9,0,0);const session=await useAppStore.getState().ensureTodaySession(now);await useAppStore.getState().startDailyTask(session.id,session.tasks[0].id,now);await useAppStore.getState().tickDailyTask(session.id,new Date(now.getTime()+5000));await useAppStore.getState().changeDailyGoal(30,new Date(now.getTime()+6000));const updated=useAppStore.getState().dailySessions[0];expect(updated.goalMinutes).toBe(30);expect(updated.tasks.reduce((sum,task)=>sum+task.targetMinutes,0)).toBe(30);expect(updated.tasks[0].accumulatedSeconds).toBe(5)})
  it('v1 백업을 가져와도 기존 기록을 보존하고 새 배열을 초기화한다',async()=>{const backup:AppBackup={version:1,exportedAt:'2026-01-02T00:00:00.000Z',profile,learningRecords:[{expressionId:'greet-hello',learnedAt:'2026-01-01T00:00:00Z',completedSteps:7,quizCorrect:true}],reviews:[],conversations:[]};await useAppStore.getState().importData(backup);expect(useAppStore.getState().learningRecords).toHaveLength(1);expect(useAppStore.getState().dailySessions).toEqual([]);expect(useAppStore.getState().activities).toEqual([])})
})
