'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Target, Trophy, Heart, Settings, LogOut, ChevronRight
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/scores', label: 'My Scores', icon: Target },
  { href: '/dashboard/draws', label: 'Draws & Wins', icon: Trophy },
  { href: '/dashboard/charity', label: 'My Charity', icon: Heart },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

interface Profile {
  full_name?: string
  email: string
  role: string
}

export default function DashboardSidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside
      className="w-64 min-h-screen flex flex-col border-r"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: 'var(--accent-emerald)', color: '#080810' }}>G</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>GolfGives</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group"
              style={{
                background: active ? 'rgba(0,200,150,0.1)' : 'transparent',
                color: active ? 'var(--accent-emerald)' : 'var(--text-secondary)',
              }}
            >
              <Icon size={16} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          )
        })}

        {profile?.role === 'admin' && (
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all mt-2"
            style={{ color: 'var(--accent-gold)', background: 'rgba(245,200,66,0.06)' }}
          >
            <span className="text-base">⚡</span>
            Admin Panel
          </Link>
        )}
      </nav>

      {/* Profile */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'rgba(0,200,150,0.15)', color: 'var(--accent-emerald)' }}
          >
            {(profile?.full_name || profile?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{profile?.full_name || 'User'}</div>
            <div className="text-xs text-[var(--text-muted)] truncate">{profile?.email}</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-[var(--text-muted)] hover:text-[var(--accent-rose)] transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
