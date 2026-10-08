import type { ActivityRecord, LanguageSkill } from '../types'

export interface SkillInsight { skill:LanguageSkill; activities:number; seconds:number; accuracy:number|null; retries:number; hints:number; priority:number }

export function analyzeSkills(records:ActivityRecord[]):SkillInsight[]{
  const skills:LanguageSkill[]=['listening','speaking','reading','writing']
  return skills.map(skill=>{const items=records.filter(item=>item.skill===skill);const graded=items.filter(item=>typeof item.correct==='boolean');const correct=graded.filter(item=>item.correct).length;const accuracy=graded.length?correct/graded.length:null;const retries=items.reduce((sum,item)=>sum+Math.max(0,item.attempts-1),0);const hints=items.reduce((sum,item)=>sum+item.hintsUsed,0);const seconds=items.reduce((sum,item)=>sum+item.durationSeconds,0);const priority=(accuracy===null ? .5 : 1-accuracy)*50+Math.min(25,retries*5)+Math.min(15,hints*3)+(items.length===0?10:0);return{skill,activities:items.length,seconds,accuracy,retries,hints,priority}}).sort((a,b)=>b.priority-a.priority)
}

export function recommendTomorrow(records:ActivityRecord[]):{focus:LanguageSkill;message:string}{
  const insight=analyzeSkills(records)[0]
  const reason=insight.activities===0?'아직 수행 기록이 없어요.':insight.accuracy!==null&&insight.accuracy<.7?'정답률과 회상 결과를 더 안정시킬 필요가 있어요.':insight.retries+insight.hints>1?'재시도와 힌트 사용이 상대적으로 많았어요.':'네 영역의 균형을 위해 다음 순서로 연습해요.'
  return {focus:insight.skill,message:reason}
}
