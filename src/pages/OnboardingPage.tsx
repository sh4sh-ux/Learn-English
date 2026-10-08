import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, Progress } from '../components/ui'
import { useAppStore } from '../store/useAppStore'
import type { DailyGoal, Goal, Level } from '../types'

const goals: Goal[]=['여행','일상 회화','업무','자기계발']
const levels: Level[]=['왕초보','초급','초중급','중급']
const interests=['인사','자기소개','일상','카페','식당','쇼핑','호텔','공항','교통','길 묻기','비즈니스']
const times: DailyGoal[]=[15,30,45,60,90]

export function OnboardingPage(){
  const navigate=useNavigate(); const saveProfile=useAppStore((s)=>s.saveProfile)
  const [step,setStep]=useState(0); const [goal,setGoal]=useState<Goal>('일상 회화'); const [level,setLevel]=useState<Level>('왕초보'); const [dailyGoal,setDailyGoal]=useState<DailyGoal>(60); const [selected,setSelected]=useState<string[]>(['일상','카페'])
  const [saving,setSaving]=useState(false)
  const next=async()=>{ if(step<3){setStep(step+1);return} setSaving(true); await saveProfile({name:'학습자',goal,level,dailyGoal,interests:selected,voiceRate:0.9,saveConversationText:true,activeMode:'general',createdAt:new Date().toISOString()}); navigate('/') }
  const options=step===0?goals:step===1?levels:step===2?times:interests
  const title=['영어로 무엇을 하고 싶나요?','현재 나와 가장 가까운 수준은?','하루에 얼마나 학습할까요?','관심 있는 상황을 골라주세요'][step]
  const description=['목표에 맞는 표현을 먼저 추천해 드려요.','시험 점수가 아니라 스스로 느끼는 수준이에요.','짧아도 매일 이어가는 것이 중요해요.','여러 개 선택할 수 있어요. 나중에도 바꿀 수 있습니다.'][step]
  return <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-white px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(28px,env(safe-area-inset-top))]">
    <div className="mb-10 flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white"><Sparkles size={20}/></div><span className="text-sm font-bold text-primary">NARO</span></div>
    <Progress value={(step+1)*25} label={`${step+1} / 4`}/>
    <div className="mt-10"><h1 className="text-3xl font-bold leading-tight tracking-tight">{title}</h1><p className="mt-3 text-sm leading-6 text-muted">{description}</p></div>
    <div className={`mt-8 grid gap-3 ${step===3?'grid-cols-2':''}`}>{options.map((raw)=>{const value=String(raw); const isSelected=step===0?goal===raw:step===1?level===raw:step===2?dailyGoal===raw:selected.includes(value); return <button key={value} onClick={()=>{if(step===0)setGoal(raw as Goal);else if(step===1)setLevel(raw as Level);else if(step===2)setDailyGoal(raw as DailyGoal);else setSelected(isSelected?selected.filter(x=>x!==value):[...selected,value])}} className={`flex min-h-14 items-center justify-between rounded-2xl border px-4 text-left text-sm font-bold transition ${isSelected?'border-primary bg-blue-50 text-primary':'border-line bg-white hover:bg-slate-50'}`}><span>{step===2?`${value}분`:value}</span>{isSelected&&<Check size={18}/>}</button>})}</div>
    <div className="mt-auto flex gap-3 pt-10">{step>0&&<Button variant="secondary" aria-label="이전" onClick={()=>setStep(step-1)}><ArrowLeft size={18}/></Button>}<Button className="flex-1" disabled={(step===3&&!selected.length)||saving} onClick={next}>{step===3?'학습 시작하기':'다음'}<ArrowRight size={18}/></Button></div>
    <p className="mt-4 text-center text-[11px] leading-5 text-muted">학습 데이터는 이 기기의 브라우저에만 저장되며 자동으로 다른 기기와 동기화되지 않습니다.</p>
  </div>
}
