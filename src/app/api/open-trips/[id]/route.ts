import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient(cookies())
  const { data, error } = await supabase
    .from("open_trips")
    .select("*, agency:agency_profiles(agency_name,description,rating_avg,is_verified,phone,email), destination:destinations(name,province,description,latitude,longitude)")
    .eq("id", params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ data })
}
