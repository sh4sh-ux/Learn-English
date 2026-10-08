import type { ConversationNode, ConversationScenario, IntentPattern, Level } from '../types'

type Turn = {
  tutor: string
  ko: string
  intent: string
  patterns: string[]
  answers: string[]
  hint: string
  feedback: string
  natural?: string
  polite?: string
  save?: string
}

const intent = (name: string, patterns: string[]): IntentPattern => ({ intent: name, patterns })

function makeScenario(id: string, category: string, level: Level, title: string, description: string, turns: Turn[]): ConversationScenario {
  const nodes: ConversationNode[] = turns.map((turn, index) => ({
    id: `${id}-${index + 1}`,
    tutorEnglish: turn.tutor,
    tutorKorean: turn.ko,
    acceptedIntents: [intent(turn.intent, turn.patterns)],
    hints: [turn.hint],
    suggestedAnswers: turn.answers,
    transitions: [{
      intent: turn.intent,
      nextNodeId: index === turns.length - 1 ? null : `${id}-${index + 2}`,
      feedback: turn.feedback,
      naturalAlternative: turn.natural,
      politeAlternative: turn.polite,
      saveExpressionId: turn.save
    }]
  }))
  return { id, category, level, title, description, startNodeId: nodes[0].id, nodes }
}

const greeting = makeScenario('greeting-first','인사','왕초보','새 이웃과 첫인사','엘리베이터에서 새 이웃과 자연스럽게 인사해요.',[
  { tutor:'Hi! I don’t think we’ve met. I’m Alex.', ko:'안녕하세요! 우리 처음 보는 것 같네요. 저는 알렉스예요.', intent:'greet', patterns:['hello','hi','nice to meet','good morning'], answers:['Hi, I’m Jisu. Nice to meet you.','Hello! Nice to meet you.'], hint:'Hi 또는 Hello로 인사해 보세요.', feedback:'따뜻한 첫인사예요.', natural:'Hi, I’m Jisu. Nice to meet you.', save:'greet-hello' },
  { tutor:'Nice to meet you too. How are you doing today?', ko:'저도 반가워요. 오늘 어떻게 지내세요?', intent:'wellbeing', patterns:['doing well','i am good','pretty good','not bad','great thanks'], answers:["I’m doing well, thanks.","Pretty good. How about you?"], hint:'현재 기분과 thanks를 함께 말해 보세요.', feedback:'안부에 자연스럽게 답했어요.', natural:"I’m doing well, thanks. How about you?", save:'greet-good' },
  { tutor:'I’m great. Are you new to this building?', ko:'저는 좋아요. 이 건물에 새로 오셨나요?', intent:'new_resident', patterns:['yes i am','just moved','moved here','no i have lived','not new'], answers:['Yes, I just moved here.','No, I’ve lived here for a year.'], hint:'새로 왔는지 yes 또는 no로 설명해 보세요.', feedback:'상황을 분명하게 설명했어요.' },
  { tutor:'Welcome! I hope you enjoy living here.', ko:'환영해요! 여기서 즐겁게 지내시길 바라요.', intent:'thank', patterns:['thank you','thanks','i appreciate'], answers:['Thank you. That’s very kind of you.','Thanks! See you around.'], hint:'환영 인사에 감사를 표현해 보세요.', feedback:'기분 좋게 대화를 마쳤어요.', polite:'Thank you. That’s very kind of you.' }
])

