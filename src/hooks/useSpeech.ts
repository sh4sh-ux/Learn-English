import { useCallback, useEffect, useRef, useState } from 'react'
import { collectRecognitionResults } from '../engine/speechRecognition'

type RecognitionCtor = new () => {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onstart: (() => void) | null
  onresult: ((event: { results: ArrayLike<{ isFinal?:boolean; 0?: { transcript?: string } }> }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition?: RecognitionCtor
    webkitSpeechRecognition?: RecognitionCtor
  }
}

export function useSpeechSynthesis(rate: number) {
  const [speaking,setSpeaking] = useState(false)
  const [voices,setVoices] = useState<SpeechSynthesisVoice[]>([])
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!supported) return
    const load = () => setVoices(window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith('en')))
    load(); window.speechSynthesis.addEventListener('voiceschanged',load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged',load)
  },[supported])

  const speak = useCallback((text: string) => {
    if (!supported) return false
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'; utterance.rate = rate; utterance.voice = voices[0] ?? null
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
    return true
  },[rate,supported,voices])
  const stop = useCallback(() => { if (supported) window.speechSynthesis.cancel(); setSpeaking(false) },[supported])
  return { supported,speaking,voices,speak,stop }
}

export type SpeechRecognitionStatus = 'idle'|'starting'|'listening'|'stopping'|'processing'|'complete'|'error'

const recognitionError=(code:string)=>code==='not-allowed'||code==='service-not-allowed'
  ? '마이크 권한이 거부되었습니다. Safari 설정에서 권한을 허용하거나 텍스트 입력을 이용해 주세요.'
  : code==='no-speech'
    ? '음성이 감지되지 않았어요. 다시 말하거나 직접 입력해 주세요.'
    : code==='network'
      ? '음성 인식 서비스 응답이 지연되고 있어요. 네트워크를 확인하거나 직접 입력해 주세요.'
      : '음성을 인식하지 못했어요. 다시 시도하거나 텍스트로 입력해 주세요.'

