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

/** Paket berbayar: harga (Rp) dan masa aktif (hari). */
const PLANS: Record<string, { price: number; label: string; durationDays: number }> = {
  weekly: { price: 9900, label: "Weekly", durationDays: 7 },
  monthly: { price: 29000, label: "Monthly", durationDays: 30 },
  exclusive: { price: 299000, label: "Exclusive", durationDays: 365 },
}

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
 * POST /api/subscriptions/checkout
 *
 * Membeli paket langganan:
 *  1. membuat baris `user_subscriptions` (status "pending");
 *  2. membuat transaksi pending + tagihan Mayar (via provider
 *     aktif) dan mengembalikan payment_url;
 *  3. setelah pembayaran lunas, webhook Mayar mengaktifkan
 *     langganan dan memperbarui `user_profiles` melalui
 *     `reference_type="subscription"` (lihat lib/payments/index.ts).
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(cookies())
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Paket yang dibeli
    let plan = ""
    try {
      const body = await request.json()
      if (body && typeof body.plan === "string") plan = body.plan.toLowerCase()
    } catch {
      // Body kosong / bukan JSON
    }
    const config = PLANS[plan]
    if (!config) {
      return NextResponse.json({ error: "Paket langganan tidak valid." }, { status: 400 })
    }

    const amount = config.price
    const subscriptionExpiresAt = new Date(
      Date.now() + config.durationDays * 24 * 60 * 60 * 1000
    )

    // Buat baris langganan (pending hingga pembayaran dikonfirmasi webhook)
    const { data: subscription, error: subscriptionError } = await supabase
      .from("user_subscriptions")
      .insert({
        user_id: user.id,
        plan,
        expires_at: subscriptionExpiresAt.toISOString(),
        status: "pending",
      })
      .select()
      .single()

    if (subscriptionError || !subscription) {
      console.error("Subscription insert failed:", subscriptionError)
      return NextResponse.json(
        { error: "Gagal membuat langganan." },
        { status: 500 }
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
        description: `Langganan Jejakawan ${config.label}`,
        quantity: 1,
        rate: amount,
      },
    ]

    // Record transaksi (pending) yang merujuk ke langganan ini.
    // Saat webhook Mayar menandai transaksi lunas, syncReference()
    // mengaktifkan langganan dan memperbarui user_profiles.
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "subscription",
        amount,
        status: "pending",
        reference_type: "subscription",
        reference_id: subscription.id,
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
    const invoiceExpiresAt = new Date(
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
      redirectUrl: `${origin}/subscription`,
      expiresAt: invoiceExpiresAt,
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

    return NextResponse.json(
      {
        data: subscription,
        transaction_id: tx.id,
        provider: result.provider,
        provider_ref: result.providerRef,
        payment_url: result.paymentUrl,
        expires_at: invoiceExpiresAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Subscription checkout error:", error)
    if (error instanceof PaymentProviderError) {
      return NextResponse.json(
        { error: errorMessage(error) },
        { status: error.statusCode < 500 ? error.statusCode : 502 }
      )
    }
    return NextResponse.json(
      {
        error: "Gagal memproses pembelian langganan. Silakan coba lagi beberapa saat lagi.",
        detail: process.env.NODE_ENV === "production" ? undefined : errorMessage(error),
      },
      { status: 502 }
    )
  }
}
