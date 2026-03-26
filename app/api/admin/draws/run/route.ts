import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  generateRandomDraw,
  generateAlgorithmicDraw,
  checkMatches,
  calculatePrizePools,
} from '@/lib/draw-engine'

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return profile?.role === 'admin' ? user : null
}

// POST /api/admin/draws/run — run a draw (simulate or publish)
export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { drawMonth, drawType, simulate } = await request.json()
  const supabase = createAdminClient()

  // Get active subscribers and their scores
  const { data: activeSubs } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active')

  if (!activeSubs?.length) {
    return NextResponse.json({ error: 'No active subscribers' }, { status: 400 })
  }

  const userIds = activeSubs.map((s) => s.user_id)

  // Get latest 5 scores per user
  const { data: allScores } = await supabase
    .from('golf_scores')
    .select('user_id, score')
    .in('user_id', userIds)
    .order('played_at', { ascending: false })

  // Group scores per user (max 5)
  const userScoreMap: Record<string, number[]> = {}
  for (const s of allScores || []) {
    if (!userScoreMap[s.user_id]) userScoreMap[s.user_id] = []
    if (userScoreMap[s.user_id].length < 5) userScoreMap[s.user_id].push(s.score)
  }

  // Only include users with at least 3 scores
  const eligibleUsers = Object.entries(userScoreMap).filter(([, scores]) => scores.length >= 3)

  if (!eligibleUsers.length) {
    return NextResponse.json({ error: 'No eligible users (need at least 3 scores)' }, { status: 400 })
  }

  // Generate draw
  const flatScores = Object.values(userScoreMap).flat()
  const drawResult =
    drawType === 'algorithmic'
      ? generateAlgorithmicDraw(flatScores)
      : generateRandomDraw()

  // Get config for prize pools
  const { data: config } = await supabase.from('prize_config').select('*').single()
  const { data: prevDraw } = await supabase
    .from('draws')
    .select('rollover_amount')
    .eq('draw_month', drawMonth)
    .single()

  const rollover = prevDraw?.rollover_amount || 0
  const pools = calculatePrizePools(
    activeSubs.length,
    config?.monthly_price_pence || 1499,
    config?.subscription_pool_percentage || 30,
    rollover
  )

  // Create or update the draw record
  const { data: drawRecord, error: drawError } = await supabase
    .from('draws')
    .upsert({
      draw_month: drawMonth,
      draw_type: drawType || 'random',
      winning_numbers: drawResult.winningNumbers,
      status: simulate ? 'simulated' : 'published',
      jackpot_amount: pools.jackpot,
      prize_pool_total: pools.totalPool,
      participant_count: eligibleUsers.length,
      rollover_amount: rollover,
      published_at: simulate ? null : new Date().toISOString(),
    }, { onConflict: 'draw_month' })
    .select()
    .single()

  if (drawError) return NextResponse.json({ error: drawError.message }, { status: 500 })

  if (!simulate) {
    // Calculate matches and create entries + winners
    const fiveMatchWinners: string[] = []
    const fourMatchWinners: string[] = []
    const threeMatchWinners: string[] = []

    for (const [userId, scores] of eligibleUsers) {
      const { matchCount, prizeTier } = checkMatches(scores, drawResult.winningNumbers)
      await supabase.from('draw_entries').upsert({
        draw_id: drawRecord.id,
        user_id: userId,
        entry_numbers: scores,
        match_count: matchCount,
        prize_tier: prizeTier,
        prize_amount: null, // set below after split calc
      }, { onConflict: 'draw_id,user_id' })

      if (prizeTier === '5-match') fiveMatchWinners.push(userId)
      else if (prizeTier === '4-match') fourMatchWinners.push(userId)
      else if (prizeTier === '3-match') threeMatchWinners.push(userId)
    }

    // Calculate split prizes
    const prizes: Record<string, { amount: number; tier: string }> = {}
    if (fiveMatchWinners.length > 0) {
      const share = Math.floor(pools.jackpot / fiveMatchWinners.length)
      fiveMatchWinners.forEach((id) => (prizes[id] = { amount: share, tier: '5-match' }))
    }
    if (fourMatchWinners.length > 0) {
      const share = Math.floor(pools.fourMatchPool / fourMatchWinners.length)
      fourMatchWinners.forEach((id) => (prizes[id] = { amount: share, tier: '4-match' }))
    }
    if (threeMatchWinners.length > 0) {
      const share = Math.floor(pools.threeMatchPool / threeMatchWinners.length)
      threeMatchWinners.forEach((id) => (prizes[id] = { amount: share, tier: '3-match' }))
    }

    // Handle jackpot rollover
    if (fiveMatchWinners.length === 0) {
      await supabase
        .from('draws')
        .update({ rollover_amount: pools.jackpot })
        .eq('id', drawRecord.id)
    }

    // Update entries with prize amounts and create winner records
    for (const [userId, prize] of Object.entries(prizes)) {
      const { data: entry } = await supabase
        .from('draw_entries')
        .select('id')
        .eq('draw_id', drawRecord.id)
        .eq('user_id', userId)
        .single()

      if (entry) {
        await supabase
          .from('draw_entries')
          .update({ prize_amount: prize.amount })
          .eq('id', entry.id)

        await supabase.from('winners').upsert({
          draw_entry_id: entry.id,
          user_id: userId,
          draw_id: drawRecord.id,
          prize_tier: prize.tier,
          prize_amount: prize.amount,
          verification_status: 'pending',
          payment_status: 'pending',
        }, { onConflict: 'draw_entry_id' })
      }
    }
  }

  return NextResponse.json({
    success: true,
    draw: drawRecord,
    winningNumbers: drawResult.winningNumbers,
    simulate,
    stats: {
      participants: eligibleUsers.length,
      totalPool: pools.totalPool,
      jackpot: pools.jackpot,
    },
  })
}
