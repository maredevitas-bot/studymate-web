'use server'
import { createClient } from '@/lib/supabase/server'
import { GeminiClient } from '@/lib/ai/gemini'
import { revalidatePath } from 'next/cache'

export async function getSettings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('user_settings').select('*').eq('id', user.id).single()
  return data
}

export async function saveSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다' }

  const apiKey = formData.get('gemini_api_key') as string

  // API 키 유효성 검증
  if (apiKey) {
    try {
      const ai = new GeminiClient(apiKey)
      await ai.summarizeText('테스트')
    } catch (e: any) {
      if (e.message?.includes('400') || e.message?.includes('401') || e.message?.includes('403')) {
        return { error: '유효하지 않은 API 키입니다.' }
      }
    }
  }

  const { error } = await supabase.from('user_settings').upsert({
    id: user.id,
    gemini_api_key: apiKey || null,
    school_name: formData.get('school_name') as string || null,
    grade: formData.get('grade') as string || null,
    exam_date: formData.get('exam_date') as string || null,
  })
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}
