import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      <AdminSidebar profile={profile} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
          {children}
        </div>
      </main>
    </div>
  )
}
