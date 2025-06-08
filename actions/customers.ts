"use server"

import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import type { Customer, RewardsTransaction } from "@/types"

export async function getCustomers() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    const { data, error } = await supabase.from("customers").select("*").order("name")

    if (error) {
      console.error("Error fetching customers:", error)
      return []
    }

    return data as Customer[]
  } catch (error) {
    console.error("Failed to fetch customers:", error)
    return []
  }
}

export async function getCustomer(id: number) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    const { data, error } = await supabase.from("customers").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching customer:", error)
      return null
    }

    return data as Customer
  } catch (error) {
    console.error("Failed to fetch customer:", error)
    return null
  }
}

export async function createCustomer(customer: Omit<Customer, "id" | "created_at" | "updated_at">) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    // Generate a customer ID if not provided
    if (!customer.customer_id) {
      customer.customer_id = `CUST-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(3, "0")}`
    }

    const { data, error } = await supabase.from("customers").insert([customer]).select()

    if (error) {
      console.error("Error creating customer:", error)
      return null
    }

    revalidatePath("/customers")
    return data[0] as Customer
  } catch (error) {
    console.error("Failed to create customer:", error)
    return null
  }
}

export async function updateCustomer(id: number, customer: Partial<Customer>) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    const { data, error } = await supabase
      .from("customers")
      .update({
        ...customer,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating customer:", error)
      return null
    }

    revalidatePath("/customers")
    return data[0] as Customer
  } catch (error) {
    console.error("Failed to update customer:", error)
    return null
  }
}

export async function getCustomerRewards(customerId: number) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    const { data, error } = await supabase
      .from("rewards_transactions")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching customer rewards:", error)
      return []
    }

    return data as RewardsTransaction[]
  } catch (error) {
    console.error("Failed to fetch customer rewards:", error)
    return []
  }
}

export async function addCustomerReward(
  customerId: number,
  orderId: number | null,
  amount: number,
  type: "earned" | "redeemed",
) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    // Get current customer data
    const { data: customer } = await supabase
      .from("customers")
      .select("rewards_earned, store_credit")
      .eq("id", customerId)
      .single()

    if (!customer) {
      throw new Error("Customer not found")
    }

    // Calculate new balances
    const newRewardsEarned = type === "earned" ? customer.rewards_earned + amount : customer.rewards_earned - amount

    const newStoreCredit = type === "earned" ? customer.store_credit + amount : customer.store_credit

    // Update customer balances
    const { error: updateError } = await supabase
      .from("customers")
      .update({
        rewards_earned: Math.max(0, newRewardsEarned),
        store_credit: Math.max(0, newStoreCredit),
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId)

    if (updateError) {
      throw new Error(`Failed to update customer: ${updateError.message}`)
    }

    // Create rewards transaction record
    const { error: transactionError } = await supabase
      .from("rewards_transactions")
      .insert({
        customer_id: customerId,
        order_id: orderId,
        amount: amount,
        type: type,
        balance_after: newStoreCredit,
        created_at: new Date().toISOString(),
      })

    if (transactionError) {
      console.error("Error creating reward transaction:", transactionError)
    }

    revalidatePath("/customers")
    return true
  } catch (error) {
    console.error("Error adding customer reward:", error)
    throw error
  }
}

export async function deductStoreCredit(
  customerId: number,
  orderId: number,
  amount: number,
) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    // Get current customer data
    const { data: customer } = await supabase
      .from("customers")
      .select("store_credit")
      .eq("id", customerId)
      .single()

    if (!customer) {
      throw new Error("Customer not found")
    }

    if (customer.store_credit < amount) {
      throw new Error("Insufficient store credit")
    }

    // Update customer store credit
    const newStoreCredit = customer.store_credit - amount
    const { error: updateError } = await supabase
      .from("customers")
      .update({
        store_credit: newStoreCredit,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId)

    if (updateError) {
      throw new Error(`Failed to update store credit: ${updateError.message}`)
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from("rewards_transactions")
      .insert({
        customer_id: customerId,
        order_id: orderId,
        amount: -amount, // Negative for deduction
        type: "redeemed",
        balance_after: newStoreCredit,
        created_at: new Date().toISOString(),
      })

    if (transactionError) {
      console.error("Error creating deduction transaction:", transactionError)
    }

    revalidatePath("/customers")
    return true
  } catch (error) {
    console.error("Error deducting store credit:", error)
    throw error
  }
}

export async function addStoreCredit(customerId: number, amount: number) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('store_credit')
      .eq('id', customerId)
      .single()

    if (fetchError) throw fetchError

    const newStoreCredit = customer.store_credit + amount

    const { error } = await supabase
      .from('customers')
      .update({ store_credit: newStoreCredit })
      .eq('id', customerId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error adding store credit:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function removeStoreCredit(customerId: number, amount: number) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('store_credit')
      .eq('id', customerId)
      .single()

    if (fetchError) throw fetchError

    const newStoreCredit = Math.max(0, customer.store_credit - amount)

    const { error } = await supabase
      .from('customers')
      .update({ store_credit: newStoreCredit })
      .eq('id', customerId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error removing store credit:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}