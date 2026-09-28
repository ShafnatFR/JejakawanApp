import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { createPayment } from "@/lib/payments/stub"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Get the trip
  const { data: trip } = await supabase
    .from("open_trips")
    .select("*")
    .eq("id", params.id)
    .single()

  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 })
  if (trip.current_participants >= trip.max_participants) {
    return NextResponse.json({ error: "Trip penuh" }, { status: 400 })
  }

  // Check existing booking
  const { data: existing } = await supabase
    .from("open_trip_bookings")
    .select("id")
    .eq("trip_id", params.id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) return NextResponse.json({ error: "Sudah booking" }, { status: 400 })

  // Create payment stub
  const payment = await createPayment({
    amount: trip.price,
    description: `Booking: ${trip.title}`,
    user_id: user.id,
    metadata: { trip_id: trip.id },
  })

  // Create booking
  const { data: booking, error } = await supabase
    .from("open_trip_bookings")
    .insert({
      trip_id: params.id,
      user_id: user.id,
      status: "pending",
      payment_status: "pending",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update participant count
  await supabase
    .from("open_trips")
    .update({ current_participants: trip.current_participants + 1 })
    .eq("id", params.id)

  return NextResponse.json({
    data: booking,
    payment_url: payment.payment_url,
    transaction_id: payment.transaction_id,
  }, { status: 201 })
}
