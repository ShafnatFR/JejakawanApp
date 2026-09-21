import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/discover"

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createClient(cookieStore)
      await supabase.auth.exchangeCodeForSession(code)
    } catch (e) {
      // fallback redirect
    }
  }

  return NextResponse.redirect(new URL(next, origin).toString())
}
