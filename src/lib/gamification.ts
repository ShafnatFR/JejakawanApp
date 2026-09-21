import { createClient } from '@/lib/supabase/client'

const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 3500, 5500, 8000, 12000, 18000]

const XP_REWARDS: Record<string, number> = {
  trip_created: 50,
  trip_completed: 100,
  match_accepted: 30,
  review_written: 20,
  destination_visited: 40,
  underrated_visit: 60,
  mission_completed: 0, // varies per mission
  profile_completed: 25,
  ktp_verified: 50,
  referral: 100,
}

export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1
  }
  return 1
}

export function getLevelThreshold(level: number): number {
  return LEVEL_THRESHOLDS[level - 1] ?? 0
}

export function getNextLevelThreshold(level: number): number {
  return LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
}

export async function addXP(
  userId: string,
  action: string,
  amount?: number,
  referenceId?: string,
  referenceType?: string
): Promise<{ newXp: number; newLevel: number; levelUp: boolean }> {
  const supabase = createClient()
  const xpAmount = amount ?? XP_REWARDS[action] ?? 10

  // Insert XP log
  await supabase.from('user_xp_logs').insert({
    user_id: userId,
    action,
    xp_amount: xpAmount,
    reference_id: referenceId || null,
    reference_type: referenceType || null,
  })

  // Get current XP
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('xp_total, level')
    .eq('id', userId)
    .single()

  if (!profile) return { newXp: 0, newLevel: 1, levelUp: false }

  const newXp = (profile.xp_total || 0) + xpAmount
  const oldLevel = profile.level || 1
  const newLevel = getLevelFromXP(newXp)
  const levelUp = newLevel > oldLevel

  // Update profile
  await supabase
    .from('user_profiles')
    .update({ xp_total: newXp, level: newLevel })
    .eq('id', userId)

  // Check badge unlocks on level up
  if (levelUp) {
    await checkBadgeUnlock(userId)
  }

  return { newXp, newLevel, levelUp }
}

export async function checkLevelUp(userId: string): Promise<{ level: number; levelUp: boolean }> {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('xp_total, level')
    .eq('id', userId)
    .single()

  if (!profile) return { level: 1, levelUp: false }

  const correctLevel = getLevelFromXP(profile.xp_total || 0)
  const levelUp = correctLevel > (profile.level || 1)

  if (levelUp) {
    await supabase
      .from('user_profiles')
      .update({ level: correctLevel })
      .eq('id', userId)
  }

  return { level: correctLevel, levelUp }
}

const BADGE_CONDITIONS: Record<string, (userId: string, supabase: any) => Promise<boolean>> = {
  first_trip: async (userId, supabase) => {
    const { count } = await supabase
      .from('trip_requests')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId)
    return (count || 0) >= 1
  },
  trip_master: async (userId, supabase) => {
    const { count } = await supabase
      .from('trip_requests')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId)
      .eq('status', 'completed')
    return (count || 0) >= 5
  },
  social_butterfly: async (userId, supabase) => {
    const { count } = await supabase
      .from('trip_matches')
      .select('*', { count: 'exact', head: true })
      .eq('invitee_id', userId)
      .eq('status', 'accepted')
    return (count || 0) >= 3
  },
  reviewer: async (userId, supabase) => {
    const { count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('reviewer_id', userId)
    return (count || 0) >= 5
  },
  explorer: async (userId, supabase) => {
    const { count } = await supabase
      .from('user_xp_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action', 'underrated_visit')
    return (count || 0) >= 3
  },
  verified: async (userId, supabase) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('ktp_verified, phone_verified')
      .eq('id', userId)
      .single()
    return data?.ktp_verified === true && data?.phone_verified === true
  },
  level_5: async (userId, supabase) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('level')
      .eq('id', userId)
      .single()
    return (data?.level || 0) >= 5
  },
  level_10: async (userId, supabase) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('level')
      .eq('id', userId)
      .single()
    return (data?.level || 0) >= 10
  },
}

