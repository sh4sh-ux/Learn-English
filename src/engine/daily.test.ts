import { describe, expect, it } from 'vitest'
import { completeTask, createDailySession, MAX_TICK_SECONDS, restoreSession, sessionProgress, startTask, tickTask, toLocalDateKey } from './daily'

describe('Daily 활동 세션',()=>{
  const now=new Date(2026,0,15,9,0,0)
  it('60분을 10/10/15/15/10 활동으로 구성한다',()=>{const session=createDailySession(60,now);expect(session.tasks.map(task=>task.targetMinutes)).toEqual([10,10,15,15,10]);expect(session.tasks.reduce((sum,task)=>sum+task.targetMinutes,0)).toBe(60)})
  it.each([15,30,45,60,90] as const)('%i분 목표의 합계를 정확히 유지한다',(goal)=>expect(createDailySession(goal,now).tasks.reduce((sum,task)=>sum+task.targetMinutes,0)).toBe(goal))
  it('새 활동 시작 시 이전 활동의 중복 실행을 막는다',()=>{let session=createDailySession(60,now);session=startTask(session,session.tasks[0].id,now);session=startTask(session,session.tasks[1].id,new Date(now.getTime()+1000));expect(session.tasks.filter(task=>task.status==='active')).toHaveLength(1);expect(session.activeTaskId).toBe(session.tasks[1].id)})
  it('오랜 공백은 한 번의 최대 틱까지만 기록한다',()=>{let session=createDailySession(60,now);session=startTask(session,session.tasks[0].id,now);session=tickTask(session,new Date(now.getTime()+5*60_000));expect(session.tasks[0].accumulatedSeconds).toBe(MAX_TICK_SECONDS)})
  it('새로고침 복원 시 활동을 정지하고 누적 시간은 보존한다',()=>{let session=createDailySession(60,now);session=startTask(session,session.tasks[0].id,now);session=tickTask(session,new Date(now.getTime()+5000));const restored=restoreSession(session);expect(restored.activeTaskId).toBeNull();expect(restored.tasks[0].status).toBe('not_started');expect(restored.tasks[0].accumulatedSeconds).toBe(5)})
  it('완료 상태와 실제 시간 진행률을 구분한다',()=>{let session=createDailySession(60,now);session=startTask(session,session.tasks[0].id,now);session=tickTask(session,new Date(now.getTime()+10_000));session=completeTask(session,session.tasks[0].id,new Date(now.getTime()+10_000));expect(session.tasks[0].status).toBe('completed');expect(sessionProgress(session)).toBeCloseTo(10/3600*100)})
  it('날짜 키는 UTC가 아닌 로컬 달력 날짜를 사용한다',()=>expect(toLocalDateKey(new Date(2026,6,9,23,59))).toBe('2026-07-09'))
})
