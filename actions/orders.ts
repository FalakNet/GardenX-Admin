"use server"

import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import type { Order as OrderType, OrderItem as OrderItemType } from "@/types"
import { addCustomerReward } from "./customers"

export type Order = OrderType

export type OrderItem = OrderItemType

export async function getOrders() {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      customer:customers(*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
    return []
  }

  return data as Order[]
}

export async function getOrder(id: number) {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      customer:customers(*),
      items:order_items(*, product:products(*))
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching order:", error)
    return null
  }

  return data as Order & { items: (OrderItem & { product: any })[] }
}

export async function getOrderDetails(orderId: number) {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  // Get order with customer info
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(`
      *,
      customer:customers(*)
    `)
    .eq("id", orderId)
    .single()

  if (orderError) {
    console.error("Error fetching order:", orderError)
    return null
  }

  // Get order items with product info
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select(`
      *,
      product:products(*)
    `)
    .eq("order_id", orderId)

  if (itemsError) {
    console.error("Error fetching order items:", itemsError)
    return null
  }

  return {
    order,
    items,
  }
}

export async function createOrder(
  order: Omit<Order, "id" | "created_at" | "updated_at">,
  items: Omit<OrderItem, "id" | "order_id" | "created_at">[],
) {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  // Generate an order ID if not provided
  if (!order.order_id) {
    order.order_id = `GH-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`
  }

  // Start a transaction
  const { data: orderData, error: orderError } = await supabase.from("orders").insert([order]).select()

  if (orderError) {
    console.error("Error creating order:", orderError)
    return null
  }

  const newOrder = orderData[0] as Order

  // Insert order items
  const orderItems = items.map((item) => ({
    ...item,
    order_id: newOrder.id,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

  if (itemsError) {
    console.error("Error creating order items:", itemsError)
    // Ideally we would rollback the order here
    return null
  }

  // Add cashback rewards if applicable
  if (newOrder.customer_id && newOrder.cashback_earned > 0) {
    await addCustomerReward(newOrder.customer_id, newOrder.id, newOrder.cashback_earned, "earned")
  }

  revalidatePath("/orders")
  return newOrder
}

export async function updateOrderStatus(id: number, status: Order["status"]) {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  const { data, error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating order status:", error)
    throw new Error("Failed to update order status")
  }

  revalidatePath("/orders")
  revalidatePath("/pos")
  return data[0] as Order
}

export async function refundOrder(id: number, amount: number, reason: string) {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  // In a real app, you would integrate with payment processor here
  // For now, we'll just update the order status and log the refund

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "Cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error processing refund:", error)
    throw new Error("Failed to process refund")
  }

  // Log the refund (in a real app, you'd have a refunds table)
  console.log(`Refund processed: Order ${id}, Amount: ${amount} AED, Reason: ${reason}`)

  revalidatePath("/orders")
  return data[0] as Order
}

export async function cancelOrder(id: number, reason: string) {
  const cookieStore = await cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "Cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error cancelling order:", error)
    throw new Error("Failed to cancel order")
  }

  // Log the cancellation reason
  console.log(`Order cancelled: Order ${id}, Reason: ${reason}`)

  revalidatePath("/orders")
  return data[0] as Order
}