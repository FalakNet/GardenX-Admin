import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Check if API key is configured
    if (!process.env.ZIINA_API_KEY) {
      console.error("ZIINA_API_KEY not configured")
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 })
    }

    // Prepare the request payload without any callback URLs
    const paymentData = {
      amount: Math.round(body.amount), // Convert AED to fils (smallest unit)
      currency_code: "AED",
      test: true,
      transaction_source: "directApi",
      message: body.message || "GardenX POS Payment",
      // No success_url, failure_url, or cancel_url
    }

    console.log("Creating Ziina payment intent with data:", JSON.stringify(paymentData, null, 2))

    // Use the correct API endpoint
    const response = await fetch("https://api-v2.ziina.com/api/payment_intent", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ZIINA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    })

    console.log("Ziina API response status:", response.status)

    // Get response text first to handle non-JSON responses
    const responseText = await response.text()
    console.log("Ziina API raw response:", responseText)

    if (!response.ok) {
      console.error("Ziina API error:", response.status, responseText)

      // Handle specific error cases
      if (response.status === 401) {
        return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
      }

      if (response.status === 400) {
        return NextResponse.json(
          {
            error: "Invalid request parameters",
            details: responseText,
          },
          { status: 400 },
        )
      }

      // Return the actual error message from Ziina
      return NextResponse.json(
        {
          error: responseText || "Payment service error",
        },
        { status: response.status },
      )
    }

    // Parse successful response
    let paymentIntent
    try {
      paymentIntent = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse Ziina response:", parseError)
      console.error("Response text:", responseText)
      return NextResponse.json({ error: "Invalid response from payment service" }, { status: 500 })
    }

    console.log("Payment intent created successfully:", paymentIntent.id)
    return NextResponse.json(paymentIntent)
  } catch (error) {
    console.error("Error in create-payment route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
