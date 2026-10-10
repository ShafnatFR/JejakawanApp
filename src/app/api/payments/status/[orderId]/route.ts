import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  adminClient,
  providerForTransaction,
  syncReference,
} from "@/lib/payments";
import type { PaymentStatusResult } from "@/lib/payments";

/**
 * GET /api/payments/status/[transactionId]
 *
 * Mengecek & menyinkronkan status pembayaran transaksi milik user
 * (admin boleh mengecek transaksi siapa saja).
 *
 * Alur:
 *  1. ambil status dari gateway (provider.fetchStatus)
 *  2. verifikasi nominal cocok dengan transaksi
 *  3. transisi idempoten: tulis hanya kalau status benar-benar berubah
 *  4. sinkronkan tabel bisnis yang direferensikan (booking, donation, ...)
 */

export async function GET(
  _request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = params;
    const { data: tx, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", orderId)
      .single();

    if (txError || !tx) {
      // Jawaban sama untuk "bukan milikmu" supaya tidak bocorkan id transaksi lain.
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Pemilik transaksi atau admin.
    if (tx.user_id !== user.id) {
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!adminRole) {
        return NextResponse.json(
          { error: "Transaksi tidak ditemukan" },
          { status: 404 }
        );
      }
    }

    if (!tx.payment_ref) {
      return NextResponse.json(
        {
          error:
            'Transaksi ini belum memiliki pembayaran. Klik "Bayar Sekarang" terlebih dahulu.',
          transaction: serializeTransaction(tx),
        },
        { status: 400 }
      );
    }

    // ── Ambil status dari gateway ──────────────────────────────────────
    const provider = providerForTransaction(tx);
    let payment: PaymentStatusResult;
    try {
      payment = await provider.fetchStatus(tx.payment_ref);
    } catch (error) {
      console.error(`${provider.label} status lookup failed:`, error);
      return NextResponse.json(
        {
          error: `Gagal mengambil status pembayaran dari ${provider.label}. Coba lagi beberapa saat lagi.`,
          transaction: serializeTransaction(tx),
        },
        { status: 502 }
      );
    }

    const amountMatches =
      payment.amount !== undefined && payment.amount === Number(tx.amount);

    // ── Transisi idempoten ────────────────────────────────────────────
    let statusChanged = false;
    let verifiedPaid = false;

    if (payment.status === "paid" && amountMatches && tx.status !== "paid") {
      const admin = adminClient();
      const { error: updError } = await admin
        .from("transactions")
        .update({
          status: "paid",
          payment_method: payment.paymentMethod ?? tx.payment_method,
          payment_provider: payment.provider,
          payment_ref: payment.providerRef,
          paid_at: payment.paidAt?.toISOString() ?? new Date().toISOString(),
        })
        .eq("id", tx.id);

      if (updError) {
        console.error("Transaction status sync failed:", updError);
        return NextResponse.json(
          { error: "Gagal memperbarui status transaksi" },
          { status: 500 }
        );
      }

      await syncReference(admin, tx);
      statusChanged = true;
      verifiedPaid = true;
    } else if (
      (payment.status === "expired" || payment.status === "failed") &&
      tx.status === "pending"
    ) {
      const admin = adminClient();
      const { error: updError } = await admin
        .from("transactions")
        .update({ status: "failed" })
        .eq("id", tx.id);
      if (!updError) statusChanged = true;
    }

    return NextResponse.json({
      transaction: serializeTransaction(tx),
      status: verifiedPaid ? "paid" : tx.status,
      paymentStatus: payment.status,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      paidAt: payment.paidAt?.toISOString(),
      amountMatches,
      statusChanged,
    });
  } catch (error) {
    console.error("Payment status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function serializeTransaction(tx: Record<string, unknown>) {
  return {
    id: tx.id,
    type: tx.type,
    amount: Number(tx.amount),
    status: tx.status,
    payment_method: tx.payment_method,
    payment_provider: tx.payment_provider,
    payment_ref: tx.payment_ref,
    payment_url: tx.payment_url,
    paid_at: tx.paid_at,
    created_at: tx.created_at,
  };
}
