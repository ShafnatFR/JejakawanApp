export type UserRole = 'tourist' | 'explorer'
export type TripStatus = 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled'
export type MatchStatus = 'pending' | 'accepted' | 'declined' | 'expired'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'
export type SubscriptionPlan = 'free' | 'weekly' | 'monthly' | 'exclusive'
export type TargetType = 'destination' | 'user' | 'agency'

export interface UserProfile {
  id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  current_mode: UserRole
  preferred_interests: string[]
  budget_min: number
  budget_max: number
  transport_modes: string[]
  home_location: string | null
  current_location: string | null
  ktp_verified: boolean
  phone_verified: boolean
  rating_avg: number
  xp_total: number
  level: number
  badge_count: number
  subscription: SubscriptionPlan
  created_at: string
  updated_at: string
}

export interface Destination {
  id: string
  name: string
  slug: string
  description: string
  category: string[]
  latitude: number
  longitude: number
  address: string
  province: string
  regency: string
  cover_image_url: string | null
  image_urls: string[]
  is_underrated: boolean
  entry_fee_min: number
  entry_fee_max: number
  signal_strength: string | null
  best_season: string[]
  rating_avg: number
  visit_count: number
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TripRequest {
  id: string
  creator_id: string
  destination_id: string
  date_from: string
  date_to: string
  budget_min: number
  budget_max: number
  transport_modes: string[]
  max_members: number
  current_members: number
  notes: string | null
  status: TripStatus
  created_at: string
  updated_at: string
  creator?: UserProfile
  destination?: Destination
}

export interface TripMatch {
  id: string
  trip_request_id: string
  inviter_id: string
  invitee_id: string
  compatibility: number
  status: MatchStatus
  expires_at: string
  created_at: string
  inviter?: UserProfile
  invitee?: UserProfile
  trip_request?: TripRequest
}

export interface OpenTrip {
  id: string
  agency_id: string
  destination_id: string
  title: string
  description: string
  price: number
  start_date: string
  end_date: string
  max_participants: number
  current_participants: number
  includes: string[]
  excludes: string[]
  itinerary: any
  created_at: string
  updated_at: string
  agency?: AgencyProfile
  destination?: Destination
}

export interface AgencyProfile {
  id: string
  user_id: string
  agency_name: string
  description: string | null
  logo_url: string | null
  phone: string | null
  email: string | null
  rating_avg: number
  is_verified: boolean
  created_at: string
}

export interface Review {
  id: string
  reviewer_id: string
  target_type: TargetType
  target_id: string
  rating: number
  comment: string | null
  trip_id: string | null
  created_at: string
  reviewer?: UserProfile
}

export interface Badge {
  id: string
  name: string
  description: string
  icon_url: string | null
  category: string
  xp_required: number
  condition_type: string | null
  condition_value: number | null
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  badge?: Badge
}

export interface Mission {
  id: string
  title: string
  description: string
  destination_id: string | null
  xp_reward: number
  badge_reward_id: string | null
  start_date: string | null
  end_date: string | null
  max_claims: number | null
  current_claims: number
  created_at: string
  destination?: Destination
}

export interface MissionClaim {
  id: string
  mission_id: string
  user_id: string
  status: string
  proof_url: string | null
  completed_at: string | null
  created_at: string
  mission?: Mission
}

export interface ChatRoom {
  id: string
  type: 'direct' | 'group'
  trip_group_id: string | null
  created_at: string
}

export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  content: string
  type: 'text' | 'image' | 'system'
  created_at: string
  sender?: UserProfile
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  data: any
  read_at: string | null
  created_at: string
}

export interface UserReport {
  id: string
  reporter_id: string
  reported_type: 'user' | 'content'
  reported_id: string
  reason: string
  description: string | null
  status: ReportStatus
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}
