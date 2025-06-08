import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Ziina webhook received:", body)

    // Here you would typically:
    // 1. Verify the webhook signature
    // 2. Update your database with the payment status
    // 3. Trigger any business logic based on the payment status

    const { id, status, amount, currency } = body

    console.log(`Payment ${id} status: ${status}, amount: ${amount} ${currency}`)

    // Acknowledge receipt of the webhook
    return NextResponse.json({
      status: "received",
      message: "Webhook processed successfully",
    })
  } catch (error) {
    console.error("Error processing Ziina webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