const selfIntro = makeScenario('self-intro','자기소개','왕초보','모임에서 자기소개','새로운 사람에게 이름, 출신, 사는 곳을 소개해요.',[
  { tutor:'Hi! What’s your name?', ko:'안녕하세요! 이름이 뭐예요?', intent:'give_name', patterns:['my name is','i am','i’m','call me'], answers:["My name is Minji.","I’m Minji."], hint:'My name is … 또는 I’m …을 사용하세요.', feedback:'이름을 잘 소개했어요.', save:'intro-name' },
  { tutor:'Where are you from?', ko:'어디에서 오셨어요?', intent:'give_origin', patterns:['i am from','i’m from','from korea','grew up in'], answers:["I’m from Korea.","I grew up in Busan."], hint:'I’m from …으로 출신을 말해 보세요.', feedback:'출신을 자연스럽게 말했어요.', save:'intro-from' },
  { tutor:'Which city do you live in now?', ko:'지금은 어느 도시에 사세요?', intent:'give_city', patterns:['i live in','living in','based in'], answers:['I live in Seoul.','I’m living in Incheon now.'], hint:'I live in …을 사용하세요.', feedback:'현재 사는 곳을 잘 설명했어요.', save:'intro-live' },
  { tutor:'What do you like to do in your free time?', ko:'여가 시간에는 무엇을 좋아하세요?', intent:'give_hobby', patterns:['i like','i enjoy','my hobby','love to'], answers:['I like hiking and reading.','I enjoy watching movies.'], hint:'I like …ing로 취미를 말해 보세요.', feedback:'대화를 이어 가기 좋은 소개예요.' }
])

// “출신” 대신 현재 거주지를 답한 경우, 틀렸다고 하지 않고 그 내용에 맞는 질문으로 분기한다.
selfIntro.nodes[1].acceptedIntents.push(intent('give_current_city',['i live in','i am living in','i’m living in','based in']))
selfIntro.nodes[1].transitions.push({ intent:'give_current_city',nextNodeId:'self-intro-city-follow',feedback:'현재 사는 도시를 이해했어요. 그곳에서의 생활을 이어서 이야기해 봐요.',saveExpressionId:'intro-live' })
selfIntro.nodes.push({
  id:'self-intro-city-follow',
  tutorEnglish:'Do you like living there?',
  tutorKorean:'그곳에서 사는 것이 마음에 드세요?',
  acceptedIntents:[intent('city_opinion',['yes i do','i like it','love living','it is convenient','not really','a little busy'])],
  hints:['도시 생활에서 좋은 점이나 불편한 점을 짧게 말해 보세요.'],
  suggestedAnswers:['Yes, I like it. It’s very convenient.','It’s a little busy, but I enjoy living there.'],
  transitions:[{intent:'city_opinion',nextNodeId:'self-intro-4',feedback:'도시에 대한 느낌을 자연스럽게 덧붙였어요.'}]
})

const family = makeScenario('family-chat','가족','초급','가족 이야기','친구와 가족 구성과 함께 하는 일을 이야기해요.',[
  { tutor:'Do you have any brothers or sisters?', ko:'형제나 자매가 있나요?', intent:'siblings', patterns:['i have','one brother','two sisters','only child','no siblings'], answers:['I have two sisters.','I’m an only child.'], hint:'I have … 또는 I’m an only child를 써 보세요.', feedback:'가족 구성을 정확히 전했어요.', save:'family-have' },
  { tutor:'Are you close to your family?', ko:'가족과 가까운 사이인가요?', intent:'family_closeness', patterns:['we are close','we’re close','very close','not very close','yes we'], answers:["Yes, we’re very close.","We don’t meet often, but we keep in touch."], hint:'관계와 연락 빈도를 말해 보세요.', feedback:'가족 관계를 자연스럽게 표현했어요.', save:'family-close' },
  { tutor:'What do you usually do together?', ko:'보통 함께 무엇을 하나요?', intent:'family_activity', patterns:['we usually','we like','eat together','go hiking','watch movies'], answers:['We usually have dinner together.','We like to go hiking.'], hint:'We usually …로 활동을 말해 보세요.', feedback:'구체적인 예가 좋아요.' },
  { tutor:'That sounds lovely. When will you see them next?', ko:'좋네요. 다음에는 언제 만나나요?', intent:'next_meeting', patterns:['this weekend','next week','on sunday','soon','next month'], answers:['I’ll see them this weekend.','We’re meeting next month.'], hint:'미래 시점을 넣어 답해 보세요.', feedback:'자연스럽게 일정을 말했어요.' }
])

