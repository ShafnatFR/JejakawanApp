import { createClient } from '@/lib/supabase/client'
import { Destination, UserProfile, SubscriptionPlan } from '@/types/database'

export interface RecommendationResult {
  destinations: (Destination & { relevance_score: number })[]
  total: number
  has_more: boolean
  daily_remaining: number
}

const DAILY_LIMITS: Record<SubscriptionPlan, number> = {
  free: 3,
  weekly: 10,
  monthly: Infinity,
  exclusive: Infinity,
}

const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 3500, 5500, 8000, 12000, 18000]

function calculateRelevance(
  dest: Destination,
  profile: UserProfile | null,
  mode: 'tourist' | 'explorer'
): number {
  let categoryMatch = 0
  let underratedBonus = 0

  if (profile?.preferred_interests?.length) {
    const overlap = dest.category.filter(c => profile.preferred_interests.includes(c)).length
    categoryMatch = overlap / Math.max(profile.preferred_interests.length, 1)
  }

  const ratingScore = Math.min(dest.rating_avg / 5, 1)
  const visitScore = Math.min(dest.visit_count / 10000, 1)

  if (mode === 'explorer' && dest.is_underrated) {
    underratedBonus = 1
  }

  return (
    categoryMatch * 0.3 +
    ratingScore * 0.2 +
    visitScore * 0.1 +
    underratedBonus * 0.15
  )
}

export async function getRecommendations(
  userId: string | undefined,
  mode: 'tourist' | 'explorer' = 'tourist',
  offset = 0,
  limit = 20
): Promise<RecommendationResult> {
  const supabase = createClient()

  // Check daily limit
  let dailyRemaining = 0
  if (userId) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription, preferred_interests, budget_min, budget_max, xp_total')
      .eq('id', userId)
      .single()

    const plan = (profile?.subscription as SubscriptionPlan) || 'free'
    const dailyLimit = DAILY_LIMITS[plan]

    if (dailyLimit !== Infinity) {
      const today = new Date().toISOString().split('T')[0]
      const { count } = await supabase
        .from('user_recommendation_limits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('date', today)

      const used = count || 0
      dailyRemaining = Math.max(0, dailyLimit - used)

      if (dailyRemaining <= 0) {
        return { destinations: [], total: 0, has_more: false, daily_remaining: 0 }
      }
    } else {
      dailyRemaining = Infinity
    }
  }

  // Fetch active destinations
  let query = supabase
    .from('destinations')
    .select('*', { count: 'exact' })
    .eq('is_active', true)

  // Budget filter
  if (userId) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('budget_max')
      .eq('id', userId)
      .single()

    if (profile?.budget_max) {
      query = query.lte('entry_fee_min', profile.budget_max)
    }
  }

  query = query.range(0, Math.min(offset + 199, 499))

  const { data: allDests, count: total } = await query

  if (!allDests) {
    return { destinations: [], total: 0, has_more: false, daily_remaining: dailyRemaining }
  }

  // Get profile for scoring
  const { data: profile } = userId
    ? await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()
    : { data: null }

  // Score and sort
  const scored = allDests.map(dest => ({
    ...dest,
    relevance_score: calculateRelevance(dest, profile as UserProfile | null, mode),
  }))

  scored.sort((a, b) => b.relevance_score - a.relevance_score)

  const paged = scored.slice(offset, offset + limit)
  const hasMore = offset + limit < scored.length

  // Track usage
  if (userId && dailyRemaining !== Infinity) {
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('user_recommendation_limits').upsert(
      { user_id: userId, date: today, count: 1 },
      { onConflict: 'user_id,date', ignoreDuplicates: false }
    ).then(async () => {
      await supabase.rpc('increment_recommendation_count', { p_user_id: userId, p_date: today }).catch(() => {
        // Fallback: just insert a new row
        return supabase.from('user_recommendation_limits').insert({ user_id: userId, date: today })
      })
    }).catch(() => {
      // Table may not exist yet, ignore
    })
  }

  return {
    destinations: paged as (Destination & { relevance_score: number })[],
    total: scored.length,
    has_more: hasMore,
    daily_remaining: dailyRemaining === Infinity ? 9999 : dailyRemaining,
  }
}
