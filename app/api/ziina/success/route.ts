import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { payment_intent_id, status } = body

    console.log("Ziina payment success webhook:", { payment_intent_id, status })

    // In a real implementation, you would:
    // 1. Verify the webhook signature
    // 2. Update your database with the payment status
    // 3. Process the order if payment is successful

    if (status === "completed") {
      // Payment successful - order should be processed by the frontend
      console.log("Payment completed successfully:", payment_intent_id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing payment success webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Handle success page redirect if needed
  const searchParams = request.nextUrl.searchParams
  const paymentId = searchParams.get("payment_intent")
  const status = searchParams.get("status")

  console.log("Payment success page accessed:", { paymentId, status })

  return NextResponse.json({
    message: "Payment processed",
    payment_id: paymentId,
    status,
  })
}
