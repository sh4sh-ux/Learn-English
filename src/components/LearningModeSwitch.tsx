import { BookOpen, GraduationCap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import type { LearningMode } from '../types'

export function LearningModeSwitch(){
  const navigate=useNavigate();const profile=useAppStore(s=>s.profile);const saveProfile=useAppStore(s=>s.saveProfile)
  if(!profile)return null
  const change=async(mode:LearningMode)=>{if(mode===profile.activeMode)return;await saveProfile({...profile,activeMode:mode});navigate(mode==='general'?'/learn':'/toefl')}
  return <div role="group" aria-label="학습 모드" className="grid grid-cols-2 rounded-2xl bg-slate-200/70 p-1">
    <button onClick={()=>void change('general')} aria-pressed={profile.activeMode==='general'} className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition ${profile.activeMode==='general'?'bg-white text-primary shadow-sm':'text-muted'}`}><BookOpen size={17}/> 일반 학습</button>
    <button onClick={()=>void change('toefl')} aria-pressed={profile.activeMode==='toefl'} className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition ${profile.activeMode==='toefl'?'bg-white text-primary shadow-sm':'text-muted'}`}><GraduationCap size={17}/> TOEFL 집중</button>
  </div>
}
