import Link from 'next/link'

interface Props {
  subject: { id: string; name: string; teacher: string; color_hex: string }
}

export default function SubjectCard({ subject }: Props) {
  return (
    <Link href={`/app/subjects/${subject.id}`}>
      <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-95 transition-transform">
        <div className="w-12 h-12 rounded-xl flex-shrink-0"
          style={{ backgroundColor: subject.color_hex + '33' }}>
          <div className="w-full h-full rounded-xl flex items-center justify-center text-2xl">📖</div>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{subject.name}</p>
          <p className="text-sm text-gray-500">{subject.teacher} 선생님</p>
        </div>
        <span className="ml-auto text-gray-300">›</span>
      </div>
    </Link>
  )
}
