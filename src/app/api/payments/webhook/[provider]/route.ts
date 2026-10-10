import { NextRequest } from "next/server";
import { handleWebhookFor } from "@/lib/payments";

/**
 * POST /api/payments/webhook/[provider]
 *
 * Webhook generik multi-gateway:
 *  - `/api/payments/webhook/mayar`
 *      Daftarkan URL ini di dashboard Mayar (Integration -> Webhook) dengan
 *      `?secret=<MAYAR_WEBHOOK_SECRET>`; header `x-mayar-secret` juga diterima.
 *      Mayar tidak mengirim signature, jadi setiap notifikasi diverifikasi
 *      ulang ke GET /transactions/{id} sebelum transaksi ditandai lunas.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params;
  return handleWebhookFor(provider, request);
}
