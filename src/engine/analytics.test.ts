import { describe, expect, it } from 'vitest'
import { analyzeSkills, recommendTomorrow } from './analytics'
import type { ActivityRecord } from '../types'

const record=(skill:ActivityRecord['skill'],correct:boolean,attempts=1,hintsUsed=0):ActivityRecord=>({id:crypto.randomUUID(),localDate:'2026-01-01',type:skill==='listening'?'listening':skill==='speaking'?'speaking_recall':skill,skill,durationSeconds:60,attempts,correct,hintsUsed,createdAt:'2026-01-01T00:00:00Z'})

describe('4영역 활동 분석',()=>{
  it('영역별 기록과 정답률을 섞지 않는다',()=>{const result=analyzeSkills([record('listening',true),record('listening',false),record('writing',true)]);expect(result.find(x=>x.skill==='listening')?.accuracy).toBe(.5);expect(result.find(x=>x.skill==='writing')?.accuracy).toBe(1)})
  it('반복 실패와 힌트가 많은 영역을 다음 연습으로 추천한다',()=>{const records=[record('speaking',false,3,2),record('reading',true),record('writing',true),record('listening',true)];expect(recommendTomorrow(records).focus).toBe('speaking')})
})
