import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!process.env.ZIINA_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Get the base URL for callbacks
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : "https://gardenx2.vercel.app" // Fallback to your domain

    // Try the minimal request based on the example
    const minimalPaymentData = {
      amount: Math.round(body.amount * 100),
      currency_code: "AED",
      test: true,
      transaction_source: "directApi",
      success_url: `${baseUrl}/api/ziina/success`,
      failure_url: `${baseUrl}/api/ziina/failure`,
      cancel_url: `${baseUrl}/api/ziina/cancel`,
    }

    console.log("Trying minimal Ziina request:", JSON.stringify(minimalPaymentData, null, 2))

    const response = await fetch("https://api-v2.ziina.com/api/payment_intent", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ZIINA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(minimalPaymentData),
    })

    const responseText = await response.text()
    console.log("Minimal request response status:", response.status)
    console.log("Minimal request response:", responseText)

    if (!response.ok) {
      return NextResponse.json(
        {
          error: responseText,
          status: response.status,
          request: minimalPaymentData,
        },
        { status: response.status },
      )
    }

    try {
      const paymentIntent = JSON.parse(responseText)
      return NextResponse.json(paymentIntent)
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Invalid JSON response",
          response: responseText,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in minimal payment creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
