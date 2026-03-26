'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Charity {
  id: string
  name: string
  description: string
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultPlan = searchParams.get('plan') === 'yearly' ? 'yearly' : 'monthly'

  const [step, setStep] = useState(1) // 1: account, 2: plan, 3: charity
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [plan, setPlan] = useState(defaultPlan)
  const [charityId, setCharityId] = useState('')
  const [charityPercent, setCharityPercent] = useState(10)
  const [charities, setCharities] = useState<Charity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    createClient()
      .from('charities')
      .select('id,name,description')
      .eq('is_active', true)
      .then(({ data }) => setCharities(data || []))
  }, [])

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setStep(2)
    setError('')
  }

  const handleFinalSubmit = async () => {
    if (!charityId) { setError('Please select a charity'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (signUpError || !authData.user) {
      setError(signUpError?.message || 'Signup failed')
      setLoading(false)
      return
    }

    // Save charity selection
    await supabase.from('user_charities').upsert({
      user_id: authData.user.id,
      charity_id: charityId,
      contribution_percentage: charityPercent,
    })

    // Redirect to subscription checkout
    const res = await fetch('/api/subscriptions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, userId: authData.user.id }),
    })
    const { url, error: checkoutError } = await res.json()
    if (checkoutError) { setError(checkoutError); setLoading(false); return }
    window.location.href = url
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,200,150,0.06) 0%, transparent 70%)' }} />

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base" style={{ background: 'var(--accent-emerald)', color: '#080810' }}>G</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700 }}>GolfGives</span>
          </Link>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: s <= step ? 'var(--accent-emerald)' : 'var(--bg-elevated)',
                  color: s <= step ? '#080810' : 'var(--text-muted)',
                  border: s === step ? '2px solid var(--accent-emerald)' : '1px solid var(--border)',
                }}
              >
                {s}
              </div>
              {s < 3 && <div className="w-10 h-px" style={{ background: s < step ? 'var(--accent-emerald)' : 'var(--border)' }} />}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8">
          {error && (
            <div className="mb-5 p-3 rounded-lg text-sm" style={{ background: 'rgba(255,77,109,0.1)', color: 'var(--accent-rose)', border: '1px solid rgba(255,77,109,0.2)' }}>
              {error}
            </div>
          )}

          {/* Step 1: Account */}
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>Create your account</h1>
              <p className="text-sm text-[var(--text-secondary)] mb-7">Start your journey in 3 quick steps</p>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputClass} style={inputStyle} placeholder="Your name"
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(0,200,150,0.4)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} style={inputStyle} placeholder="you@example.com"
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(0,200,150,0.4)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} style={inputStyle} placeholder="Min. 8 characters"
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(0,200,150,0.4)')} onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl font-semibold text-sm mt-2 btn-glow" style={{ background: 'var(--accent-emerald)', color: '#080810' }}>
                  Continue →
                </button>
              </form>
              <p className="text-center text-sm text-[var(--text-muted)] mt-5">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-[var(--accent-emerald)] hover:underline">Sign in</Link>
              </p>
            </>
          )}

          {/* Step 2: Plan selection */}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>Choose your plan</h1>
              <p className="text-sm text-[var(--text-secondary)] mb-7">You can change this anytime</p>
              <div className="space-y-3 mb-6">
                {[
                  { id: 'monthly', label: 'Monthly', price: '£14.99 / month', sub: 'Cancel anytime', badge: null },
                  { id: 'yearly', label: 'Yearly', price: '£149.90 / year', sub: '£12.49/mo · Save 17%', badge: 'BEST VALUE' },
                ].map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setPlan(p.id)}
                    className="rounded-xl p-5 cursor-pointer transition-all relative"
                    style={{
                      border: plan === p.id ? '2px solid var(--accent-emerald)' : '1px solid var(--border)',
                      background: plan === p.id ? 'rgba(0,200,150,0.06)' : 'var(--bg-elevated)',
                    }}
                  >
                    {p.badge && (
                      <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--accent-gold)', color: '#080810' }}>{p.badge}</span>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all" style={{ borderColor: plan === p.id ? 'var(--accent-emerald)' : 'var(--border)' }}>
                        {plan === p.id && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-emerald)' }} />}
                      </div>
                      <div>
                        <div className="font-semibold">{p.label}</div>
                        <div className="text-xs text-[var(--text-muted)]">{p.sub}</div>
                      </div>
                      <div className="ml-auto font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>{p.price}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(3)} className="w-full py-3 rounded-xl font-semibold text-sm btn-glow" style={{ background: 'var(--accent-emerald)', color: '#080810' }}>
                Continue →
              </button>
            </>
          )}

          {/* Step 3: Charity selection */}
          {step === 3 && (
            <>
              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>Choose your charity</h1>
              <p className="text-sm text-[var(--text-secondary)] mb-5">Minimum 10% of your subscription goes to them</p>

              <div className="space-y-2 mb-5 max-h-60 overflow-y-auto pr-1">
                {charities.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setCharityId(c.id)}
                    className="rounded-xl p-4 cursor-pointer transition-all"
                    style={{
                      border: charityId === c.id ? '2px solid var(--accent-emerald)' : '1px solid var(--border)',
                      background: charityId === c.id ? 'rgba(0,200,150,0.06)' : 'var(--bg-elevated)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: charityId === c.id ? 'var(--accent-emerald)' : 'var(--border)', background: charityId === c.id ? 'var(--accent-emerald)' : 'transparent' }} />
                      <div>
                        <div className="font-medium text-sm">{c.name}</div>
                        <div className="text-xs text-[var(--text-muted)] line-clamp-1">{c.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-3">
                  Contribution: <span style={{ color: 'var(--accent-emerald)' }}>{charityPercent}%</span>
                </label>
                <input
                  type="range" min={10} max={50} step={5}
                  value={charityPercent}
                  onChange={(e) => setCharityPercent(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                  style={{ accentColor: 'var(--accent-emerald)' }}
                />
                <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1"><span>10% (min)</span><span>50%</span></div>
              </div>

              <button
                onClick={handleFinalSubmit}
                disabled={loading || !charityId}
                className="w-full py-3 rounded-xl font-semibold text-sm btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--accent-emerald)', color: '#080810' }}
              >
                {loading ? 'Setting up your account…' : 'Proceed to payment →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
