import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const supabase = createClient(cookies())
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "50")
  const search = searchParams.get("search")

  let query = supabase.from("user_profiles").select("*").order("created_at", { ascending: false }).limit(limit)
  if (search) query = query.or(`display_name.ilike.%${search}%,id.ilike.%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function PUT(request: NextRequest) {
  const supabase = createClient(cookies())
  const body = await request.json()
  const { user_id, is_banned } = body

  const { data, error } = await supabase
    .from("user_profiles")
    .update({ is_banned })
    .eq("id", user_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
