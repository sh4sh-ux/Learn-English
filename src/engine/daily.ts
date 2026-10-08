import type { DailyGoal, DailySession, DailyTask, DailyTaskKind, LanguageSkill } from '../types'

export const MAX_TICK_SECONDS = 15

export function toLocalDateKey(date = new Date()): string {
  const year=date.getFullYear();const month=String(date.getMonth()+1).padStart(2,'0');const day=String(date.getDate()).padStart(2,'0')
  return `${year}-${month}-${day}`
}

const templates: Array<{kind:DailyTaskKind;title:string;description:string;weight:number;route:string;skills:LanguageSkill[]}>= [
  {kind:'review',title:'기억 깨우기',description:'오늘 복습할 표현을 힌트 없이 떠올려요.',weight:10,route:'/review',skills:['reading','speaking']},
  {kind:'foundation',title:'단어·문장·문법',description:'오늘의 핵심 표현과 문장 구조를 익혀요.',weight:10,route:'/learn/session',skills:['reading','writing']},
  {kind:'shadowing',title:'듣기·쉐도잉',description:'듣고, 따라 하고, 도움 없이 회상해요.',weight:15,route:'/speaking',skills:['listening','speaking']},
  {kind:'conversation',title:'실전 회화',description:'상황 속 질문에 내 문장으로 답해요.',weight:15,route:'/conversation',skills:['listening','speaking']},
  {kind:'literacy',title:'읽기·쓰기',description:'짧은 글을 이해하고 한 문장으로 정리해요.',weight:10,route:'/daily/literacy',skills:['reading','writing']}
]

function allocateMinutes(goal:number):number[]{
  const exact=templates.map(item=>goal*item.weight/60);const base=exact.map(Math.floor);let remaining=goal-base.reduce((sum,value)=>sum+value,0)
  const order=exact.map((value,index)=>({index,fraction:value-base[index]})).sort((a,b)=>b.fraction-a.fraction)
  for(let i=0;i<remaining;i++)base[order[i%order.length].index]++
  return base
}

export function createDailySession(goalMinutes:DailyGoal=60,now=new Date()):DailySession{
  const localDate=toLocalDateKey(now);const minutes=allocateMinutes(goalMinutes);const iso=now.toISOString()
  const tasks:DailyTask[]=templates.map((item,index)=>({id:`${localDate}-${item.kind}`,kind:item.kind,title:item.title,description:item.description,targetMinutes:minutes[index],accumulatedSeconds:0,status:'not_started',route:item.route,skills:item.skills}))
  return {id:localDate,localDate,goalMinutes,tasks,activeTaskId:null,createdAt:iso,updatedAt:iso}
}

export function startTask(session:DailySession,taskId:string,now=new Date()):DailySession{
  if(!session.tasks.some(task=>task.id===taskId)||session.tasks.find(task=>task.id===taskId)?.status==='completed')return session
  const iso=now.toISOString()
  return {...session,activeTaskId:taskId,updatedAt:iso,tasks:session.tasks.map(task=>task.id===taskId?{...task,status:'active',lastTickAt:iso}:task.status==='active'?{...task,status:'not_started',lastTickAt:undefined}:task)}
}

export function tickTask(session:DailySession,now=new Date()):DailySession{
  if(!session.activeTaskId)return session
  const task=session.tasks.find(item=>item.id===session.activeTaskId);if(!task?.lastTickAt)return session
  const elapsed=Math.max(0,Math.min(MAX_TICK_SECONDS,Math.floor((now.getTime()-new Date(task.lastTickAt).getTime())/1000)))
  if(!elapsed)return session
  const iso=now.toISOString()
  return {...session,updatedAt:iso,tasks:session.tasks.map(item=>item.id===task.id?{...item,accumulatedSeconds:item.accumulatedSeconds+elapsed,lastTickAt:iso}:item)}
}

export function pauseTask(session:DailySession,now=new Date()):DailySession{
  const ticked=tickTask(session,now);const iso=now.toISOString()
  return {...ticked,activeTaskId:null,updatedAt:iso,tasks:ticked.tasks.map(task=>task.status==='active'?{...task,status:'not_started',lastTickAt:undefined}:task)}
}

export function completeTask(session:DailySession,taskId:string,now=new Date()):DailySession{
  const ticked=session.activeTaskId===taskId?tickTask(session,now):session;const iso=now.toISOString()
  const tasks=ticked.tasks.map(task=>task.id===taskId?{...task,status:'completed' as const,lastTickAt:undefined}:task)
  const allComplete=tasks.every(task=>task.status==='completed')
  return {...ticked,tasks,activeTaskId:ticked.activeTaskId===taskId?null:ticked.activeTaskId,updatedAt:iso,completedAt:allComplete?iso:ticked.completedAt}
}

export function restoreSession(session:DailySession):DailySession{
  return {...session,activeTaskId:null,tasks:session.tasks.map(task=>task.status==='active'?{...task,status:'not_started',lastTickAt:undefined}:task)}
}

export function sessionSeconds(session:DailySession):number{return session.tasks.reduce((sum,task)=>sum+task.accumulatedSeconds,0)}
export function sessionProgress(session:DailySession):number{return Math.min(100,sessionSeconds(session)/(session.goalMinutes*60)*100)}
