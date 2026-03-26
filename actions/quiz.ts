'use server'
import { createClient } from '@/lib/supabase/server'
import { GeminiClient } from '@/lib/ai/gemini'

export async function getSubjectMaterials(subjectId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('materials')
    .select('extracted_text, title').eq('subject_id', subjectId)
  return data ?? []
}

export async function generateAndSaveQuiz(
  subjectId: string, count: number, difficulty: string, combinedText: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다' }
  const { data: settings } = await supabase.from('user_settings')
    .select('gemini_api_key').eq('id', user.id).single()
  if (!settings?.gemini_api_key) return { error: 'API 키를 설정해주세요' }

  try {
    const ai = new GeminiClient(settings.gemini_api_key)
    const questions = await ai.generateQuiz(combinedText, count, difficulty)
    const { data: session } = await supabase.from('quiz_sessions').insert({
      subject_id: subjectId, questions,
    }).select().single()
    return { sessionId: session.id }
  } catch (e: any) {
    if (e.message?.includes('429')) return { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }
    return { error: e.message }
  }
}

export async function getQuizSession(sessionId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('quiz_sessions').select('*').eq('id', sessionId).single()
  return data
}

export async function saveQuizResult(sessionId: string, answers: any[], scorePercent: number) {
  const supabase = await createClient()
  const session = await getQuizSession(sessionId)
  if (!session) return { error: '세션을 찾을 수 없습니다' }
  const updatedQuestions = session.questions.map((q: any, i: number) => ({
    ...q, userAnswer: answers[i] ?? ''
  }))
  await supabase.from('quiz_sessions').update({
    questions: updatedQuestions,
    score_percent: scorePercent,
    completed_at: new Date().toISOString(),
  }).eq('id', sessionId)
}
