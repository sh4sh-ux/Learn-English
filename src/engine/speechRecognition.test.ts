import { describe,expect,it } from 'vitest'
import { collectRecognitionResults, suggestProperNounAliases, validateProperNoun } from './speechRecognition'
import type { ProperNounEntry } from '../types'

const names:ProperNounEntry[]=[
  {id:'sanghyun',kind:'person',canonical:'Sanghyun',aliases:['San','Sang Hyun']},
  {id:'wisen',kind:'person',canonical:'Wisen',aliases:['Wise N']}
]

describe('음성 인식 결과 처리',()=>{
  it('중간 결과와 최종 결과를 분리한다',()=>{const result=collectRecognitionResults({0:{isFinal:true,0:{transcript:"I'm"}},1:{isFinal:false,0:{transcript:'Sang'}},length:2});expect(result).toEqual({finalTranscript:"I'm",interimTranscript:'Sang'})})
  it('자기소개 문맥에서만 등록한 이름 별칭을 제안한다',()=>{expect(suggestProperNounAliases("I'm San",names)).toMatchObject({text:"I'm Sanghyun",entryId:'sanghyun'});expect(suggestProperNounAliases('San is a city',names).text).toBe('San is a city')})
  it('띄어쓰기 변형을 고유명사 후보로 처리한다',()=>{expect(suggestProperNounAliases('My name is Wise N',names).text).toBe('My name is Wisen')})
  it('의미가 분명한 일반 단어는 별칭으로 허용하지 않는다',()=>{expect(validateProperNoun({id:'w',kind:'person',canonical:'Wisen',aliases:['white']})).toContain('일반 단어')})
  it('무관한 문자열을 무제한 별칭으로 허용하지 않는다',()=>{expect(validateProperNoun({id:'x',kind:'brand',canonical:'NARO',aliases:['coffee shop']})).toContain('보기 어렵습니다')})
})
