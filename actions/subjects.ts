'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSubjects() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await supabase.from('subjects')
    .select('*').order('created_at', { ascending: false })
  return data ?? []
}

export async function createSubject(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('로그인이 필요합니다')
  const { error } = await supabase.from('subjects').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    teacher: formData.get('teacher') as string,
    color_hex: formData.get('color_hex') as string || '#4A90D9',
  })
  if (error) throw new Error(error.message)
  revalidatePath('/subjects')
}

export async function deleteSubject(id: string) {
  const supabase = await createClient()
  await supabase.from('subjects').delete().eq('id', id)
  revalidatePath('/subjects')
}
