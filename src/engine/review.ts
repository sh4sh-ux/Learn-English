import type { MasteryStatus, ReviewGrade, ReviewRecord } from '../types'

function addLocalDays(now:Date,days:number):Date{return new Date(now.getFullYear(),now.getMonth(),now.getDate()+days,12,0,0,0)}
function dayNumber(date:Date):number{return date.getFullYear()*10_000+(date.getMonth()+1)*100+date.getDate()}

export function masteryStatus(record:ReviewRecord):MasteryStatus{
  if(record.masteryStatus)return record.masteryStatus
  if(record.reviewCount===0)return 'new'
  if(record.difficulty==='hard')return 'review_needed'
  if(record.correctCount>=5&&record.interval>=30)return 'long_term_confirmed'
  if(record.correctCount>=3&&record.interval>=14)return 'provisional_mastery'
  return 'learning'
}

export function createReview(expressionId: string, now = new Date()): ReviewRecord {
  const iso = now.toISOString()
  return {
    expressionId,
    firstLearnedAt: iso,
    lastReviewedAt: iso,
    nextReviewAt: addLocalDays(now,1).toISOString(),
    reviewCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    difficulty: 'good',
    interval: 1,
    easeFactor: 2.5,
    masteryStatus:'new',
    successfulRecalls:0
  }
}

export function scheduleReview(record: ReviewRecord, grade: ReviewGrade, now = new Date()): ReviewRecord {
  const isCorrect = grade !== 'hard'
  const nextEase = Math.max(1.3, record.easeFactor + (grade === 'easy' ? 0.15 : grade === 'hard' ? -0.2 : 0))
  let interval: number
  if (grade === 'hard') interval = 1
  else if (record.reviewCount === 0) interval = grade === 'easy' ? 4 : 2
  else if (record.reviewCount === 1) interval = grade === 'easy' ? 8 : 5
  else interval = Math.max(1, Math.round(record.interval * nextEase * (grade === 'easy' ? 1.3 : 1)))

  return {
    ...record,
    lastReviewedAt: now.toISOString(),
    nextReviewAt: addLocalDays(now,interval).toISOString(),
    reviewCount: record.reviewCount + 1,
    correctCount: record.correctCount + (isCorrect ? 1 : 0),
    incorrectCount: record.incorrectCount + (isCorrect ? 0 : 1),
    difficulty: grade,
    interval,
    easeFactor: nextEase,
    successfulRecalls:(record.successfulRecalls??record.correctCount)+(isCorrect?1:0),
    masteryStatus:grade==='hard'?'review_needed':record.correctCount+(isCorrect?1:0)>=5&&interval>=30?'long_term_confirmed':record.correctCount+(isCorrect?1:0)>=3&&interval>=14?'provisional_mastery':'learning'
  }
}

export function isDue(record: ReviewRecord, now = new Date()): boolean {
  return dayNumber(new Date(record.nextReviewAt)) <= dayNumber(now)
}
