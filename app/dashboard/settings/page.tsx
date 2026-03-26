'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user!.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user!.id).single(),
      ])
      setProfile(p)
      setSubscription(s)
      setFullName(p?.full_name || '')
    }
    load()
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({ full_name: fullName, updated_at: new Date().toISOString() }).eq('id', user!.id)
    toast.success('Profile updated!')
    setSaving(false)
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access at the end of the billing period.')) return
    setCancelling(true)
    const res = await fetch('/api/subscriptions/cancel', { method: 'POST' })
    const data = await res.json()
    if (data.error) {
      toast.error(data.error)
    } else {
      toast.success('Subscription cancelled. You retain access until the end of the period.')
      setSubscription({ ...subscription, status: 'cancelled' })
    }
    setCancelling(false)
  }

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
  const inputStyle = { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Settings</h1>
        <p className="text-[var(--text-secondary)] mt-1">Manage your account and subscription</p>
      </div>

      {/* Profile */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold mb-5">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">Full Name</label>
            <input
              type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className={inputClass} style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'rgba(0,200,150,0.4)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">Email</label>
            <input
              type="email" value={profile?.email || ''} disabled
              className={inputClass} style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
            />
          </div>
          <button
            onClick={handleSaveProfile} disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold btn-glow disabled:opacity-50"
            style={{ background: 'var(--accent-emerald)', color: '#080810' }}
          >
            {saving ? 'Saving…' : 'Update profile'}
          </button>
        </div>
      </div>

      {/* Subscription */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold mb-5">Subscription</h2>
        {subscription ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Status', value: subscription.status, badge: true },
                { label: 'Plan', value: subscription.plan?.charAt(0).toUpperCase() + subscription.plan?.slice(1), badge: false },
                { label: 'Amount', value: formatCurrency(subscription.amount_pence), badge: false },
                { label: subscription.status === 'cancelled' ? 'Access until' : 'Renews', value: subscription.current_period_end ? formatDate(subscription.current_period_end) : '—', badge: false },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                  <div className="text-xs text-[var(--text-muted)] mb-1">{item.label}</div>
                  {item.badge ? (
                    <span className={`badge badge-${subscription.status}`}>{subscription.status}</span>
                  ) : (
                    <div className="font-medium text-sm">{item.value}</div>
                  )}
                </div>
              ))}
            </div>

            {subscription.status === 'active' && (
              <div className="pt-2">
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                  style={{ border: '1px solid rgba(255,77,109,0.3)', color: 'var(--accent-rose)', background: 'rgba(255,77,109,0.06)' }}
                >
                  {cancelling ? 'Cancelling…' : 'Cancel subscription'}
                </button>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  You'll retain access until the end of your current billing period.
                </p>
              </div>
            )}

            {subscription.status !== 'active' && (
              <a
                href="/auth/signup"
                className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold btn-glow"
                style={{ background: 'var(--accent-emerald)', color: '#080810' }}
              >
                Reactivate subscription
              </a>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">💳</div>
            <div className="text-[var(--text-secondary)] mb-4">No subscription found</div>
            <a
              href="/auth/signup"
              className="inline-block px-6 py-2.5 rounded-xl text-sm font-semibold btn-glow"
              style={{ background: 'var(--accent-emerald)', color: '#080810' }}
            >
              Subscribe now
            </a>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="glass rounded-2xl p-6" style={{ border: '1px solid rgba(255,77,109,0.15)' }}>
        <h2 className="font-semibold mb-2 text-[var(--accent-rose)]">Danger Zone</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
        <button
          onClick={() => toast.error('To delete your account, please contact support.')}
          className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ border: '1px solid rgba(255,77,109,0.3)', color: 'var(--accent-rose)', background: 'transparent' }}
        >
          Delete my account
        </button>
      </div>
    </div>
  )
}
