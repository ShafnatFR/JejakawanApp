import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const supabase = createClient(cookies())
  const { searchParams } = new URL(request.url)
  const province = searchParams.get("province")
  const category = searchParams.get("category")
  const underrated = searchParams.get("underrated")
  const search = searchParams.get("search")
  const limit = parseInt(searchParams.get("limit") || "50")
  const offset = parseInt(searchParams.get("offset") || "0")

  let query = supabase
    .from("destinations")
    .select("*")
    .eq("is_active", true)
    .order("rating_avg", { ascending: false })
    .range(offset, offset + limit - 1)

  if (province) query = query.eq("province", province)
  if (category) query = query.contains("category", [category])
  if (underrated === "true") query = query.eq("is_underrated", true)
  if (search) query = query.or(`name.ilike.%${search}%,province.ilike.%${search}%,regency.ilike.%${search}%`)

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
    .from("destinations")
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
