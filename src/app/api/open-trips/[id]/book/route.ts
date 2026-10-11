import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import {
  activeProvider,
  PaymentProviderError,
  type PaymentLineItem,
} from "@/lib/payments"

/** Masa berlaku tagihan (jam). */
const PAYMENT_EXPIRY_HOURS = 24

/** Origin absolut, menghormati header reverse-proxy. */
function resolveOrigin(request: NextRequest): string {
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0].trim() || "https"
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0].trim() ||
    request.headers.get("host")
  if (host) return `${proto}://${host}`
  try {
    return new URL(request.url).origin
  } catch {
    return ""
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error"
}

/**
 * POST /api/open-trips/[id]/book
 *
 * Mendaftarkan user ke open trip:
 *  1. validasi trip & kapasitas & anti-double-booking;
 *  2. membuat baris `open_trip_bookings` (pending);
 *  3. bila trip berbayar — membuat transaksi pending + tagihan
 *     Mayar (via provider aktif) dan mengembalikan payment_url;
 *     bila gratis — booking langsung dikonfirmasi.
 *
 * Webhook Mayar menyinkronkan `payment_status` booking ke "paid"
 * melalui `reference_type="booking"` (lihat lib/payments/index.ts).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const amount = Math.round(Number(trip.price) || 0)

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("open_trip_bookings")
      .insert({
        trip_id: params.id,
        user_id: user.id,
        status: amount > 0 ? "pending" : "confirmed",
        payment_status: "pending",
      })
      .select()
      .single()

    if (bookingError || !booking) {
      console.error("Booking insert failed:", bookingError)
      return NextResponse.json(
        { error: "Gagal membuat booking." },
        { status: 500 }
      )
    }

    // Update participant count
    await supabase
      .from("open_trips")
      .update({ current_participants: trip.current_participants + 1 })
      .eq("id", params.id)

    // Trip gratis — tidak perlu pembayaran
    if (amount <= 0) {
      return NextResponse.json(
        { data: booking, payment_url: null, free: true },
        { status: 201 }
      )
    }

    // ── Alur pembayaran (provider aktif: Mayar) ──────────────
    const provider = activeProvider()
    if (!provider.isConfigured()) {
      return NextResponse.json(
        {
          error: `Provider pembayaran ${provider.label} belum dikonfigurasi. Hubungi admin.`,
        },
        { status: 503 }
      )
    }

    const items: PaymentLineItem[] = [
      {
        description: `Open Trip: ${String(trip.title).slice(0, 110)}`,
        quantity: 1,
        rate: amount,
      },
    ]

    // Record transaksi (pending) yang merujuk ke booking ini.
    // Saat webhook Mayar menandai transaksi lunas, syncReference()
    // otomatis mengubah payment_status booking menjadi "paid".
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "open_trip_booking",
        amount,
        status: "pending",
        reference_type: "booking",
        reference_id: booking.id,
      })
      .select()
      .single()

    if (txError || !tx) {
      console.error("Transaction insert failed:", txError)
      return NextResponse.json(
        { error: "Gagal membuat record transaksi." },
        { status: 500 }
      )
    }

    const origin = resolveOrigin(request)
    const expiresAt = new Date(
      Date.now() + PAYMENT_EXPIRY_HOURS * 60 * 60 * 1000
    )

    const result = await provider.createPayment({
      orderNumber: tx.id,
      amount,
      customer: {
        name:
          (user.user_metadata as Record<string, unknown> | null)
            ?.display_name?.toString() ||
          user.email ||
          "Pelanggan",
        email: user.email ?? "",
        mobile:
          (user.user_metadata as Record<string, unknown> | null)?.phone?.toString() ||
          undefined,
      },
      items,
      redirectUrl: `${origin}/bookings`,
      expiresAt,
    })

    // Simpan referensi pembayaran ke transaksi
    const { error: updError } = await supabase
      .from("transactions")
      .update({
        payment_provider: result.provider,
        payment_ref: result.providerRef,
        payment_url: result.paymentUrl,
      })
      .eq("id", tx.id)

    if (updError) {
      console.error("Transaction payment_ref update failed:", updError)
      // Tidak menggagalkan respons — klien tetap bisa membuka paymentUrl.
    }

    return NextResponse.json({
      data: booking,
      transaction_id: tx.id,
      provider: result.provider,
      provider_ref: result.providerRef,
      payment_url: result.paymentUrl,
      expires_at: expiresAt.toISOString(),
    }, { status: 201 })
  } catch (error) {
    console.error("Open trip booking error:", error)
    const message = errorMessage(error)
    if (error instanceof PaymentProviderError && error.statusCode < 500) {
      return NextResponse.json({ error: message }, { status: error.statusCode })
    }
    return NextResponse.json(
      {
        error: "Gagal memproses booking. Silakan coba lagi beberapa saat lagi.",
        detail: process.env.NODE_ENV === "production" ? undefined : message,
      },
      { status: 502 }
    )
  }
}
