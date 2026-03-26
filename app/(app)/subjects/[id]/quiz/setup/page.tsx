'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getSubjectMaterials, generateAndSaveQuiz } from '@/actions/quiz'

export default function QuizSetupPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [count, setCount] = useState(3)
  const [difficulty, setDifficulty] = useState('보통')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function start() {
    setLoading(true); setError('')
    const materials = await getSubjectMaterials(params.id)
    const text = materials.map((m: any) => m.extracted_text).filter(Boolean).join('\n\n').slice(0, 3000)
    const result = await generateAndSaveQuiz(params.id, count, difficulty, text)
    if (result.error) { setError(result.error); setLoading(false); return }
    router.push(`/app/subjects/${params.id}/quiz/session?session=${result.sessionId}`)
  }

  return (
    <div className="pt-8 space-y-6">
      <h1 className="text-xl font-bold">퀴즈 설정</h1>
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <p className="font-medium mb-3">문제 수</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setCount(c => Math.max(1, c-1))}
              className="w-10 h-10 rounded-full bg-gray-100 font-bold text-xl">−</button>
            <span className="text-2xl font-bold w-8 text-center">{count}</span>
            <button onClick={() => setCount(c => Math.min(5, c+1))}
              className="w-10 h-10 rounded-full bg-gray-100 font-bold text-xl">+</button>
          </div>
        </div>
        <div>
          <p className="font-medium mb-3">난이도</p>
          <div className="flex gap-2">
            {['쉬움','보통','어려움'].map(d => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors
                  ${difficulty === d ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button onClick={start} disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium disabled:opacity-50">
          {loading ? 'AI가 문제를 만드는 중...' : '퀴즈 시작'}
        </button>
      </div>
    </div>
  )
}
