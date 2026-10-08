import type { ConversationEngine, ConversationFeedback, ConversationNode, ConversationScenario, ConversationSession, IntentPattern } from '../types'

const fillers = new Set(['a','an','the','please','really','very','just','well','um','uh'])

export function normalize(text: string): string {
  return text.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9'\s-]/g, ' ').replace(/\s+/g, ' ').trim()
}

function tokens(text: string): Set<string> {
  return new Set(normalize(text).split(' ').filter((word) => word && !fillers.has(word)))
}

function phraseScore(input: string, phrase: string): number {
  const normalizedInput = normalize(input)
  const normalizedPhrase = normalize(phrase)
  if (normalizedInput.includes(normalizedPhrase)) return 1
  const inputTokens = tokens(input)
  const phraseTokens = tokens(phrase)
  if (!phraseTokens.size) return 0
  const overlap = [...phraseTokens].filter((token) => inputTokens.has(token)).length
  return overlap / phraseTokens.size
}

export function matchIntent(input: string, patterns: IntentPattern[]): { intent: string; score: number } | null {
  const normalized = normalize(input)
  if (normalized.length < 2) return null
  let best: { intent: string; score: number } | null = null
  for (const candidate of patterns) {
    const slotValid = !candidate.requiredSlots || Object.values(candidate.requiredSlots).every((values) => values.some((value) => normalized.includes(normalize(value))))
    if (!slotValid) continue
    const score = Math.max(...candidate.patterns.map((pattern) => phraseScore(normalized, pattern)))
    if (!best || score > best.score) best = { intent: candidate.intent, score }
  }
  return best && best.score >= 0.5 ? best : null
}

export function findNode(scenario: ConversationScenario, nodeId: string | null): ConversationNode | undefined {
  return nodeId ? scenario.nodes.find((node) => node.id === nodeId) : undefined
}

export class ScenarioEngine implements ConversationEngine {
  startSession(scenario: ConversationScenario): ConversationSession {
    const node = findNode(scenario, scenario.startNodeId)
    return {
      id: crypto.randomUUID(), scenarioId: scenario.id, startedAt: new Date().toISOString(), currentNodeId: scenario.startNodeId,
      completedNodes: [], savedExpressionIds: [], messages: node ? [{ role:'tutor', english:node.tutorEnglish, korean:node.tutorKorean }] : []
    }
  }

  sendMessage(session: ConversationSession, scenario: ConversationScenario, message: string): { session: ConversationSession; feedback: ConversationFeedback } {
    const node = findNode(scenario, session.currentNodeId)
    if (!node) throw new Error('현재 대화 단계를 찾을 수 없습니다.')
    const matched = matchIntent(message, node.acceptedIntents)
    if (!matched) {
      return {
        session: { ...session, messages: [...session.messages, { role:'user', english:message }] },
        feedback: { status:'uncertain', recognizedText:message, matchedIntent:null, message:'표현을 확인하지 못했어요. 다시 말하거나 예시 답변을 확인해 주세요.', nextNodeId:session.currentNodeId }
      }
    }
    const transition = node.transitions.find((item) => item.intent === matched.intent) ?? node.transitions[0]
    const nextNode = findNode(scenario, transition.nextNodeId)
    const savedExpressionIds = transition.saveExpressionId && !session.savedExpressionIds.includes(transition.saveExpressionId)
      ? [...session.savedExpressionIds, transition.saveExpressionId] : session.savedExpressionIds
    const updated: ConversationSession = {
      ...session,
      currentNodeId: transition.nextNodeId,
      completedAt: transition.nextNodeId ? undefined : new Date().toISOString(),
      completedNodes: [...session.completedNodes, node.id],
      savedExpressionIds,
      messages: [
        ...session.messages,
        { role:'user', english:message },
        ...(nextNode ? [{ role:'tutor' as const, english:nextNode.tutorEnglish, korean:nextNode.tutorKorean }] : [])
      ]
    }
    return { session:updated, feedback:{ status:'matched', recognizedText:message, matchedIntent:matched.intent, message:transition.feedback, naturalAlternative:transition.naturalAlternative, politeAlternative:transition.politeAlternative, nextNodeId:transition.nextNodeId, saveExpressionId:transition.saveExpressionId } }
  }

  getFeedback(session: ConversationSession): string {
    return session.currentNodeId ? `${session.completedNodes.length}개 대화 단계를 완료했어요.` : `대화 ${session.completedNodes.length}단계를 모두 완료했어요.`
  }

  endSession(session: ConversationSession): ConversationSession {
    return { ...session, currentNodeId:null, completedAt:new Date().toISOString() }
  }
}

export interface OptionalLocalAIEngine extends ConversationEngine {
  readonly supported: boolean
  readonly modelInfo?: { name: string; downloadSize: number; license: string }
}