const daily = makeScenario('daily-routine','일상','초급','나의 평일 루틴','하루 일과와 주말 계획을 이야기해요.',[
  { tutor:'What time do you usually get up?', ko:'보통 몇 시에 일어나세요?', intent:'wake_time', patterns:['get up at','wake up at','around seven','at six','at seven','at eight'], answers:['I usually get up at seven.','I wake up around six thirty.'], hint:'I usually get up at …을 사용하세요.', feedback:'시간과 습관을 잘 표현했어요.', save:'daily-usually' },
  { tutor:'What’s the first thing you do in the morning?', ko:'아침에 가장 먼저 무엇을 하나요?', intent:'morning_action', patterns:['i drink','i make','i check','i take','first i'], answers:['I drink a glass of water.','First, I make coffee.'], hint:'I … 또는 First, I …로 답하세요.', feedback:'아침 행동이 선명하게 들려요.' },
  { tutor:'How do you get to work or school?', ko:'직장이나 학교에 어떻게 가세요?', intent:'commute', patterns:['by bus','by subway','by car','i walk','work from home','take the'], answers:['I take the subway to work.','I work from home.'], hint:'I take … 또는 I go by …를 사용하세요.', feedback:'이동 방법을 잘 설명했어요.' },
  { tutor:'What do you like to do on weekends?', ko:'주말에는 무엇을 좋아하세요?', intent:'weekend', patterns:['i like','i usually','relax','meet friends','go hiking'], answers:['I like to relax on weekends.','I usually meet my friends.'], hint:'I like to …로 말해 보세요.', feedback:'주말 루틴까지 잘 소개했어요.', save:'daily-weekend' }
])

const cafe = makeScenario('cafe-order','카페','초급','카페에서 주문하기','음료의 종류와 크기, 매장 이용 여부를 말해요.',[
  { tutor:'Hi! What can I get for you?', ko:'안녕하세요! 무엇을 드릴까요?', intent:'order_drink', patterns:['coffee','latte','tea','americano','cappuccino','can i have','could i get','i would like','i’d like'], answers:['Could I get a coffee, please?',"I’d like an iced latte."], hint:'음료 이름과 please를 함께 말해 보세요.', feedback:'주문 의도가 정확히 전달됐어요.', natural:"I’d like an iced latte, please.", polite:'Could I get an iced latte, please?', save:'cafe-coffee' },
  { tutor:'Sure. What size would you like?', ko:'네. 어떤 크기로 드릴까요?', intent:'choose_size', patterns:['small','medium','large','regular','a medium'], answers:['A medium, please.','Large, please.'], hint:'Small, medium, large 중 하나를 말하세요.', feedback:'크기를 잘 선택했어요.', save:'cafe-size' },
  { tutor:'Would you like it hot or iced?', ko:'따뜻하게 드릴까요, 아이스로 드릴까요?', intent:'temperature', patterns:['hot','iced','cold','warm'], answers:['Iced, please.','Hot, please.'], hint:'Hot 또는 iced로 답하세요.', feedback:'음료 온도가 정확히 전달됐어요.' },
  { tutor:'Is that for here or to go?', ko:'매장에서 드시나요, 가져가시나요?', intent:'place', patterns:['for here','to go','take away','drink here'], answers:['For here, please.','To go, please.'], hint:'For here 또는 to go를 사용하세요.', feedback:'주문을 완성했어요.', save:'cafe-here' }
])

