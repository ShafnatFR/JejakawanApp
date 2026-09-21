import { create } from 'zustand'
import { Destination, TripRequest, OpenTrip } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

interface AppState {
  destinations: Destination[]
  tripRequests: TripRequest[]
  openTrips: OpenTrip[]
  loading: boolean
  fetchDestinations: () => Promise<void>
  fetchTripRequests: () => Promise<void>
  fetchOpenTrips: () => Promise<void>
}

export const useAppStore = create<AppState>((set) => ({
  destinations: [],
  tripRequests: [],
  openTrips: [],
  loading: false,
  fetchDestinations: async () => {
    set({ loading: true })
    const supabase = createClient()
    const { data } = await supabase
      .from('destinations')
      .select('*')
      .eq('is_active', true)
      .order('rating_avg', { ascending: false })
    set({ destinations: (data as Destination[]) || [], loading: false })
  },
  fetchTripRequests: async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('trip_requests')
      .select('*, creator:user_profiles!creator_id(*), destination:destinations(*)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
    set({ tripRequests: (data as TripRequest[]) || [] })
  },
  fetchOpenTrips: async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('open_trips')
      .select('*, agency:agency_profiles(*), destination:destinations(*)')
      .order('start_date', { ascending: true })
    set({ openTrips: (data as OpenTrip[]) || [] })
  },
}))
