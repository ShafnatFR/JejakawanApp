import { createClient } from '@/lib/supabase/client'

export interface TrustScoreResult {
  score: number
  factors: {
    phone_verified: number
    ktp_verified: number
    rating_bonus: number
    rating_count_bonus: number
    trips_bonus: number
    account_age_bonus: number
    warnings_penalty: number
  }
  eligible: boolean
}

export async function calculateTrustScore(userId: string): Promise<TrustScoreResult> {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('ktp_verified, phone_verified, rating_avg, created_at')
    .eq('id', userId)
    .single()

  if (!profile) {
    return {
      score: 0,
      factors: { phone_verified: 0, ktp_verified: 0, rating_bonus: 0, rating_count_bonus: 0, trips_bonus: 0, account_age_bonus: 0, warnings_penalty: 0 },
      eligible: false,
    }
  }

  // Get review count
  const { count: reviewCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('target_id', userId)
    .eq('target_type', 'user')

  // Get completed trips
  const { count: tripCount } = await supabase
    .from('trip_requests')
    .select('*', { count: 'exact', head: true })
    .eq('creator_id', userId)
    .eq('status', 'completed')

  // Get warnings
  const { count: warningCount } = await supabase
    .from('user_reports')
    .select('*', { count: 'exact', head: true })
    .eq('reported_id', userId)
    .eq('reported_type', 'user')
    .eq('status', 'resolved')

  // Account age in days
  const accountAgeDays = profile.created_at
    ? (Date.now() - new Date(profile.created_at).getTime()) / 86400000
    : 0

  const factors = {
    phone_verified: profile.phone_verified ? 10 : 0,
    ktp_verified: profile.ktp_verified ? 20 : 0,
    rating_bonus: (profile.rating_avg || 0) > 4 ? 15 : (profile.rating_avg || 0) > 3 ? 5 : 0,
    rating_count_bonus: (reviewCount || 0) >= 5 ? 10 : (reviewCount || 0) >= 2 ? 5 : 0,
    trips_bonus: (tripCount || 0) >= 3 ? 10 : (tripCount || 0) >= 1 ? 5 : 0,
    account_age_bonus: accountAgeDays > 30 ? 5 : 0,
    warnings_penalty: (warningCount || 0) * 15,
  }

  const score = Math.max(0,
    factors.phone_verified +
    factors.ktp_verified +
    factors.rating_bonus +
    factors.rating_count_bonus +
    factors.trips_bonus +
    factors.account_age_bonus -
    factors.warnings_penalty
  )

  return { score, factors, eligible: score >= 30 }
}

export async function getTrustScore(userId: string): Promise<number> {
  const supabase = createClient()

  // Try to get cached score from trust_score_logs
  const { data: logs } = await supabase
    .from('trust_score_logs')
    .select('change_amount')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (logs && logs.length > 0) {
    const cached = logs.reduce((sum, l) => sum + (l.change_amount || 0), 0)
    if (cached > 0) return Math.min(cached, 100)
  }

  // Calculate fresh
  const result = await calculateTrustScore(userId)
  return result.score
}

export async function checkMatchingEligibility(userId: string): Promise<{ eligible: boolean; reason?: string }> {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('ktp_verified, rating_avg, created_at')
    .eq('id', userId)
    .single()

  if (!profile) return { eligible: false, reason: 'Profil tidak ditemukan' }

  if (!profile.ktp_verified) {
    return { eligible: false, reason: 'Verifikasi KTP diperlukan' }
  }

  if ((profile.rating_avg || 0) < 3.0) {
    return { eligible: false, reason: 'Rating minimum 3.0 diperlukan' }
  }

  // Check account age > 24h
  if (profile.created_at) {
    const ageHours = (Date.now() - new Date(profile.created_at).getTime()) / 3600000
    if (ageHours < 24) {
      return { eligible: false, reason: 'Akun harus berusia minimal 24 jam' }
    }
  }

  // Check trust score
  const trustScore = await getTrustScore(userId)
  if (trustScore < 30) {
    return { eligible: false, reason: 'Trust score minimal 30 diperlukan' }
  }

  // Check if banned
  const { count: banCount } = await supabase
    .from('user_reports')
    .select('*', { count: 'exact', head: true })
    .eq('reported_id', userId)
    .eq('reported_type', 'user')
    .eq('status', 'resolved')

  if ((banCount || 0) >= 3) {
    return { eligible: false, reason: 'Akun diblokir karena laporan' }
  }

  return { eligible: true }
}

export async function submitReport(
  reporterId: string,
  reportedType: 'user' | 'content',
  reportedId: string,
  reason: string,
  description?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  // Check if already reported recently
  const { data: existing } = await supabase
    .from('user_reports')
    .select('id')
    .eq('reporter_id', reporterId)
    .eq('reported_id', reportedId)
    .eq('reported_type', reportedType)
    .gte('created_at', new Date(Date.now() - 86400000).toISOString())
    .single()

  if (existing) {
    return { success: false, error: 'Sudah melaporkan dalam 24 jam terakhir' }
  }

  const { error } = await supabase.from('user_reports').insert({
    reporter_id: reporterId,
    reported_type: reportedType,
    reported_id: reportedId,
    reason,
    description: description || null,
    status: 'pending',
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function blockUser(
  userId: string,
  blockedUserId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { error } = await supabase.from('user_blocks').upsert(
    { user_id: userId, blocked_user_id: blockedUserId },
    { onConflict: 'user_id,blocked_user_id' }
  )

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function isBlocked(userId: string, targetUserId: string): Promise<boolean> {
  const supabase = createClient()

  const { data } = await supabase
    .from('user_blocks')
    .select('id')
    .eq('user_id', userId)
    .eq('blocked_user_id', targetUserId)
    .single()

  return !!data
}
