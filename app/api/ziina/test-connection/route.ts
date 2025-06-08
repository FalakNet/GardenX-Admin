import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    if (!process.env.ZIINA_API_KEY) {
      return NextResponse.json({
        error: "ZIINA_API_KEY not configured",
        configured: false,
      })
    }

    // Test API connection with a simple request
    console.log("Testing Ziina API connection...")

    // Use the correct API endpoint from the example
    const response = await fetch("https://api-v2.ziina.com/api/payment_intent", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.ZIINA_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "GardenX-POS/1.0",
      },
    })

    const responseText = await response.text()

    console.log("Test response status:", response.status)
    console.log("Test response headers:", Object.fromEntries(response.headers.entries()))
    console.log("Test response body:", responseText)

    return NextResponse.json({
      configured: true,
      api_key_length: process.env.ZIINA_API_KEY.length,
      api_key_prefix: process.env.ZIINA_API_KEY.substring(0, 8) + "...",
      test_response: {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText,
      },
    })
  } catch (error) {
    console.error("Error testing Ziina connection:", error)
    return NextResponse.json({
      error: "Connection test failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
