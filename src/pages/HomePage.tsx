import { ArrowRight, Flame, Mic2, RotateCcw, Sparkles, Target } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, PageHeader, Progress } from '../components/ui'
import { expressions } from '../data/expressions'
import { isDue } from '../engine/review'
import { useAppStore } from '../store/useAppStore'
import { sessionProgress, sessionSeconds, toLocalDateKey } from '../engine/daily'
import { foundationCurriculum } from '../data/curriculum'

function dayKey(date:Date){return toLocalDateKey(date)}
function streak(dates:string[]){const set=new Set(dates.map(x=>dayKey(new Date(x))));let n=0;const cursor=new Date();while(set.has(dayKey(cursor))){n++;cursor.setDate(cursor.getDate()-1)}return n}

export function HomePage(){
  const profile=useAppStore(s=>s.profile); const learning=useAppStore(s=>s.learningRecords); const reviews=useAppStore(s=>s.reviews); const conversations=useAppStore(s=>s.conversations);const sessions=useAppStore(s=>s.dailySessions);const ensure=useAppStore(s=>s.ensureTodaySession)
  useEffect(()=>{void ensure()},[ensure])
  const due=reviews.filter(item=>isDue(item)).length; const today=dayKey(new Date());const daily=sessions.find(item=>item.id===today);const progress=daily?sessionProgress(daily):0; const current=expressions.find(x=>!learning.some(r=>r.expressionId===x.id)) ?? expressions[0]
  const allDates=[...learning.map(x=>x.learnedAt),...conversations.map(x=>x.startedAt),...sessions.map(x=>x.createdAt)]
  const created=new Date(profile?.createdAt??Date.now());const day=Math.min(90,Math.max(1,Math.floor((new Date().setHours(0,0,0,0)-new Date(created.getFullYear(),created.getMonth(),created.getDate()).getTime())/86_400_000)+1));const week=Math.min(12,Math.ceil(day/7));const plan=foundationCurriculum[week-1]
  return <>
    <PageHeader eyebrow="NARO Learn English" title={`좋은 ${new Date().getHours()<12?'아침':'하루'}이에요 👋`} description={`Foundation ${plan?.cefrTarget??'A0'} · Day ${day}. 오늘의 ${profile?.dailyGoal??60}분을 한 단계씩 시작해요.`}/>
    <div className="space-y-5 px-5 sm:px-8">
      <section className="overflow-hidden rounded-[28px] bg-primary p-6 text-white shadow-soft">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-100"><Sparkles size={17}/> 오늘의 {profile?.dailyGoal??60}분</div><h2 className="mt-5 text-2xl font-bold leading-tight">{daily?.tasks.find(task=>task.status!=='completed')?.title??'오늘 훈련 완료'}</h2><p className="mt-2 text-sm text-blue-100">다음 표현: {current.english}</p>
        <div className="mt-6"><Progress value={progress}/><div className="mt-2 flex justify-between text-xs text-blue-100"><span>실제 활동 {Math.floor((daily?sessionSeconds(daily):0)/60)}분</span><span>목표 {profile?.dailyGoal??60}분</span></div></div>
        <Link to="/daily" className="mt-6 flex min-h-14 items-center justify-between rounded-2xl bg-white px-5 font-bold text-primary transition hover:bg-blue-50"><span>{progress?'Daily 이어하기':'Daily 시작하기'}</span><ArrowRight size={20}/></Link>
      </section>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-line bg-white p-4"><Target className="text-primary" size={20}/><b className="mt-3 block text-xl">{Math.round(progress)}%</b><span className="text-xs text-muted">오늘 진행률</span></div>
        <div className="rounded-2xl border border-line bg-white p-4"><RotateCcw className="text-violet-600" size={20}/><b className="mt-3 block text-xl">{due}</b><span className="text-xs text-muted">복습할 표현</span></div>
        <div className="rounded-2xl border border-line bg-white p-4"><Flame className="text-orange-500" size={20}/><b className="mt-3 block text-xl">{streak(allDates)}</b><span className="text-xs text-muted">연속 학습일</span></div>
      </div>
      <section className="rounded-3xl bg-conversation p-5 text-white"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500"><Mic2/></div><div><p className="text-xs font-bold uppercase tracking-wider text-blue-300">4단계 말하기</p><h2 className="mt-1 text-lg font-bold">듣기에서 내 답변까지</h2><p className="mt-2 text-sm leading-5 text-slate-300">Listen → Repeat → Recall → Respond 결과를 각각 저장합니다.</p></div></div><Link to="/speaking" className="mt-5 block"><Button className="w-full bg-blue-500 hover:bg-blue-600">말하기 훈련 <ArrowRight size={18}/></Button></Link></section>
    </div>
  </>
}
