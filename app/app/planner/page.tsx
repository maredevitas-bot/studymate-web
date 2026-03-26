'use client'
import { useState, useEffect } from 'react'
import { getPlanEntries, generatePlan, togglePlanEntry } from '@/actions/planner'

export default function PlannerPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [examDate, setExamDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { getPlanEntries().then(setEntries) }, [])

  const grouped = entries.reduce((acc: any, e: any) => {
    (acc[e.date] = acc[e.date] || []).push(e)
    return acc
  }, {})

  async function handleGenerate() {
    if (!examDate) { setError('시험일을 선택해주세요'); return }
    setLoading(true); setError('')
    const result = await generatePlan(new Date(examDate))
    if (result.error) { setError(result.error); setLoading(false); return }
    const updated = await getPlanEntries()
    setEntries(updated)
    setLoading(false)
  }

  async function handleToggle(id: string, completed: boolean) {
    await togglePlanEntry(id, !completed)
    setEntries(prev => prev.map(e => e.id === id ? {...e, completed: !completed} : e))
  }

  return (
    <div className="pt-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">플래너</h1>
      <div className="bg-gray-800 rounded-2xl p-4 shadow-sm space-y-3">
        <p className="font-medium text-sm text-white">AI 플래너 생성</p>
        <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded-xl text-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button onClick={handleGenerate} disabled={loading}
          className="w-full bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
          {loading ? 'AI가 계획 중...' : '플래너 생성'}
        </button>
      </div>

      {Object.keys(grouped).sort().map(date => (
        <div key={date} className="space-y-2">
          <p className="text-sm font-semibold text-gray-500">
            {new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', { month:'long', day:'numeric', weekday:'short' })}
          </p>
          {grouped[date].map((e: any) => (
            <div key={e.id} onClick={() => handleToggle(e.id, e.completed)}
              className={`bg-gray-800 rounded-xl p-4 shadow-sm flex items-start gap-3 cursor-pointer transition-opacity
                ${e.completed ? 'opacity-50' : ''}`}>
              <span className="text-lg">{e.completed ? '✅' : '⬜'}</span>
              <div>
                <p className="font-medium text-sm text-white">{e.subject_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{e.topic}</p>
              </div>
            </div>
          ))}
        </div>
      ))}

      {entries.length === 0 && !loading && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">📅</p>
          <p>시험일을 입력하고 플래너를 생성해보세요</p>
        </div>
      )}
    </div>
  )
}
