import { describe, expect, it } from 'vitest'
import { createReview, isDue, scheduleReview } from './review'

describe('간격 반복 일정', () => {
  const now=new Date('2026-01-01T00:00:00.000Z')
  it('새 표현을 로컬 날짜 기준 다음 날 복습하도록 등록한다',()=>{const record=createReview('hello',now);expect(record.interval).toBe(1);expect(new Date(record.nextReviewAt).getDate()).toBe(2);expect(record.masteryStatus).toBe('new')})
  it('어려움은 1일 뒤로 재설정하고 오답을 기록한다',()=>{const result=scheduleReview(createReview('hello',now),'hard',now);expect(result.interval).toBe(1);expect(result.incorrectCount).toBe(1);expect(result.easeFactor).toBe(2.3)})
  it('보통과 쉬움은 기억 상태에 따라 간격을 늘린다',()=>{const base=createReview('hello',now);const good=scheduleReview(base,'good',now);const easy=scheduleReview(base,'easy',now);expect(good.interval).toBe(2);expect(easy.interval).toBe(4);expect(easy.nextReviewAt>good.nextReviewAt).toBe(true)})
  it('현재 시각을 기준으로 복습 대상을 판별한다',()=>{const record=createReview('hello',now);expect(isDue(record,new Date('2026-01-01T23:59:59Z'))).toBe(false);expect(isDue(record,new Date('2026-01-02T00:00:00Z'))).toBe(true)})
  it('학습 완료와 장기 숙달 상태를 구분한다',()=>{let record=createReview('hello',now);expect(record.masteryStatus).toBe('new');for(let i=0;i<5;i++)record=scheduleReview({...record,interval:i===4?15:record.interval},'easy',new Date(2026,0,2+i));expect(['provisional_mastery','long_term_confirmed']).toContain(record.masteryStatus)})
})
