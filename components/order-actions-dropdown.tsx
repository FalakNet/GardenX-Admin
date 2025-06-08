"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MoreHorizontal, Eye, Printer, RefreshCw, Ban, DollarSign, Phone, Mail, Package } from "lucide-react"
import type { Order, OrderItem } from "@/types"
import { updateOrderStatus, refundOrder, cancelOrder, getOrderDetails } from "@/actions/orders"
import { toast } from "sonner"
import { formatCurrency, formatDate } from "@/lib/utils"

interface OrderActionsDropdownProps {
  order: Order
}

export function OrderActionsDropdown({ order }: OrderActionsDropdownProps) {
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [orderDetails, setOrderDetails] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [newStatus, setNewStatus] = useState<Order["status"]>(order.status)
  const [refundAmount, setRefundAmount] = useState(order.total_amount.toString())
  const [refundReason, setRefundReason] = useState("")
  const [cancelReason, setCancelReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const loadOrderDetails = async () => {
    setLoadingDetails(true)
    try {
      const details = await getOrderDetails(order.id)
      if (details) {
        setOrderDetails(details.order)
        setOrderItems(details.items)
      }
    } catch (error) {
      toast.error("Failed to load order details")
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleViewDetails = () => {
    setShowDetailsDialog(true)
    loadOrderDetails()
  }

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) {
      setShowStatusDialog(false)
      return
    }

    setIsLoading(true)
    try {
      await updateOrderStatus(order.id, newStatus)
      toast.success(`Order status updated to ${newStatus}`)
      setShowStatusDialog(false)
      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      toast.error("Failed to update order status")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefund = async () => {
    setIsLoading(true)
    try {
      await refundOrder(order.id, Number.parseFloat(refundAmount), refundReason)
      toast.success(`Refund of ${refundAmount} AED processed`)
      setShowRefundDialog(false)
      window.location.reload()
    } catch (error) {
      toast.error("Failed to process refund")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    setIsLoading(true)
    try {
      await cancelOrder(order.id, cancelReason)
      toast.success("Order cancelled successfully")
      setShowCancelDialog(false)
      window.location.reload()
    } catch (error) {
      toast.error("Failed to cancel order")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrintReceipt = () => {
    // In a real app, this would generate and print a receipt
    toast.success("Receipt sent to printer")
  }

  const handleContactCustomer = (method: "phone" | "email") => {
    if (!order.customer) {
      toast.error("No customer information available")
      return
    }

    if (method === "phone" && order.customer.phone) {
      window.open(`tel:${order.customer.phone}`)
    } else if (method === "email" && order.customer.email) {
      window.open(`mailto:${order.customer.email}`)
    } else {
      toast.error(`Customer ${method} not available`)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowStatusDialog(true)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Update Status
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handlePrintReceipt}>
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {order.customer && (
            <>
              <DropdownMenuItem onClick={() => handleContactCustomer("phone")}>
                <Phone className="mr-2 h-4 w-4" />
                Call Customer
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handleContactCustomer("email")}>
                <Mail className="mr-2 h-4 w-4" />
                Email Customer
              </DropdownMenuItem>

              <DropdownMenuSeparator />
            </>
          )}

          {order.status !== "Cancelled" && order.status !== "Delivered" && (
            <DropdownMenuItem onClick={() => setShowRefundDialog(true)}>
              <DollarSign className="mr-2 h-4 w-4" />
              Process Refund
            </DropdownMenuItem>
          )}

          {order.status !== "Cancelled" && order.status !== "Delivered" && (
            <DropdownMenuItem onClick={() => setShowCancelDialog(true)} className="text-red-600">
              <Ban className="mr-2 h-4 w-4" />
              Cancel Order
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Order Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Details - {order.order_id}
            </DialogTitle>
            <DialogDescription>Complete information about this order and its items</DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Loading order details...</div>
            </div>
          ) : (
            <div className="grid gap-6 py-4">
              {/* Order Information */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Customer</Label>
                  <p className="text-sm font-medium">{order.customer?.name || "Guest Customer"}</p>
                  {order.customer?.phone && <p className="text-xs text-gray-500">{order.customer.phone}</p>}
                  {order.customer?.email && <p className="text-xs text-gray-500">{order.customer.email}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Order Date</Label>
                  <p className="text-sm">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        order.status === "Delivered"
                          ? "bg-green-500"
                          : order.status === "Processing"
                            ? "bg-blue-500"
                            : order.status === "Shipped"
                              ? "bg-purple-500"
                              : order.status === "Cancelled"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-sm">{order.status}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Type</Label>
                  <p className="text-sm">{order.type}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Unit Price</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Quantity</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{item.product?.name || "Unknown Product"}</p>
                              <p className="text-sm text-gray-500">{item.product?.category}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">{formatCurrency(item.unit_price)} AED</td>
                          <td className="py-3 px-4 text-sm">{item.quantity}</td>
                          <td className="py-3 px-4 text-sm font-medium">{formatCurrency(item.total_price)} AED</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Payment Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(order.total_amount - order.tax_amount)} AED</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (5%):</span>
                      <span>{formatCurrency(order.tax_amount)} AED</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(order.total_amount)} AED</span>
                    </div>
                    {order.cashback_earned > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Cashback Earned:</span>
                        <span>+{formatCurrency(order.cashback_earned)} AED</span>
                      </div>
                    )}
                  </div>
                </div>

                {order.customer && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Customer Info</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Status:</span>
                        <span className="ml-2">{order.customer.status}</span>
                      </div>
                      <div>
                        <span className="font-medium">Store Credit:</span>
                        <span className="ml-2 text-green-600">{formatCurrency(order.customer.store_credit)} AED</span>
                      </div>
                      <div>
                        <span className="font-medium">Total Rewards:</span>
                        <span className="ml-2 text-yellow-600">
                          {formatCurrency(order.customer.rewards_earned)} AED
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            <Button onClick={handlePrintReceipt}>
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>Change the status of order {order.order_id}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as Order["status"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>Process a refund for order {order.order_id}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="refund-amount">Refund Amount (AED)</Label>
              <input
                id="refund-amount"
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={order.total_amount}
                step="0.01"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="refund-reason">Reason for Refund</Label>
              <Textarea
                id="refund-reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for refund..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefund} disabled={isLoading}>
              {isLoading ? "Processing..." : "Process Refund"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>Cancel order {order.order_id}. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cancel-reason">Reason for Cancellation</Label>
              <Textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Order
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
              {isLoading ? "Cancelling..." : "Cancel Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
