import { BookOpen, Check, ChevronRight, Clock3, Headphones, MessageCircle, Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, PageHeader, Progress } from '../components/ui'
import { consolidationDays, foundationCurriculum } from '../data/curriculum'
import { sessionProgress, sessionSeconds, toLocalDateKey } from '../engine/daily'
import { useAppStore } from '../store/useAppStore'
import type { DailyTaskKind } from '../types'

const icons:Record<DailyTaskKind,typeof Clock3>={review:RotateCcw,foundation:BookOpen,shadowing:Headphones,conversation:MessageCircle,literacy:BookOpen}
const format=(seconds:number)=>`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`

export function DailyPage(){
  const profile=useAppStore(s=>s.profile)!;const sessions=useAppStore(s=>s.dailySessions);const ensure=useAppStore(s=>s.ensureTodaySession);const start=useAppStore(s=>s.startDailyTask);const pause=useAppStore(s=>s.pauseDailyTask);const complete=useAppStore(s=>s.completeDailyTask)
  const today=toLocalDateKey();const session=sessions.find(item=>item.id===today)
  useEffect(()=>{void ensure()},[ensure,profile.dailyGoal])
  const created=new Date(profile.createdAt);const elapsed=Math.max(0,Math.floor((new Date().setHours(0,0,0,0)-new Date(created.getFullYear(),created.getMonth(),created.getDate()).getTime())/86_400_000));const day=Math.min(90,elapsed+1);const week=Math.min(12,Math.ceil(day/7));const curriculum=foundationCurriculum[week-1];const dayPlan=day>84?consolidationDays[day-85]:curriculum?.days[(day-1)%7]
  if(!session)return <div className="flex min-h-[60dvh] items-center justify-center"><div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-200 border-t-primary"/></div>
  return <><PageHeader eyebrow="PERSONAL TRAINING" title={`Daily ${session.goalMinutes}`} description="목표 시간과 실제 활동 시간은 별도로 기록됩니다. 한 번에 하나씩 집중하세요."/>
    <div className="space-y-6 px-5 sm:px-8">
      <section className="rounded-3xl bg-primary p-6 text-white"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-blue-100">Foundation {curriculum?.cefrTarget??'A0'} · Day {day}</p><h2 className="mt-2 text-2xl font-bold">{dayPlan?.title??'기초 누적 복습'}</h2></div><Clock3/></div><div className="mt-6"><Progress value={sessionProgress(session)}/><div className="mt-2 flex justify-between text-xs text-blue-100"><span>실제 활동 {Math.floor(sessionSeconds(session)/60)}분</span><span>목표 {session.goalMinutes}분</span></div></div></section>
      <div className="space-y-3">{session.tasks.map((task,index)=>{const Icon=icons[task.kind];const active=session.activeTaskId===task.id;return <section key={task.id} className={`rounded-3xl border bg-white p-4 transition ${active?'border-primary shadow-soft':'border-line'}`}><div className="flex items-start gap-4"><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${task.status==='completed'?'bg-green-100 text-green-700':active?'bg-blue-100 text-primary':'bg-slate-100 text-muted'}`}>{task.status==='completed'?<Check/>:<Icon size={20}/>}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><b>{index+1}. {task.title}</b><span className="text-xs font-bold text-muted">{task.targetMinutes}분</span></div><p className="mt-1 text-xs leading-5 text-muted">{task.description}</p><p className="mt-2 text-xs font-bold text-primary">실제 {format(task.accumulatedSeconds)}</p></div></div>{task.status!=='completed'&&<div className="mt-4 flex gap-2">{active?<><Button variant="secondary" className="flex-1" onClick={()=>void pause(session.id)}><Pause size={17}/> 일시정지</Button><Button className="flex-1" onClick={()=>void complete(session.id,task.id)}><Check size={17}/> 완료</Button></>:<Button className="flex-1" onClick={()=>void start(session.id,task.id)}><Play size={17}/> 시작</Button>}<Link to={task.route} className="flex min-h-12 items-center justify-center rounded-2xl border border-line px-4 text-sm font-bold">활동 열기 <ChevronRight size={17}/></Link></div>}</section>})}</div>
      <section className="rounded-3xl border border-line bg-white p-5"><p className="text-xs font-bold text-primary">이번 주 목표 · {curriculum?.title}</p><h2 className="mt-2 text-lg font-bold">{curriculum?.objective}</h2><p className="mt-3 text-sm leading-6 text-muted">주간 점검: {curriculum?.weeklyCheck}</p>{curriculum?.status==='planned'&&<p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">이 주차는 학습 구조만 준비되어 있으며 상세 수업 콘텐츠는 아직 개발 중입니다.</p>}</section>
    </div></>
}
