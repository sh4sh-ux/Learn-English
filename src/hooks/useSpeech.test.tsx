import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest'
import { useSpeechRecognition } from './useSpeech'

class FakeRecognition {
  static latest:FakeRecognition
  lang='';interimResults=false;continuous=false;started=false;stopped=false;aborted=false
  onstart:(()=>void)|null=null
  onresult:((event:{results:ArrayLike<{isFinal?:boolean;0?:{transcript?:string}}>})=>void)|null=null
  onerror:((event:{error:string})=>void)|null=null
  onend:(()=>void)|null=null
  constructor(){FakeRecognition.latest=this}
  start(){this.started=true;this.onstart?.()}
  stop(){this.stopped=true}
  abort(){this.aborted=true}
}

type HookValue=ReturnType<typeof useSpeechRecognition>
let container:HTMLDivElement;let root:Root;let current:HookValue;let onFinal:ReturnType<typeof vi.fn>

function Harness({timeoutMs=1000,stopGraceMs=100}:{timeoutMs?:number;stopGraceMs?:number}){current=useSpeechRecognition(onFinal,{timeoutMs,stopGraceMs});return null}

beforeEach(()=>{vi.useFakeTimers();(globalThis as typeof globalThis&{IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=true;container=document.createElement('div');document.body.append(container);root=createRoot(container);onFinal=vi.fn();window.webkitSpeechRecognition=FakeRecognition as never})
afterEach(()=>{act(()=>root.unmount());container.remove();delete window.webkitSpeechRecognition;(globalThis as typeof globalThis&{IS_REACT_ACT_ENVIRONMENT:boolean}).IS_REACT_ACT_ENVIRONMENT=false;vi.useRealTimers()})

const renderHook=(props?:{timeoutMs?:number;stopGraceMs?:number})=>act(()=>root.render(<Harness {...props}/>))

describe('Safari 음성 인식 세션',()=>{
  it('중간 결과를 표시하고 최종 결과만 콜백으로 전달한다',()=>{renderHook();act(()=>current.start());expect(FakeRecognition.latest.interimResults).toBe(true);act(()=>FakeRecognition.latest.onresult?.({results:[{isFinal:false,0:{transcript:'I am Sang'}}]}));expect(current.interimTranscript).toBe('I am Sang');expect(onFinal).not.toHaveBeenCalled();act(()=>FakeRecognition.latest.onresult?.({results:[{isFinal:true,0:{transcript:"I'm Sanghyun"}}]}));expect(current.finalTranscript).toBe("I'm Sanghyun");expect(onFinal).toHaveBeenCalledWith("I'm Sanghyun")})
  it('stop 후 종료되지 않으면 grace 시간 뒤 abort한다',()=>{renderHook({stopGraceMs:50});act(()=>current.start());act(()=>current.stop());expect(FakeRecognition.latest.stopped).toBe(true);act(()=>vi.advanceTimersByTime(51));expect(FakeRecognition.latest.aborted).toBe(true)})
  it('인식 타임아웃에서 마이크를 중단하고 복구 UI 상태를 제공한다',()=>{renderHook({timeoutMs:50});act(()=>current.start());act(()=>vi.advanceTimersByTime(51));expect(FakeRecognition.latest.aborted).toBe(true);expect(current.timedOut).toBe(true);expect(current.listening).toBe(false);expect(current.error).toContain('늦어지고')})
  it('권한 거부와 정상 종료 모두 마이크 상태를 복원한다',()=>{renderHook();act(()=>current.start());act(()=>FakeRecognition.latest.onerror?.({error:'not-allowed'}));expect(current.listening).toBe(false);expect(current.error).toContain('권한');act(()=>current.start());act(()=>FakeRecognition.latest.onend?.());expect(current.listening).toBe(false)})
  it('화면 이동으로 unmount되면 활성 인식을 abort한다',()=>{renderHook();act(()=>current.start());const active=FakeRecognition.latest;act(()=>root.unmount());expect(active.aborted).toBe(true);root=createRoot(container)})
})
