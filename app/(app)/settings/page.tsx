'use client'
import { useState, useEffect } from 'react'
import { getSettings, saveSettings } from '@/actions/settings'
import { signOut } from '@/actions/auth'

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [status, setStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => { getSettings().then(s => { setSettings(s); setLoaded(true) }) }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('saving'); setError('')
    const result = await saveSettings(new FormData(e.currentTarget))
    if (result?.error) { setError(result.error); setStatus('error') }
    else setStatus('saved')
    setTimeout(() => setStatus('idle'), 2000)
  }

  if (!loaded) return <div className="pt-8 text-center text-gray-400">불러오는 중...</div>

  return (
    <div className="pt-8 space-y-6">
      <h1 className="text-2xl font-bold">설정</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold">AI 설정</h2>
          <div className="space-y-1">
            <label className="text-sm text-gray-500">Gemini API 키</label>
            <input name="gemini_api_key" type="password"
              defaultValue={settings?.gemini_api_key ?? ''}
              placeholder="AIza..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-gray-400">
              aistudio.google.com에서 무료로 발급 가능
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold">학교 정보</h2>
          <input name="school_name" defaultValue={settings?.school_name ?? ''}
            placeholder="학교 이름"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input name="grade" defaultValue={settings?.grade ?? ''}
            placeholder="학년 (예: 2학년)"
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="space-y-1">
            <label className="text-sm text-gray-500">시험일</label>
            <input name="exam_date" type="date" defaultValue={settings?.exam_date ?? ''}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={status === 'saving'}
          className={`w-full py-3 rounded-xl font-medium transition-colors
            ${status === 'saved' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'}
            disabled:opacity-50`}>
          {status === 'saving' ? '저장 중...' : status === 'saved' ? '저장됨 ✓' : '저장'}
        </button>
      </form>

      <button onClick={() => signOut()}
        className="w-full py-3 rounded-xl font-medium text-red-500 bg-white shadow-sm">
        로그아웃
      </button>
    </div>
  )
}
