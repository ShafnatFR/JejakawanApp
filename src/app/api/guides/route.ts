import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const supabase = createClient(cookies())
  const { searchParams } = new URL(request.url)
  const location = searchParams.get("location")
  const limit = parseInt(searchParams.get("limit") || "20")

  let query = supabase.from("guide_profiles").select("*, user:user_profiles(display_name,avatar_url,rating_avg)").eq("is_active", true).order("rating_avg", { ascending: false }).limit(limit)
  if (location) query = query.contains("operating_locations", [location])

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase.from("guide_profiles").insert({
    user_id: user.id,
    guide_name: body.guide_name,
    bio: body.bio,
    operating_locations: body.operating_locations || [],
    price_per_day: body.price_per_day || 0,
    languages: body.languages || [],
    bank_account: body.bank_account,
    bank_name: body.bank_name,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
