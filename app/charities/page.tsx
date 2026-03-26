import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default async function CharitiesPage() {
  const supabase = createClient()
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-20 px-6 lg:px-8" style={{ background: 'var(--bg-base)' }}>
        <div className="absolute inset-0 h-80" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,200,150,0.06) 0%, transparent 70%)' }} />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[var(--accent-emerald)] text-sm font-medium uppercase tracking-widest mb-4">Charitable Impact</p>
            <h1 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,6vw,72px)', fontWeight: 700 }}>
              Causes we support
            </h1>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto text-lg">
              Every GolfGives subscription donates a portion to the charity of your choice.
              Meet the organisations making a difference.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(charities || []).map((c) => (
              <div
                key={c.id}
                className="glass rounded-2xl p-7 group hover:border-[var(--border-accent)] transition-all duration-300 relative overflow-hidden"
              >
                {c.is_featured && (
                  <div className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(245,200,66,0.15)', color: 'var(--accent-gold)' }}>
                    ★ Featured
                  </div>
                )}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5" style={{ background: 'rgba(0,200,150,0.1)' }}>
                  ❤️
                </div>
                <h2 className="font-semibold text-lg mb-2 group-hover:text-[var(--accent-emerald)] transition-colors">
                  {c.name}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                  {c.description}
                </p>
                {c.website && (
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--accent-emerald)] hover:underline"
                  >
                    Visit website →
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <p className="text-[var(--text-secondary)] mb-6">
              Subscribe to start donating to your chosen charity with every monthly payment.
            </p>
            <Link href="/auth/signup" className="btn-glow inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold" style={{ background: 'var(--accent-emerald)', color: '#080810' }}>
              Join GolfGives & start giving
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
