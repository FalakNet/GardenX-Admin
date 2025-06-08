import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const paymentIntentId = searchParams.get("payment_intent")

  console.log("Payment cancel callback:", paymentIntentId)

  return NextResponse.json({
    status: "cancelled",
    payment_intent: paymentIntentId,
    message: "Payment was cancelled",
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Payment cancel webhook:", body)

    return NextResponse.json({
      status: "received",
      message: "Cancel webhook processed",
    })
  } catch (error) {
    console.error("Error processing cancel webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
