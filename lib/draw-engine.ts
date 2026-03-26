// ─── DRAW ENGINE ────────────────────────────────────────────────────────────
// Generates winning numbers for the monthly draw
// Supports: random mode and algorithmic (score-frequency weighted) mode

export type DrawType = 'random' | 'algorithmic'

export interface DrawResult {
  winningNumbers: number[]
  drawType: DrawType
  metadata?: Record<string, unknown>
}

/** Generate 5 unique numbers 1–45 (random lottery style) */
export function generateRandomDraw(): DrawResult {
  const nums = new Set<number>()
  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 45) + 1)
  }
  return {
    winningNumbers: Array.from(nums).sort((a, b) => a - b),
    drawType: 'random',
  }
}

/**
 * Algorithmic draw: weighted by user score frequency.
 * Numbers that appear most often in user scores are more likely to be drawn.
 * Numbers 1-45 each get a weight; higher frequency = higher weight.
 */
export function generateAlgorithmicDraw(
  userScores: number[] // flat array of all active user scores
): DrawResult {
  // Build frequency map
  const freq: Record<number, number> = {}
  for (let i = 1; i <= 45; i++) freq[i] = 1 // baseline weight
  for (const s of userScores) {
    if (s >= 1 && s <= 45) freq[s] = (freq[s] || 0) + 2 // boost seen scores
  }

  // Build weighted pool
  const pool: number[] = []
  for (let i = 1; i <= 45; i++) {
    for (let j = 0; j < freq[i]; j++) pool.push(i)
  }

  // Fisher-Yates shuffle and pick 5 unique
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  const nums = new Set<number>()
  for (const n of shuffled) {
    nums.add(n)
    if (nums.size === 5) break
  }

  // Fallback if we somehow didn't get 5
  while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1)

  return {
    winningNumbers: Array.from(nums).sort((a, b) => a - b),
    drawType: 'algorithmic',
    metadata: {
      totalScoresAnalyzed: userScores.length,
      topScores: Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([num, count]) => ({ num: Number(num), count })),
    },
  }
}

/** Check how many numbers a user's entry matches against winning numbers */
export function checkMatches(
  userNumbers: number[],
  winningNumbers: number[]
): { matchCount: number; prizeTier: string | null } {
  const winSet = new Set(winningNumbers)
  const matchCount = userNumbers.filter((n) => winSet.has(n)).length

  let prizeTier: string | null = null
  if (matchCount === 5) prizeTier = '5-match'
  else if (matchCount === 4) prizeTier = '4-match'
  else if (matchCount === 3) prizeTier = '3-match'

  return { matchCount, prizeTier }
}

/** Calculate prize amounts for a draw */
export function calculatePrizePools(
  activeSubscriberCount: number,
  monthlyPricePence: number,
  poolPercentage: number,
  rolloverAmount: number = 0
): {
  totalPool: number
  jackpot: number
  fourMatchPool: number
  threeMatchPool: number
} {
  const totalPool =
    Math.floor((activeSubscriberCount * monthlyPricePence * poolPercentage) / 100) +
    rolloverAmount
  const jackpot = Math.floor((totalPool * 40) / 100)
  const fourMatchPool = Math.floor((totalPool * 35) / 100)
  const threeMatchPool = Math.floor((totalPool * 25) / 100)
  return { totalPool, jackpot, fourMatchPool, threeMatchPool }
}

/** Convert pence to formatted £ string */
export function formatPounds(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}
