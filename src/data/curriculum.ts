import type { CurriculumDay, CurriculumWeek } from '../types'

function days(week:number,topics:string[],expressionIds:string[]=[]):CurriculumDay[]{return topics.map((topic,index)=>({day:(week-1)*7+index+1,title:topic,objective:`${topic}를 듣고 이해한 뒤 내 문장으로 사용한다.`,expressionIds:expressionIds.slice(index%Math.max(1,expressionIds.length),index%Math.max(1,expressionIds.length)+2),listeningTask:`${topic} 핵심 문장을 세 번 듣고 들린 단어를 확인한다.`,speakingTask:`${topic} 문장을 Listen → Repeat → Recall → Respond 순서로 말한다.`,readingTask:`${topic} 관련 짧은 문장 3개를 읽고 핵심 표현을 찾는다.`,writingTask:`${topic}를 사용해 나에 관한 문장 1개를 쓴다.`}))}

const weekData:Array<Omit<CurriculumWeek,'days'>>=[
  {week:1,cefrTarget:'A0',title:'영어의 소리와 첫인사',objective:'알파벳의 기본 소리를 구별하고 짧게 인사한다.',grammar:['I am','You are'],expressions:['Hello.','I am …','Nice to meet you.'],reviewFocus:'알파벳 소리와 I am 문장 회상',weeklyCheck:'이름을 말하고 처음 만난 사람에게 두 문장으로 인사한다.',status:'available'},
  {week:2,cefrTarget:'A0',title:'나와 주변 소개하기',objective:'이름, 출신, 가까운 사람과 사물을 짧게 소개한다.',grammar:['This is','It is','be동사 의문문'],expressions:['My name is …','I am from …','This is my …'],reviewFocus:'한국어 힌트만 보고 자기소개 문장 말하기',weeklyCheck:'도움 없이 4문장 자기소개를 녹음하거나 입력한다.',status:'available'},
  {week:3,cefrTarget:'A1',title:'일반동사로 일상 말하기',objective:'자주 하는 행동을 긍정문으로 설명한다.',grammar:['일반동사 현재형','주어+동사'],expressions:['I work …','I like …','I study …'],reviewFocus:'주어와 동사 조합',weeklyCheck:'평일 일과를 4문장으로 말한다.',status:'planned'},
  {week:4,cefrTarget:'A1',title:'질문하고 대답하기',objective:'do와 does를 사용해 일상 질문을 주고받는다.',grammar:['do/does','부정문','의문문'],expressions:['Do you …?','I do not …','What do you …?'],reviewFocus:'질문과 짧은 대답',weeklyCheck:'일상 질문 5개에 문장으로 답한다.',status:'planned'},
  {week:5,cefrTarget:'A1',title:'가족과 숫자',objective:'가족 구성과 나이, 수량을 설명한다.',grammar:['have/has','복수형'],expressions:['I have …','There are …'],reviewFocus:'가족 어휘와 수량',weeklyCheck:'가족 또는 가까운 사람을 4문장으로 소개한다.',status:'planned'},
  {week:6,cefrTarget:'A1',title:'시간과 하루 일과',objective:'시간을 묻고 현재시제로 일과를 설명한다.',grammar:['현재시제','시간 전치사'],expressions:['I get up at …','What time …?'],reviewFocus:'숫자·시간·빈도',weeklyCheck:'아침부터 저녁까지 일과를 순서대로 말한다.',status:'planned'},
  {week:7,cefrTarget:'A1',title:'어제 이야기',objective:'기초 과거형으로 어제 한 일을 말한다.',grammar:['be동사 과거','규칙 과거형'],expressions:['I was …','I watched …'],reviewFocus:'현재와 과거 구별',weeklyCheck:'어제 있었던 일을 4문장으로 쓴다.',status:'planned'},
  {week:8,cefrTarget:'A1',title:'내일 계획',objective:'미래 표현으로 계획과 예정을 말한다.',grammar:['be going to','will 기초'],expressions:["I'm going to …",'I will …'],reviewFocus:'어제·오늘·내일 시간 표현',weeklyCheck:'주말 계획을 4문장으로 말한다.',status:'planned'},
  {week:9,cefrTarget:'A1',title:'카페와 식당',objective:'원하는 음식과 음료를 정중하게 주문한다.',grammar:['would like','Can I …?'],expressions:["I'd like …",'Could I get …?'],reviewFocus:'주문과 수량',weeklyCheck:'입장부터 계산까지 역할극을 완료한다.',status:'planned'},
  {week:10,cefrTarget:'A1',title:'쇼핑과 길 묻기',objective:'가격, 크기, 위치를 묻고 안내를 이해한다.',grammar:['의문사','명령문 방향'],expressions:['How much …?','How do I get to …?'],reviewFocus:'위치·방향·가격',weeklyCheck:'물건 구매와 길 묻기 시나리오를 완료한다.',status:'planned'},
  {week:11,cefrTarget:'A1',title:'문장 연결하기',objective:'and, but, because로 생각을 연결한다.',grammar:['and/but/because'],expressions:['I like … because …','It is … but …'],reviewFocus:'두 문장 연결',weeklyCheck:'좋아하는 것을 이유와 함께 설명한다.',status:'planned'},
  {week:12,cefrTarget:'A1',title:'대화 이어가기',objective:'자기소개를 확장하고 후속 질문으로 대화를 이어간다.',grammar:['기초 문장 종합','후속 질문'],expressions:['How about you?','Why do you …?'],reviewFocus:'힌트 없는 자기소개와 질문',weeklyCheck:'6턴 이상의 짧은 대화를 완료한다.',status:'planned'}
]

const topics=[
  ['알파벳 A–M','알파벳 N–Z','모음의 기본 소리','Hello와 Hi','I am으로 이름 말하기','You are 이해하기','1주차 회상과 점검'],
  ['My name is','I am from','This is a person','This is a thing','It is로 설명하기','Are you 질문','2주차 자기소개 점검'],
  ['일상 동사 1','일상 동사 2','I work','I study','I like','긍정문 연결','3주차 점검'],
  ['Do you 질문','Yes, I do','No, I do not','Does 질문','What do you','일상 인터뷰','4주차 점검'],
  ['가족 어휘','I have','He/She has','숫자 1–20','나이 말하기','가족 소개','5주차 점검'],
  ['시간 읽기','What time','아침 일과','오후 일과','저녁 일과','하루 순서','6주차 점검'],
  ['was와 were','어제 시간 표현','규칙 과거형','과거 부정','과거 질문','어제 이야기','7주차 점검'],
  ['내일 시간 표현','going to','will 기초','주말 계획','날씨와 계획','계획 질문','8주차 점검'],
  ['카페 메뉴','음료 주문','크기 선택','식당 자리','음식 주문','계산 요청','9주차 역할극'],
  ['가격 묻기','크기와 색상','입어 보기','위치 묻기','방향 이해','이동 시간','10주차 역할극'],
  ['and 연결','but 대비','because 이유','좋아하는 것','싫어하는 것','세 문장 연결','11주차 점검'],
  ['자기소개 확장','후속 질문','상대 답변 듣기','되묻기','이유 말하기','대화 마무리','12주차 종합 점검']
]

const ids=[['greet-hello','intro-name'],['intro-name','intro-from','intro-live']]
export const foundationCurriculum:CurriculumWeek[]=weekData.map((week,index)=>({...week,days:days(week.week,topics[index],ids[index]??[])}))
export const consolidationDays=days(13,['핵심 표현 누적 복습','듣기 집중 복습','말하기 집중 복습','읽기·쓰기 복습','취약 표현 재도전','90일 기초 종합 점검'])
