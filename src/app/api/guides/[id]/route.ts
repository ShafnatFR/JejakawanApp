import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient(cookies())
  const { data, error } = await supabase
    .from("guide_profiles")
    .select("*, user:user_profiles(display_name,avatar_url,rating_avg,bio), reviews:reviews!target_id(rating,comment,reviewer:user_profiles(display_name))")
    .eq("id", params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ data })
}
