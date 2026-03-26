'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { GeminiClient } from '@/lib/ai/gemini'

async function getApiKey(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase.from('user_settings')
    .select('gemini_api_key').eq('id', userId).single()
  return data?.gemini_api_key ?? null
}

export async function getSubjectWithMaterials(subjectId: string) {
  const supabase = await createClient()
  const { data: subject } = await supabase.from('subjects')
    .select('*, materials(*), quiz_sessions(*)')
    .eq('id', subjectId).single()
  return subject
}

export async function analyzeAndSaveMaterial(
  subjectId: string,
  title: string,
  extractedText: string,
  fileName: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다' }

  if (!extractedText.trim()) {
    return { error: '텍스트를 인식할 수 없는 PDF입니다. 텍스트 기반 PDF를 사용해주세요.' }
  }

  const apiKey = await getApiKey(supabase, user.id)
  if (!apiKey) return { error: 'Gemini API 키를 설정 탭에서 먼저 입력해주세요.' }

  try {
    const ai = new GeminiClient(apiKey)
    const analysis = await ai.summarizeText(extractedText)
    const { data: material, error } = await supabase.from('materials').insert({
      subject_id: subjectId,
      title: title || fileName,
      extracted_text: extractedText,
      summary: analysis.summary,
      highlights: analysis.highlights,
    }).select().single()
    if (error) return { error: error.message }
    revalidatePath(`/app/subjects/${subjectId}`)
    return { material }
  } catch (e: any) {
    if (e.message?.includes('429')) return { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }
    return { error: e.message }
  }
}

export async function deleteMaterial(id: string, subjectId: string) {
  const supabase = await createClient()
  await supabase.from('materials').delete().eq('id', id)
  revalidatePath(`/app/subjects/${subjectId}`)
}
