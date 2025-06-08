export interface ZiinaPaymentIntent {
  id: string
  object: "payment_intent"
  amount: number
  currency_code: string
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | "requires_payment_instrument" | "requires_user_action"
  redirect_url?: string
  created_at: string
  message?: string
  metadata?: Record<string, any>
}

export interface CreatePaymentRequest {
  amount: number
  currency_code: "AED"
  message?: string
  test?: boolean
  transaction_source?: string
}

export async function createZiinaPayment(data: CreatePaymentRequest): Promise<ZiinaPaymentIntent> {
  const response = await fetch("/api/ziina/create-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create payment")
  }

  return response.json()
}

export async function getZiinaPaymentStatus(paymentId: string): Promise<ZiinaPaymentIntent> {
  const response = await fetch(`/api/ziina/payment/${paymentId}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to get payment status")
  }

  return response.json()
}

// Use the shared function from utils instead
export { formatCurrency } from './utils';
