import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { proof_url } = body

  // Find the claim
  const { data: claim } = await supabase
    .from("mission_claims")
    .select("*, mission:missions(*)")
    .eq("mission_id", params.id)
    .eq("user_id", user.id)
    .eq("status", "claimed")
    .single()

  if (!claim) return NextResponse.json({ error: "Klaim tidak ditemukan" }, { status: 404 })

  // Update claim to completed
  const { data, error } = await supabase
    .from("mission_claims")
    .update({ status: "completed", proof_url: proof_url || null, completed_at: new Date().toISOString() })
    .eq("id", claim.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Award XP
  const mission = claim.mission as any
  if (mission?.xp_reward) {
    await supabase.from("user_xp_logs").insert({
      user_id: user.id,
      action: "complete_mission",
      xp_amount: mission.xp_reward,
      reference_type: "mission",
      reference_id: params.id,
    })

    // Update user XP
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("xp_total, level")
      .eq("id", user.id)
      .single()

    if (profile) {
      const newXp = (profile.xp_total || 0) + mission.xp_reward
      const thresholds = [0, 200, 500, 1000, 2000, 3500, 5500, 8000, 12000, 18000]
      let newLevel = 1
      for (let i = thresholds.length - 1; i >= 0; i--) {
        if (newXp >= thresholds[i]) { newLevel = i + 1; break }
      }
      await supabase.from("user_profiles").update({ xp_total: newXp, level: newLevel }).eq("id", user.id)
    }
  }

  return NextResponse.json({ data })
}
