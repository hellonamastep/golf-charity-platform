'use client'
import { useState, useEffect } from 'react'
import { formatCurrency, getMonthLabel, getCurrentDrawMonth } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Draw {
  id: string
  draw_month: string
  draw_type: string
  winning_numbers: number[]
  status: string
  prize_pool_total: number
  jackpot_amount: number
  participant_count: number
  rollover_amount: number
  published_at: string | null
}

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [drawMonth, setDrawMonth] = useState(getCurrentDrawMonth())
  const [drawType, setDrawType] = useState<'random' | 'algorithmic'>('random')
  const [lastResult, setLastResult] = useState<any>(null)

  const fetchDraws = async () => {
    const res = await fetch('/api/admin/draws')
    if (res.ok) {
      const data = await res.json()
      setDraws(data.draws || [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchDraws() }, [])

  const handleRun = async (simulate: boolean) => {
    setRunning(true)
    const res = await fetch('/api/admin/draws/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawMonth, drawType, simulate }),
    })
    const data = await res.json()
    if (data.error) {
      toast.error(data.error)
    } else {
      setLastResult(data)
      toast.success(simulate ? 'Simulation complete! Review numbers before publishing.' : 'Draw published successfully!')
      fetchDraws()
    }
    setRunning(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Draw Management</h1>
        <p className="text-[var(--text-secondary)] mt-1">Configure and run monthly draws</p>
      </div>

      {/* Draw control panel */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold mb-5 text-[var(--accent-gold)]">⚡ Run a Draw</h2>
        <div className="grid md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">Draw Month</label>
            <input
              type="month" value={drawMonth} onChange={(e) => setDrawMonth(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', colorScheme: 'dark' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2">Draw Type</label>
            <div className="flex gap-2">
              {(['random', 'algorithmic'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setDrawType(t)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium capitalize transition-all"
                  style={{
                    background: drawType === t ? 'rgba(245,200,66,0.12)' : 'var(--bg-elevated)',
                    border: drawType === t ? '1px solid rgba(245,200,66,0.4)' : '1px solid var(--border)',
                    color: drawType === t ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl mb-5 text-sm text-[var(--text-secondary)]" style={{ background: 'var(--bg-elevated)' }}>
          {drawType === 'random'
            ? '🎲 Random: 5 numbers picked randomly from 1–45 (standard lottery)'
            : '🧮 Algorithmic: Weighted draw based on frequency of user scores (most common scores more likely)'}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleRun(true)}
            disabled={running}
            className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            style={{ border: '1px solid rgba(245,200,66,0.3)', color: 'var(--accent-gold)', background: 'rgba(245,200,66,0.06)' }}
          >
            {running ? 'Running…' : '🔍 Simulate (preview only)'}
          </button>
          <button
            onClick={() => handleRun(false)}
            disabled={running}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 btn-glow"
            style={{ background: 'var(--accent-gold)', color: '#080810' }}
          >
            {running ? 'Publishing…' : '⚡ Run & Publish Draw'}
          </button>
        </div>
      </div>

      {/* Last result */}
      {lastResult && (
        <div className="glass rounded-2xl p-6" style={{ border: '1px solid rgba(0,200,150,0.2)' }}>
          <h3 className="font-semibold mb-4 text-[var(--accent-emerald)]">
            {lastResult.simulate ? '🔍 Simulation Result' : '✅ Draw Published'}
          </h3>
          <div className="flex flex-wrap gap-3 mb-4">
            {lastResult.winningNumbers.map((n: number, i: number) => (
              <div key={i} className="score-ball" style={{ borderColor: 'rgba(245,200,66,0.4)', color: 'var(--accent-gold)' }}>{n}</div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-[var(--text-muted)] text-xs mb-1">Participants</div>
              <div className="font-bold" style={{ fontFamily: 'var(--font-mono)' }}>{lastResult.stats?.participants}</div>
            </div>
            <div>
              <div className="text-[var(--text-muted)] text-xs mb-1">Total Pool</div>
              <div className="font-bold text-[var(--accent-emerald)]" style={{ fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(lastResult.stats?.totalPool)}
              </div>
            </div>
            <div>
              <div className="text-[var(--text-muted)] text-xs mb-1">Jackpot</div>
              <div className="font-bold text-[var(--accent-gold)]" style={{ fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(lastResult.stats?.jackpot)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draw history */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold">Draw History</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-[var(--text-muted)]">Loading…</div>
        ) : draws.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Winning Numbers</th>
                <th>Pool</th>
                <th>Jackpot</th>
                <th>Participants</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {draws.map((d) => (
                <tr key={d.id}>
                  <td className="font-medium">{getMonthLabel(d.draw_month)}</td>
                  <td>
                    <div className="flex gap-1.5">
                      {d.winning_numbers.map((n, i) => (
                        <span key={i} className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                          style={{ background: 'rgba(245,200,66,0.12)', color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
                          {n}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="font-mono text-sm" style={{ color: 'var(--accent-emerald)' }}>{formatCurrency(d.prize_pool_total)}</td>
                  <td className="font-mono text-sm" style={{ color: 'var(--accent-gold)' }}>{formatCurrency(d.jackpot_amount)}</td>
                  <td className="text-[var(--text-secondary)]">{d.participant_count}</td>
                  <td className="text-[var(--text-secondary)] text-xs capitalize">{d.draw_type}</td>
                  <td><span className={`badge badge-${d.status === 'published' ? 'active' : 'pending'}`}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-[var(--text-muted)]">No draws yet</div>
        )}
      </div>
    </div>
  )
}
