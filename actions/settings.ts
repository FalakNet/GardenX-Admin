"use server"

import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export interface CustomerGroup {
  id: string
  name: string
  cashback_rate: number
  min_spend: number
  color: string
  benefits: string[]
  created_at?: string
  updated_at?: string
}

export interface PaymentSettings {
  cashback_enabled: boolean
  default_cashback_rate: number
  max_cashback_per_transaction: number
  cashback_expiry_days: number
  auto_apply_cashback: boolean
}

export interface BusinessSettings {
  store_name: string
  currency: string
  tax_rate: number
  receipt_footer: string
  timezone: string
}

export async function getCustomerGroups() {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  const { data, error } = await supabase.from("customer_groups").select("*").order("min_spend")

  if (error) {
    console.error("Error fetching customer groups:", error)
    return []
  }

  return data as CustomerGroup[]
}

export async function saveCustomerGroup(group: Omit<CustomerGroup, "created_at" | "updated_at">) {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  const { data, error } = await supabase
    .from("customer_groups")
    .upsert({
      ...group,
      updated_at: new Date().toISOString(),
    })
    .select()

  if (error) {
    console.error("Error saving customer group:", error)
    throw new Error(`Failed to save customer group: ${error.message}`)
  }

  revalidatePath("/settings")
  return data[0] as CustomerGroup
}

export async function deleteCustomerGroup(id: string) {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  const { error } = await supabase.from("customer_groups").delete().eq("id", id)

  if (error) {
    console.error("Error deleting customer group:", error)
    return false
  }

  revalidatePath("/settings")
  return true
}

export async function getPaymentSettings() {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  const { data, error } = await supabase.from("settings").select("*").eq("category", "payment").single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching payment settings:", error)
  }

  if (!data) {
    // Return default settings if none exist
    return {
      cashback_enabled: true,
      default_cashback_rate: 10,
      max_cashback_per_transaction: 100,
      cashback_expiry_days: 365,
      auto_apply_cashback: true,
    }
  }

  return data.settings as PaymentSettings
}

export async function savePaymentSettings(settings: PaymentSettings) {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  // First try to update existing record
  const { data: existingData } = await supabase.from("settings").select("id").eq("category", "payment").single()

  let result
  if (existingData) {
    // Update existing record
    result = await supabase
      .from("settings")
      .update({
        settings,
        updated_at: new Date().toISOString(),
      })
      .eq("category", "payment")
      .select()
  } else {
    // Insert new record
    result = await supabase
      .from("settings")
      .insert({
        category: "payment",
        settings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
  }

  if (result.error) {
    console.error("Error saving payment settings:", result.error)
    throw new Error(`Failed to save payment settings: ${result.error.message}`)
  }

  revalidatePath("/settings")
  return result.data[0]
}

export async function getBusinessSettings() {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  const { data, error } = await supabase.from("settings").select("*").eq("category", "business").single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching business settings:", error)
  }

  if (!data) {
    // Return default settings if none exist
    return {
      store_name: "GardenX",
      currency: "AED",
      tax_rate: 5,
      receipt_footer: "Thank you for shopping with GardenX!",
      timezone: "Asia/Dubai",
    }
  }

  return data.settings as BusinessSettings
}

export async function saveBusinessSettings(settings: BusinessSettings) {
  const cookieStore = cookies()
  const supabase = createServerSupabaseClient(cookieStore)

  // First try to update existing record
  const { data: existingData } = await supabase.from("settings").select("id").eq("category", "business").single()

  let result
  if (existingData) {
    // Update existing record
    result = await supabase
      .from("settings")
      .update({
        settings,
        updated_at: new Date().toISOString(),
      })
      .eq("category", "business")
      .select()
  } else {
    // Insert new record
    result = await supabase
      .from("settings")
      .insert({
        category: "business",
        settings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
  }

  if (result.error) {
    console.error("Error saving business settings:", result.error)
    throw new Error(`Failed to save business settings: ${result.error.message}`)
  }

  revalidatePath("/settings")
  return result.data[0]
}