import { Suspense } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Package, Users } from "lucide-react"
import { getDashboardStats } from "@/actions/dashboard"
import { formatCurrency } from "@/lib/utils"

async function DashboardContent() {
  const stats = await getDashboardStats()

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Dashboard" subtitle="Welcome to the GardenX admin dashboard" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)} AED</div>
              <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-green-600 mt-1">+8.2% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Products</CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-green-600 mt-1">+2 new this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Customers</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-green-600 mt-1">+4 new this month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>You have {stats.totalOrders} orders this month.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Order {order.order_id}</p>
                      <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-sm font-medium">{formatCurrency(order.total_amount)} AED</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your store efficiently</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Add New Product</p>
                  <p className="text-xs text-gray-500">Expand your inventory</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Customer Rewards</p>
                  <p className="text-xs text-gray-500">Track cashback & loyalty</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <Suspense fallback={<p className="p-4">Loading dashboard...</p>}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
