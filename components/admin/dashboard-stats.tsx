import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, ShoppingBag } from "lucide-react";
import { getDashboardStats } from "@/actions/dashboard";
import { formatCurrency } from "@/lib/utils";

export async function DashboardStats() {
  const stats = await getDashboardStats();

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.recentOrders.slice(0, 5).map((order) => (
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
    </>
  );
}
