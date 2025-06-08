"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Gift, Plus, Minus, User, CreditCard } from "lucide-react"
import { updateCustomer, addStoreCredit, removeStoreCredit } from "@/actions/customers"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import type { Customer } from "@/types"

interface CustomerSettingsDialogProps {
  customer: Customer
  children: React.ReactNode
}

export function CustomerSettingsDialog({ customer, children }: CustomerSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Customer info form state
  const [name, setName] = useState(customer.name)
  const [email, setEmail] = useState(customer.email || "")
  const [phone, setPhone] = useState(customer.phone || "")
  const [status, setStatus] = useState(customer.status)

  // Store credit form state
  const [creditAmount, setCreditAmount] = useState("")
  const [creditReason, setCreditReason] = useState("")
  const [creditAction, setCreditAction] = useState<"add" | "remove">("add")

  const handleUpdateCustomer = async () => {
    if (!name.trim()) {
      toast.error("Customer name is required")
      return
    }

    setLoading(true)
    try {
      await updateCustomer(customer.id, {
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        status,
      })

      toast.success("Customer updated successfully")
      window.location.reload() // Refresh to show updates
    } catch (error) {
      console.error("Error updating customer:", error)
      toast.error("Failed to update customer")
    } finally {
      setLoading(false)
    }
  }

  const handleStoreCredit = async () => {
    const amount = Number.parseFloat(creditAmount)

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (!creditReason.trim()) {
      toast.error("Please provide a reason")
      return
    }

    setLoading(true)
    try {
      if (creditAction === "add") {
        await addStoreCredit(customer.id, amount, creditReason.trim())
        toast.success(`Added ${formatCurrency(amount)} AED store credit`)
      } else {
        if (amount > customer.store_credit) {
          toast.error("Cannot remove more credit than available")
          return
        }
        await removeStoreCredit(customer.id, amount, creditReason.trim())
        toast.success(`Removed ${formatCurrency(amount)} AED store credit`)
      }

      setCreditAmount("")
      setCreditReason("")
      window.location.reload() // Refresh to show updates
    } catch (error) {
      console.error("Error managing store credit:", error)
      toast.error("Failed to update store credit")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Settings
          </DialogTitle>
          <DialogDescription>Manage {customer.name}'s account settings and store credit</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Customer Info</TabsTrigger>
            <TabsTrigger value="credit">Store Credit</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
                <CardDescription>Update customer details and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="customer@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+971 50 123 4567"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Customer ID:</span>
                    <Badge variant="outline">{customer.customer_id}</Badge>
                  </div>
                  <Button onClick={handleUpdateCustomer} disabled={loading}>
                    {loading ? "Updating..." : "Update Customer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Current Store Credit
                </CardTitle>
                <CardDescription>Manage customer's store credit balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-6 bg-green-50 rounded-lg">
                  <div className="text-center">
                    <Gift className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-800">{formatCurrency(customer.store_credit)} AED</p>
                    <p className="text-sm text-green-600">Available Balance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Store Credit</CardTitle>
                <CardDescription>Add or remove store credit with reason tracking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={creditAction === "add" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCreditAction("add")}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Credit
                  </Button>
                  <Button
                    variant={creditAction === "remove" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCreditAction("remove")}
                    className="flex items-center gap-1"
                  >
                    <Minus className="h-4 w-4" />
                    Remove Credit
                  </Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Amount (AED) {creditAction === "remove" && `(Max: ${formatCurrency(customer.store_credit)})`}
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={creditAction === "remove" ? customer.store_credit : undefined}
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason *</Label>
                    <Textarea
                      id="reason"
                      value={creditReason}
                      onChange={(e) => setCreditReason(e.target.value)}
                      placeholder={`Reason for ${creditAction === "add" ? "adding" : "removing"} store credit...`}
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleStoreCredit} disabled={loading} className="w-full">
                    {loading ? "Processing..." : `${creditAction === "add" ? "Add" : "Remove"} Store Credit`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
