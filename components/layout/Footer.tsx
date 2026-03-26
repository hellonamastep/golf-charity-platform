import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="border-t py-12 px-6 lg:px-8"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ background: 'var(--accent-emerald)', color: '#080810' }}
              >
                G
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>
                GolfGives
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
              Play. Win. Give. A golf subscription platform where your game creates
              real charitable impact every month.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">Platform</h4>
            <ul className="space-y-2">
              {[
                { href: '/#how-it-works', label: 'How it works' },
                { href: '/charities', label: 'Charities' },
                { href: '/auth/signup', label: 'Join now' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">Legal</h4>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
                <li key={l}>
                  <span className="text-sm text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors">
                    {l}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t gap-3" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} GolfGives. All rights reserved.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Built with care for golfers who give.
          </p>
        </div>
      </div>
    </footer>
  )
}
