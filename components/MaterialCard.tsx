interface Props {
  material: {
    id: string; title: string; summary: string | null
    highlights: string[]; created_at: string
  }
}
export default function MaterialCard({ material }: Props) {
  return (
    <div className="bg-gray-800 rounded-2xl p-4 shadow-sm space-y-2">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📄</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate text-white">{material.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(material.created_at).toLocaleDateString('ko-KR')}
          </p>
        </div>
      </div>
      {material.summary && (
        <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">{material.summary}</p>
      )}
      {material.highlights?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {material.highlights.map((h, i) => (
            <span key={i} className="bg-blue-900/40 text-blue-400 text-xs px-2 py-0.5 rounded-full">{h}</span>
          ))}
        </div>
      )}
    </div>
  )
}
