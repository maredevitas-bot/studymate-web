'use client'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { extractTextFromPDF } from '@/lib/pdf/extract'
import { analyzeAndSaveMaterial } from '@/actions/materials'

export default function NewMaterialPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<'idle'|'extracting'|'analyzing'|'done'>('idle')
  const [error, setError] = useState('')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) { setError('파일이 너무 큽니다 (최대 50MB)'); return }
    setError('')
    setStatus('extracting')
    try {
      const text = await extractTextFromPDF(file)
      if (!text.trim()) {
        setError('텍스트를 인식할 수 없는 PDF입니다.')
        setStatus('idle'); return
      }
      setStatus('analyzing')
      const result = await analyzeAndSaveMaterial(
        params.id, title || file.name.replace('.pdf',''), text, file.name
      )
      if (result?.error) { setError(result.error); setStatus('idle'); return }
      setStatus('done')
      router.push(`/subjects/${params.id}`)
    } catch (e: any) {
      setError(e.message)
      setStatus('idle')
    }
  }

  return (
    <div className="pt-8 space-y-6">
      <h1 className="text-xl font-bold text-white">자료 추가</h1>
      <div className="bg-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="자료 제목 (선택)"
          className="w-full px-3 py-2 border border-gray-600 rounded-xl text-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />

        <label className={`block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors
          ${status !== 'idle' ? 'border-blue-700 bg-blue-900/20' : 'border-gray-600 hover:border-blue-500'}`}>
          <input type="file" accept=".pdf" className="sr-only"
            onChange={handleFileChange} disabled={status !== 'idle'} />
          {status === 'idle' && <><p className="text-4xl mb-2">📄</p><p className="text-sm text-gray-400">PDF 파일 선택</p></>}
          {status === 'extracting' && <><p className="text-4xl mb-2 animate-pulse">📄</p><p className="text-sm text-blue-500">텍스트 추출 중...</p></>}
          {status === 'analyzing' && <><p className="text-4xl mb-2 animate-pulse">🤖</p><p className="text-sm text-blue-500">AI 분석 중...</p></>}
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  )
}
