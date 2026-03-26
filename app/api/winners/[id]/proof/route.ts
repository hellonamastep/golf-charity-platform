import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// POST /api/winners/[id]/proof — upload proof screenshot
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // Upload to Supabase Storage
  const fileName = `proof_${params.id}_${Date.now()}.${file.name.split('.').pop()}`
  const { data: upload, error: uploadError } = await supabase.storage
    .from('winner-proofs')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('winner-proofs').getPublicUrl(upload.path)

  await supabase
    .from('winners')
    .update({ proof_url: publicUrl, verification_status: 'pending' })
    .eq('id', params.id)
    .eq('user_id', user.id)

  return NextResponse.json({ url: publicUrl })
}

// PATCH /api/winners/[id]/proof — admin verify/reject winner
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { verification_status, payment_status, admin_notes } = await request.json()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (verification_status) {
    updates.verification_status = verification_status
    if (verification_status === 'approved') updates.verified_at = new Date().toISOString()
  }
  if (payment_status) {
    updates.payment_status = payment_status
    if (payment_status === 'paid') updates.paid_at = new Date().toISOString()
  }
  if (admin_notes !== undefined) updates.admin_notes = admin_notes

  const { error } = await adminSupabase
    .from('winners')
    .update(updates)
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
