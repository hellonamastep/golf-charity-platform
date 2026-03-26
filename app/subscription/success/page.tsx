import Link from 'next/link'

export default function SubscriptionSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0,200,150,0.08) 0%, transparent 70%)' }} />
      <div className="relative text-center max-w-md">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          Welcome to GolfGives!
        </h1>
        <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
          Your subscription is active. Start entering your Stableford scores and you'll be entered into next month's draw automatically.
        </p>
        <Link href="/dashboard" className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold" style={{ background: 'var(--accent-emerald)', color: '#080810' }}>
          Go to Dashboard →
        </Link>
      </div>
    </div>
  )
}
