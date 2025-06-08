"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ShoppingCart, Package, Users } from "lucide-react";

export function DashboardQuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Manage your store efficiently</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          onClick={() => (window.location.href = "/admin/products")}
          className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
        >
          <DollarSign className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium">Point of Sale</p>
            <p className="text-xs text-gray-500">Take orders</p>
          </div>
        </div>
        <div
          onClick={() => (window.location.href = "/admin/orders")}
          className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
        >
          <ShoppingCart className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium">View Orders</p>
            <p className="text-xs text-gray-500">Expand your inventory</p>
          </div>
        </div>
        <div
          onClick={() => (window.location.href = "/admin/products")}
          className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
        >
          <Package className="h-5 w-5 text-red-600" />
          <div>
            <p className="text-sm font-medium">Add New Product</p>
            <p className="text-xs text-gray-500">Expand your inventory</p>
          </div>
        </div>
        <div
          className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
          onClick={() => (window.location.href = "/admin/customers")}
        >
          <Users className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium">Customer Rewards</p>
            <p className="text-xs text-gray-500">Track cashback & loyalty</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
