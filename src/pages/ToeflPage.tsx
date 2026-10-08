import { BarChart3, BookOpen, Check, Construction, Headphones, Mic2, PenLine, ShieldCheck } from 'lucide-react'
import { LearningModeSwitch } from '../components/LearningModeSwitch'
import { PageHeader, Progress } from '../components/ui'
import { learningPath, skillLabels } from '../data/learningPath'
import { useAppStore } from '../store/useAppStore'
import type { LanguageSkill } from '../types'

const skillMeta:Record<LanguageSkill,{icon:typeof BookOpen;color:string}>={
  reading:{icon:BookOpen,color:'bg-blue-100 text-blue-700'},listening:{icon:Headphones,color:'bg-violet-100 text-violet-700'},speaking:{icon:Mic2,color:'bg-emerald-100 text-emerald-700'},writing:{icon:PenLine,color:'bg-orange-100 text-orange-700'}
}

export function ToeflPage(){
  const learning=useAppStore(s=>s.learningRecords);const reviews=useAppStore(s=>s.reviews);const conversations=useAppStore(s=>s.conversations);const stage=learningPath.find(x=>x.id==='advanced-c1')!
  return <><PageHeader eyebrow="ACADEMIC PATH" title="TOEFL 집중 모드" description="기초 학습 기록과 단어장, 복습 일정을 그대로 이어받는 B2–C1 학술 영어 경로입니다."/>
    <div className="space-y-6 px-5 sm:px-8"><LearningModeSwitch/>
      <section className="overflow-hidden rounded-3xl bg-conversation p-6 text-white"><div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500"><Construction/></div><div><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-blue-200">확장 구조 준비 완료</span><h2 className="mt-4 text-2xl font-bold">학술 영어 기반부터 차근차근</h2><p className="mt-3 text-sm leading-6 text-slate-300">현재는 시험 문제나 점수를 제공하지 않습니다. 공식 ETS 자료로 형식과 채점 기준을 검증한 자체 제작 콘텐츠만 단계적으로 추가합니다.</p></div></div></section>
      <section><div className="mb-3 flex items-end justify-between"><div><p className="text-xs font-bold text-primary">{stage.cefrRange.join('–')}</p><h2 className="mt-1 text-xl font-bold">4영역 학습 구조</h2></div><span className="text-xs font-bold text-muted">콘텐츠 준비 중</span></div><div className="grid grid-cols-2 gap-3">{stage.skills.map(skill=>{const meta=skillMeta[skill];const Icon=meta.icon;return <div key={skill} className="rounded-2xl border border-line bg-white p-4"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.color}`}><Icon size={20}/></div><b className="mt-4 block">{skillLabels[skill]}</b><p className="mt-1 text-xs leading-5 text-muted">학술 {skillLabels[skill]} 및 시험 유형별 연습</p><div className="mt-3"><Progress value={0}/></div></div>})}</div></section>
      <section className="rounded-3xl border border-line bg-white p-5"><div className="flex items-center gap-3"><BarChart3 className="text-primary"/><h2 className="text-lg font-bold">통합 학습 기록</h2></div><div className="mt-5 grid grid-cols-3 gap-3 text-center"><div><b className="text-xl">{learning.length}</b><p className="mt-1 text-xs text-muted">완료 학습</p></div><div><b className="text-xl">{reviews.length}</b><p className="mt-1 text-xs text-muted">통합 단어장</p></div><div><b className="text-xl">{conversations.length}</b><p className="mt-1 text-xs text-muted">회화 기록</p></div></div><div className="mt-5 flex gap-2 rounded-2xl bg-green-50 p-4 text-xs leading-5 text-green-800"><Check size={17} className="shrink-0"/>일반 학습과 TOEFL 모드가 동일한 IndexedDB 기록과 복습 엔진을 사용합니다.</div></section>
      <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-xs leading-5 text-amber-900"><ShieldCheck size={18} className="shrink-0"/><p>연습 분석은 실제 완료 기록만 사용합니다. 공식 TOEFL 점수로 오인될 수 있는 추정 점수는 표시하지 않습니다. 시험 형식과 콘텐츠는 공개 전 최신 ETS 공식 기준과 저작권을 다시 검증합니다.</p></div>
    </div></>
}
