import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const paymentIntentId = searchParams.get("payment_intent")

  console.log("Payment failure callback:", paymentIntentId)

  return NextResponse.json({
    status: "failed",
    payment_intent: paymentIntentId,
    message: "Payment failed",
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Payment failure webhook:", body)

    return NextResponse.json({
      status: "received",
      message: "Failure webhook processed",
    })
  } catch (error) {
    console.error("Error processing failure webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
