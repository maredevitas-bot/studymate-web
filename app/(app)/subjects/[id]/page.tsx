import Link from 'next/link'
import { getSubjectWithMaterials } from '@/actions/materials'
import MaterialCard from '@/components/MaterialCard'

export default async function SubjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const subject = await getSubjectWithMaterials(id)
  if (!subject) return <div className="pt-8">과목을 찾을 수 없습니다.</div>

  const materials = subject.materials?.sort((a: any, b: any) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) ?? []
  const sessions = subject.quiz_sessions?.sort((a: any, b: any) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) ?? []

  return (
    <div className="pt-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/app/subjects" className="text-gray-400">‹</Link>
        <div>
          <h1 className="text-xl font-bold">{subject.name}</h1>
          <p className="text-sm text-gray-500">{subject.teacher} 선생님</p>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">자료 ({materials.length})</h2>
          <Link href={`/app/subjects/${subject.id}/material/new`}
            className="text-sm text-blue-500">+ 추가</Link>
        </div>
        {materials.map((m: any) => <MaterialCard key={m.id} material={m} />)}
        {materials.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">자료를 추가해보세요</p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">퀴즈</h2>
          {materials.length > 0 && (
            <Link href={`/app/subjects/${subject.id}/quiz/setup`}
              className="text-sm text-blue-500">+ 시작</Link>
          )}
        </div>
        {sessions.slice(0, 5).map((s: any) => (
          <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {s.completed_at ? new Date(s.completed_at).toLocaleDateString('ko-KR') : '미완료'}
            </span>
            {s.score_percent != null && (
              <span className={`font-bold ${s.score_percent < 70 ? 'text-red-500' : 'text-green-500'}`}>
                {Math.round(s.score_percent)}점
              </span>
            )}
          </div>
        ))}
      </section>
    </div>
  )
}
