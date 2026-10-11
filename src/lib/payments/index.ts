/**
 * Registry provider pembayaran Jejakawan (Supabase edition).
 *
 * Diport dari jagofarm-ecommerce, diadaptasi ke Supabase:
 *  - Tidak ada Prisma/email — transisi status menulis ke tabel
 *    `transactions` (service role) lalu menyinkronkan tabel bisnis
 *    yang direferensikan (`reference_type` + `reference_id`).
 *  - Provider aktif: env PAYMENT_PROVIDER, fallback Mayar bila
 *    MAYAR_API_KEY tersedia.
 *
 * Webhook Mayar tidak mengirim signature, jadi keamanan bertumpu pada:
 *  1. secret rahasia di URL (?secret=) atau header x-mayar-secret;
 *  2. VERIFIKASI ULANG ke GET /transactions/{id} sebelum menandai lunas —
 *     payload webhook sendiri tidak pernah dipercaya;
 *  3. transisi idempoten (hanya menulis kalau status benar-benar berubah).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  extractMayarWebhookSecret,
  getMayarWebhookSecret,
  mayarProvider,
  mayarSecretMatches,
} from "./mayar";
import {
  PaymentProviderError,
  type NormalizedWebhookEvent,
  type PaymentProvider,
  type PaymentStatusResult,
} from "./types";

export * from "./types";

/** Provider yang dipakai untuk pembayaran BARU. */
export function activeProvider(): PaymentProvider {
  const configured = (process.env.PAYMENT_PROVIDER ?? "").trim().toLowerCase();
  if (configured === "mayar") return mayarProvider;
  if (mayarProvider.isConfigured()) return mayarProvider;
  return mayarProvider;
}

/** Provider untuk transaksi yang sudah tersimpan. */
export function providerForTransaction(tx: {
  payment_provider?: string | null;
}): PaymentProvider {
  const stored = (tx.payment_provider ?? "").trim().toLowerCase();
  if (stored === "mayar") return mayarProvider;
  return activeProvider();
}

/**
 * Admin client (service role) untuk webhook — tidak bergantung cookie.
 * Auth session di-disable supaya tidak menyimpan session ke cookie.
 */
