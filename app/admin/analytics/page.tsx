"use client"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp } from "lucide-react"

export default function Analytics() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Analytics"
          subtitle="Track your business performance and insights"
          actions={
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          }
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,485.56 AED</div>
                <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Orders</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">124</div>
                <p className="text-xs text-green-600 mt-1">+8.2% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Average Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">100.69 AED</div>
                <p className="text-xs text-green-600 mt-1">+31% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Customers</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78</div>
                <p className="text-xs text-green-600 mt-1">+4 new this month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>View your sales performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Sales Chart Placeholder</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Your best performing products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Organic Kale</p>
                      <p className="text-sm text-gray-500">45 units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">719.55 AED</p>
                      <p className="text-sm text-green-600">+15%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Heirloom Tomatoes</p>
                      <p className="text-sm text-gray-500">38 units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">721.62 AED</p>
                      <p className="text-sm text-green-600">+12%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Rainbow Carrots</p>
                      <p className="text-sm text-gray-500">32 units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">415.68 AED</p>
                      <p className="text-sm text-green-600">+8%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Rewards Analytics</CardTitle>
              <CardDescription>Track your loyalty program performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">1,248.56 AED</div>
                  <p className="text-sm text-green-600">Total Cashback Given</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">489.96 AED</div>
                  <p className="text-sm text-blue-600">Active Store Credit</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-800">78%</div>
                  <p className="text-sm text-purple-600">Customer Retention Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
