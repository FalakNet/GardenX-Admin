import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { DashboardQuickActions } from "../DashboardQuickActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/actions/dashboard";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DollarSign, Package } from "lucide-react";

export default async function Dashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Dashboard"
          subtitle="Welcome to GardenX Admin"
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Today's Sales
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)} AED</div>
                <p className="text-xs text-green-600 mt-1">+18% from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Active Customers
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <p className="text-xs text-green-600 mt-1">+4 new today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pending Orders
                </CardTitle>
                <ShoppingBag className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-orange-600 mt-1">3 require attention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.recentOrders.slice(0, 1).map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">Order #{order.order_id}</div>
                        <div className="text-xs text-gray-500">
                          {order.customer?.name || "Guest Customer"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(order.total_amount)} AED</div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Link href="/admin/pos" className="w-full">
                    <Button className="w-full justify-start" variant="outline">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Open POS Mode
                    </Button>
                  </Link>
                  <Link href="/admin/orders" className="w-full">
                    <Button className="w-full justify-start" variant="outline">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      View Orders
                    </Button>
                  </Link>
                  <Link href="/admin/products" className="w-full">
                    <Button className="w-full justify-start" variant="outline">
                      <Package className="mr-2 h-4 w-4" />
                      Manage Products
                    </Button>
                  </Link>
                  <Link href="/admin/customers" className="w-full">
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      View Customers
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Daily Revenue</CardTitle>
                <CardDescription>Revenue trends for the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                  <svg width="48" height="48" fill="none" className="text-gray-200" viewBox="0 0 24 24">
                    <rect width="24" height="24" rx="4" fill="currentColor" />
                    <path d="M7 17V13M12 17V7M17 17V10" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
