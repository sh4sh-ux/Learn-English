import { BookOpen, CheckCircle2, ChevronRight, Clock3, Headphones } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader, Progress } from '../components/ui'
import { LearningModeSwitch } from '../components/LearningModeSwitch'
import { expressions } from '../data/expressions'
import { useAppStore } from '../store/useAppStore'

export function LearnPage(){
  const records=useAppStore(s=>s.learningRecords); const completed=new Set(records.map(r=>r.expressionId)); const first=expressions.find(x=>!completed.has(x.id))??expressions[0]
  const categories=[...new Set(expressions.map(x=>x.category))]
  return <><PageHeader eyebrow="LEARN" title="오늘의 학습" description="듣고, 말하고, 문장을 만들며 표현을 내 것으로 만드세요."/>
    <div className="space-y-6 px-5 sm:px-8">
      <LearningModeSwitch/>
      <Link to={`/learn/session?id=${first.id}`} className="block rounded-3xl border border-line bg-white p-5 shadow-soft transition hover:-translate-y-0.5">
        <div className="flex items-center justify-between"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-primary">다음 표현 · {first.category}</span><ChevronRight className="text-muted"/></div><h2 className="mt-5 text-2xl font-bold">{first.english}</h2><p className="mt-2 text-muted">{first.korean}</p><div className="mt-6"><Progress value={completed.size/expressions.length*100} label={`${completed.size} / ${expressions.length} 표현`}/></div>
      </Link>
      <div className="grid grid-cols-3 gap-3"><div className="rounded-2xl bg-white p-4 text-center"><Headphones className="mx-auto text-primary"/><b className="mt-2 block">듣기</b><span className="text-xs text-muted">자연스러운 속도</span></div><div className="rounded-2xl bg-white p-4 text-center"><BookOpen className="mx-auto text-violet-600"/><b className="mt-2 block">문장</b><span className="text-xs text-muted">맥락으로 기억</span></div><div className="rounded-2xl bg-white p-4 text-center"><Clock3 className="mx-auto text-orange-500"/><b className="mt-2 block">복습</b><span className="text-xs text-muted">자동 일정</span></div></div>
      <section><h2 className="mb-3 text-lg font-bold">카테고리별 표현</h2><div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">{categories.map(category=>{const list=expressions.filter(x=>x.category===category);const done=list.filter(x=>completed.has(x.id)).length;return <div key={category} className="flex items-center gap-4 p-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold">{done===list.length?<CheckCircle2 className="text-green-600"/>:category.slice(0,1)}</div><div className="flex-1"><b>{category}</b><p className="text-xs text-muted">{done}/{list.length} 완료</p></div><Progress value={done/list.length*100}/></div>})}</div></section>
    </div></>
}
