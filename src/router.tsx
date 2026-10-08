import { useEffect, useState } from 'react'
import { createHashRouter, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ConversationPage } from './pages/ConversationPage'
import { ConversationSessionPage } from './pages/ConversationSessionPage'
import { HomePage } from './pages/HomePage'
import { LearnPage } from './pages/LearnPage'
import { LearningSessionPage } from './pages/LearningSessionPage'
import { MyPage } from './pages/MyPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { ReviewPage } from './pages/ReviewPage'
import { ToeflPage } from './pages/ToeflPage'
import { useAppStore } from './store/useAppStore'
import { DailyPage } from './pages/DailyPage'
import { LiteracyPage } from './pages/LiteracyPage'
import { SpeakingTrainingPage } from './pages/SpeakingTrainingPage'

function Gate(){const profile=useAppStore(s=>s.profile);const hydrated=useAppStore(s=>s.hydrated);const hydrate=useAppStore(s=>s.hydrate);const location=useLocation();useEffect(()=>{void hydrate()},[hydrate]);if(!hydrated)return <div className="flex min-h-dvh items-center justify-center bg-canvas"><div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-200 border-t-primary"/><span className="sr-only">학습 기록 불러오는 중</span></div>;if(!profile&&location.pathname!=='/onboarding')return <Navigate to="/onboarding" replace/>;if(profile&&location.pathname==='/onboarding')return <Navigate to="/" replace/>;return <Outlet/>}
function UpdateNotice(){const [show,setShow]=useState(false);useEffect(()=>{const listener=()=>setShow(true);window.addEventListener('naro-update-ready',listener);return()=>window.removeEventListener('naro-update-ready',listener)},[]);return show?<button onClick={()=>location.reload()} className="fixed bottom-24 left-1/2 z-50 min-h-12 -translate-x-1/2 rounded-2xl bg-ink px-5 text-sm font-bold text-white shadow-soft">새 버전이 준비됐어요 · 업데이트</button>:null}

export const router=createHashRouter([{element:<><Gate/><UpdateNotice/></>,children:[{path:'/onboarding',element:<OnboardingPage/>},{element:<Layout/>,children:[{index:true,element:<HomePage/>},{path:'daily',element:<DailyPage/>},{path:'daily/literacy',element:<LiteracyPage/>},{path:'speaking',element:<SpeakingTrainingPage/>},{path:'learn',element:<LearnPage/>},{path:'toefl',element:<ToeflPage/>},{path:'learn/session',element:<LearningSessionPage/>},{path:'conversation',element:<ConversationPage/>},{path:'conversation/session',element:<ConversationSessionPage/>},{path:'review',element:<ReviewPage/>},{path:'my',element:<MyPage/>}]}]}])
