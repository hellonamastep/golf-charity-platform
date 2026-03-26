import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      <DashboardSidebar profile={profile} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10">
          {children}
        </div>
      </main>
    </div>
  )
}
