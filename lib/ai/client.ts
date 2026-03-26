export interface AnalysisResult {
  summary: string
  highlights: string[]
}

export interface GeneratedQuestion {
  displayOrder: number
  body: string
  modelAnswer: string
  scoringCriteria: string
}

export interface SubjectInfo {
  name: string
  avgScore: number | null
  materialCount: number
}

export interface PlanEntryDraft {
  date: string        // yyyy-MM-dd
  subjectName: string
  topic: string
}

export interface AIClient {
  summarizeText(text: string): Promise<AnalysisResult>
  generateQuiz(text: string, count: number, difficulty: string): Promise<GeneratedQuestion[]>
  generateStudyPlan(subjects: SubjectInfo[], examDate: Date): Promise<PlanEntryDraft[]>
}
