import { ArrowRight, MessageCircle, ShieldCheck, Volume2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui'
import { scenarios } from '../data/scenarios'
import { useAppStore } from '../store/useAppStore'

export function ConversationPage(){
  const history=useAppStore(s=>s.conversations)
  return <><PageHeader eyebrow="SPEAK" title="상황별 회화" description="생성형 AI가 아닌 검증된 시나리오와 규칙 기반 분석으로, 추가 비용 없이 연습합니다."/>
    <div className="px-5 sm:px-8"><div className="mb-6 flex gap-3 overflow-x-auto pb-2 scrollbar-none"><span className="whitespace-nowrap rounded-full bg-conversation px-4 py-2 text-xs font-bold text-white">전체 {scenarios.length}</span>{[...new Set(scenarios.map(x=>x.level))].map(level=><span key={level} className="whitespace-nowrap rounded-full border border-line bg-white px-4 py-2 text-xs font-bold text-muted">{level}</span>)}</div>
      <div className="grid gap-4 md:grid-cols-2">{scenarios.map((scenario,index)=>{const attempts=history.filter(x=>x.scenarioId===scenario.id).length;return <Link key={scenario.id} to={`/conversation/session?id=${scenario.id}`} className="group rounded-3xl border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-soft"><div className="flex items-start justify-between"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${index%3===0?'bg-blue-100 text-blue-700':index%3===1?'bg-violet-100 text-violet-700':'bg-emerald-100 text-emerald-700'}`}><MessageCircle/></div><ArrowRight className="text-muted transition group-hover:translate-x-1"/></div><p className="mt-5 text-xs font-bold text-primary">{scenario.category} · {scenario.level}</p><h2 className="mt-1 text-lg font-bold">{scenario.title}</h2><p className="mt-2 text-sm leading-6 text-muted">{scenario.description}</p><div className="mt-4 flex gap-4 text-xs text-muted"><span className="flex items-center gap-1"><Volume2 size={14}/> {scenario.nodes.length}턴</span>{attempts>0&&<span>{attempts}회 연습</span>}</div></Link>})}</div>
      <div className="mt-6 flex items-start gap-3 rounded-2xl bg-slate-100 p-4 text-xs leading-5 text-muted"><ShieldCheck className="mt-0.5 shrink-0 text-primary" size={18}/><p>답변은 기기의 IndexedDB에만 저장됩니다. MY에서 대화문 저장을 끄거나 언제든 삭제할 수 있습니다. 기기 변경 시 자동 동기화되지 않습니다.</p></div>
    </div></>
}
