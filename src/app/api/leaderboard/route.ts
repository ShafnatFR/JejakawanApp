import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const supabase = createClient(cookies())
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "50")
  const region = searchParams.get("region")

  let query = supabase
    .from("user_profiles")
    .select("id, display_name, avatar_url, xp_total, level, badge_count, rating_avg")
    .order("xp_total", { ascending: false })
    .limit(limit)

  if (region) query = query.eq("province", region)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
