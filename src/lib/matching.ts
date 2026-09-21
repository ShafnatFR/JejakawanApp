import { createClient } from '@/lib/supabase/client'
import { TripRequest, UserProfile, TripMatch } from '@/types/database'

export interface Candidate {
  trip: TripRequest & { creator?: UserProfile; destination?: any }
  compatibility: number
  factors: {
    destination: number
    date_overlap: number
    budget_overlap: number
    interest_match: number
    transport_match: number
    reputation: number
  }
}

function calculateDateOverlap(
  aFrom: string, aTo: string, bFrom: string, bTo: string
): number {
  const aStart = new Date(aFrom).getTime()
  const aEnd = new Date(aTo).getTime()
  const bStart = new Date(bFrom).getTime()
  const bEnd = new Date(bTo).getTime()

  const overlapStart = Math.max(aStart, bStart)
  const overlapEnd = Math.min(aEnd, bEnd)

  if (overlapEnd <= overlapStart) return 0

  const overlapDays = (overlapEnd - overlapStart) / 86400000
  const totalDays = Math.max((aEnd - aStart), (bEnd - bStart)) / 86400000

  return Math.min(overlapDays / Math.max(totalDays, 1), 1)
}

function calculateBudgetOverlap(
  aMin: number, aMax: number, bMin: number, bMax: number
): number {
  const overlapMin = Math.max(aMin, bMin)
  const overlapMax = Math.min(aMax, bMax)

  if (overlapMax < overlapMin) return 0

  const overlapRange = overlapMax - overlapMin
  const totalRange = Math.max(aMax - aMin, bMax - bMin, 1)

  return overlapRange / totalRange
}

export function calculateCompatibility(
  tripA: TripRequest,
  tripB: TripRequest,
  userA: UserProfile,
  userB: UserProfile
): { score: number; factors: Candidate['factors'] } {
  // Destination match (25%)
  const destination = tripA.destination_id === tripB.destination_id ? 1 : 0

  // Date overlap (20%)
  const date_overlap = calculateDateOverlap(
    tripA.date_from, tripA.date_to,
    tripB.date_from, tripB.date_to
  )

  // Budget overlap (20%)
  const budget_overlap = calculateBudgetOverlap(
    tripA.budget_min, tripA.budget_max,
    tripB.budget_min, tripB.budget_max
  )

  // Interest match (15%)
  const interestsA = userA.preferred_interests || []
  const interestsB = userB.preferred_interests || []
  let interest_match = 0
  if (interestsA.length && interestsB.length) {
    const overlap = interestsA.filter(i => interestsB.includes(i)).length
    interest_match = overlap / Math.max(interestsA.length, interestsB.length)
  }

  // Transport match (10%)
  const transportA = tripA.transport_modes || []
  const transportB = tripB.transport_modes || []
  let transport_match = 0
  if (transportA.length && transportB.length) {
    const overlap = transportA.filter(t => transportB.includes(t)).length
    transport_match = overlap / Math.max(transportA.length, transportB.length)
  }

  // Reputation (10%)
  const reputation = (
    ((userA.rating_avg || 0) / 5) * 0.5 +
    ((userB.rating_avg || 0) / 5) * 0.5
  )

  const factors = { destination, date_overlap, budget_overlap, interest_match, transport_match, reputation }
  const score = Math.round(
    destination * 25 +
    date_overlap * 20 +
    budget_overlap * 20 +
    interest_match * 15 +
    transport_match * 10 +
    reputation * 10
  )

  return { score: Math.min(score, 100), factors }
}

export async function findCandidates(tripRequestId: string): Promise<Candidate[]> {
  const supabase = createClient()

  // Get the target trip
  const { data: targetTrip } = await supabase
    .from('trip_requests')
    .select('*, creator:user_profiles!creator_id(*)')
    .eq('id', tripRequestId)
    .single()

  if (!targetTrip) return []

  const targetUser = targetTrip.creator as UserProfile
  if (!targetUser) return []

  // Find other open trips with creators
  const { data: otherTrips } = await supabase
    .from('trip_requests')
    .select('*, creator:user_profiles!creator_id(*), destination:destinations(*)')
    .eq('status', 'open')
    .neq('id', tripRequestId)
    .limit(50)

  if (!otherTrips) return []

  // Filter eligible candidates
  const candidates: Candidate[] = []

  for (const trip of otherTrips) {
    const user = trip.creator as UserProfile
    if (!user) continue

    // Eligibility checks
    if (!user.ktp_verified) continue
    if ((user.rating_avg || 0) < 3.0) continue

    const { score, factors } = calculateCompatibility(
      targetTrip as TripRequest,
      trip as TripRequest,
      targetUser,
      user
    )

    candidates.push({
      trip: trip as TripRequest & { creator?: UserProfile; destination?: any },
      compatibility: score,
      factors,
    })
  }

  candidates.sort((a, b) => b.compatibility - a.compatibility)
  return candidates
}

export async function acceptMatch(matchId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('trip_matches')
    .update({ status: 'accepted' })
    .eq('id', matchId)

  if (error) return false

  // Get match details to update member count
  const { data: match } = await supabase
    .from('trip_matches')
    .select('trip_request_id')
    .eq('id', matchId)
    .single()

  if (match) {
    await supabase.rpc('increment_trip_members', { p_trip_id: match.trip_request_id }).catch(() => {
      // Fallback: manual increment
      supabase.from('trip_requests')
        .select('current_members')
        .eq('id', match.trip_request_id)
        .single()
        .then(({ data }) => {
          if (data) {
            supabase.from('trip_requests')
              .update({ current_members: (data.current_members || 0) + 1 })
              .eq('id', match.trip_request_id)
          }
        })
    })
  }

  return true
}

export async function declineMatch(matchId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('trip_matches')
    .update({ status: 'declined' })
    .eq('id', matchId)
  return !error
}

export async function sendMatchRequest(
  tripRequestId: string,
  inviterId: string,
  inviteeId: string
): Promise<TripMatch | null> {
  const supabase = createClient()

  // Calculate compatibility
  const { data: inviterTrip } = await supabase
    .from('trip_requests')
    .select('*, creator:user_profiles!creator_id(*)')
    .eq('creator_id', inviterId)
    .eq('status', 'open')
    .single()

  const { data: inviteeTrip } = await supabase
    .from('trip_requests')
    .select('*, creator:user_profiles!creator_id(*)')
    .eq('id', tripRequestId)
    .single()

  let compatibility = 50 // default if we can't calculate
  if (inviterTrip && inviteeTrip) {
    const inviterUser = inviterTrip.creator as UserProfile
    const inviteeUser = inviteeTrip.creator as UserProfile
    if (inviterUser && inviteeUser) {
      const { score } = calculateCompatibility(
        inviterTrip as TripRequest,
        inviteeTrip as TripRequest,
        inviterUser,
        inviteeUser
      )
      compatibility = score
    }
  }

  const { data, error } = await supabase
    .from('trip_matches')
    .insert({
      trip_request_id: tripRequestId,
      inviter_id: inviterId,
      invitee_id: inviteeId,
      compatibility,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    })
    .select()
    .single()

  if (error) return null
  return data as TripMatch
}
