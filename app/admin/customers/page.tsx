import { Suspense } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Gift, Settings } from "lucide-react"
import { getCustomers } from "@/actions/customers"
import { formatCurrency } from "@/lib/utils"
import { AddCustomerDialog } from "@/components/add-customer-dialog"
import { CustomerSettingsDialog } from "@/components/customer-settings-dialog"

async function CustomersContent() {
  const customers = await getCustomers()

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Customers"
        subtitle="Manage your customer relationships"
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <AddCustomerDialog />
          </>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Customer Management</CardTitle>
                <CardDescription>View and manage your customer database with rewards tracking.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Gift className="h-3 w-3 mr-1" />
                  10% Cashback Active
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search customers..." className="pl-10" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Store Credit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{customer.customer_id}</td>
                      <td className="py-3 px-4 text-sm font-medium">{customer.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{customer.email || "-"}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{customer.phone || "-"}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Gift className="h-3 w-3 text-green-600" />
                          <span className="text-green-600 font-medium">
                            {formatCurrency(customer.store_credit)} AED
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            customer.status === "VIP"
                              ? "bg-purple-100 text-purple-800"
                              : customer.status === "Regular"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                          }
                        >
                          {customer.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <CustomerSettingsDialog customer={customer}>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Settings
                          </Button>
                        </CustomerSettingsDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Rewards Program Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-green-600">Total Store Credit</p>
                  <p className="font-bold text-green-800">
                    {formatCurrency(customers.reduce((sum, c) => sum + c.store_credit, 0))} AED
                  </p>
                </div>
                <div>
                  <p className="text-green-600">Active Customers</p>
                  <p className="font-bold text-green-800">{customers.filter((c) => c.status !== "Inactive").length}</p>
                </div>
                <div>
                  <p className="text-green-600">Cashback Rate</p>
                  <p className="font-bold text-green-800">10% on all purchases</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function Customers() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <Suspense fallback={<p className="p-4">Loading customers...</p>}>
        <CustomersContent />
      </Suspense>
    </div>
  )
}
