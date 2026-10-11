import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from '@supabase/supabase-js'

// NOTE: do NOT annotate this with ReturnType<typeof createSupabaseClient> —
// instantiating the generic function that way collapses the internal Schema
// type parameter to `never`, which makes every `.from()`/`.insert()`/`.select()`
// resolve to `never`. `SupabaseClient<any>` keeps Schema = `any`, so queries
// stay permissive (any table name, rows as `any`) — the intended behaviour
// for an untyped client.
let clientInstance: SupabaseClient<any> | null = null

export function createClient() {
  if (!clientInstance) {
    clientInstance = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return clientInstance
}
