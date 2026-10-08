import { ArrowLeft, ArrowRight, Check, Eye, Headphones, Mic2, RotateCcw, Square, Volume1, Volume2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Progress } from '../components/ui'
import { expressions } from '../data/expressions'
import { speakingTrainingSteps } from '../data/speaking'
import { normalize } from '../engine/conversation'
import { toLocalDateKey } from '../engine/daily'
import { suggestProperNounAliases } from '../engine/speechRecognition'
import { useActiveSeconds } from '../hooks/useActiveSeconds'
import { useSpeechRecognition, useSpeechSynthesis } from '../hooks/useSpeech'
import { useAppStore } from '../store/useAppStore'
import type { ActivityType, SpeechAttempt } from '../types'

export function SpeakingTrainingPage(){
  const navigate=useNavigate();const profile=useAppStore(s=>s.profile);const learning=useAppStore(s=>s.learningRecords);const log=useAppStore(s=>s.logActivity);const saveSpeechAttempt=useAppStore(s=>s.saveSpeechAttempt);const sessions=useAppStore(s=>s.dailySessions);const complete=useAppStore(s=>s.completeDailyTask)
  const expression=expressions.find(item=>!learning.some(record=>record.expressionId===item.id))??expressions[0]
  const [step,setStep]=useState(0);const [input,setInput]=useState('');const [rawTranscript,setRawTranscript]=useState('');const [aliasEntryId,setAliasEntryId]=useState<string|undefined>();const [attempts,setAttempts]=useState(1);const [hint,setHint]=useState(false);const [selfCorrect,setSelfCorrect]=useState<boolean|null>(null);const [showDebug,setShowDebug]=useState(false)
  const trainingId=useRef(crypto.randomUUID());const readActiveSeconds=useActiveSeconds();const speech=useSpeechSynthesis(profile?.voiceRate??.9);const slowSpeech=useSpeechSynthesis(Math.min(profile?.voiceRate??.9,.7))
  const recognition=useSpeechRecognition(text=>{const suggestion=suggestProperNounAliases(text,profile?.properNouns??[]);setRawTranscript(text);setInput(suggestion.text);setAliasEntryId(suggestion.entryId);setAttempts(value=>value+1)})
  const today=toLocalDateKey();const daily=sessions.find(item=>item.id===today);const dailyTask=daily?.tasks.find(item=>item.kind==='shadowing')
  const record=async(type:ActivityType,correct?:boolean)=>{await log({id:`${trainingId.current}-${type}`,localDate:today,sessionId:daily?.id,taskId:dailyTask?.id,contentId:expression.id,type,skill:type==='listening'?'listening':'speaking',durationSeconds:readActiveSeconds(),attempts,hintsUsed:hint?1:0,correct,createdAt:new Date().toISOString()})}
  const saveAttempt=async(status?:SpeechAttempt['recognitionStatus'])=>{if(step===0)return;const corrected=input.trim();const raw=rawTranscript.trim();if(!corrected&&!raw&&status!=='cancelled'&&status!=='timeout'&&status!=='error')return;await saveSpeechAttempt({id:crypto.randomUUID(),localDate:today,contentId:expression.id,step:step+1,source:raw?'speech':'text',rawTranscript:raw,correctedTranscript:corrected,aliasEntryId,userEdited:Boolean(raw&&normalize(raw)!==normalize(corrected)),recognitionStatus:status??(raw?'final':recognition.interimTranscript?'interim-only':'text'),createdAt:new Date().toISOString()})}
  const clearCapture=()=>{recognition.cancel();setInput('');setRawTranscript('');setAliasEntryId(undefined)}
  const cancelCapture=()=>{void saveAttempt('cancelled');clearCapture()}
  const retryCapture=()=>{setInput('');setRawTranscript('');setAliasEntryId(undefined);recognition.retry()}
  const next=async()=>{
    recognition.stop();await saveAttempt(recognition.timedOut?'timeout':undefined)
    if(step===0)await record('listening')
    if(step===1)await record('speaking_repeat',selfCorrect??undefined)
    if(step===2){const target=new Set(normalize(expression.english).split(' ').filter(x=>x.length>2));const answer=new Set(normalize(input).split(' '));const contentCorrect=[...target].filter(x=>answer.has(x)).length>=Math.max(1,Math.ceil(target.size*.6));await record('speaking_recall',rawTranscript?undefined:contentCorrect)}
    if(step===3){await record('speaking_respond');if(daily&&dailyTask)await complete(daily.id,dailyTask.id);recognition.cancel();return navigate('/daily')}
    setStep(value=>value+1);clearCapture();setAttempts(1);setHint(false);setSelfCorrect(null)
  }
  const leave=()=>{recognition.cancel();navigate('/daily')}
  const capture=<section className="mt-5 space-y-3" aria-label="음성 인식">
    <div className="grid grid-cols-2 gap-3">
      {!recognition.listening&&<Button variant={!input?'primary':'secondary'} disabled={!recognition.supported} onClick={recognition.start}><Mic2 size={18}/> 마이크 시작</Button>}
      {recognition.listening&&<Button onClick={recognition.stop}><Square size={17}/> 말하기 완료</Button>}
      {recognition.listening&&<Button variant="secondary" onClick={cancelCapture}><X size={18}/> 취소</Button>}
      {!recognition.listening&&(rawTranscript||recognition.error)&&<Button variant="secondary" onClick={retryCapture}><RotateCcw size={18}/> 다시 말하기</Button>}
    </div>
    {!recognition.supported&&<p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">이 브라우저는 음성 인식을 지원하지 않습니다. 아래 입력란에 직접 입력해도 같은 학습 흐름을 완료할 수 있습니다.</p>}
    {recognition.listening&&<div className="rounded-2xl border border-blue-200 bg-blue-50 p-4" aria-live="polite"><p className="text-xs font-bold text-primary">중간 인식 · 듣는 중</p><p className="mt-2 min-h-6 text-sm text-blue-950">{recognition.interimTranscript||'말씀해 주세요…'}</p><p className="mt-2 text-xs text-blue-700">발화를 마쳤다면 ‘말하기 완료’를 눌러 결과를 요청하세요.</p></div>}
    {!recognition.listening&&!rawTranscript&&recognition.interimTranscript&&<div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold text-amber-900">중간 결과 · 최종 결과 미수신</p><p className="mt-2 text-sm text-amber-950">{recognition.interimTranscript}</p><Button variant="secondary" className="mt-3" onClick={()=>setInput(recognition.interimTranscript)}>수정 초안으로 사용</Button></div>}
    {rawTranscript&&<div className="rounded-2xl bg-canvas p-4"><p className="text-xs font-bold text-muted">최종 음성 인식 결과</p><p className="mt-2 text-sm text-ink">{rawTranscript}</p></div>}
    {aliasEntryId&&<p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">내 고유명사 사전의 별칭과 일치해 수정 후보를 적용했습니다. 아래 문장을 직접 확인해 주세요.</p>}
    <label className="block"><span className="text-xs font-bold text-muted">확인·수정할 문장</span><textarea value={input} onChange={event=>setInput(event.target.value)} className="mt-2 min-h-28 w-full rounded-2xl border border-line p-4 focus:border-primary" placeholder="인식 결과를 확인하거나 직접 입력하세요"/></label>
    {recognition.error&&<div role="alert" className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-900"><b>{recognition.timedOut?'인식 시간이 초과됐어요':'음성 인식을 완료하지 못했어요'}</b><p className="mt-1 leading-6">{recognition.error}</p><Button variant="secondary" className="mt-3" onClick={retryCapture}>복구 후 다시 시도</Button></div>}
    <p className="text-xs leading-5 text-muted">음성 인식 문자열은 발음 점수가 아닙니다. 수정한 문장은 발음 평가에 사용하지 않으며, 원본 인식 결과와 별도로 저장됩니다.</p>
    <button className="text-xs font-bold text-muted underline" onClick={()=>setShowDebug(value=>!value)}>{showDebug?'디버그 상태 닫기':'iPhone Safari 디버그 상태'}</button>
    {showDebug&&<pre className="overflow-x-auto rounded-2xl bg-slate-950 p-3 text-[10px] leading-4 text-slate-200">{JSON.stringify(recognition.debug,null,2)}</pre>}
  </section>

  return <div className="mx-auto flex min-h-dvh max-w-xl flex-col bg-white px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(20px,env(safe-area-inset-top))]">
    <header className="flex items-center gap-3"><button aria-label="나가기" onClick={leave} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-100"><ArrowLeft/></button><div className="flex-1"><Progress value={(step+1)*25}/></div><b className="text-xs text-muted">{step+1}/4</b></header><p className="mt-10 text-xs font-bold uppercase tracking-[.18em] text-primary">STEP {step+1} · {speakingTrainingSteps[step].label}</p>
    {step===0&&<section className="flex flex-1 flex-col items-center justify-center text-center"><button onClick={()=>speech.speak(expression.practiceSentence)} className={`flex h-28 w-28 items-center justify-center rounded-full ${speech.speaking?'animate-pulse bg-blue-200 text-primary':'bg-primary text-white'}`}><Volume2 size={42}/></button><h1 className="mt-8 text-3xl font-bold">먼저 소리에 집중하세요</h1><p className="mt-3 leading-6 text-muted">문장을 보지 않고 2–3번 들어 보세요.<br/>음성 품질과 온라인 처리 여부는 기기마다 다릅니다.</p><div className="mt-6 flex gap-3"><Button variant="secondary" onClick={()=>speech.speak(expression.practiceSentence)}><Headphones size={18}/> 듣기</Button><Button variant="secondary" onClick={()=>slowSpeech.speak(expression.practiceSentence)}><Volume1 size={18}/> 느리게</Button></div></section>}
    {step===1&&<section className="mt-8"><h1 className="text-3xl font-bold">보고 따라 말하세요</h1><p className="mt-6 rounded-3xl bg-blue-50 p-6 text-2xl font-bold leading-9 text-primary">{expression.english}</p><div className="mt-4 flex gap-3"><Button variant="secondary" onClick={()=>speech.speak(expression.english)}><Headphones size={18}/> 듣기</Button><Button variant="secondary" onClick={()=>slowSpeech.speak(expression.english)}><Volume1 size={18}/> 느리게</Button></div>{capture}<p className="mt-5 text-sm font-bold">문장을 끝까지 따라 했나요?</p><div className="mt-3 grid grid-cols-2 gap-3"><Button variant={selfCorrect===false?'danger':'secondary'} onClick={()=>setSelfCorrect(false)}>다시 연습</Button><Button variant={selfCorrect===true?'primary':'secondary'} onClick={()=>setSelfCorrect(true)}>따라 했어요</Button></div></section>}
    {step===2&&<section className="mt-8"><h1 className="text-3xl font-bold">영어 문장을 떠올리세요</h1><p className="mt-6 rounded-3xl bg-canvas p-6 text-xl font-bold">{expression.korean}</p>{hint&&<p className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">첫 단어: {expression.english.split(' ')[0]}</p>}<div className="mt-4 flex gap-3"><Button variant="secondary" onClick={()=>speech.speak(expression.english)}><Headphones size={18}/> 듣기</Button><Button variant="secondary" onClick={()=>slowSpeech.speak(expression.english)}><Volume1 size={18}/> 느리게</Button><Button variant="secondary" onClick={()=>setHint(true)}><Eye size={18}/> 힌트</Button></div>{capture}</section>}
    {step===3&&<section className="mt-8"><h1 className="text-3xl font-bold">내 답으로 대화하세요</h1><div className="mt-6 rounded-3xl bg-conversation p-6 text-white"><p className="text-xs font-bold text-blue-300">NARO TUTOR</p><p className="mt-3 text-xl font-bold">Please introduce yourself in one or two sentences.</p><p className="mt-2 text-sm text-slate-400">한두 문장으로 자신을 소개해 주세요.</p></div>{hint&&<p className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">예: Hello, I’m Mina. I’m from Korea.</p>}<div className="mt-4 flex gap-3"><Button variant="secondary" onClick={()=>speech.speak('Please introduce yourself in one or two sentences.')}><Headphones size={18}/> 듣기</Button><Button variant="secondary" onClick={()=>slowSpeech.speak('Please introduce yourself in one or two sentences.')}><Volume1 size={18}/> 느리게</Button><Button variant="secondary" onClick={()=>setHint(true)}><Eye size={18}/> 예시</Button></div>{capture}</section>}
    <Button variant={recognition.listening?'secondary':'primary'} className="mt-8 w-full" disabled={recognition.listening||(step===1&&selfCorrect===null)||(step>=2&&!input.trim())} onClick={()=>void next()}>{step===3?<><Check size={18}/> 훈련 완료</>:<>다음 단계 <ArrowRight size={18}/></>}</Button>
  </div>
}
