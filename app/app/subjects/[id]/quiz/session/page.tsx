'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { getQuizSession } from '@/actions/quiz'

function QuizSessionContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const sessionId = searchParams.get('session') ?? ''
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    getQuizSession(sessionId).then(s => {
      if (s) {
        const sorted = [...s.questions].sort((a: any, b: any) => a.displayOrder - b.displayOrder)
        setQuestions(sorted)
        setAnswers(new Array(sorted.length).fill(''))
      }
    })
  }, [sessionId])

  function next() {
    if (current < questions.length - 1) setCurrent(c => c + 1)
    else {
      sessionStorage.setItem(`quiz_answers_${sessionId}`, JSON.stringify(answers))
      router.push(`/app/subjects/${params.id}/quiz/result?session=${sessionId}`)
    }
  }

  if (!questions.length) return <div className="pt-8 text-center text-gray-500">불러오는 중...</div>
  const q = questions[current]

  return (
    <div className="pt-8 space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">{current + 1} / {questions.length}</p>
        <div className="h-1.5 flex-1 mx-4 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
      </div>
      <div className="bg-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <p className="font-medium leading-relaxed text-white">{q.body}</p>
        <textarea
          value={answers[current]}
          onChange={e => setAnswers(a => { const n = [...a]; n[current] = e.target.value; return n })}
          placeholder="답변을 입력하세요..."
          rows={5}
          className="w-full px-3 py-2 border border-gray-600 rounded-xl text-sm bg-gray-700 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <button onClick={next}
        className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium">
        {current < questions.length - 1 ? '다음' : '제출'}
      </button>
    </div>
  )
}

export default function QuizSessionPage() {
  return (
    <Suspense fallback={<div className="pt-8 text-center text-gray-500">불러오는 중...</div>}>
      <QuizSessionContent />
    </Suspense>
  )
}
