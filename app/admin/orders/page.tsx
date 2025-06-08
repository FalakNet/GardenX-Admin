"use client"

import { Suspense, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download } from "lucide-react"
import { getOrders } from "@/actions/orders"
import { formatCurrency, formatDate } from "@/lib/utils"
import { OrderActionsDropdown } from "@/components/order-actions-dropdown"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

function ExportOrdersModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    // TODO: Implement export logic (CSV, Excel, etc.)
    setTimeout(() => {
      setIsExporting(false)
      onOpenChange(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Orders</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || !startDate || !endDate}>
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function OrdersTable({ orders }: { orders: any[] }) {
  const [exportOpen, setExportOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredOrders = orders.filter(order =>
    order.order_id?.toLowerCase().includes(search.toLowerCase()) ||
    order.customer?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Orders"
        subtitle="Manage and track all orders"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <ExportOrdersModal open={exportOpen} onOpenChange={setExportOpen} />
          </>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>View and manage all customer orders and POS sales.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by order ID or customer..."
                  className="pl-10"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Cashback</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium">{order.order_id}</td>
                      <td className="py-3 px-4 text-sm">{order.customer?.name || "Guest Customer"}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{formatDate(order.created_at)}</td>
                      <td className="py-3 px-4 text-sm font-medium">{formatCurrency(order.total_amount)} AED</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-800"
                              : order.status === "Processing"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "Shipped"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={order.type === "POS" ? "secondary" : "outline"}>{order.type}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-green-600 font-medium">
                        {order.cashback_earned > 0 ? `+${formatCurrency(order.cashback_earned)} AED` : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <OrderActionsDropdown order={order} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

// The default export is now a Server Component
export default async function Orders() {
  const orders = await getOrders()
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <OrdersTable orders={orders} />
    </div>
  )
}
