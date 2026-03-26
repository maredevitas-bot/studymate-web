import { createClient } from '@/lib/supabase/server'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: subjects } = await supabase.from('subjects').select('id, name, color_hex')
  const { data: sessions } = await supabase.from('quiz_sessions')
    .select('subject_id, score_percent').not('score_percent', 'is', null)
  const { data: entries } = await supabase.from('plan_entries').select('completed')

  if (!subjects?.length) {
    return (
      <div className="pt-8 text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📊</p>
        <p>과목을 추가하고 퀴즈를 풀어보세요</p>
      </div>
    )
  }

  // 과목별 평균 점수
  const subjectStats = subjects.map(s => {
    const subjectSessions = sessions?.filter(q => q.subject_id === s.id) ?? []
    const avg = subjectSessions.length
      ? subjectSessions.reduce((a, b) => a + (b.score_percent ?? 0), 0) / subjectSessions.length
      : null
    return { ...s, avg, count: subjectSessions.length }
  }).filter(s => s.avg !== null).sort((a, b) => (a.avg ?? 0) - (b.avg ?? 0))

  // 완료율
  const totalEntries = entries?.length ?? 0
  const completedEntries = entries?.filter(e => e.completed).length ?? 0
  const completionRate = totalEntries > 0 ? Math.round(completedEntries / totalEntries * 100) : null

  const maxScore = Math.max(...subjectStats.map(s => s.avg ?? 0), 1)

  return (
    <div className="pt-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">분석</h1>

      {subjectStats.length === 0 ? (
        <div className="bg-gray-800 rounded-2xl p-8 shadow-sm text-center text-gray-400">
          <p className="text-3xl mb-2">🎯</p>
          <p className="text-sm">퀴즈를 먼저 풀어보세요</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-white">과목별 평균 점수</h2>
          {subjectStats.map(s => (
            <div key={s.id} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className={s.avg! < 70 ? 'text-red-400 font-medium' : 'text-gray-200'}>{s.name}</span>
                <span className={s.avg! < 70 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
                  {Math.round(s.avg!)}점
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${(s.avg! / maxScore) * 100}%`,
                    backgroundColor: s.avg! < 70 ? '#EF4444' : s.color_hex
                  }} />
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400">* 70점 미만은 약점 과목으로 표시</p>
        </div>
      )}

      {completionRate !== null && (
        <div className="bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold mb-4 text-white">플래너 완료율</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#374151" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3B82F6" strokeWidth="3"
                  strokeDasharray={`${completionRate} ${100 - completionRate}`}
                  strokeDashoffset="0" strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                {completionRate}%
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {totalEntries}개 중 {completedEntries}개 완료
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
