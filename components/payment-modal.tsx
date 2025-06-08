"use client";

import React, { useState } from "react";
import { QrCode, CreditCard, Banknote, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentStatusMonitor } from "@/components/payment-status-monitor";
import {
  createZiinaPayment,
  formatCurrency,
  ZiinaPaymentIntent,
} from "@/lib/ziina";
import { toast } from "sonner";

interface PaymentModalProps {
  total: number;
  onPaymentComplete: (
    method: "cash" | "card" | "ziina",
    amountReceived?: number
  ) => void;
  onCancel: () => void;
}

export function PaymentModal({
  total,
  onPaymentComplete,
  onCancel,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<
    "cash" | "card" | "ziina" | null
  >(null);
  const [cashReceived, setCashReceived] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ziinaPayment, setZiinaPayment] = useState<ZiinaPaymentIntent | null>(
    null
  );

  const handleCashPayment = () => {
    const received = parseFloat(cashReceived);
    if (isNaN(received) || received < total) {
      toast.error("Cash received must be at least the total amount");
      return;
    }
    onPaymentComplete("cash", received);
  };

  const handleCardPayment = () => {
    onPaymentComplete("card", total);
  };

  const handleZiinaPayment = async () => {
    setIsProcessing(true);
    try {
      const payment = await createZiinaPayment({
        amount: Math.round(total * 100), // Convert AED to fils
        currency_code: "AED",
        message: "GardenX POS Payment",
        test: process.env.NODE_ENV !== "production",
        transaction_source: "directApi",
      });

      setZiinaPayment(payment);
      toast.success("QR code generated successfully!");
    } catch (error) {
      console.error("Ziina payment error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create payment"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleZiinaStatusChange = (status: ZiinaPaymentIntent["status"]) => {
    if (status === "completed") {
      toast.success("Payment completed successfully!");
    } else if (status === "failed") {
      toast.error("Payment failed. Please try again.");
    } else if (status === "cancelled") {
      toast.error("Payment was cancelled.");
    }
  };

  const handleZiinaComplete = () => {
    onPaymentComplete("ziina", total);
  };

  const generateQRCodeDisplay = (url: string) => {
    let qrlink =
      `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=` +
      encodeURIComponent(url);
    if (!url) return null;

    return (
      <div className="w-48 h-48 flex items-center justify-center mx-auto bg-white border-2 border-gray-300 rounded">
        <div className="text-center p-4">
          <img src={qrlink} alt="" style={{ width: "100%", padding: "0.5rem" }} />
          <p className="text-xs text-gray-600 mb-2">Scan to Pay</p>
        </div>
      </div>
    );
  };

  const change = cashReceived ? parseFloat(cashReceived) - total : 0;

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
          </div>

          {!selectedMethod && (
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="h-16 flex flex-col gap-2"
                onClick={() => setSelectedMethod("cash")}
              >
                <Banknote className="h-6 w-6" />
                <span>Cash Payment</span>
              </Button>

              <Button
                variant="outline"
                className="h-16 flex flex-col gap-2"
                onClick={() => {
                  setSelectedMethod("ziina");
                  handleZiinaPayment();
                }}
              >
                <CreditCard className="h-6 w-6" />
                <span>Card Payment</span>
              </Button>
            </div>
          )}

          {selectedMethod === "cash" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cash Received
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="Enter amount received"
                  autoFocus
                />
              </div>

              {change > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    Change to give:{" "}
                    <span className="font-bold">{formatCurrency(change)}</span>
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedMethod(null)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCashPayment}
                  disabled={!cashReceived || parseFloat(cashReceived) < total}
                >
                  Complete Payment
                </Button>
              </div>
            </div>
          )}

          {selectedMethod === "ziina" && (
            <div className="space-y-4">
              {!ziinaPayment ? (
                <>
                  <p className="text-center text-gray-600">
                    Generate QR code for customer to scan and pay
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedMethod(null)}
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleZiinaPayment}
                      disabled={isProcessing}
                    >
                      {isProcessing
                        ? "Creating Payment..."
                        : "Generate QR Code"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600 font-medium">
                      Customer should scan this QR code to pay
                    </p>

                    {ziinaPayment.redirect_url &&
                      generateQRCodeDisplay(ziinaPayment.redirect_url)}

                    <p className="text-xs text-gray-500">
                      Amount: {formatCurrency(total)}
                    </p>
                  </div>

                  <PaymentStatusMonitor
                    paymentId={ziinaPayment.id}
                    onStatusChange={handleZiinaStatusChange}
                    onPaymentComplete={handleZiinaComplete}
                  />

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={onCancel}>
                      Cancel Payment
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setZiinaPayment(null)}
                    >
                      Generate New QR
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentModal;
