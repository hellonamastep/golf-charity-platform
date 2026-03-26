'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => {
      listener.subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(8,8,16,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-105"
            style={{ background: 'var(--accent-emerald)', color: '#080810' }}
          >
            G
          </div>
          <span
            className="font-bold text-lg"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}
          >
            GolfGives
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { href: '/#how-it-works', label: 'How it works' },
            { href: '/charities', label: 'Charities' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all btn-glow"
              style={{ background: 'var(--accent-emerald)', color: '#080810' }}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all btn-glow"
                style={{ background: 'var(--accent-emerald)', color: '#080810' }}
              >
                Join now
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg glass"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            {menuOpen ? (
              <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <>
                <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-[var(--border)] px-6 py-4 flex flex-col gap-3">
          <Link href="/#how-it-works" className="text-sm text-[var(--text-secondary)] py-2" onClick={() => setMenuOpen(false)}>How it works</Link>
          <Link href="/charities" className="text-sm text-[var(--text-secondary)] py-2" onClick={() => setMenuOpen(false)}>Charities</Link>
          {user ? (
            <Link href="/dashboard" className="text-sm font-medium py-2 text-[var(--accent-emerald)]" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-[var(--text-secondary)] py-2" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link href="/auth/signup" className="text-sm font-semibold text-[var(--accent-emerald)] py-2" onClick={() => setMenuOpen(false)}>Join now →</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
