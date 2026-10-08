import { describe, expect, it } from 'vitest'
import { expressions } from './expressions'
import { scenarios } from './scenarios'
import { learningPath, unifiedContentIndex } from './learningPath'
import { foundationCurriculum, consolidationDays } from './curriculum'
import { speakingTrainingSteps } from './speaking'

describe('MVP 학습 콘텐츠',()=>{
  it('실제 표현을 최소 30개 제공한다',()=>{expect(expressions.length).toBeGreaterThanOrEqual(30);expect(new Set(expressions.map(x=>x.id)).size).toBe(expressions.length);for(const item of expressions){expect(item.english.length).toBeGreaterThan(5);expect(item.korean.length).toBeGreaterThan(3);expect(item.example).not.toBe(item.english)}})
  it('요구된 12개 회화 카테고리를 지원한다',()=>{const required=['인사','자기소개','가족','일상','카페','식당','쇼핑','호텔','공항','교통','길 묻기','비즈니스'];expect(new Set(scenarios.map(x=>x.category))).toEqual(new Set(required))})
  it('각 시나리오는 최소 4턴과 여러 예시 답변을 가진다',()=>{expect(scenarios.length).toBeGreaterThanOrEqual(10);for(const scenario of scenarios){expect(scenario.nodes.length).toBeGreaterThanOrEqual(4);for(const node of scenario.nodes){expect(node.suggestedAnswers.length).toBeGreaterThanOrEqual(2);expect(node.acceptedIntents[0].patterns.length).toBeGreaterThanOrEqual(3)}}})
  it('A0부터 C1까지 일반·TOEFL 통합 학습 경로를 정의한다',()=>{expect(learningPath.map(x=>x.cefrRange.join('-'))).toEqual(['A0','A1','A2','B1','B2','C1']);expect(learningPath.at(-1)?.mode).toBe('toefl');for(const stage of learningPath){expect(new Set(stage.skills)).toEqual(new Set(['reading','listening','speaking','writing']));expect(stage.grammarFocus.length).toBeGreaterThan(0);expect(stage.expressionGoals.length).toBeGreaterThan(0);expect(stage.exitAssessment.length).toBeGreaterThan(10)}})
  it('현재 콘텐츠를 동일한 복습 가능한 인덱스로 통합한다',()=>{expect(unifiedContentIndex).toHaveLength(expressions.length+scenarios.length);expect(unifiedContentIndex.every(x=>x.source==='naro-original')).toBe(true);expect(unifiedContentIndex.filter(x=>x.kind==='expression').every(x=>x.reviewable)).toBe(true)})
  it('12주와 90일 마무리 과정을 구분하고 완료 범위를 표시한다',()=>{expect(foundationCurriculum).toHaveLength(12);expect(foundationCurriculum.every(week=>week.days.length===7)).toBe(true);expect(foundationCurriculum.filter(week=>week.status==='available').map(week=>week.week)).toEqual([1,2]);expect(consolidationDays).toHaveLength(6)})
  it('말하기 훈련을 Listen, Repeat, Recall, Respond 결과로 분리한다',()=>{expect(speakingTrainingSteps.map(step=>step.label)).toEqual(['Listen','Repeat','Recall','Respond']);expect(new Set(speakingTrainingSteps.map(step=>step.activityType)).size).toBe(4)})
})