export async function checkBadgeUnlock(userId: string): Promise<string[]> {
  const supabase = createClient()
  const unlockedBadges: string[] = []

  // Get all badges with conditions
  const { data: badges } = await supabase
    .from('badges')
    .select('id, condition_type')
    .not('condition_type', 'is', null)

  if (!badges) return []

  // Get already earned badges
  const { data: earned } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)

  const earnedIds = new Set((earned || []).map((b: any) => b.badge_id))

  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue
    if (!badge.condition_type) continue

    const checker = BADGE_CONDITIONS[badge.condition_type]
    if (!checker) continue

    const earned = await checker(userId, supabase)
    if (earned) {
      await supabase.from('user_badges').insert({
        user_id: userId,
        badge_id: badge.id,
      })
      unlockedBadges.push(badge.id)

      // Update badge count
      await supabase.rpc('increment_badge_count', { p_user_id: userId }).catch(async () => {
        const { data: p } = await supabase
          .from('user_profiles')
          .select('badge_count')
          .eq('id', userId)
          .single()
        if (p) {
          await supabase
            .from('user_profiles')
            .update({ badge_count: (p.badge_count || 0) + 1 })
            .eq('id', userId)
        }
      })
    }
  }

  return unlockedBadges
}

export async function claimMission(
  userId: string,
  missionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // Check if mission exists and is active
  const { data: mission } = await supabase
    .from('missions')
    .select('max_claims, current_claims')
    .eq('id', missionId)
    .single()

  if (!mission) return { success: false, error: 'Misi tidak ditemukan' }

  if (mission.max_claims && mission.current_claims >= mission.max_claims) {
    return { success: false, error: 'Misi sudah penuh' }
  }

  // Check if already claimed
  const { data: existing } = await supabase
    .from('mission_claims')
    .select('id')
    .eq('mission_id', missionId)
    .eq('user_id', userId)
    .single()

  if (existing) return { success: false, error: 'Sudah mengklaim misi ini' }

  // Claim
  const { error } = await supabase.from('mission_claims').insert({
    mission_id: missionId,
    user_id: userId,
    status: 'claimed',
  })

  if (error) return { success: false, error: error.message }

  // Increment claims
  await supabase
    .from('missions')
    .update({ current_claims: (mission.current_claims || 0) + 1 })
    .eq('id', missionId)

  return { success: true }
}

export async function completeMission(
  claimId: string,
  proofUrl?: string
): Promise<{ success: boolean; xpEarned?: number; error?: string }> {
  const supabase = createClient()

  const { data: claim } = await supabase
    .from('mission_claims')
    .select('*, mission:missions(*)')
    .eq('id', claimId)
    .single()

  if (!claim) return { success: false, error: 'Klaim tidak ditemukan' }
  if (claim.status === 'completed') return { success: false, error: 'Sudah selesai' }

  const updateData: any = {
    status: 'completed',
    completed_at: new Date().toISOString(),
  }
  if (proofUrl) updateData.proof_url = proofUrl

  const { error } = await supabase
    .from('mission_claims')
    .update(updateData)
    .eq('id', claimId)

  if (error) return { success: false, error: error.message }

  // Award XP
  const mission = claim.mission as any
  const xpReward = mission?.xp_reward || 0
  let xpEarned = 0

  if (xpReward > 0) {
    const result = await addXP(
      claim.user_id,
      'mission_completed',
      xpReward,
      claim.mission_id,
      'mission'
    )
    xpEarned = result.newXp
  }

  // Award badge if mission has one
  if (mission?.badge_reward_id) {
    await supabase.from('user_badges').insert({
      user_id: claim.user_id,
      badge_id: mission.badge_reward_id,
    }).catch(() => {}) // may already exist
  }

  return { success: true, xpEarned }
}

export async function getLeaderboard(limit = 10) {
  const supabase = createClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url, xp_total, level, badge_count, rating_avg')
    .order('xp_total', { ascending: false })
    .limit(limit)

  return data || []
}

export async function getXPHistory(userId: string, limit = 20) {
  const supabase = createClient()
  const { data } = await supabase
    .from('user_xp_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}