export function useSpeechRecognition(onResult: (text: string) => void,{timeoutMs=15000,stopGraceMs=1500}:{timeoutMs?:number;stopGraceMs?:number}={}) {
  const [status,setStatus] = useState<SpeechRecognitionStatus>('idle')
  const [error,setError] = useState<string | null>(null)
  const [interimTranscript,setInterimTranscript]=useState('')
  const [finalTranscript,setFinalTranscript]=useState('')
  const [timedOut,setTimedOut]=useState(false)
  const [lastEvent,setLastEvent]=useState('idle')
  const [startedAt,setStartedAt]=useState<string|null>(null)
  const [endedAt,setEndedAt]=useState<string|null>(null)
  const recognitionRef=useRef<InstanceType<RecognitionCtor>|null>(null)
  const timeoutRef=useRef<ReturnType<typeof setTimeout>|null>(null)
  const abortRef=useRef<ReturnType<typeof setTimeout>|null>(null)
  const retryRef=useRef<ReturnType<typeof setTimeout>|null>(null)
  const cancelledRef=useRef(false)
  const Ctor = typeof window !== 'undefined' ? window.SpeechRecognition ?? window.webkitSpeechRecognition : undefined
  const supported = Boolean(Ctor)

  const clearTimers=useCallback(()=>{if(timeoutRef.current)clearTimeout(timeoutRef.current);if(abortRef.current)clearTimeout(abortRef.current);if(retryRef.current)clearTimeout(retryRef.current);timeoutRef.current=null;abortRef.current=null;retryRef.current=null},[])
  const abortCurrent=useCallback(()=>{clearTimers();const current=recognitionRef.current;recognitionRef.current=null;if(current){current.onend=null;current.onerror=null;current.onresult=null;try{current.abort()}catch{/* already ended */}}},[clearTimers])

  const cancel=useCallback(()=>{cancelledRef.current=true;abortCurrent();setStatus('idle');setError(null);setTimedOut(false);setInterimTranscript('');setFinalTranscript('');setLastEvent('cancel');setEndedAt(new Date().toISOString())},[abortCurrent])

  const stop=useCallback(()=>{
    const current=recognitionRef.current;if(!current)return
    setStatus('stopping');setLastEvent('stop-requested')
    try{current.stop();setStatus('processing')}catch{try{current.abort()}catch{/* already ended */}recognitionRef.current=null;setStatus('complete');setEndedAt(new Date().toISOString())}
    abortRef.current=setTimeout(()=>{if(recognitionRef.current===current){setLastEvent('stop-fallback-abort');try{current.abort()}catch{/* already ended */}recognitionRef.current=null;if(timeoutRef.current)clearTimeout(timeoutRef.current);timeoutRef.current=null;setStatus('complete');setEndedAt(new Date().toISOString())}},stopGraceMs)
  },[stopGraceMs])

  const start = useCallback(() => {
    if (!Ctor) { setError('이 브라우저에서는 음성 인식을 지원하지 않습니다. 텍스트 입력을 이용해 주세요.'); return }
    abortCurrent();cancelledRef.current=false
    const recognition = new Ctor()
    let latestFinal='';let latestInterim='';let failed=false
    recognitionRef.current=recognition
    recognition.lang='en-US'; recognition.interimResults=true; recognition.continuous=false
    recognition.onstart=()=>{setStatus('listening');setLastEvent('start')}
    recognition.onresult=(event) => {
      const result=collectRecognitionResults(event.results);latestFinal=result.finalTranscript;latestInterim=result.interimTranscript
      setFinalTranscript(latestFinal);setInterimTranscript(latestInterim);setLastEvent(latestFinal?'final-result':'interim-result')
      if(latestFinal)onResult(latestFinal)
    }
    recognition.onerror=(event) => {
      if(cancelledRef.current||event.error==='aborted')return
      failed=true;clearTimers();recognitionRef.current=null;setStatus('error');setError(recognitionError(event.error));setLastEvent(`error:${event.error}`);setEndedAt(new Date().toISOString())
    }
    recognition.onend=()=>{
      clearTimers();recognitionRef.current=null;setEndedAt(new Date().toISOString())
      if(cancelledRef.current||failed)return
      setStatus(latestFinal||latestInterim?'complete':'idle');setLastEvent(latestFinal?'end-with-final':latestInterim?'end-with-interim':'end-empty')
    }
    const now=new Date().toISOString();setError(null);setTimedOut(false);setInterimTranscript('');setFinalTranscript('');setStatus('starting');setLastEvent('starting');setStartedAt(now);setEndedAt(null)
    timeoutRef.current=setTimeout(()=>{if(recognitionRef.current!==recognition)return;failed=true;setTimedOut(true);setError('인식 결과가 늦어지고 있어요. 다시 시도하거나 현재 내용을 직접 수정해 주세요.');setStatus('error');setLastEvent('timeout');setEndedAt(new Date().toISOString());try{recognition.abort()}catch{/* already ended */}recognitionRef.current=null},timeoutMs)
    try { recognition.start() } catch { clearTimers();recognitionRef.current=null;setStatus('error');setError('음성 인식을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.');setLastEvent('start-error') }
  },[Ctor,abortCurrent,clearTimers,onResult,timeoutMs])

  const retry=useCallback(()=>{cancel();retryRef.current=setTimeout(start,80)},[cancel,start])
  useEffect(()=>{const leave=()=>abortCurrent();window.addEventListener('pagehide',leave);return()=>{window.removeEventListener('pagehide',leave);abortCurrent()}},[abortCurrent])
  const listening=status==='starting'||status==='listening'||status==='stopping'||status==='processing'
  return { supported,listening,status,error,interimTranscript,finalTranscript,timedOut,start,stop,cancel,retry,clearError:()=>setError(null),debug:{status,lastEvent,startedAt,endedAt,timeoutMs,supported,userAgent:typeof navigator==='undefined'?'':navigator.userAgent} }
}
