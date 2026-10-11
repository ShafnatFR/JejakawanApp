import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  activeProvider,
  PaymentProviderError,
  type PaymentLineItem,
} from "@/lib/payments";

/**
 * POST /api/payments/create
 *
 * Membuat transaksi pembayaran Mayar untuk user yang sedang login.
 *
 * Body:
 *  - amount         number  (wajib, Rupiah utuh > 0)
 *  - description    string  (opsional)
 *  - type           string  (opsional, default "booking")
 *  - payment_method string  (opsional, mis. "qris")
 *  - reference_type string  (opsional: "booking" | "donation" | "subscription" | "guide_booking")
 *  - reference_id   uuid    (opsional, id baris di tabel bisnis terkait)
 *  - items          array   (opsional, default satu baris = amount)
 *
 * Respons:
 *  { transaction_id, provider, provider_ref, payment_url, amount, expires_at }
 */

/** Masa berlaku pembayaran (jam). */
const PAYMENT_EXPIRY_HOURS = 24;

/** Absolute origin of this app, honouring reverse-proxy headers. */
function resolveOrigin(request: NextRequest): string {
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0].trim() || "https";
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0].trim() ||
    request.headers.get("host");
  if (host) return `${proto}://${host}`;
  try {
    return new URL(request.url).origin;
  } catch {
    return "";
  }
}

/** Nilai `expiredAt` dari respons gateway bila ada (Mayar: epoch ms). */
function resolveExpiresAt(raw: unknown, fallback: Date): string {
  if (raw !== null && typeof raw === "object" && "expiredAt" in raw) {
    const value = (raw as { expiredAt?: unknown }).expiredAt;
    if (typeof value === "number" && Number.isFinite(value)) {
      const date = new Date(value < 1e12 ? value * 1000 : value);
      if (!Number.isNaN(date.getTime())) return date.toISOString();
    }
    if (typeof value === "string") {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) return date.toISOString();
    }
  }
  return fallback.toISOString();
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Body request tidak valid" },
        { status: 400 }
      );
    }

    const amount = Math.round(Number(body?.amount));
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Nominal pembayaran tidak valid (harus lebih dari 0)." },
        { status: 400 }
      );
    }

    const type =
      typeof body?.type === "string" && body.type.trim()
        ? body.type.trim().slice(0, 50)
        : "booking";
    const description =
      typeof body?.description === "string" && body.description.trim()
        ? body.description.trim().slice(0, 200)
        : "Pembayaran Jejakawan";
    const paymentMethod =
      typeof body?.payment_method === "string" && body.payment_method.trim()
        ? body.payment_method.trim().slice(0, 50)
        : null;
    const referenceType =
      typeof body?.reference_type === "string" && body.reference_type.trim()
        ? body.reference_type.trim().slice(0, 50)
        : null;
    const referenceId =
      typeof body?.reference_id === "string" && body.reference_id.trim()
        ? body.reference_id.trim()
        : null;

    // Baris item: default satu baris dengan nominal penuh.
    let items: PaymentLineItem[];
    if (Array.isArray(body?.items) && body.items.length > 0) {
      items = body.items
        .filter(
          (it: any) =>
            it &&
            Number.isFinite(Number(it.rate)) &&
            Number(it.quantity) > 0
        )
        .slice(0, 50)
        .map((it: any, i: number) => ({
          description: String(it.description || `Item ${i + 1}`).slice(0, 120),
          quantity: Math.max(1, Math.round(Number(it.quantity))),
          rate: Math.round(Number(it.rate)),
        }));
      if (items.length === 0) {
        items = [{ description, quantity: 1, rate: amount }];
      }
    } else {
      items = [{ description, quantity: 1, rate: amount }];
    }

    // ── 1. Buat record transaksi (status pending) ────────────────────
    const { data: tx, error: insertError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type,
        amount,
        status: "pending",
        payment_method: paymentMethod,
        reference_type: referenceType,
        reference_id: referenceId,
      })
      .select()
      .single();

    if (insertError || !tx) {
      console.error("Transaction insert failed:", insertError);
      return NextResponse.json(
        { error: "Gagal membuat record transaksi." },
        { status: 500 }
      );
    }

    const provider = activeProvider();
    if (!provider.isConfigured()) {
      return NextResponse.json(
        {
          error: `Provider pembayaran ${provider.label} belum dikonfigurasi. Hubungi admin untuk mengaktifkan pembayaran.`,
        },
        { status: 503 }
      );
    }

    // ── 2. Buat tagihan di gateway ───────────────────────────────────
    const origin = resolveOrigin(request);
    const expiresAt = new Date(
      Date.now() + PAYMENT_EXPIRY_HOURS * 60 * 60 * 1000
    );

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
      paymentMethodHint: paymentMethod ?? undefined,
    });

    // ── 3. Simpan referensi pembayaran ───────────────────────────────
    const { error: updError } = await supabase
      .from("transactions")
      .update({
        payment_provider: result.provider,
        payment_ref: result.providerRef,
        payment_url: result.paymentUrl,
      })
      .eq("id", tx.id);

    if (updError) {
      console.error("Transaction payment_ref update failed:", updError);
      // Tidak menggagalkan respons — klien tetap bisa membuka paymentUrl.
    }

    return NextResponse.json({
      transaction_id: tx.id,
      provider: result.provider,
      provider_ref: result.providerRef,
      payment_url: result.paymentUrl,
      redirect_url: result.paymentUrl,
      amount,
      expires_at: resolveExpiresAt(result.raw, expiresAt),
    });
  } catch (error) {
    console.error("Create payment error:", error);
    const message = errorMessage(error);
    if (error instanceof PaymentProviderError && error.statusCode < 500) {
      return NextResponse.json({ error: message }, { status: error.statusCode });
    }
    return NextResponse.json(
      {
        error:
          "Gagal membuat transaksi pembayaran. Silakan coba lagi beberapa saat lagi.",
        detail: process.env.NODE_ENV === "production" ? undefined : message,
      },
      { status: 502 }
    );
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}
