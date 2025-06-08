"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, CheckCircle, AlertTriangle } from "lucide-react"

export default function TestZiina() {
  const [amount, setAmount] = useState("10.00")
  const [message, setMessage] = useState("Test payment from GardenX")
  const [paymentIntent, setPaymentIntent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("")
  const [connectionTest, setConnectionTest] = useState<any>(null)

  const handleTestConnection = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ziina/test-connection")
      const data = await response.json()

      setConnectionTest(data)

      if (data.configured) {
        setStatus("API connection test completed")
      } else {
        setError("API key not configured")
      }
    } catch (err) {
      setError("Failed to test connection")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePayment = async () => {
    setIsLoading(true)
    setError(null)
    setPaymentIntent(null)

    try {
      const response = await fetch("/api/ziina/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
          message: message,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPaymentIntent(data)
        setStatus("Payment intent created successfully!")

        // Automatically open the payment page
        if (data.redirect_url) {
          window.open(data.redirect_url, "_blank")
          setStatus("Payment link opened. Complete payment in the new tab.")
        }
      } else {
        setError(`Payment creation failed: ${data.error || "Unknown error"}`)
      }
    } catch (err) {
      setError("Error creating payment intent")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateMinimal = async () => {
    setIsLoading(true)
    setError(null)
    setPaymentIntent(null)

    try {
      const response = await fetch("/api/ziina/create-minimal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPaymentIntent(data)
        setStatus("Minimal payment intent created successfully!")

        // Automatically open the payment page
        if (data.redirect_url) {
          window.open(data.redirect_url, "_blank")
        }
      } else {
        setError(`Minimal request failed: ${data.error || "Unknown error"}`)
      }
    } catch (err) {
      setError("Error creating minimal payment intent")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDirectApiCall = async () => {
    setIsLoading(true)
    setError(null)
    setPaymentIntent(null)

    try {
      // Get the base URL for callbacks
      const baseUrl = window.location.origin

      // Create a direct API call similar to the provided example
      const options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ZIINA_API_KEY || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(Number.parseFloat(amount) * 100),
          currency_code: "AED",
          test: true,
          transaction_source: "directApi",
          message: message,
          failure_url: `${baseUrl}/api/ziina/failure`,
          success_url: `${baseUrl}/api/ziina/success`,
          cancel_url: `${baseUrl}/api/ziina/cancel`,
        }),
      }

      const response = await fetch("https://api-v2.ziina.com/api/payment_intent", options)
      const data = await response.json()

      if (response.ok) {
        setPaymentIntent(data)
        setStatus("Direct API call successful!")

        // Automatically open the payment page
        if (data.redirect_url) {
          window.open(data.redirect_url, "_blank")
        }
      } else {
        setError(`Direct API call failed: ${JSON.stringify(data)}`)
      }
    } catch (err) {
      setError("Error making direct API call")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const openPaymentPage = () => {
    if (paymentIntent?.redirect_url) {
      window.open(paymentIntent.redirect_url, "_blank")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="minimal">Minimal</TabsTrigger>
            <TabsTrigger value="direct">Direct</TabsTrigger>
          </TabsList>

          <TabsContent value="connection">
            <Card>
              <CardHeader>
                <CardTitle>API Connection Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleTestConnection} disabled={isLoading} variant="outline" className="w-full">
                  {isLoading ? "Testing..." : "Test Ziina API Connection"}
                </Button>

                {connectionTest && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {connectionTest.configured ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        API Key: {connectionTest.configured ? "Configured" : "Not Configured"}
                      </span>
                    </div>

                    {connectionTest.configured && (
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Key Length:</strong> {connectionTest.api_key_length} characters
                        </p>
                        <p>
                          <strong>Key Prefix:</strong> {connectionTest.api_key_prefix}
                        </p>
                      </div>
                    )}

                    {connectionTest.test_response && (
                      <div className="bg-gray-100 p-3 rounded text-xs">
                        <p>
                          <strong>Test Response Status:</strong> {connectionTest.test_response.status}
                        </p>
                        <p>
                          <strong>Response:</strong> {connectionTest.test_response.body.substring(0, 200)}...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Full Payment Intent Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {status && (
                  <Alert>
                    <AlertDescription>{status}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (AED)</label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="10.00"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Payment message" />
                  </div>

                  <Button onClick={handleCreatePayment} disabled={isLoading} className="w-full">
                    {isLoading ? "Creating..." : "Create Payment Intent (Full)"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="minimal">
            <Card>
              <CardHeader>
                <CardTitle>Minimal Payment Intent Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (AED)</label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="10.00"
                      step="0.01"
                    />
                  </div>

                  <Button onClick={handleCreateMinimal} disabled={isLoading} className="w-full">
                    {isLoading ? "Creating..." : "Create Payment Intent (Minimal)"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="direct">
            <Card>
              <CardHeader>
                <CardTitle>Direct API Call (Client-Side)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertDescription>
                    This test makes a direct API call from the browser, similar to the provided example code. Note: This
                    requires the API key to be exposed to the client, which is not recommended for production.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (AED)</label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="10.00"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Payment message" />
                  </div>

                  <Button onClick={handleDirectApiCall} disabled={isLoading} className="w-full">
                    {isLoading ? "Creating..." : "Make Direct API Call"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {paymentIntent && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Intent Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Payment ID:</strong>
                  <p className="break-all">{paymentIntent.id}</p>
                </div>
                <div>
                  <strong>Amount:</strong>
                  <p>{(paymentIntent.amount / 100).toFixed(2)} AED</p>
                </div>
                <div>
                  <strong>Status:</strong>
                  <Badge variant={paymentIntent.status === "succeeded" ? "default" : "secondary"}>
                    {paymentIntent.status}
                  </Badge>
                </div>
                {paymentIntent.created_at && (
                  <div>
                    <strong>Created:</strong>
                    <p>{new Date(paymentIntent.created_at).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {paymentIntent.redirect_url && (
                <>
                  <div className="text-center">
                    <h3 className="font-medium mb-4">Payment QR Code</h3>
                    <div className="flex justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                          paymentIntent.redirect_url
                        )}`}
                        alt="Payment QR Code"
                        className="w-[200px] h-[200px] border-2 border-gray-300 rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          target.parentElement!.innerHTML = `
                            <div class="w-[200px] h-[200px] bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center">
                              <span class="text-gray-500">QR Code Unavailable</span>
                            </div>
                          `
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button onClick={openPaymentPage} className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Payment Page
                    </Button>

                    <div className="text-xs text-gray-500 break-all">
                      <strong>Redirect URL:</strong> {paymentIntent.redirect_url}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
