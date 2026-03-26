import { createClient } from '@/lib/supabase/server'
import { formatCurrency, getMonthLabel } from '@/lib/utils'

export default async function AdminReportsPage() {
  const supabase = createClient()

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: subs },
    { data: draws },
    { data: winners },
    { data: userCharities },
    { data: charities },
    { data: config },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('subscriptions').select('plan, amount_pence, status'),
    supabase.from('draws').select('*').eq('status', 'published').order('draw_month', { ascending: false }),
    supabase.from('winners').select('prize_amount, prize_tier, payment_status'),
    supabase.from('user_charities').select('charity_id, contribution_percentage'),
    supabase.from('charities').select('id, name'),
    supabase.from('prize_config').select('*').single(),
  ])

  // Revenue calc
  const totalRevenue = (subs || [])
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + (s.amount_pence || 0), 0)

  // Total prizes paid
  const totalPrizesPaid = (winners || [])
    .filter((w) => w.payment_status === 'paid')
    .reduce((sum, w) => sum + (w.prize_amount || 0), 0)

  // Charity contributions estimate
  const avgContribution = (userCharities || []).length > 0
    ? (userCharities || []).reduce((s, uc) => s + uc.contribution_percentage, 0) / (userCharities || []).length
    : 10
  const totalCharityContribs = Math.floor((totalRevenue * avgContribution) / 100)

  // Prize breakdown by tier
  const tierBreakdown = ['5-match', '4-match', '3-match'].map((tier) => {
    const wins = (winners || []).filter((w) => w.prize_tier === tier)
    return {
      tier,
      count: wins.length,
      total: wins.reduce((s, w) => s + (w.prize_amount || 0), 0),
    }
  })

  // Charity popularity
  const charityPopularity = (charities || []).map((c) => {
    const count = (userCharities || []).filter((uc) => uc.charity_id === c.id).length
    return { name: c.name, subscribers: count }
  }).sort((a, b) => b.subscribers - a.subscribers)

  const monthlyPool = config
    ? Math.floor(((activeSubscribers || 0) * config.monthly_price_pence * config.subscription_pool_percentage) / 100)
    : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Reports & Analytics</h1>
        <p className="text-[var(--text-secondary)] mt-1">Platform performance overview</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: totalUsers || 0, color: 'var(--accent-emerald)' },
          { label: 'Active Subscribers', value: activeSubscribers || 0, color: 'var(--accent-gold)' },
          { label: 'Monthly Revenue', value: formatCurrency(totalRevenue), color: 'var(--accent-emerald)' },
          { label: 'Current Prize Pool', value: formatCurrency(monthlyPool), color: 'var(--accent-gold)' },
          { label: 'Total Prizes Paid', value: formatCurrency(totalPrizesPaid), color: 'var(--accent-rose)' },
          { label: 'Draws Completed', value: draws?.length || 0, color: 'var(--accent-emerald)' },
          { label: 'Total Winners', value: winners?.length || 0, color: 'var(--accent-gold)' },
          { label: 'Charity Contributions', value: formatCurrency(totalCharityContribs), color: 'var(--accent-emerald)' },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">{s.label}</div>
            <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subscription split */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-5">Subscription Plans</h2>
          {(['monthly', 'yearly'] as const).map((plan) => {
            const count = (subs || []).filter((s) => s.plan === plan && s.status === 'active').length
            const pct = activeSubscribers ? Math.round((count / activeSubscribers) * 100) : 0
            return (
              <div key={plan} className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="capitalize font-medium">{plan}</span>
                  <span className="text-[var(--text-muted)]">{count} users ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: plan === 'yearly' ? 'var(--accent-gold)' : 'var(--accent-emerald)' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Prize tier breakdown */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-5">Prize Tier Breakdown</h2>
          <table className="data-table">
            <thead>
              <tr><th>Tier</th><th>Winners</th><th>Total Paid</th></tr>
            </thead>
            <tbody>
              {tierBreakdown.map((t) => (
                <tr key={t.tier}>
                  <td><span className="badge badge-active">{t.tier}</span></td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{t.count}</td>
                  <td className="font-mono" style={{ color: 'var(--accent-gold)' }}>{formatCurrency(t.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Draw history */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-5">Draw History</h2>
          {(draws || []).length > 0 ? (
            <table className="data-table">
              <thead><tr><th>Month</th><th>Pool</th><th>Jackpot</th><th>Players</th></tr></thead>
              <tbody>
                {(draws || []).slice(0, 6).map((d) => (
                  <tr key={d.id}>
                    <td className="text-sm">{getMonthLabel(d.draw_month)}</td>
                    <td className="font-mono text-xs" style={{ color: 'var(--accent-emerald)' }}>{formatCurrency(d.prize_pool_total)}</td>
                    <td className="font-mono text-xs" style={{ color: 'var(--accent-gold)' }}>{formatCurrency(d.jackpot_amount)}</td>
                    <td className="text-sm text-[var(--text-secondary)]">{d.participant_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-[var(--text-muted)]">No draws yet</div>
          )}
        </div>

        {/* Charity popularity */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-5">Charity Popularity</h2>
          <div className="space-y-3">
            {charityPopularity.filter(c => c.subscribers > 0).slice(0, 6).map((c) => {
              const max = charityPopularity[0]?.subscribers || 1
              const pct = Math.round((c.subscribers / max) * 100)
              return (
                <div key={c.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate">{c.name}</span>
                    <span className="text-[var(--text-muted)] ml-2 flex-shrink-0">{c.subscribers}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent-emerald)' }} />
                  </div>
                </div>
              )
            })}
            {charityPopularity.every(c => c.subscribers === 0) && (
              <div className="text-center py-4 text-[var(--text-muted)] text-sm">No charity selections yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
