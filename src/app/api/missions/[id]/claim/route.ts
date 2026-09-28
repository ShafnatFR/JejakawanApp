import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Check mission exists and is claimable
  const { data: mission } = await supabase
    .from("missions")
    .select("*")
    .eq("id", params.id)
    .eq("is_active", true)
    .single()

  if (!mission) return NextResponse.json({ error: "Misi tidak ditemukan" }, { status: 404 })
  if (mission.max_claims !== null && mission.current_claims >= mission.max_claims) {
    return NextResponse.json({ error: "Misi sudah penuh" }, { status: 400 })
  }

  // Check if already claimed
  const { data: existing } = await supabase
    .from("mission_claims")
    .select("id")
    .eq("mission_id", params.id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) return NextResponse.json({ error: "Sudah mengklaim misi ini" }, { status: 400 })

  const { data, error } = await supabase
    .from("mission_claims")
    .insert({ mission_id: params.id, user_id: user.id, status: "claimed" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update claim count
  await supabase
    .from("missions")
    .update({ current_claims: mission.current_claims + 1 })
    .eq("id", params.id)

  return NextResponse.json({ data }, { status: 201 })
}
