"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, Plus, Trash2, Edit, Percent, Users, SettingsIcon, CreditCard } from "lucide-react"
import {
  getCustomerGroups,
  saveCustomerGroup,
  deleteCustomerGroup,
  getPaymentSettings,
  savePaymentSettings,
  getBusinessSettings,
  saveBusinessSettings,
} from "@/actions/settings"

// Update the interface definitions to match the server types
interface CustomerGroup {
  id: string
  name: string
  cashback_rate: number
  min_spend: number
  color: string
  benefits: string[]
}

interface PaymentSettings {
  cashback_enabled: boolean
  default_cashback_rate: number
  max_cashback_per_transaction: number
  cashback_expiry_days: number
  auto_apply_cashback: boolean
}

interface BusinessSettings {
  store_name: string
  currency: string
  tax_rate: number
  receipt_footer: string
  timezone: string
}

// Update the component to fetch and save settings
export default function Settings() {
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([])
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    cashback_enabled: true,
    default_cashback_rate: 10,
    max_cashback_per_transaction: 100,
    cashback_expiry_days: 365,
    auto_apply_cashback: true,
  })
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    store_name: "GardenX",
    currency: "AED",
    tax_rate: 5,
    receipt_footer: "Thank you for shopping with GardenX!",
    timezone: "Asia/Dubai",
  })

  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [groups, payment, business] = await Promise.all([
          getCustomerGroups(),
          getPaymentSettings(),
          getBusinessSettings(),
        ])

        setCustomerGroups(groups)
        setPaymentSettings(payment)
        setBusinessSettings(business)
      } catch (error) {
        console.error("Error fetching settings:", error)
        setSaveMessage("Error loading settings. Please refresh the page.")
      }
    }

    fetchSettings()
  }, [])

  const handleSaveSettings = async () => {
    setIsLoading(true)
    setSaveMessage(null)

    try {
      // Save all settings
      await Promise.all([
        // Save each customer group
        ...customerGroups.map((group) => saveCustomerGroup(group)),
        // Save payment settings
        savePaymentSettings(paymentSettings),
        // Save business settings
        saveBusinessSettings(businessSettings),
      ])

      setSaveMessage("Settings saved successfully!")
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error("Error saving settings:", error)
      setSaveMessage("Error saving settings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const addCustomerGroup = () => {
    const newGroup: CustomerGroup = {
      id: `group_${Date.now()}`,
      name: "New Group",
      cashback_rate: 10,
      min_spend: 0,
      color: "gray",
      benefits: [],
    }
    setCustomerGroups([...customerGroups, newGroup])
    setEditingGroup(newGroup)
  }

  const updateCustomerGroup = (id: string, updates: Partial<CustomerGroup>) => {
    setCustomerGroups((groups) => groups.map((group) => (group.id === id ? { ...group, ...updates } : group)))
  }

  const deleteCustomerGroupHandler = async (id: string) => {
    try {
      const success = await deleteCustomerGroup(id)
      if (success) {
        setCustomerGroups((groups) => groups.filter((group) => group.id !== id))
        if (editingGroup?.id === id) {
          setEditingGroup(null)
        }
      } else {
        setSaveMessage("Error deleting group. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting group:", error)
      setSaveMessage("Error deleting group. Please try again.")
    }
  }

  const addBenefit = (groupId: string, benefit: string) => {
    if (benefit.trim()) {
      updateCustomerGroup(groupId, {
        benefits: [...(customerGroups.find((g) => g.id === groupId)?.benefits || []), benefit.trim()],
      })
    }
  }

  const removeBenefit = (groupId: string, benefitIndex: number) => {
    const group = customerGroups.find((g) => g.id === groupId)
    if (group) {
      const newBenefits = group.benefits.filter((_, index) => index !== benefitIndex)
      updateCustomerGroup(groupId, { benefits: newBenefits })
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Settings"
          subtitle="Configure your store settings and customer groups"
          actions={
            <Button onClick={handleSaveSettings} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          {saveMessage && (
            <Alert className={`mb-6 ${saveMessage.includes("Error") ? "border-red-200" : "border-green-200"}`}>
              <AlertDescription className={saveMessage.includes("Error") ? "text-red-700" : "text-green-700"}>
                {saveMessage}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="customer-groups" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="customer-groups" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Customer Groups
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment & Cashback
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                Business Settings
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                Integrations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customer-groups" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Customer Groups</CardTitle>
                        <CardDescription>Manage customer tiers and their benefits</CardDescription>
                      </div>
                      <Button onClick={addCustomerGroup} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Group
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {customerGroups.map((group) => (
                      <div
                        key={group.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          editingGroup?.id === group.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => setEditingGroup(group)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full bg-${group.color}-500`} />
                            <h3 className="font-medium">{group.name}</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Percent className="h-3 w-3 mr-1" />
                              {group.cashback_rate}%
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteCustomerGroupHandler(group.id)
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Min spend: {group.min_spend} AED • {group.benefits.length} benefits
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {editingGroup && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit {editingGroup.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="group-name">Group Name</Label>
                        <Input
                          id="group-name"
                          value={editingGroup.name}
                          onChange={(e) => updateCustomerGroup(editingGroup.id, { name: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cashback-rate">Cashback Rate (%)</Label>
                          <Input
                            id="cashback-rate"
                            type="number"
                            min="0"
                            max="100"
                            value={editingGroup.cashback_rate}
                            onChange={(e) =>
                              updateCustomerGroup(editingGroup.id, { cashback_rate: Number(e.target.value) })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="min-spend">Min Spend (AED)</Label>
                          <Input
                            id="min-spend"
                            type="number"
                            min="0"
                            value={editingGroup.min_spend}
                            onChange={(e) =>
                              updateCustomerGroup(editingGroup.id, { min_spend: Number(e.target.value) })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="group-color">Group Color</Label>
                        <Select
                          value={editingGroup.color}
                          onValueChange={(value) => updateCustomerGroup(editingGroup.id, { color: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="yellow">Yellow</SelectItem>
                            <SelectItem value="gray">Gray</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Benefits</Label>
                        <div className="space-y-2">
                          {editingGroup.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input value={benefit} readOnly className="flex-1" />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeBenefit(editingGroup.id, index)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add new benefit"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  addBenefit(editingGroup.id, e.currentTarget.value)
                                  e.currentTarget.value = ""
                                }
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement
                                addBenefit(editingGroup.id, input.value)
                                input.value = ""
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cashback Settings</CardTitle>
                    <CardDescription>Configure how cashback rewards work in your store</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="cashback-enabled">Enable Cashback</Label>
                        <p className="text-sm text-gray-500">Allow customers to earn cashback on purchases</p>
                      </div>
                      <Switch
                        id="cashback-enabled"
                        checked={paymentSettings.cashback_enabled}
                        onCheckedChange={(checked) =>
                          setPaymentSettings({ ...paymentSettings, cashback_enabled: checked })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default-cashback">Default Cashback Rate (%)</Label>
                      <Input
                        id="default-cashback"
                        type="number"
                        min="0"
                        max="100"
                        value={paymentSettings.default_cashback_rate}
                        onChange={(e) =>
                          setPaymentSettings({ ...paymentSettings, default_cashback_rate: Number(e.target.value) })
                        }
                      />
                      <p className="text-xs text-gray-500">Used for customers without a specific group</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-cashback">Max Cashback per Transaction (AED)</Label>
                      <Input
                        id="max-cashback"
                        type="number"
                        min="0"
                        value={paymentSettings.max_cashback_per_transaction}
                        onChange={(e) =>
                          setPaymentSettings({
                            ...paymentSettings,
                            max_cashback_per_transaction: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cashback-expiry">Cashback Expiry (days)</Label>
                      <Input
                        id="cashback-expiry"
                        type="number"
                        min="0"
                        value={paymentSettings.cashback_expiry_days}
                        onChange={(e) =>
                          setPaymentSettings({ ...paymentSettings, cashback_expiry_days: Number(e.target.value) })
                        }
                      />
                      <p className="text-xs text-gray-500">Set to 0 for no expiry</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-apply">Auto-apply Cashback</Label>
                        <p className="text-sm text-gray-500">Automatically apply available cashback to purchases</p>
                      </div>
                      <Switch
                        id="auto-apply"
                        checked={paymentSettings.auto_apply_cashback}
                        onCheckedChange={(checked) =>
                          setPaymentSettings({ ...paymentSettings, auto_apply_cashback: checked })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Configure accepted payment methods</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Cash Payments</Label>
                        <p className="text-sm text-gray-500">Accept cash payments at POS</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Card Payments (Ziina)</Label>
                        <p className="text-sm text-gray-500">Accept card payments via Ziina</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Store Credit</Label>
                        <p className="text-sm text-gray-500">Allow customers to pay with store credit</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="business" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Store Information</CardTitle>
                    <CardDescription>Basic information about your store</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="store-name">Store Name</Label>
                      <Input
                        id="store-name"
                        value={businessSettings.store_name}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, store_name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={businessSettings.currency}
                        onValueChange={(value) => setBusinessSettings({ ...businessSettings, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AED">AED (UAE Dirham)</SelectItem>
                          <SelectItem value="USD">USD (US Dollar)</SelectItem>
                          <SelectItem value="EUR">EUR (Euro)</SelectItem>
                          <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                      <Input
                        id="tax-rate"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={businessSettings.tax_rate}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, tax_rate: Number(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={businessSettings.timezone}
                        onValueChange={(value) => setBusinessSettings({ ...businessSettings, timezone: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Dubai">Asia/Dubai (UAE)</SelectItem>
                          <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                          <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Receipt Settings</CardTitle>
                    <CardDescription>Customize receipt appearance and content</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="receipt-footer">Receipt Footer Message</Label>
                      <Input
                        id="receipt-footer"
                        value={businessSettings.receipt_footer}
                        onChange={(e) => setBusinessSettings({ ...businessSettings, receipt_footer: e.target.value })}
                        placeholder="Thank you message..."
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Print Customer Copy</Label>
                        <p className="text-sm text-gray-500">Automatically print customer receipt</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show QR Code on Receipt</Label>
                        <p className="text-sm text-gray-500">Include QR code for digital receipt</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ziina Payment Integration</CardTitle>
                    <CardDescription>Configure Ziina payment gateway settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ziina-api-key">API Key</Label>
                      <Input
                        id="ziina-api-key"
                        type="password"
                        placeholder="Enter your Ziina API key"
                        defaultValue="sk_test_..."
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Test Mode</Label>
                        <p className="text-sm text-gray-500">Use Ziina in test mode</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="webhook-url">Webhook URL</Label>
                      <Input
                        id="webhook-url"
                        value="https://gardenx2.vercel.app/api/ziina/webhook"
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Database Integration</CardTitle>
                    <CardDescription>Configure database connection settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Database Provider</Label>
                      <Select defaultValue="supabase">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="supabase">Supabase</SelectItem>
                          <SelectItem value="neon">Neon</SelectItem>
                          <SelectItem value="planetscale">PlanetScale</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Connection Status</Label>
                        <p className="text-sm text-gray-500">Database connection health</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>

                    <Button variant="outline" className="w-full">
                      Test Connection
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
