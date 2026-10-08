import { useCallback, useEffect, useRef } from 'react'

export function useActiveSeconds(idleAfterMs=45_000){
  const seconds=useRef(0);const lastActivity=useRef(Date.now())
  useEffect(()=>{const touch=()=>{lastActivity.current=Date.now()};const events=['pointerdown','keydown','touchstart','input'] as const;events.forEach(event=>window.addEventListener(event,touch,{passive:true}));const timer=window.setInterval(()=>{if(!document.hidden&&Date.now()-lastActivity.current<=idleAfterMs)seconds.current+=1},1000);return()=>{window.clearInterval(timer);events.forEach(event=>window.removeEventListener(event,touch))}},[idleAfterMs])
  return useCallback(()=>{const value=seconds.current;seconds.current=0;lastActivity.current=Date.now();return value},[])
}
