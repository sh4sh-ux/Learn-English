import { describe, expect, it, vi } from 'vitest'
import { scenarios } from '../data/scenarios'
import { ScenarioEngine, matchIntent, normalize } from './conversation'

describe('규칙 기반 대화 엔진',()=>{
  it('대소문자와 문장부호를 정규화한다',()=>expect(normalize("I'd LIKE a coffee, please!  ")).toBe("i'd like a coffee please"))
  it('다양한 주문 표현에서 의도를 찾는다',()=>{const node=scenarios.find(x=>x.id==='cafe-order')!.nodes[0];for(const answer of ["I'd like a coffee.",'Can I have a latte?','A cappuccino, please.'])expect(matchIntent(answer,node.acceptedIntents)?.intent).toBe('order_drink')})
  it('근거 없는 답변은 오답이 아닌 uncertain으로 처리한다',()=>{vi.stubGlobal('crypto',{randomUUID:()=> 'session-1'});const scenario=scenarios[0];const engine=new ScenarioEngine();const result=engine.sendMessage(engine.startSession(scenario),scenario,'Bananas fly quickly');expect(result.feedback.status).toBe('uncertain');expect(result.session.currentNodeId).toBe(scenario.startNodeId)})
  it('의도가 맞으면 다음 노드로 전환하고 표현을 저장한다',()=>{vi.stubGlobal('crypto',{randomUUID:()=> 'session-2'});const scenario=scenarios.find(x=>x.id==='cafe-order')!;const engine=new ScenarioEngine();const result=engine.sendMessage(engine.startSession(scenario),scenario,'Could I get a coffee, please?');expect(result.feedback.matchedIntent).toBe('order_drink');expect(result.session.currentNodeId).toBe('cafe-order-2');expect(result.session.savedExpressionIds).toContain('cafe-coffee')})
  it('답변 내용에 따라 다른 후속 질문으로 분기한다',()=>{vi.stubGlobal('crypto',{randomUUID:()=> 'session-branch'});const scenario=scenarios.find(x=>x.id==='self-intro')!;const engine=new ScenarioEngine();let session=engine.startSession(scenario);session=engine.sendMessage(session,scenario,"I'm Jisu").session;const result=engine.sendMessage(session,scenario,'I live in Seoul').session;expect(result.currentNodeId).toBe('self-intro-city-follow');expect(result.messages.at(-1)?.english).toBe('Do you like living there?')})
  it('마지막 턴 뒤 세션을 완료한다',()=>{vi.stubGlobal('crypto',{randomUUID:()=> 'session-3'});const scenario=scenarios[0];const engine=new ScenarioEngine();let session=engine.startSession(scenario);for(const answer of scenario.nodes.map(x=>x.suggestedAnswers[0]))session=engine.sendMessage(session,scenario,answer).session;expect(session.currentNodeId).toBeNull();expect(session.completedAt).toBeTruthy();expect(session.completedNodes).toHaveLength(4)})
})
