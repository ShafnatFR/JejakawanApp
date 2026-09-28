import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const supabase = createClient(cookies())
  const { searchParams } = new URL(request.url)
  const active = searchParams.get("active") !== "false"

  let query = supabase
    .from("missions")
    .select("*, destination:destinations(name,province)")
    .order("created_at", { ascending: false })

  if (active) {
    query = query.eq("is_active", true)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
