import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { trip_request_id, invitee_id, compatibility } = body

  const { data, error } = await supabase
    .from("trip_matches")
    .insert({
      trip_request_id,
      inviter_id: user.id,
      invitee_id,
      compatibility: compatibility || 50,
      status: "pending",
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
