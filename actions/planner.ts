'use server'
import { createClient } from '@/lib/supabase/server'
import { GeminiClient } from '@/lib/ai/gemini'
import { revalidatePath } from 'next/cache'

export async function getPlanEntries() {
  const supabase = await createClient()
  const { data } = await supabase.from('plan_entries')
    .select('*').order('date').order('created_at')
  return data ?? []
}

export async function generatePlan(examDate: Date) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다' }
  const { data: settings } = await supabase.from('user_settings')
    .select('gemini_api_key').eq('id', user.id).single()
  if (!settings?.gemini_api_key) return { error: 'API 키를 설정해주세요' }

  const { data: subjects } = await supabase.from('subjects').select('id, name')
  const subjectInfos = await Promise.all((subjects ?? []).map(async (s: any) => {
    const { data: sessions } = await supabase.from('quiz_sessions')
      .select('score_percent').eq('subject_id', s.id).not('score_percent', 'is', null)
    const { count } = await supabase.from('materials')
      .select('*', { count: 'exact', head: true }).eq('subject_id', s.id)
    const scores = sessions?.map((s: any) => s.score_percent) ?? []
    const avgScore = scores.length ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : null
    return { name: s.name, avgScore, materialCount: count ?? 0 }
  }))

  try {
    const ai = new GeminiClient(settings.gemini_api_key)
    const entries = await ai.generateStudyPlan(subjectInfos, examDate)
    const toInsert = entries.map((e: any) => ({ user_id: user.id, subject_name: e.subjectName, topic: e.topic, date: e.date }))
    await supabase.from('plan_entries').delete().eq('user_id', user.id)
    await supabase.from('plan_entries').insert(toInsert)
    revalidatePath('/planner')
    return { count: entries.length }
  } catch (e: any) {
    if (e.message?.includes('429')) return { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }
    return { error: e.message }
  }
}

export async function togglePlanEntry(id: string, completed: boolean) {
  const supabase = await createClient()
  await supabase.from('plan_entries').update({ completed }).eq('id', id)
  revalidatePath('/planner')
}
