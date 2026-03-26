'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,200,150,0.06) 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base" style={{ background: 'var(--accent-emerald)', color: '#080810' }}>G</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700 }}>GolfGives</span>
          </Link>
        </div>

        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>Welcome back</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-7">Sign in to your account</p>

          {error && (
            <div className="mb-5 p-3 rounded-lg text-sm" style={{ background: 'rgba(255,77,109,0.1)', color: 'var(--accent-rose)', border: '1px solid rgba(255,77,109,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder="you@example.com"
                onFocus={(e) => (e.target.style.borderColor = 'rgba(0,200,150,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                placeholder="••••••••"
                onFocus={(e) => (e.target.style.borderColor = 'rgba(0,200,150,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all btn-glow disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ background: 'var(--accent-emerald)', color: '#080810' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            No account?{' '}
            <Link href="/auth/signup" className="text-[var(--accent-emerald)] hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
