"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QRCode } from "@/components/qr-code"
import { EnhancedQRCode } from "@/components/enhanced-qr-code"

export default function TestQRCode() {
  const [text, setText] = useState("https://pay.ziina.com/payment_intent/pi_test123")
  const [size, setSize] = useState(200)

  const testUrls = [
    "https://pay.ziina.com/payment_intent/pi_test123",
    "https://gardenx2.vercel.app",
    "https://www.google.com",
    "Hello World QR Code Test",
    "tel:+971501234567",
    "mailto:test@example.com",
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>QR Code Generator Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Text/URL to encode</label>
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text or URL" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Size (pixels)</label>
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
              <p className="text-sm font-medium">Quick test URLs:</p>
              <div className="flex flex-wrap gap-2">
                {testUrls.map((url, index) => (
                  <Button key={index} variant="outline" size="sm" onClick={() => setText(url)} className="text-xs">
                    {url.length > 30 ? url.substring(0, 30) + "..." : url}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Canvas QR Code (Basic)</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <QRCode value={text} size={size} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SVG QR Code (Enhanced)</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <EnhancedQRCode value={text} size={size} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>QR Code Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Text Length:</strong>
                <p>{text.length} characters</p>
              </div>
              <div>
                <strong>Size:</strong>
                <p>
                  {size}x{size} pixels
                </p>
              </div>
              <div>
                <strong>Type:</strong>
                <p>
                  {text.startsWith("http")
                    ? "URL"
                    : text.startsWith("tel:")
                      ? "Phone"
                      : text.startsWith("mailto:")
                        ? "Email"
                        : "Text"}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <strong>Encoded Text:</strong>
              <p className="break-all mt-1">{text}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
