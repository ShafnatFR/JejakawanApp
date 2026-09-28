import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const supabase = createClient(cookies())
  const { searchParams } = new URL(request.url)
  const target_id = searchParams.get("target_id")
  const target_type = searchParams.get("target_type") || "destination"
  const limit = parseInt(searchParams.get("limit") || "10")

  let query = supabase
    .from("reviews")
    .select("*, reviewer:user_profiles!reviewer_id(id,display_name,avatar_url,ktp_verified,rating_avg)")
    .eq("target_type", target_type)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (target_id) query = query.eq("target_id", target_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase
    .from("reviews")
    .insert({ reviewer_id: user.id, ...body })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
