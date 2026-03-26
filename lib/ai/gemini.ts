import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIClient, AnalysisResult, GeneratedQuestion, SubjectInfo, PlanEntryDraft } from './client'

export class GeminiClient implements AIClient {
  private model

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey)
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  }

  private async callGemini(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt)
    return result.response.text()
  }

  private parseJSON<T>(text: string): T {
    const cleaned = text
      .replace(/```json\s*/g, '')
      .replace(/```/g, '')
      .trim()
    return JSON.parse(cleaned)
  }

  async summarizeText(text: string): Promise<AnalysisResult> {
    const prompt = `다음 수업 자료를 분석해 요약과 핵심 키워드만 JSON으로 응답해주세요 (마크다운 없이):
{"summary": "3~5문장 요약", "highlights": ["키워드1","키워드2","키워드3","키워드4","키워드5"]}

자료:
${text.slice(0, 2000)}`
    const response = await this.callGemini(prompt)
    return this.parseJSON<AnalysisResult>(response)
  }

  async generateQuiz(text: string, count: number, difficulty: string): Promise<GeneratedQuestion[]> {
    const prompt = `다음 수업 내용으로 ${count}개의 서술형 문제를 만들어주세요.
난이도: ${difficulty} / 언어: 한국어
JSON 배열로만 응답 (마크다운 없이):
[{"displayOrder":1,"body":"문제","modelAnswer":"모범답안","scoringCriteria":"채점기준"}]

수업 내용:
${text.slice(0, 3000)}`
    const response = await this.callGemini(prompt)
    return this.parseJSON<GeneratedQuestion[]>(response)
  }

  async generateStudyPlan(subjects: SubjectInfo[], examDate: Date): Promise<PlanEntryDraft[]> {
    const today = new Date().toISOString().split('T')[0]
    const exam = examDate.toISOString().split('T')[0]
    const info = subjects.map(s =>
      `- ${s.name}: 평균점수 ${s.avgScore ?? '없음'}, 자료 ${s.materialCount}개`
    ).join('\n')
    const prompt = `오늘(${today})부터 시험일(${exam})까지 복습 일정을 만들어주세요.
취약 과목(점수 낮음) 우선 배치, 주말 제외.
JSON 배열로만 응답:
[{"date":"yyyy-MM-dd","subjectName":"과목명","topic":"복습내용"}]

과목 현황:
${info}`
    const response = await this.callGemini(prompt)
    return this.parseJSON<PlanEntryDraft[]>(response)
  }
}
