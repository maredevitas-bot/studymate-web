'use client'
import { useState } from 'react'
import { signIn, signUp } from '@/actions/auth'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const result = mode === 'login' ? await signIn(fd) : await signUp(fd)
    if (result?.error) setError(result.error)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2 text-white">StudyMate</h1>
        <p className="text-gray-400 text-center text-sm mb-8">AI 기반 학습 도우미</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" type="email" placeholder="이메일" required
            className="w-full px-4 py-3 border border-gray-600 rounded-xl text-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input name="password" type="password" placeholder="비밀번호 (6자 이상)" required minLength={6}
            className="w-full px-4 py-3 border border-gray-600 rounded-xl text-sm bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium text-sm hover:bg-blue-600 transition-colors">
            {mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>
        <button onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError('') }}
          className="w-full text-center text-sm text-gray-400 mt-4 hover:text-blue-400">
          {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
        </button>
      </div>
    </div>
  )
}