const restaurant = makeScenario('restaurant-order','식당','초급','식당에서 식사하기','자리 요청부터 추천과 계산까지 연습해요.',[
  { tutor:'Good evening. How many people?', ko:'안녕하세요. 몇 분이세요?', intent:'party_size', patterns:['table for','two people','three people','just me','one person'], answers:['A table for two, please.','Just one, please.'], hint:'A table for …, please를 써 보세요.', feedback:'인원수가 잘 전달됐어요.', save:'restaurant-table' },
  { tutor:'Here are the menus. Can I help you choose?', ko:'메뉴입니다. 고르는 것을 도와드릴까요?', intent:'ask_recommendation', patterns:['recommend','what is popular','suggest','yes please'], answers:['What do you recommend?','What’s popular here?'], hint:'recommend를 사용해 물어보세요.', feedback:'추천을 자연스럽게 요청했어요.', save:'restaurant-recommend' },
  { tutor:'The grilled chicken is popular. Would you like that?', ko:'구운 치킨이 인기예요. 그걸로 드릴까요?', intent:'order_food', patterns:['i will have','i’ll have','yes please','sounds good','i would like'], answers:["I’ll have the grilled chicken, please.","That sounds good. I’ll try it."], hint:'I’ll have …를 사용하세요.', feedback:'메뉴 주문이 완료됐어요.' },
  { tutor:'How was everything?', ko:'음식은 어떠셨나요?', intent:'request_bill', patterns:['bill','check please','everything was','delicious','great'], answers:['Everything was great. Could we have the bill, please?','It was delicious. The check, please.'], hint:'간단한 평가 뒤 bill을 요청해 보세요.', feedback:'식사를 예의 있게 마무리했어요.', save:'restaurant-bill' }
])

const shopping = makeScenario('shopping-clothes','쇼핑','초급','옷 가게에서 쇼핑하기','상품 찾기, 피팅, 사이즈와 구매를 연습해요.',[
  { tutor:'Hi! Are you looking for anything in particular?', ko:'안녕하세요! 특별히 찾는 것이 있나요?', intent:'find_item', patterns:['looking for','need a','jacket','shirt','pants','just browsing'], answers:["I’m looking for a light jacket.","I’m just browsing, thanks."], hint:'I’m looking for …를 사용하세요.', feedback:'원하는 상품을 잘 설명했어요.' },
  { tutor:'This one is popular. Would you like to try it?', ko:'이 제품이 인기예요. 입어 보시겠어요?', intent:'try_on', patterns:['try it','try this on','yes please','fitting room'], answers:['Yes, can I try this on?','Where is the fitting room?'], hint:'Can I try this on?을 말해 보세요.', feedback:'피팅을 자연스럽게 요청했어요.', save:'shop-try' },
  { tutor:'How does it fit?', ko:'사이즈가 어떤가요?', intent:'size_issue', patterns:['too small','too big','larger size','smaller size','fits well'], answers:['It’s a little small. Do you have a larger size?','It fits well.'], hint:'크거나 작은지 말해 보세요.', feedback:'사이즈 상태를 구체적으로 설명했어요.', save:'shop-size' },
  { tutor:'Here you are. Would you like to buy it?', ko:'여기 있습니다. 구매하시겠어요?', intent:'purchase', patterns:['i will take it','i’ll take it','yes i would','no thank you'], answers:["Yes, I’ll take it.","No, thank you. I’ll think about it."], hint:'I’ll take it 또는 No, thank you를 사용하세요.', feedback:'구매 의사를 분명하고 예의 있게 표현했어요.' }
])

const hotel = makeScenario('hotel-checkin','호텔','초급','호텔 체크인','예약 확인과 객실·체크아웃 정보를 확인해요.',[
  { tutor:'Welcome. How can I help you?', ko:'어서 오세요. 무엇을 도와드릴까요?', intent:'check_in', patterns:['check in','reservation','i have a booking'], answers:['I’d like to check in. I have a reservation.','I have a reservation under Kim.'], hint:'reservation과 이름을 말해 보세요.', feedback:'체크인 의도가 분명해요.', save:'hotel-reservation' },
  { tutor:'May I see your passport, please?', ko:'여권을 보여주시겠어요?', intent:'provide_id', patterns:['here you are','here is my passport','of course','sure'], answers:['Of course. Here you are.','Sure, here is my passport.'], hint:'Here you are를 사용하세요.', feedback:'요청에 자연스럽게 응답했어요.' },
  { tutor:'Your room is on the fifth floor. Do you need anything else?', ko:'객실은 5층입니다. 더 필요한 것이 있나요?', intent:'ask_checkout', patterns:['checkout','what time','breakfast','wifi','nothing else'], answers:['What time is checkout?','What time is breakfast?'], hint:'궁금한 호텔 정보를 질문하세요.', feedback:'필요한 정보를 잘 확인했어요.', save:'hotel-checkout' },
  { tutor:'Checkout is at eleven. Enjoy your stay!', ko:'체크아웃은 11시입니다. 편안히 머무세요!', intent:'thank_hotel', patterns:['thank you','thanks','i will','have a good'], answers:['Thank you very much.','Thanks. Have a good evening.'], hint:'감사 인사로 마무리하세요.', feedback:'체크인을 기분 좋게 마쳤어요.' }
])

