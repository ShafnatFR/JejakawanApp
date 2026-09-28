// Payment stub for JejakawanApp
// TODO: Replace with Mayar integration when API key is ready

export interface PaymentResult {
  success: boolean
  payment_url: string | null
  transaction_id: string
  error?: string
}

export interface PaymentParams {
  amount: number
  description: string
  user_id: string
  metadata?: Record<string, string>
}

export async function createPayment(params: PaymentParams): Promise<PaymentResult> {
  const transaction_id = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  
  // Mock: simulates payment URL generation
  const payment_url = `https://payment-stub.example.com/pay/${transaction_id}?amount=${params.amount}`
  
  console.log(`[Payment Stub] Created payment: ${transaction_id} for Rp ${params.amount.toLocaleString("id-ID")}`)
  
  return {
    success: true,
    payment_url,
    transaction_id,
  }
}

export async function verifyPayment(transaction_id: string): Promise<{ success: boolean; status: "paid" | "pending" | "failed" }> {
  // Mock: always returns paid after verification
  console.log(`[Payment Stub] Verifying payment: ${transaction_id}`)
  return { success: true, status: "paid" }
}

export async function cancelPayment(transaction_id: string): Promise<{ success: boolean }> {
  console.log(`[Payment Stub] Cancelling payment: ${transaction_id}`)
  return { success: true }
}
