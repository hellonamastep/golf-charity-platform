'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Zap, Heart, Trophy, BarChart2, LayoutDashboard, ChevronRight } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/draws', label: 'Draw Management', icon: Zap },
  { href: '/admin/charities', label: 'Charities', icon: Heart },
  { href: '/admin/winners', label: 'Winners', icon: Trophy },
  { href: '/admin/reports', label: 'Reports', icon: BarChart2 },
]

export default function AdminSidebar({ profile }: { profile: any }) {
  const pathname = usePathname()

  return (
    <aside
      className="w-64 min-h-screen flex flex-col border-r"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href="/" className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: 'var(--accent-gold)', color: '#080810' }}>G</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>GolfGives</span>
        </Link>
        <div className="text-xs px-2 py-0.5 rounded-full inline-block mt-1" style={{ background: 'rgba(245,200,66,0.15)', color: 'var(--accent-gold)' }}>
          Admin Panel
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: active ? 'rgba(245,200,66,0.1)' : 'transparent',
                color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
              }}
            >
              <Icon size={16} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          )
        })}
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text-muted)] mt-2">
          ← Back to dashboard
        </Link>
      </nav>

      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'rgba(245,200,66,0.15)', color: 'var(--accent-gold)' }}>
            {(profile?.full_name || profile?.email || 'A')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{profile?.full_name || 'Admin'}</div>
            <div className="text-xs" style={{ color: 'var(--accent-gold)' }}>Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
