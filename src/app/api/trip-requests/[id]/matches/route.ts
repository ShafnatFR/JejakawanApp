import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Get the trip request
  const { data: trip } = await supabase
    .from("trip_requests")
    .select("*, creator:user_profiles!creator_id(*)")
    .eq("id", params.id)
    .single()

  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 })

  // Find compatible open trips by other users
  const { data: candidates } = await supabase
    .from("trip_requests")
    .select("*, creator:user_profiles!creator_id(*), destination:destinations(*)")
    .eq("status", "open")
    .neq("creator_id", user.id)
    .eq("destination_id", trip.destination_id)
    .limit(20)

  return NextResponse.json({ data: candidates || [] })
}
