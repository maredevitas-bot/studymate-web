import { getSubjects, createSubject } from '@/actions/subjects'
import SubjectCard from '@/components/SubjectCard'

const COLORS = ['#4A90D9','#E74C3C','#2ECC71','#F39C12','#9B59B6','#1ABC9C']

export default async function SubjectsPage() {
  const subjects = await getSubjects()

  return (
    <div className="pt-8 space-y-4">
      <h1 className="text-2xl font-bold text-white">과목</h1>

      <div className="space-y-3">
        {subjects.map(s => <SubjectCard key={s.id} subject={s} />)}
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📚</p>
          <p className="font-medium">아직 과목이 없어요</p>
          <p className="text-sm mt-1">아래에서 과목을 추가해보세요</p>
        </div>
      )}

      <details className="bg-gray-800 rounded-2xl shadow-sm">
        <summary className="p-4 cursor-pointer font-medium text-blue-400 list-none">
          + 과목 추가
        </summary>
        <form action={createSubject} className="p-4 pt-0 space-y-3">
          <input name="name" placeholder="과목명 (예: 수학)" required
            className="w-full px-3 py-2 border border-gray-600 rounded-xl text-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input name="teacher" placeholder="선생님 이름" required
            className="w-full px-3 py-2 border border-gray-600 rounded-xl text-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-2">
            {COLORS.map(c => (
              <label key={c} className="cursor-pointer">
                <input type="radio" name="color_hex" value={c} className="sr-only" />
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: c }} />
              </label>
            ))}
          </div>
          <button type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-xl text-sm font-medium">
            추가
          </button>
        </form>
      </details>
    </div>
  )
}