const airport = makeScenario('airport-checkin','공항','초급','공항 체크인','카운터 찾기부터 수하물과 좌석까지 연습해요.',[
  { tutor:'Hello. Where are you flying today?', ko:'안녕하세요. 오늘 어디로 가시나요?', intent:'destination', patterns:['flying to','going to','to tokyo','to london','to paris'], answers:["I’m flying to Tokyo.","I’m going to London."], hint:'I’m flying to …를 사용하세요.', feedback:'목적지가 정확히 전달됐어요.' },
  { tutor:'May I see your passport and ticket?', ko:'여권과 항공권을 보여주시겠어요?', intent:'provide_documents', patterns:['here you are','of course','here is my','sure'], answers:['Of course. Here you are.','Sure, here they are.'], hint:'Here you are로 건네세요.', feedback:'필요한 서류를 잘 전달했어요.' },
  { tutor:'Are you checking any bags?', ko:'부칠 짐이 있나요?', intent:'check_bag', patterns:['one bag','two bags','no bags','bag to check','carry on'], answers:['I have one bag to check.','No, just this carry-on.'], hint:'가방 수와 check를 활용하세요.', feedback:'수하물 정보를 정확히 말했어요.', save:'airport-bag' },
  { tutor:'Would you prefer a window or an aisle seat?', ko:'창가와 통로 중 어느 좌석을 선호하세요?', intent:'seat_preference', patterns:['window seat','aisle seat','no preference','either is fine'], answers:['A window seat, please.','Either is fine, thank you.'], hint:'window 또는 aisle을 선택하세요.', feedback:'좌석 선호까지 잘 전달했어요.' }
])

const transport = makeScenario('transport-ticket','교통','초급','대중교통 표 사기','목적지, 표 종류, 환승 여부를 확인해요.',[
  { tutor:'Hello. Where would you like to go?', ko:'안녕하세요. 어디로 가시나요?', intent:'ticket_destination', patterns:['ticket to','going to','city hall','airport','station'], answers:['One ticket to City Hall, please.','I’d like to go to the airport.'], hint:'One ticket to …, please를 사용하세요.', feedback:'목적지를 정확히 말했어요.', save:'transport-ticket' },
  { tutor:'One-way or round-trip?', ko:'편도인가요, 왕복인가요?', intent:'ticket_type', patterns:['one way','one-way','round trip','round-trip','return'], answers:['One-way, please.','A round-trip ticket, please.'], hint:'one-way 또는 round-trip을 고르세요.', feedback:'표 종류를 잘 선택했어요.' },
  { tutor:'The next train leaves at 10:20. Is that okay?', ko:'다음 열차는 10시 20분에 출발합니다. 괜찮으세요?', intent:'confirm_time', patterns:['that is fine','that’s fine','yes','works for me','too late'], answers:["That’s fine, thank you.","Is there an earlier train?"], hint:'괜찮은지 또는 다른 시간을 원하는지 말하세요.', feedback:'시간에 대한 의사가 분명해요.' },
  { tutor:'You’ll need to change at Central Station.', ko:'센트럴역에서 환승해야 합니다.', intent:'confirm_transfer', patterns:['understand','got it','which platform','thank you','change at'], answers:['Got it. Which platform do I need?','Okay, thank you.'], hint:'이해했음을 말하거나 플랫폼을 물어보세요.', feedback:'환승 안내까지 잘 확인했어요.' }
])

