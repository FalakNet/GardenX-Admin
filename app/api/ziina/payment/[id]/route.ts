import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!process.env.ZIINA_API_KEY) {
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 })
    }

    console.log("Fetching payment intent:", params.id)

    // Use the correct Ziina API endpoint from the documentation
    const response = await fetch(`https://api-v2.ziina.com/api/payment_intent/${params.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.ZIINA_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    const responseText = await response.text()
    console.log("Ziina get payment response:", response.status, responseText)

    if (!response.ok) {
      console.error("Failed to get payment intent:", response.status, responseText)

      let errorMessage = "Failed to get payment status"
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        errorMessage = responseText || errorMessage
      }

      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    let paymentIntent
    try {
      paymentIntent = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse payment response:", parseError)
      return NextResponse.json({ error: "Invalid response from payment service" }, { status: 500 })
    }

    // Log the status for debugging
    console.log(`Payment ${params.id} status: ${paymentIntent.status}`)

    return NextResponse.json(paymentIntent)
  } catch (error) {
    console.error("Error getting payment intent:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
