import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate, getMonthLabel } from '@/lib/utils'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: profile },
    { data: subscription },
    { data: scores },
    { data: userCharity },
    { data: entries },
    { data: winners },
    { data: latestDraw },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user!.id).single(),
    supabase.from('golf_scores').select('*').eq('user_id', user!.id).order('played_at', { ascending: false }).limit(5),
    supabase.from('user_charities').select('*, charity:charities(name)').eq('user_id', user!.id).single(),
    supabase.from('draw_entries').select('*, draw:draws(draw_month, status, winning_numbers)').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('winners').select('*').eq('user_id', user!.id),
    supabase.from('draws').select('*').eq('status', 'published').order('draw_month', { ascending: false }).limit(1).single(),
  ])

  const totalWon = (winners || []).reduce((sum, w) => sum + (w.prize_amount || 0), 0)
  const isActive = subscription?.status === 'active'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
          Good to see you, {profile?.full_name?.split(' ')[0] || 'Golfer'} 👋
        </h1>
        <p className="text-[var(--text-secondary)]">Here's your GolfGives overview</p>
      </div>

      {/* Subscription banner if inactive */}
      {!isActive && (
        <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.2)' }}>
          <div>
            <div className="font-semibold text-[var(--accent-rose)]">No active subscription</div>
            <div className="text-sm text-[var(--text-secondary)] mt-0.5">Subscribe to enter monthly draws and support your chosen charity.</div>
          </div>
          <Link href="/auth/signup" className="px-5 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0" style={{ background: 'var(--accent-emerald)', color: '#080810' }}>
            Subscribe
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Subscription',
            value: isActive ? 'Active' : 'Inactive',
            sub: subscription?.current_period_end ? `Renews ${formatDate(subscription.current_period_end)}` : '—',
            color: isActive ? 'var(--accent-emerald)' : 'var(--accent-rose)',
            badge: isActive,
          },
          {
            label: 'Scores entered',
            value: scores?.length || 0,
            sub: 'of 5 max',
            color: 'var(--accent-gold)',
            badge: false,
          },
          {
            label: 'Draws entered',
            value: entries?.length || 0,
            sub: 'total participations',
            color: 'var(--accent-emerald)',
            badge: false,
          },
          {
            label: 'Total won',
            value: formatCurrency(totalWon),
            sub: `${winners?.length || 0} prizes`,
            color: 'var(--accent-gold)',
            badge: false,
          },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5">
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">{stat.label}</div>
            <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-mono)', color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-xs text-[var(--text-muted)]">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Scores */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">My Scores</h2>
            <Link href="/dashboard/scores" className="text-xs text-[var(--accent-emerald)] hover:underline">Manage →</Link>
          </div>
          {scores && scores.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {scores.map((s) => (
                <div key={s.id} className="score-ball">{s.score}</div>
              ))}
              {Array.from({ length: 5 - scores.length }).map((_, i) => (
                <div key={i} className="score-ball" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>—</div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">⛳</div>
              <div className="text-sm text-[var(--text-secondary)] mb-3">No scores yet</div>
              <Link href="/dashboard/scores" className="text-xs text-[var(--accent-emerald)] hover:underline">Add your first score →</Link>
            </div>
          )}
        </div>

        {/* My Charity */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">My Charity</h2>
            <Link href="/dashboard/charity" className="text-xs text-[var(--accent-emerald)] hover:underline">Change →</Link>
          </div>
          {userCharity ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(0,200,150,0.1)' }}>❤️</div>
                <div>
                  <div className="font-medium">{(userCharity as any).charity?.name || 'Unknown'}</div>
                  <div className="text-xs text-[var(--text-muted)]">Your chosen cause</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(0,200,150,0.06)' }}>
                <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}>
                  {userCharity.contribution_percentage}%
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  of your subscription donated each month
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">💚</div>
              <div className="text-sm text-[var(--text-secondary)] mb-3">No charity selected</div>
              <Link href="/dashboard/charity" className="text-xs text-[var(--accent-emerald)] hover:underline">Choose a charity →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Latest draw */}
      {latestDraw && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Latest Draw — {getMonthLabel(latestDraw.draw_month)}</h2>
            <Link href="/dashboard/draws" className="text-xs text-[var(--accent-emerald)] hover:underline">All draws →</Link>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            {(latestDraw.winning_numbers as number[]).map((n: number, i: number) => (
              <div key={i} className="score-ball" style={{ borderColor: 'rgba(245,200,66,0.4)', color: 'var(--accent-gold)' }}>{n}</div>
            ))}
          </div>
          <div className="flex gap-4 text-sm text-[var(--text-secondary)]">
            <span>Pool: <span style={{ color: 'var(--accent-emerald)' }}>{formatCurrency(latestDraw.prize_pool_total)}</span></span>
            <span>Jackpot: <span style={{ color: 'var(--accent-gold)' }}>{formatCurrency(latestDraw.jackpot_amount)}</span></span>
            <span>{latestDraw.participant_count} participants</span>
          </div>
        </div>
      )}
    </div>
  )
}
