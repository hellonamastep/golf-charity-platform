import { createClient } from '@/lib/supabase/server'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function AdminUsersPage() {
  const supabase = createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select(`
      *,
      subscriptions(status, plan, amount_pence, current_period_end),
      user_charities(contribution_percentage, charity:charities(name)),
      golf_scores(score, played_at)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Users</h1>
          <p className="text-[var(--text-secondary)] mt-1">{users?.length || 0} total users</p>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Subscription</th>
              <th>Plan</th>
              <th>Scores</th>
              <th>Charity %</th>
              <th>Joined</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {(users || []).map((user) => {
              const sub = (user.subscriptions as any[])?.[0]
              const uc = (user.user_charities as any[])?.[0]
              const scoreCount = (user.golf_scores as any[])?.length || 0
              return (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'rgba(0,200,150,0.1)', color: 'var(--accent-emerald)' }}>
                        {(user.full_name || user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{user.full_name || '—'}</div>
                        <div className="text-xs text-[var(--text-muted)]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {sub ? (
                      <span className={`badge badge-${sub.status}`}>{sub.status}</span>
                    ) : (
                      <span className="badge badge-inactive">none</span>
                    )}
                  </td>
                  <td className="text-[var(--text-secondary)] text-sm">{sub?.plan || '—'}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', color: scoreCount >= 3 ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                      {scoreCount}/5
                    </span>
                  </td>
                  <td className="text-[var(--text-secondary)] text-sm">
                    {uc ? `${uc.contribution_percentage}%` : '—'}
                  </td>
                  <td className="text-[var(--text-secondary)] text-sm">
                    {formatDate(user.created_at)}
                  </td>
                  <td>
                    {user.role === 'admin' ? (
                      <span className="badge badge-pending">admin</span>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">user</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
