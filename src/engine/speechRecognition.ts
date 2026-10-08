import type { ProperNounEntry } from '../types'

const COMMON_WORDS = new Set([
  'white','black','right','write','wise','work','home','name','man','woman','good','bad','yes','no','hello','hi','fine','thanks','thank','please'
])

const clean = (value: string) => value.trim().replace(/\s+/g,' ')
const comparable = (value: string) => clean(value).toLocaleLowerCase('en-US').replace(/[^a-z0-9]/g,'')

export function validateProperNoun(entry: ProperNounEntry): string | null {
  const canonical=clean(entry.canonical)
  if(canonical.length<2||canonical.length>40)return '표준 표기는 2–40자로 입력해 주세요.'
  if(entry.aliases.length>6)return '별칭은 고유명사마다 최대 6개까지 저장할 수 있습니다.'
  const canonicalKey=comparable(canonical)
  for(const raw of entry.aliases){
    const alias=clean(raw);const key=comparable(alias)
    if(key.length<2||key.length>40)return '별칭은 2–40자로 입력해 주세요.'
    if(alias.toLocaleLowerCase('en-US')===canonical.toLocaleLowerCase('en-US'))return '표준 표기와 같은 별칭은 제외해 주세요.'
    if(COMMON_WORDS.has(key))return `“${alias}”처럼 뜻이 분명한 일반 단어는 별칭으로 저장할 수 없습니다.`
    const related=canonicalKey.startsWith(key)&&key.length>=3||key.startsWith(canonicalKey)||canonicalKey[0]===key[0]&&Math.abs(canonicalKey.length-key.length)<=3
    if(!related)return `“${alias}”은 표준 표기와 구별 가능한 음성 변형으로 보기 어렵습니다.`
  }
  return null
}

export type AliasSuggestion = { text:string; entryId?:string; canonical?:string; alias?:string }

export function suggestProperNounAliases(transcript: string, entries: ProperNounEntry[]): AliasSuggestion {
  let text=clean(transcript);let matched:AliasSuggestion={text}
  for(const entry of entries){
    if(validateProperNoun(entry))continue
    for(const rawAlias of entry.aliases){
      const escaped=clean(rawAlias).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')
      const pattern=new RegExp(`\\b${escaped.replace(/\\s+/g,'\\\\s+')}\\b`,'i')
      const found=text.match(pattern)
      if(!found)continue
      const before=text.slice(0,found.index).toLocaleLowerCase('en-US')
      const personContext=entry.kind!=='person'||/(?:i['’]?m|i am|my name is|this is)\s*$/.test(before)
      const brandContext=entry.kind!=='brand'||/(?:at|for|from|called|brand)\s*$/.test(before)
      if(!personContext||!brandContext)continue
      text=text.replace(pattern,entry.canonical)
      matched={text,entryId:entry.id,canonical:entry.canonical,alias:found[0]}
      break
    }
  }
  return matched
}

export type SpeechResultLike = ArrayLike<{ isFinal?:boolean; 0?:{ transcript?:string } }>

export function collectRecognitionResults(results: SpeechResultLike) {
  const finals:string[]=[];const interim:string[]=[]
  for(let index=0;index<results.length;index+=1){
    const result=results[index];const text=clean(result?.[0]?.transcript??'')
    if(!text)continue
    if(result.isFinal)finals.push(text);else interim.push(text)
  }
  return {finalTranscript:clean(finals.join(' ')),interimTranscript:clean(interim.join(' '))}
}
