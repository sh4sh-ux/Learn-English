import { BookOpen, Home, MessageCircle, RotateCcw, UserRound } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/useAppStore'

const items = [
  { to:'/', label:'홈', icon:Home }, { to:'/learn',label:'학습',icon:BookOpen }, { to:'/conversation',label:'회화',icon:MessageCircle },
  { to:'/review',label:'복습',icon:RotateCcw }, { to:'/my',label:'MY',icon:UserRound }
]

export function Layout() {
  const { pathname } = useLocation()
  const storageError = useAppStore((state) => state.storageError)
  const activeMode = useAppStore((state) => state.profile?.activeMode ?? 'general')
  const sessions = useAppStore((state) => state.dailySessions)
  const tick = useAppStore((state) => state.tickDailyTask)
  const pause = useAppStore((state) => state.pauseDailyTask)
  const lastActivity = useRef(Date.now())
  const activeSession=sessions.find(session=>session.activeTaskId)
  useEffect(()=>{const touch=()=>{lastActivity.current=Date.now()};const events=['pointerdown','keydown','touchstart','scroll'] as const;events.forEach(event=>window.addEventListener(event,touch,{passive:true}));const timer=window.setInterval(()=>{if(!activeSession)return;if(document.hidden||Date.now()-lastActivity.current>45_000)void pause(activeSession.id);else void tick(activeSession.id)},5_000);const visibility=()=>{if(document.hidden&&activeSession)void pause(activeSession.id)};document.addEventListener('visibilitychange',visibility);return()=>{window.clearInterval(timer);events.forEach(event=>window.removeEventListener(event,touch));document.removeEventListener('visibilitychange',visibility)}},[activeSession,pause,tick])
  const immersive = pathname.startsWith('/learn/session') || pathname.startsWith('/conversation/session') || pathname.startsWith('/daily/literacy') || pathname.startsWith('/speaking')
  return <div className="min-h-dvh bg-canvas text-ink">
    {storageError && <div role="alert" className="fixed inset-x-3 top-[max(12px,env(safe-area-inset-top))] z-50 rounded-2xl bg-red-600 px-4 py-3 text-sm text-white shadow-soft">{storageError}</div>}
    <main className={immersive ? '' : 'mx-auto min-h-dvh max-w-5xl pb-[calc(88px+env(safe-area-inset-bottom))]'}><Outlet /></main>
    {!immersive && <nav aria-label="주요 메뉴" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-xl items-center justify-around px-2">{items.map(({to,label,icon:Icon}) => {
        const target=to==='/learn'&&activeMode==='toefl'?'/toefl':to
        return <NavLink key={to} to={target} end={to === '/'} className={({isActive}) => `flex min-h-14 min-w-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold transition ${isActive?'text-primary':'text-muted hover:text-ink'}`}>
          <Icon size={22} strokeWidth={2.2}/><span>{label}</span>
        </NavLink>})}</div>
    </nav>}
  </div>
}
