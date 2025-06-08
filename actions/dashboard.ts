"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import type { DashboardStats, Order } from "@/types"

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createServerSupabaseClient()

  // Get total revenue
  const { data: revenueData, error: revenueError } = await supabase.from("orders").select("total_amount")

  if (revenueError) {
    console.error("Error fetching revenue:", revenueError)
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalCustomers: 0,
      recentOrders: [],
    }
  }

  const totalRevenue = revenueData.reduce((sum, order) => sum + order.total_amount, 0)

  // Get total orders count
  let totalOrders = 0
  try {
    const { count, error: ordersError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
    if (ordersError) {
      console.error("Error fetching orders count:", ordersError)
    } else {
      totalOrders = count || 0
    }
  } catch (err) {
    console.error("Error fetching orders count:", err)
    totalOrders = 0
  }

  // Get total products count
  let totalProducts = 0
  try {
    const { count, error: productsError } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
    if (productsError) {
      console.error("Error fetching products count:", productsError)
    } else {
      totalProducts = count || 0
    }
  } catch (err) {
    console.error("Error fetching products count:", err)
    totalProducts = 0
  }

  // Get total customers count
  let totalCustomers = 0
  try {
    const { count, error: customersError } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
    if (customersError) {
      console.error("Error fetching customers count:", customersError)
    } else {
      totalCustomers = count || 0
    }
  } catch (err) {
    console.error("Error fetching customers count:", err)
    totalCustomers = 0
  }

  // Get recent orders
  const { data: recentOrders, error: recentOrdersError } = await supabase
    .from("orders")
    .select(`
      *,
      customer:customers(name)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  if (recentOrdersError) {
    console.error("Error fetching recent orders:", recentOrdersError)
  }

  return {
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers,
    recentOrders: (recentOrders as Order[]) || [],
  }
}
