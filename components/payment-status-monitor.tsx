"use client"

import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ZiinaPaymentIntent, getZiinaPaymentStatus } from '@/lib/ziina'

interface PaymentStatusMonitorProps {
  paymentId: string
  onStatusChange: (status: ZiinaPaymentIntent["status"]) => void
  onPaymentComplete: () => void
}

export function PaymentStatusMonitor({ 
  paymentId, 
  onStatusChange, 
  onPaymentComplete 
}: PaymentStatusMonitorProps) {
  const [payment, setPayment] = useState<ZiinaPaymentIntent | null>(null)
  const [isPolling, setIsPolling] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!paymentId || !isPolling) return

    const pollPaymentStatus = async () => {
      try {
        const paymentData = await getZiinaPaymentStatus(paymentId)
        setPayment(paymentData)
        onStatusChange(paymentData.status)

        // Stop polling if payment is completed or failed
        if (paymentData.status === "completed") {
          setIsPolling(false)
          onPaymentComplete()
        } else if (paymentData.status === "failed" || paymentData.status === "cancelled") {
          setIsPolling(false)
        }
      } catch (err) {
        console.error("Error polling payment status:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      }
    }

    // Poll immediately
    pollPaymentStatus()

    // Then poll every 3 seconds
    const interval = setInterval(pollPaymentStatus, 3000)

    return () => clearInterval(interval)
  }, [paymentId, isPolling, onStatusChange, onPaymentComplete])

  const getStatusIcon = (status: ZiinaPaymentIntent["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "failed":
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "processing":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: ZiinaPaymentIntent["status"]) => {
    switch (status) {
      
      case "pending":
        return "Waiting for payment..."
      case "processing":
        return "Processing payment..."
      case "completed":
        return "Payment completed successfully!"
      case "failed":
        return "Payment failed"
      case "cancelled":
        return "Payment cancelled"
      case "requires_payment_instrument":
        return "Waiting for payment..."
      case "requires_user_action":
        return "Waiting for payment..."
      default:
        return "Unknown status"
    }
  }

  const getStatusVariant = () => {
    if (!payment) return "secondary"
    
    switch (payment.status) {
      case "completed":
        return "default"
      case "failed":
      case "cancelled":
        return "destructive"
      case "processing":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <XCircle className="h-5 w-5" />
        <span>Error: {error}</span>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Checking payment status...</span>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2">
        {getStatusIcon(payment.status)}
        <Badge variant={getStatusVariant()}>
          {getStatusText(payment.status)}
        </Badge>
      </div>

      {payment.status === 'processing' && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Payment is being processed. Please wait...
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default PaymentStatusMonitor
