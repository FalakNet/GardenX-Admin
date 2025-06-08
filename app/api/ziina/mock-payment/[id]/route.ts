import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    { error: "Mock payments are disabled. Use real Ziina integration." },
    { status: 501 }
  )
}
