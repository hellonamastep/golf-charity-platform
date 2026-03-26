import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const adminSupabase = createAdminClient()
  const { data: winners } = await adminSupabase
    .from('winners')
    .select('*, profile:profiles(full_name, email), draw:draws(draw_month)')
    .order('created_at', { ascending: false })

  return NextResponse.json({ winners: winners || [] })
}