const directions = makeScenario('asking-directions','길 묻기','초급','박물관 길 묻기','목적지까지의 방향과 거리, 랜드마크를 확인해요.',[
  { tutor:'Hi there. Can I help you?', ko:'안녕하세요. 도와드릴까요?', intent:'ask_direction', patterns:['how do i get','looking for','where is','museum','station'], answers:['How do I get to the museum?','I’m looking for the nearest station.'], hint:'How do I get to …?를 사용하세요.', feedback:'목적지를 분명히 물었어요.', save:'direction-get' },
  { tutor:'Go straight for two blocks, then turn left.', ko:'두 블록 직진한 다음 왼쪽으로 도세요.', intent:'confirm_direction', patterns:['go straight','turn left','got it','two blocks','left after'], answers:['So I go straight and then turn left?','Got it. Two blocks, then left.'], hint:'들은 길을 짧게 다시 확인하세요.', feedback:'길 안내를 정확히 확인했어요.' },
  { tutor:'That’s right. It’s next to the library.', ko:'맞아요. 도서관 옆에 있어요.', intent:'ask_distance', patterns:['far from here','how long','can i walk','close'], answers:['Is it far from here?','How long does it take on foot?'], hint:'거리나 시간을 질문하세요.', feedback:'이동 거리를 자연스럽게 확인했어요.', save:'direction-far' },
  { tutor:'It’s about a ten-minute walk.', ko:'걸어서 약 10분이에요.', intent:'thank_direction', patterns:['thank you','thanks','very helpful','appreciate'], answers:['Thank you. That’s very helpful.','Thanks for your help!'], hint:'도움에 감사를 표현하세요.', feedback:'길 묻기 대화를 잘 마쳤어요.' }
])

const business = makeScenario('business-meeting','비즈니스','초중급','첫 업무 미팅','소개, 안건 확인, 질문과 후속 조치를 연습해요.',[
  { tutor:'Welcome, Jina. It’s good to finally meet you.', ko:'환영합니다, 지나 님. 드디어 만나 뵙네요.', intent:'business_greet', patterns:['great to meet','good to meet','nice to meet','thank you for'], answers:["It’s great to meet you too.","Thank you for having me."], hint:'격식 있는 첫인사를 건네세요.', feedback:'전문적이고 자연스러운 인사예요.', save:'business-meet' },
  { tutor:'Shall we start with the project timeline?', ko:'프로젝트 일정부터 시작할까요?', intent:'agree_agenda', patterns:['sounds good','yes let us','let’s start','works for me'], answers:['Yes, that sounds good.','Absolutely. Let’s start with the timeline.'], hint:'안건에 동의한다고 말하세요.', feedback:'회의 흐름에 자연스럽게 동의했어요.' },
  { tutor:'We plan to finish the first stage in May.', ko:'첫 단계를 5월에 마칠 계획입니다.', intent:'clarify', patterns:['clarify','do you mean','could you explain','what does'], answers:['Could you clarify what the first stage includes?','Do you mean the design stage?'], hint:'clarify 또는 Do you mean …?을 사용하세요.', feedback:'근거 있는 확인 질문을 했어요.', save:'business-clarify' },
  { tutor:'It includes research and design. I’ll send the details.', ko:'조사와 디자인이 포함됩니다. 세부 내용을 보내드릴게요.', intent:'follow_up', patterns:['follow up','send an email','thank you','look forward'], answers:["Thank you. I’ll follow up by email.","Great. I look forward to the details."], hint:'후속 조치나 감사로 마무리하세요.', feedback:'다음 행동을 분명히 정리했어요.', save:'business-follow' }
])

export const scenarios: ConversationScenario[] = [greeting,selfIntro,family,daily,cafe,restaurant,shopping,hotel,airport,transport,directions,business]
export const scenarioById = new Map(scenarios.map((scenario) => [scenario.id, scenario]))
