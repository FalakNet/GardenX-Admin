"use server"

import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import type { Product } from "@/types"

export async function getProducts() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    const { data, error } = await supabase.from("products").select("*").order("name")

    if (error) {
      console.error("Error fetching products:", error)
      return []
    }

    return data as Product[]
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return []
  }
}

export async function getProduct(id: number) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching product:", error)
      return null
    }

    return data as Product
  } catch (error) {
    console.error("Failed to fetch product:", error)
    return null
  }
}

export async function createProduct(product: Omit<Product, "id" | "created_at" | "updated_at">) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    const { data, error } = await supabase.from("products").insert([product]).select()

    if (error) {
      console.error("Error creating product:", error)
      return null
    }

    revalidatePath("/products")
    return data[0] as Product
  } catch (error) {
    console.error("Failed to create product:", error)
    return null
  }
}

export async function updateProduct(id: number, product: Partial<Product>) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    const { data, error } = await supabase
      .from("products")
      .update({
        ...product,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating product:", error)
      return null
    }

    revalidatePath("/products")
    return data[0] as Product
  } catch (error) {
    console.error("Failed to update product:", error)
    return null
  }
}

export async function deleteProduct(id: number) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      console.error("Error deleting product:", error)
      return false
    }

    revalidatePath("/products")
    return true
  } catch (error) {
    console.error("Failed to delete product:", error)
    return false
  }
}