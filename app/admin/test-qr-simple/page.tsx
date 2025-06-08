"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FunctionalQRCode } from "@/components/functional-qr-code"
import { QRCode } from "@/components/qr-code"

export default function TestQRSimple() {
  const [text, setText] = useState("https://pay.ziina.com/payment_intent/pi_test123")
  const [size, setSize] = useState(200)

  const testTexts = [
    "https://pay.ziina.com/payment_intent/pi_test123",
    "https://www.google.com",
    "Hello World",
    "Test QR Code",
    "https://gardenx2.vercel.app",
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>QR Code Test - Functional Implementation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Text to encode</label>
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Size</label>
                <Input
                  type="number"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  min="100"
                  max="400"
                  step="50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Quick test:</p>
              <div className="flex flex-wrap gap-2">
                {testTexts.map((testText, index) => (
                  <Button key={index} variant="outline" size="sm" onClick={() => setText(testText)}>
                    Test {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Functional QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <FunctionalQRCode value={text} size={size} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Original QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <QRCode value={text} size={size} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>1. Enter text or URL in the input field above</p>
              <p>2. Adjust the size if needed</p>
              <p>3. Test with your phone's camera to verify the QR code is scannable</p>
              <p>4. The functional QR code should be properly readable by QR scanners</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
