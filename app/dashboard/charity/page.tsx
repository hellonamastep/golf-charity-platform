'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Charity {
  id: string
  name: string
  description: string
  website?: string
}

export default function CharityPage() {
  const [charities, setCharities] = useState<Charity[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [percentage, setPercentage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const [{ data: chars }, { data: uc }] = await Promise.all([
        supabase.from('charities').select('*').eq('is_active', true),
        supabase.from('user_charities').select('*').eq('user_id', user!.id).single(),
      ])
      setCharities(chars || [])
      if (uc) {
        setSelectedId(uc.charity_id)
        setPercentage(uc.contribution_percentage)
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!selectedId) { toast.error('Please select a charity'); return }
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('user_charities').upsert({
      user_id: user!.id,
      charity_id: selectedId,
      contribution_percentage: percentage,
    }, { onConflict: 'user_id' })
    if (error) {
      toast.error('Failed to save')
    } else {
      toast.success('Charity preferences saved!')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent-emerald)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  const selected = charities.find((c) => c.id === selectedId)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>My Charity</h1>
        <p className="text-[var(--text-secondary)] mt-1">Choose where a portion of your subscription goes</p>
      </div>

      {selected && (
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(0,200,150,0.08), rgba(0,200,150,0.04))', border: '1px solid rgba(0,200,150,0.2)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'rgba(0,200,150,0.12)' }}>❤️</div>
            <div>
              <div className="font-semibold text-lg">{selected.name}</div>
              <div className="text-xs text-[var(--text-secondary)]">Currently selected</div>
            </div>
            <div className="ml-auto text-3xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
              {percentage}%
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">{selected.description}</p>
        </div>
      )}

      {/* Contribution slider */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-4">Contribution percentage</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-5">
          Choose how much of your subscription to donate. Minimum 10%.
        </p>
        <input
          type="range" min={10} max={50} step={5}
          value={percentage}
          onChange={(e) => setPercentage(Number(e.target.value))}
          className="w-full mb-3"
          style={{ accentColor: 'var(--accent-emerald)' }}
        />
        <div className="flex justify-between text-xs text-[var(--text-muted)]">
          <span>10% (minimum)</span>
          <span className="font-bold text-base" style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>{percentage}%</span>
          <span>50%</span>
        </div>
      </div>

      {/* Charity grid */}
      <div>
        <h3 className="font-semibold mb-4">Select a charity</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {charities.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="rounded-xl p-5 cursor-pointer transition-all"
              style={{
                border: selectedId === c.id ? '2px solid var(--accent-emerald)' : '1px solid var(--border)',
                background: selectedId === c.id ? 'rgba(0,200,150,0.06)' : 'var(--bg-elevated)',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all" style={{ borderColor: selectedId === c.id ? 'var(--accent-emerald)' : 'var(--border)', background: selectedId === c.id ? 'var(--accent-emerald)' : 'transparent' }}>
                  {selectedId === c.id && (
                    <svg viewBox="0 0 10 10" className="w-full h-full p-0.5" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="#080810" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{c.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !selectedId}
        className="px-8 py-3 rounded-xl font-semibold btn-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={{ background: 'var(--accent-emerald)', color: '#080810' }}
      >
        {saving ? 'Saving…' : 'Save preferences'}
      </button>
    </div>
  )
}
