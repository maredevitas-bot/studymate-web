'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter, useParams } from 'next/navigation'
import { getQuizSession, saveQuizResult } from '@/actions/quiz'

function QuizResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const sessionId = searchParams.get('session') ?? ''
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [score, setScore] = useState(70)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getQuizSession(sessionId).then(s => {
      if (s) {
        setQuestions([...s.questions].sort((a: any, b: any) => a.displayOrder - b.displayOrder))
        if (s.score_percent != null) setSaved(true)
      }
    })
    const stored = sessionStorage.getItem(`quiz_answers_${sessionId}`)
    if (stored) setAnswers(JSON.parse(stored))
  }, [sessionId])

  async function handleSave() {
    await saveQuizResult(sessionId, answers, score)
    setSaved(true)
    router.push(`/app/subjects/${params.id}`)
  }

  return (
    <div className="pt-8 space-y-6">
      <h1 className="text-xl font-bold">퀴즈 결과</h1>
      {questions.map((q, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <p className="font-medium">{q.body}</p>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">내 답변</p>
            <p className="text-sm bg-gray-50 p-3 rounded-xl">{answers[i] || '(미입력)'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-blue-400">모범 답안</p>
            <p className="text-sm bg-blue-50 p-3 rounded-xl">{q.modelAnswer}</p>
          </div>
          <p className="text-xs text-gray-400">{q.scoringCriteria}</p>
        </div>
      ))}
      {!saved && (
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <p className="font-medium">자기 채점</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">점수</span>
              <span className="font-bold text-blue-500">{score}점</span>
            </div>
            <input type="range" min={0} max={100} step={5} value={score}
              onChange={e => setScore(Number(e.target.value))}
              className="w-full accent-blue-500" />
          </div>
          <button onClick={handleSave}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium">
            저장
          </button>
        </div>
      )}
    </div>
  )
}

export default function QuizResultPage() {
  return (
    <Suspense fallback={<div className="pt-8 text-center text-gray-400">불러오는 중...</div>}>
      <QuizResultContent />
    </Suspense>
  )
}
