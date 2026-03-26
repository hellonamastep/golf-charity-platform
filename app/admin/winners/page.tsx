'use client'
import { useEffect, useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Winner {
  id: string
  user_id: string
  draw_id: string
  prize_tier: string
  prize_amount: number
  proof_url: string | null
  verification_status: string
  payment_status: string
  admin_notes: string | null
  created_at: string
  profile?: { full_name: string; email: string }
  draw?: { draw_month: string }
}

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'paid'>('pending')

  const load = async () => {
    const res = await fetch('/api/admin/winners')
    if (res.ok) {
      const data = await res.json()
      setWinners(data.winners || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateWinner = async (id: string, updates: Record<string, string>) => {
    const res = await fetch(`/api/winners/${id}/proof`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) { toast.success('Updated!'); load() } else { toast.error('Failed') }
  }

  const filtered = filter === 'all' ? winners
    : filter === 'pending' ? winners.filter(w => w.verification_status === 'pending')
    : filter === 'approved' ? winners.filter(w => w.verification_status === 'approved' && w.payment_status === 'pending')
    : winners.filter(w => w.payment_status === 'paid')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Winners</h1>
        <p className="text-[var(--text-secondary)] mt-1">Verify submissions and mark payouts</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'paid'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all"
            style={{
              background: filter === f ? 'rgba(0,200,150,0.1)' : 'var(--bg-elevated)',
              color: filter === f ? 'var(--accent-emerald)' : 'var(--text-secondary)',
              border: filter === f ? '1px solid rgba(0,200,150,0.3)' : '1px solid var(--border)',
            }}
          >
            {f}
            {f === 'pending' && winners.filter(w => w.verification_status === 'pending').length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs" style={{ background: 'var(--accent-rose)', color: 'white' }}>
                {winners.filter(w => w.verification_status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[var(--text-muted)]">Loading…</div>
        ) : filtered.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Winner</th>
                <th>Draw</th>
                <th>Tier</th>
                <th>Prize</th>
                <th>Proof</th>
                <th>Verification</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr key={w.id}>
                  <td>
                    <div className="text-sm font-medium">{w.profile?.full_name || 'User'}</div>
                    <div className="text-xs text-[var(--text-muted)]">{w.profile?.email}</div>
                  </td>
                  <td className="text-sm text-[var(--text-secondary)]">
                    {w.draw?.draw_month || '—'}
                  </td>
                  <td>
                    <span className="badge badge-active">{w.prize_tier}</span>
                  </td>
                  <td className="font-bold font-mono" style={{ color: 'var(--accent-gold)' }}>
                    {formatCurrency(w.prize_amount)}
                  </td>
                  <td>
                    {w.proof_url ? (
                      <a href={w.proof_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[var(--accent-emerald)] hover:underline">
                        View proof →
                      </a>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">Not uploaded</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${w.verification_status}`}>{w.verification_status}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${w.payment_status}`}>{w.payment_status}</span>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1">
                      {w.verification_status === 'pending' && (
                        <>
                          <button onClick={() => updateWinner(w.id, { verification_status: 'approved' })}
                            className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(0,200,150,0.1)', color: 'var(--accent-emerald)' }}>
                            Approve
                          </button>
                          <button onClick={() => updateWinner(w.id, { verification_status: 'rejected' })}
                            className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,77,109,0.1)', color: 'var(--accent-rose)' }}>
                            Reject
                          </button>
                        </>
                      )}
                      {w.verification_status === 'approved' && w.payment_status === 'pending' && (
                        <button onClick={() => updateWinner(w.id, { payment_status: 'paid' })}
                          className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(245,200,66,0.1)', color: 'var(--accent-gold)' }}>
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🏆</div>
            <div className="text-[var(--text-muted)]">No winners in this category</div>
          </div>
        )}
      </div>
    </div>
  )
}
