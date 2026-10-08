import { useCallback, useEffect, useState } from 'react'

type RecognitionCtor = new () => {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null
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

export function useSpeechRecognition(onResult: (text: string) => void) {
  const [listening,setListening] = useState(false)
  const [error,setError] = useState<string | null>(null)
  const Ctor = typeof window !== 'undefined' ? window.SpeechRecognition ?? window.webkitSpeechRecognition : undefined
  const supported = Boolean(Ctor)

  const start = useCallback(() => {
    if (!Ctor) { setError('이 브라우저에서는 음성 인식을 지원하지 않습니다. 텍스트 입력을 이용해 주세요.'); return }
    const recognition = new Ctor()
    recognition.lang='en-US'; recognition.interimResults=false; recognition.continuous=false
    recognition.onresult=(event) => { const text=event.results[0]?.[0]?.transcript; if(text) onResult(text) }
    recognition.onerror=(event) => setError(event.error === 'not-allowed' ? '마이크 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용하거나 텍스트 입력을 이용해 주세요.' : '음성을 인식하지 못했어요. 다시 시도하거나 텍스트로 입력해 주세요.')
    recognition.onend=() => setListening(false)
    setError(null); setListening(true)
    try { recognition.start() } catch { setListening(false); setError('음성 인식을 시작하지 못했어요. 다시 시도해 주세요.') }
  },[Ctor,onResult])
  return { supported,listening,error,start,clearError:()=>setError(null) }
}
