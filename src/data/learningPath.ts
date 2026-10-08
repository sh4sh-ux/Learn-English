import type { LearningPathStage, LanguageSkill, UnifiedContentRef } from '../types'
import { expressions } from './expressions'
import { scenarios } from './scenarios'

export const skillLabels: Record<LanguageSkill,string>={reading:'읽기',listening:'듣기',speaking:'말하기',writing:'쓰기'}

export const learningPath: LearningPathStage[]=[
  {id:'foundation-a0',cefrRange:['A0'],title:'Foundation A0',description:'알파벳, 소리, 인사부터 영어 문장의 첫 기초를 만듭니다.',mode:'general',skills:['listening','speaking','reading','writing'],status:'available',outcomes:['소리와 철자 연결','두 문장 자기소개'],grammarFocus:['I am','You are','This is'],expressionGoals:['인사','이름','출신'],taskSummary:{listening:'기초 소리와 짧은 문장 구별',speaking:'보고 따라 한 뒤 짧게 회상',reading:'단어와 한 문장 읽기',writing:'나에 관한 한 문장 쓰기'},reviewPolicy:'매일 핵심 표현 회상 및 간격 반복',exitAssessment:'힌트 없이 4문장 자기소개와 기초 소리 점검'},
  {id:'foundation-a1',cefrRange:['A1'],title:'Foundation A1',description:'기본 문장과 생활 표현을 듣고 직접 만들어 봅니다.',mode:'general',skills:['listening','speaking','reading','writing'],status:'available',outcomes:['일상 질문과 답변','시간 순서 설명'],grammarFocus:['현재·과거 기초','do/does','기초 연결어'],expressionGoals:['가족','일과','주문','길 묻기'],taskSummary:{listening:'짧은 생활 대화 핵심 파악',speaking:'6턴 기초 대화',reading:'짧은 안내와 소개 읽기',writing:'연결된 3–4문장 쓰기'},reviewPolicy:'회상 성공과 힌트 사용을 반영한 복습',exitAssessment:'새 상황의 생활 대화·읽기·쓰기 종합 점검'},
  {id:'everyday-a2',cefrRange:['A2'],title:'Everyday A2',description:'익숙한 생활 상황에서 필요한 정보를 주고받습니다.',mode:'general',skills:['listening','speaking','reading','writing'],status:'planned',outcomes:['생활 문제 해결','경험의 짧은 설명'],grammarFocus:['시제 확장','비교','조동사'],expressionGoals:['요청','설명','간단한 의견'],taskSummary:{listening:'일상 대화 세부 정보',speaking:'상황별 문제 해결',reading:'생활 정보 글',writing:'짧은 메시지와 경험'},reviewPolicy:'영역별 오답과 회상 실패 우선',exitAssessment:'네 영역 수행 과제—공인 등급 인증 아님'},
  {id:'conversation-b1',cefrRange:['B1'],title:'Conversation B1',description:'경험과 의견을 이유와 함께 이어서 설명합니다.',mode:'general',skills:['listening','speaking','reading','writing'],status:'planned',outcomes:['경험 서술','근거 있는 의견'],grammarFocus:['완료형 기초','관계절','조건문'],expressionGoals:['이유','동의·반대','후속 질문'],taskSummary:{listening:'긴 대화의 요지',speaking:'경험과 의견 연결',reading:'중간 길이 글 구조',writing:'한 단락 구성'},reviewPolicy:'반복 오답과 논리 연결 취약점 복습',exitAssessment:'개인 경험 발표와 단락 작성'},
  {id:'fluency-b2',cefrRange:['B2'],title:'Fluency B2',description:'복잡한 대화와 글의 핵심을 이해하고 논리적으로 표현합니다.',mode:'general',skills:['listening','speaking','reading','writing'],status:'planned',outcomes:['복잡한 논지 이해','자발적 상호작용'],grammarFocus:['복합문','뉘앙스와 담화 표지'],expressionGoals:['분석','가정','정교한 의견'],taskSummary:{listening:'복합 논지와 태도',speaking:'즉흥 토론과 요약',reading:'논설·정보 글 분석',writing:'논리적 다단락 글'},reviewPolicy:'전이 과제에서 실패한 표현 재검증',exitAssessment:'통합 요약과 근거 기반 의견 과제'},
  {id:'advanced-c1',cefrRange:['C1'],title:'Advanced C1',description:'고급 회화와 학술 영어를 TOEFL 준비까지 연결합니다.',mode:'toefl',skills:['reading','listening','speaking','writing'],status:'planned',outcomes:['학술 자료 종합','정확하고 유연한 표현'],grammarFocus:['고급 문장 구조','문체와 응집성'],expressionGoals:['학술 요약','논증','발표'],taskSummary:{listening:'강의 구조와 근거',speaking:'통합 말하기 과제',reading:'학술 독해와 추론',writing:'자료 종합과 논리적 작문'},reviewPolicy:'공식 기준 검증 후 자체 제작 과제에 적용',exitAssessment:'검증된 통합 수행 평가—공식 CEFR·TOEFL 인증 아님'}
]

export const unifiedContentIndex: UnifiedContentRef[]=[
  ...expressions.map((item)=>({id:item.id,kind:'expression' as const,mode:'general' as const,cefrLevel:item.cefrLevel,skills:item.skills,source:'naro-original' as const,reviewable:true})),
  ...scenarios.map((item)=>({id:item.id,kind:'conversation' as const,mode:'general' as const,cefrLevel:item.level==='왕초보'?'A1' as const:item.level==='초급'?'A2' as const:item.level==='초중급'?'B1' as const:'B2' as const,skills:['listening','speaking'] as LanguageSkill[],source:'naro-original' as const,reviewable:true}))
]
