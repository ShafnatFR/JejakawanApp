import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/types/database'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  fetchProfile: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  setUser: (user) => {
    const current = get().user
    // Skip if same user (prevent re-render spam on TOKEN_REFRESHED)
    if (current?.id === user?.id) return
    set({ user })
  },
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  _fetching: false,
  fetchProfile: async () => {
    const { user, _fetching } = get() as any
    if (!user || _fetching) return
    set({ _fetching: true } as any)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (data && !error) {
      set({ profile: data as UserProfile, _fetching: false } as any)
    } else {
      set({ _fetching: false } as any)
    }
  },
  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
  updateProfile: async (updates) => {
    const { user, profile } = get()
    if (!user) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (data && !error) {
      set({ profile: { ...profile, ...data } as UserProfile })
    }
  },
}))
