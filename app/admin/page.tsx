import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = createClient()

  const [
    { count: totalUsers },
    { count: activeSubs },
    { count: totalDraws },
    { count: pendingWinners },
    { data: config },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('draws').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('winners').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    supabase.from('prize_config').select('*').single(),
    supabase.from('profiles').select('full_name, email, created_at, role').order('created_at', { ascending: false }).limit(5),
  ])

  const monthlyPool = config
    ? Math.floor(((activeSubs || 0) * config.monthly_price_pence * config.subscription_pool_percentage) / 100)
    : 0

  const stats = [
    { label: 'Total users', value: totalUsers || 0, color: 'var(--accent-emerald)', link: '/admin/users' },
    { label: 'Active subscribers', value: activeSubs || 0, color: 'var(--accent-gold)', link: '/admin/users' },
    { label: 'Draws published', value: totalDraws || 0, color: 'var(--accent-emerald)', link: '/admin/draws' },
    { label: 'Pending winners', value: pendingWinners || 0, color: pendingWinners ? 'var(--accent-rose)' : 'var(--text-muted)', link: '/admin/winners' },
    { label: 'This month\'s pool', value: formatCurrency(monthlyPool), color: 'var(--accent-gold)', link: '/admin/reports' },
    { label: 'Total charities', value: 6, color: 'var(--accent-emerald)', link: '/admin/charities' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Admin Overview</h1>
        <p className="text-[var(--text-secondary)] mt-1">Platform health at a glance</p>
      </div>

      {pendingWinners ? (
        <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.2)' }}>
          <span className="text-xl">🏆</span>
          <div>
            <span className="font-semibold text-[var(--accent-rose)]">{pendingWinners} winner{pendingWinners > 1 ? 's' : ''} pending verification</span>
            <span className="text-sm text-[var(--text-secondary)] ml-2">— action required</span>
          </div>
          <Link href="/admin/winners" className="ml-auto text-sm text-[var(--accent-rose)] hover:underline">Review →</Link>
        </div>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.link}>
            <div className="glass rounded-2xl p-5 hover:border-[var(--border-accent)] transition-all cursor-pointer group">
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-3">{s.label}</div>
              <div className="text-3xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-5">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Run monthly draw', href: '/admin/draws', color: 'var(--accent-gold)', icon: '⚡' },
              { label: 'Review winners', href: '/admin/winners', color: 'var(--accent-emerald)', icon: '🏆' },
              { label: 'Add charity', href: '/admin/charities', color: 'var(--accent-emerald)', icon: '❤️' },
              { label: 'View reports', href: '/admin/reports', color: 'var(--text-secondary)', icon: '📊' },
            ].map((a) => (
              <Link key={a.href} href={a.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/5"
                style={{ border: '1px solid var(--border)' }}
              >
                <span className="text-base">{a.icon}</span>
                <span className="text-sm font-medium" style={{ color: a.color }}>{a.label}</span>
                <span className="ml-auto text-[var(--text-muted)] text-xs">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">Recent Users</h2>
            <Link href="/admin/users" className="text-xs text-[var(--accent-emerald)] hover:underline">All users →</Link>
          </div>
          <div className="space-y-3">
            {(recentUsers || []).map((u) => (
              <div key={u.email} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'rgba(0,200,150,0.1)', color: 'var(--accent-emerald)' }}>
                  {(u.full_name || u.email)[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{u.full_name || 'User'}</div>
                  <div className="text-xs text-[var(--text-muted)] truncate">{u.email}</div>
                </div>
                {u.role === 'admin' && (
                  <span className="badge badge-pending ml-auto flex-shrink-0">admin</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
