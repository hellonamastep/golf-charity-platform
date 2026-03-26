import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default async function HomePage() {
  const supabase = createClient()

  const [{ data: charities }, { data: config }, { count: subscriberCount }] =
    await Promise.all([
      supabase.from('charities').select('*').eq('is_featured', true).eq('is_active', true).limit(3),
      supabase.from('prize_config').select('*').single(),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    ])

  const poolTotal = config
    ? Math.floor(((subscriberCount || 50) * config.monthly_price_pence * config.subscription_pool_percentage) / 100)
    : 0

  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background mesh */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(0,200,150,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 60%, rgba(245,200,66,0.06) 0%, transparent 60%), #080810',
          }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full glass text-sm text-[var(--text-secondary)] animate-in">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-emerald)] animate-pulse-slow" />
              Monthly draw now open · {formatCurrency(poolTotal)} prize pool
            </div>

            {/* Headline */}
            <h1
              className="mb-6 animate-in delay-100"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(52px, 8vw, 100px)',
                lineHeight: '0.95',
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Play golf.{' '}
              <span className="gradient-text">Win prizes.</span>
              <br />
              Change lives.
            </h1>

            <p
              className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mb-10 animate-in delay-200"
              style={{ lineHeight: '1.7' }}
            >
              Enter your Stableford scores each month. Get drawn into a prize pool.
              And with every subscription, a portion goes directly to the charity you
              choose. Golf with purpose.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 animate-in delay-300">
              <Link
                href="/auth/signup"
                className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-xl text-bg-base font-semibold text-base transition-all"
                style={{ background: 'var(--accent-emerald)', color: '#080810' }}
              >
                Start for £14.99 / month
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-medium text-[var(--text-secondary)] glass hover:text-[var(--text-primary)] transition-all"
              >
                See how it works
              </Link>
            </div>

            {/* Trust bar */}
            <div className="flex flex-wrap gap-8 mt-14 animate-in delay-400">
              {[
                { value: `${subscriberCount || '250'}+`, label: 'Active members' },
                { value: formatCurrency(poolTotal), label: 'This month\'s pool' },
                { value: '6', label: 'Charities supported' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    className="text-2xl font-bold"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-emerald)' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm text-[var(--text-muted)]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" className="py-28 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[var(--accent-emerald)] text-sm font-medium uppercase tracking-widest mb-3">
              The Process
            </p>
            <h2
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700 }}
            >
              Three steps to impact
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Subscribe & choose your cause',
                body: 'Pick a monthly or yearly plan. Select a charity from our vetted directory. A minimum 10% of your subscription goes straight to them.',
                color: 'var(--accent-emerald)',
              },
              {
                step: '02',
                title: 'Enter your Stableford scores',
                body: 'Log your last 5 golf scores (range 1–45). Your rolling score history is your draw ticket — updated after every round.',
                color: 'var(--accent-gold)',
              },
              {
                step: '03',
                title: 'Win in the monthly draw',
                body: 'Every month we draw 5 winning numbers. Match 3, 4 or all 5 of your scores to win a share of the prize pool. Jackpot rolls over if unclaimed.',
                color: 'var(--accent-rose)',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="glass rounded-2xl p-8 relative overflow-hidden hover:border-[var(--border-accent)] transition-all duration-300 group"
              >
                <div
                  className="absolute top-0 right-0 text-8xl font-bold opacity-5 select-none group-hover:opacity-10 transition-opacity"
                  style={{ fontFamily: 'var(--font-mono)', color: item.color }}
                >
                  {item.step}
                </div>
                <div
                  className="text-xs font-bold tracking-widest mb-4"
                  style={{ color: item.color, fontFamily: 'var(--font-mono)' }}
                >
                  STEP {item.step}
                </div>
                <h3
                  className="text-xl font-semibold mb-3"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '22px' }}
                >
                  {item.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIZE BREAKDOWN ──────────────────────────────── */}
      <section className="py-20 px-6 lg:px-8 bg-[var(--bg-surface)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[var(--accent-gold)] text-sm font-medium uppercase tracking-widest mb-4">
                Prize Structure
              </p>
              <h2
                style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700, lineHeight: '1.1' }}
              >
                Real prizes.<br />Real winners.<br />Every month.
              </h2>
              <p className="mt-5 text-[var(--text-secondary)] leading-relaxed">
                A fixed portion of every subscription builds the monthly prize pool.
                Three tiers of prizes mean more ways to win, and the 5-match jackpot
                rolls over if unclaimed — growing every month until someone claims it.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  match: '5 Numbers', label: 'Jackpot 🏆', share: '40%', rollover: true,
                  amount: config ? formatCurrency(Math.floor((poolTotal * 40) / 100)) : '—',
                  color: 'var(--accent-gold)',
                },
                {
                  match: '4 Numbers', label: 'Major prize', share: '35%', rollover: false,
                  amount: config ? formatCurrency(Math.floor((poolTotal * 35) / 100)) : '—',
                  color: 'var(--accent-emerald)',
                },
                {
                  match: '3 Numbers', label: 'Standard prize', share: '25%', rollover: false,
                  amount: config ? formatCurrency(Math.floor((poolTotal * 25) / 100)) : '—',
                  color: 'var(--text-secondary)',
                },
              ].map((tier) => (
                <div
                  key={tier.match}
                  className="glass rounded-xl p-5 flex items-center justify-between group hover:border-[var(--border-accent)] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: `${tier.color}18`, color: tier.color, fontFamily: 'var(--font-mono)' }}
                    >
                      {tier.share}
                    </div>
                    <div>
                      <div className="font-semibold">{tier.match}</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {tier.label}
                        {tier.rollover && <span className="ml-2 text-[var(--accent-gold)]">· Rolls over ↑</span>}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: tier.color }}>
                    {tier.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CHARITIES ────────────────────────────────────── */}
      <section className="py-28 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[var(--accent-emerald)] text-sm font-medium uppercase tracking-widest mb-3">
                Charitable Impact
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700 }}>
                You choose who benefits
              </h2>
            </div>
            <Link
              href="/charities"
              className="hidden md:flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-emerald)] transition-colors"
            >
              All charities →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {(charities || []).map((charity) => (
              <div
                key={charity.id}
                className="glass rounded-2xl p-7 hover:border-[var(--border-accent)] transition-all duration-300 cursor-pointer group"
              >
                <div
                  className="w-12 h-12 rounded-xl mb-5 flex items-center justify-center text-xl"
                  style={{ background: 'rgba(0,200,150,0.1)' }}
                >
                  ❤️
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-[var(--accent-emerald)] transition-colors">
                  {charity.name}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {charity.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section className="py-28 px-6 lg:px-8 bg-[var(--bg-surface)]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[var(--accent-emerald)] text-sm font-medium uppercase tracking-widest mb-4">
            Membership
          </p>
          <h2
            className="mb-4"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 54px)', fontWeight: 700 }}
          >
            One membership. Full access.
          </h2>
          <p className="text-[var(--text-secondary)] mb-12">
            Both plans include all features — score tracking, monthly draws, charity giving, and winner benefits.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Monthly */}
            <div className="glass rounded-2xl p-8 text-left">
              <div className="text-[var(--text-muted)] text-sm mb-2 uppercase tracking-widest">Monthly</div>
              <div className="flex items-end gap-1 mb-1">
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: 700, lineHeight: 1 }}>
                  £14.99
                </span>
                <span className="text-[var(--text-muted)] mb-2">/ month</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-8">Cancel anytime. No lock-in.</p>
              <Link
                href="/auth/signup?plan=monthly"
                className="btn-glow block text-center px-6 py-3 rounded-xl font-semibold transition-all"
                style={{ background: 'var(--accent-emerald)', color: '#080810' }}
              >
                Get started
              </Link>
            </div>

            {/* Yearly */}
            <div
              className="rounded-2xl p-8 text-left relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(0,200,150,0.12), rgba(245,200,66,0.08))', border: '1px solid rgba(0,200,150,0.3)' }}
            >
              <div
                className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full font-bold"
                style={{ background: 'var(--accent-gold)', color: '#080810' }}
              >
                SAVE 17%
              </div>
              <div className="text-[var(--text-secondary)] text-sm mb-2 uppercase tracking-widest">Yearly</div>
              <div className="flex items-end gap-1 mb-1">
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '52px', fontWeight: 700, lineHeight: 1 }}>
                  £149.90
                </span>
                <span className="text-[var(--text-muted)] mb-2">/ year</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-8">That's £12.49 / month billed annually.</p>
              <Link
                href="/auth/signup?plan=yearly"
                className="block text-center px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
                style={{ background: 'var(--accent-gold)', color: '#080810' }}
              >
                Get best value
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────── */}
      <section className="py-28 px-6 lg:px-8">
        <div
          className="max-w-4xl mx-auto rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(0,200,150,0.1) 0%, rgba(245,200,66,0.07) 100%)', border: '1px solid rgba(0,200,150,0.2)' }}
        >
          <h2
            className="mb-5"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 700 }}
          >
            Your golf, for good.
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto mb-10 text-lg">
            Every round you play. Every score you enter. Every month — a chance to
            win, and a certainty of giving.
          </p>
          <Link
            href="/auth/signup"
            className="btn-glow inline-flex items-center gap-2 px-10 py-4 rounded-xl font-semibold text-base transition-all"
            style={{ background: 'var(--accent-emerald)', color: '#080810' }}
          >
            Join GolfGives today
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </>
  )
}