export function adminClient(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

function errorStatus(error: unknown, fallback: number): number {
  return error instanceof PaymentProviderError ? error.statusCode : fallback;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

/**
 * Sinkronkan tabel bisnis yang direferensikan transaksi (idempoten,
 * best-effort — kegagalan tidak menggagalkan respons webhook).
 */
export async function syncReference(
  supabase: SupabaseClient,
  tx: { reference_type?: string | null; reference_id?: string | null }
): Promise<void> {
  if (!tx.reference_type || !tx.reference_id) return;
  switch (tx.reference_type) {
    case "booking":
      await supabase
        .from("open_trip_bookings")
        .update({ payment_status: "paid" })
        .eq("id", tx.reference_id);
      break;
    case "donation":
      await supabase
        .from("donations")
        .update({ payment_status: "paid" })
        .eq("id", tx.reference_id);
      break;
    case "subscription":
      await supabase
        .from("user_subscriptions")
        .update({ status: "active" })
        .eq("id", tx.reference_id);
      break;
    case "guide_booking":
      await supabase
        .from("guide_bookings")
        .update({ status: "confirmed" })
        .eq("id", tx.reference_id);
      break;
    default:
      console.warn(
        `[payments] reference_type "${tx.reference_type}" tidak dikenal — tabel bisnis tidak disinkronkan.`
      );
  }
}

/**
 * POST /api/payments/webhook/mayar
 *
 * Daftarkan URL ini di dashboard Mayar (Integration -> Webhook) dengan
 * `?secret=<MAYAR_WEBHOOK_SECRET>`; header `x-mayar-secret` juga diterima.
 */
async function handleMayarWebhook(request: NextRequest): Promise<NextResponse> {
  if (!getMayarWebhookSecret()) {
    return NextResponse.json(
      {
        error:
          "MAYAR_WEBHOOK_SECRET belum dikonfigurasi. Set env tersebut lalu daftarkan URL webhook Mayar dengan ?secret=<nilai>.",
      },
      { status: 503 }
    );
  }

  const candidate = extractMayarWebhookSecret(request);
  if (!candidate || !mayarSecretMatches(candidate)) {
    return NextResponse.json({ error: "Secret webhook Mayar tidak valid." }, { status: 401 });
  }

  let event: NormalizedWebhookEvent;
  try {
    event = await mayarProvider.parseWebhook(request);
  } catch (error) {
    console.error("Mayar webhook payload error:", error);
    return NextResponse.json(
      { error: errorMessage(error) },
      { status: errorStatus(error, 400) }
    );
  }

  // Hanya event pembayaran yang memerlukan verifikasi &
  // transisi status. Event lain (test, payment.reminder,
  // shipper.status, membership.*) diakui (200) tanpa
  // mengubah apa pun.
  if (event.status !== "paid") {
    console.log(
      `[payments/webhook/mayar] Event non-payment.received diakui: status=${event.status}, providerRef=${event.providerRef ?? "-"}.`
    );
    return NextResponse.json({
      status: "ok",
      changed: false,
      verified: false,
      ignored: true,
    });
  }

  const providerRef = event.providerRef;
  const orderNumber = event.orderNumber;
  const supabase = adminClient();

  // ── Cari transaksi Jejakawan yang cocok ────────────────
  // Berdasarkan payment_ref (transactionId Mayar), atau —
  // bila payload tidak memuat transactionId — orderNumber
  // yang dikirim di extraData saat invoice dibuat
  // (nilainya = id transaksi Jejakawan).
  let tx: any = null;

  if (providerRef) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("payment_ref", providerRef)
      .maybeSingle();
    if (!error && data) tx = data;
  }
  if (!tx && orderNumber) {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", orderNumber)
      .maybeSingle();
    if (!error && data) tx = data;
  }

  if (!tx) {
    console.warn(
      `[payments/webhook/mayar] Tidak ada transaksi Jejakawan: providerRef=${providerRef ?? "-"}, orderNumber=${orderNumber ?? "-"}.`
    );
    return NextResponse.json(
      { error: "Transaksi tidak ditemukan." },
      { status: 404 }
    );
  }

  // ── Verifikasi ulang ke API Mayar (satu-satunya sumber kebenaran) ──
  // Utamakan providerRef dari webhook; bila gagal (mis.
  // payload tidak memuat transactionId), verifikasi dengan
  // payment_ref transaksi yang tersimpan.
  let verified: PaymentStatusResult | null = null;
  let lastError: unknown = null;
  const refs = [providerRef, tx.payment_ref].filter(
    (ref): ref is string => Boolean(ref)
  );
  for (const ref of refs) {
    try {
      verified = await mayarProvider.fetchStatus(ref);
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!verified) {
    console.error("Mayar verification failed:", lastError);
    return NextResponse.json(
      {
        error:
          "Gagal memverifikasi pembayaran ke Mayar. Notifikasi ini tidak mengubah status transaksi.",
        detail: errorMessage(lastError),
      },
      { status: 502 }
    );
  }

  const amountMatches =
    verified.amount !== undefined && verified.amount === Number(tx.amount);

  if (verified.status !== "paid" || !amountMatches) {
    console.warn(
      `[payments/webhook/mayar] Transaksi ${tx.id} TIDAK ditandai lunas: status="${verified.status}", nominal verifikasi=${verified.amount ?? "n/a"}, total transaksi=${tx.amount}.`
    );
    return NextResponse.json({
      status: "ok",
      changed: false,
      verified: false,
      transactionStatus: tx.status,
      providerStatus: verified.status,
    });
  }

  // ── Transisi idempoten ke paid ─────────────────────────────────────
  if (tx.status === "paid") {
    return NextResponse.json({
      status: "ok",
      changed: false,
      verified: true,
      transactionStatus: "paid",
    });
  }

  const { error: updError } = await supabase
    .from("transactions")
    .update({
      status: "paid",
      payment_method: verified.paymentMethod ?? tx.payment_method,
      payment_provider: "mayar",
      payment_ref: verified.providerRef ?? providerRef,
      paid_at: verified.paidAt?.toISOString() ?? new Date().toISOString(),
    })
    .eq("id", tx.id);

  if (updError) {
    console.error("Transaction update failed:", updError);
    return NextResponse.json(
      { error: "Gagal memperbarui status transaksi" },
      { status: 500 }
    );
  }

  await syncReference(supabase, tx);

  return NextResponse.json({
    status: "ok",
    changed: true,
    verified: true,
    transactionStatus: "paid",
  });
}

/**
 * Dispatcher webhook generik.
 *
 * - `mayar`    -> verifikasi secret + verifikasi ulang ke API Mayar.
 * - provider lain -> 404 (Midtrans belum terintegrasi di Jejakawan).
 */
export async function handleWebhookFor(
  providerParam: string,
  request: NextRequest
): Promise<NextResponse> {
  const id = (providerParam ?? "").trim().toLowerCase();

  if (id !== "mayar") {
    return NextResponse.json(
      { error: `Provider pembayaran "${providerParam}" tidak dikenal atau belum didukung.` },
      { status: 404 }
    );
  }

  try {
    return await handleMayarWebhook(request);
  } catch (error) {
    console.error("Mayar webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
