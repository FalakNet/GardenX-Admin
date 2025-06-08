"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import type { Product, Order, OrderItem, ProductDenomination } from "@/types"
import { createOrder } from "./orders"
import { deductStoreCredit, addCustomerReward } from "./customers"

export async function getPosProducts() {
  try {
    const supabase = createServerSupabaseClient()

    // Get products with denominations
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        denominations:product_denominations(*)
      `)
      .order("name")
      .gt("stock_quantity", 0)

    if (error) {
      console.error("Error fetching POS products:", error)
      return []
    }

    return data as Product[]
  } catch (error) {
    console.error("Failed to fetch POS products:", error)
    return []
  }
}

export async function createPosOrder(
  customerName: string | null,
  customerId: number | null,
  items: {
    product: Product
    quantity: number
    denomination?: ProductDenomination
  }[],
  subtotal: number,
  tax: number,
  total: number,
  storeCreditUsed = 0,
) {
  try {
    console.log("Creating POS order:", { 
      customerName, 
      customerId, 
      itemsCount: items.length, 
      total, 
      storeCreditUsed 
    })

    if (!items || items.length === 0) {
      throw new Error("No items in cart")
    }

    if (total <= 0) {
      throw new Error("Invalid order total")
    }

    const supabase = createServerSupabaseClient()

    // Calculate cashback (10%) - only for identified customers
    const cashbackEarned = customerId ? Number.parseFloat((total * 0.1).toFixed(2)) : 0

    // Generate unique order ID
    const orderId = `GH-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`

    // Create order
    const order: Omit<Order, "id" | "created_at" | "updated_at"> = {
      order_id: orderId,
      customer_id: customerId,
      total_amount: total,
      tax_amount: tax,
      status: "Delivered", // POS orders are delivered immediately
      type: "POS",
      cashback_earned: cashbackEarned,
      store_credit_used: storeCreditUsed,
    }

    console.log("Order data:", order)

    // Start transaction by creating order first
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([order])
      .select()
      .single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    const newOrder = orderData as Order
    console.log("Order created with ID:", newOrder.id)

    // Create order items
    const orderItems: Omit<OrderItem, "id" | "created_at">[] = items.map((item) => {
      const unitPrice = item.denomination ? item.denomination.price : item.product.price
      const totalPrice = Number.parseFloat((unitPrice * item.quantity).toFixed(2))
      
      return {
        order_id: newOrder.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        denomination_id: item.denomination?.id || null,
      }
    })

    console.log("Creating order items:", orderItems.length)

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      // Try to clean up the order
      await supabase.from("orders").delete().eq("id", newOrder.id)
      throw new Error(`Failed to create order items: ${itemsError.message}`)
    }

    // Update product stock quantities
    for (const item of items) {
      try {
        if (item.denomination) {
          // Update denomination stock
          const { error: denomError } = await supabase
            .from("product_denominations")
            .update({
              stock_quantity: Math.max(0, item.denomination.stock_quantity - item.quantity),
            })
            .eq("id", item.denomination.id)
          
          if (denomError) {
            console.error("Error updating denomination stock:", denomError)
          }
        } else {
          // Update main product stock
          const { error: stockError } = await supabase
            .from("products")
            .update({
              stock_quantity: Math.max(0, item.product.stock_quantity - item.quantity),
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.product.id)
          
          if (stockError) {
            console.error("Error updating product stock:", stockError)
          }
        }
      } catch (stockError) {
        console.error("Stock update error:", stockError)
        // Don't fail the entire order for stock update errors
      }
    }

    // If store credit was used, deduct it from the customer's account
    if (storeCreditUsed > 0 && customerId) {
      try {
        await deductStoreCredit(customerId, newOrder.id, storeCreditUsed)
        console.log("Store credit deducted:", storeCreditUsed)
      } catch (creditError) {
        console.error("Error deducting store credit:", creditError)
        // Don't fail the order for store credit errors
      }
    }

    // Add cashback rewards if applicable
    if (customerId && cashbackEarned > 0) {
      try {
        await addCustomerReward(customerId, newOrder.id, cashbackEarned, "earned")
        console.log("Cashback reward added:", cashbackEarned)
      } catch (rewardError) {
        console.error("Error adding cashback reward:", rewardError)
        // Don't fail the order for reward errors
      }
    }

    console.log("POS order created successfully:", newOrder.id)
    return newOrder
  } catch (error) {
    console.error("Error creating POS order:", error)
    throw error // Re-throw to be handled by the calling function
  }
}

export async function searchCustomerByPhone(phone: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("customers").select("*").ilike("phone", `%${phone}%`).limit(1)

    if (error || !data.length) {
      return null
    }

    return data[0]
  } catch (error) {
    console.error("Error searching customer by phone:", error)
    return null
  }
}

export async function getProductDenominations(productId: number) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("product_denominations")
      .select("*")
      .eq("product_id", productId)
      .order("weight", { ascending: true })

    if (error) {
      console.error("Error fetching product denominations:", error)
      return []
    }

    return data as ProductDenomination[]
  } catch (error) {
    console.error("Failed to fetch product denominations:", error)
    return []
  }
}
