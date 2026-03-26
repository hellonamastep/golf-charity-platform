import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getMonthLabel } from '@/lib/utils'

export default async function DrawsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: entries }, { data: winners }, { data: publishedDraws }] = await Promise.all([
    supabase
      .from('draw_entries')
      .select('*, draw:draws(draw_month, winning_numbers, status, jackpot_amount, prize_pool_total)')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('winners')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('draw_month', { ascending: false })
      .limit(3),
  ])

  const totalWon = (winners || []).reduce((s, w) => s + (w.prize_amount || 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Draws & Wins</h1>
        <p className="text-[var(--text-secondary)] mt-1">Your participation history and winnings</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Draws entered', value: entries?.length || 0, color: 'var(--accent-emerald)' },
          { label: 'Prize wins', value: winners?.length || 0, color: 'var(--accent-gold)' },
          { label: 'Total won', value: formatCurrency(totalWon), color: 'var(--accent-gold)' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-2">{s.label}</div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Winners section */}
      {(winners || []).length > 0 && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
            <span className="text-lg">🏆</span>
            <h2 className="font-semibold">Your Winnings</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Prize Tier</th>
                <th>Amount</th>
                <th>Verification</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {(winners || []).map((w) => (
                <tr key={w.id}>
                  <td>
                    <span className={`badge ${w.prize_tier === '5-match' ? 'badge-active' : 'badge-pending'}`}>
                      {w.prize_tier === '5-match' ? '🏆 ' : ''}
                      {w.prize_tier}
                    </span>
                  </td>
                  <td className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>
                    {formatCurrency(w.prize_amount)}
                  </td>
                  <td>
                    <span className={`badge badge-${w.verification_status}`}>
                      {w.verification_status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${w.payment_status}`}>
                      {w.payment_status}
                    </span>
                  </td>
                  <td className="text-[var(--text-secondary)]">{formatDate(w.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Draw participation history */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold">Participation History</h2>
        </div>
        {(entries || []).length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Your Numbers</th>
                <th>Winning Numbers</th>
                <th>Matches</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {(entries || []).map((entry) => {
                const draw = entry.draw as any
                const winningNums: number[] = draw?.winning_numbers || []
                const entryNums: number[] = entry.entry_numbers || []
                const winSet = new Set(winningNums)

                return (
                  <tr key={entry.id}>
                    <td className="font-medium">
                      {draw ? getMonthLabel(draw.draw_month) : '—'}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1.5">
                        {entryNums.map((n, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                            style={{
                              background: winSet.has(n) ? 'rgba(0,200,150,0.2)' : 'rgba(255,255,255,0.05)',
                              color: winSet.has(n) ? 'var(--accent-emerald)' : 'var(--text-muted)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1.5">
                        {winningNums.map((n, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                            style={{
                              background: 'rgba(245,200,66,0.1)',
                              color: 'var(--accent-gold)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span
                        className="font-bold text-lg"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          color: (entry.match_count || 0) >= 3 ? 'var(--accent-gold)' : 'var(--text-muted)',
                        }}
                      >
                        {entry.match_count || 0}
                      </span>
                    </td>
                    <td>
                      {entry.prize_tier ? (
                        <span className="badge badge-active">{entry.prize_tier} 🎉</span>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)]">No prize</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🎯</div>
            <div className="text-[var(--text-secondary)]">No draw entries yet. Add your scores and wait for the monthly draw!</div>
          </div>
        )}
      </div>

      {/* Latest published draws */}
      {(publishedDraws || []).length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-5">Recent Draw Results</h2>
          <div className="space-y-4">
            {(publishedDraws || []).map((draw) => (
              <div key={draw.id} className="p-4 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">{getMonthLabel(draw.draw_month)}</span>
                  <span className="text-xs text-[var(--text-muted)]">{draw.participant_count} participants</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(draw.winning_numbers as number[]).map((n: number, i: number) => (
                    <span key={i} className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold" style={{ background: 'rgba(245,200,66,0.15)', color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
                      {n}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4 text-xs text-[var(--text-muted)]">
                  <span>Jackpot: <span className="text-[var(--accent-gold)]">{formatCurrency(draw.jackpot_amount)}</span></span>
                  <span>Total pool: <span className="text-[var(--accent-emerald)]">{formatCurrency(draw.prize_pool_total)}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
