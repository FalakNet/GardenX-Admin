"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function login(username: string, password: string) {
  const supabase = createServerSupabaseClient()
  // Use Supabase Auth to sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email: username,
    password,
  })

  if (error || !data.session) {
    return { success: false, error: error?.message || "Invalid credentials" }
  }

  // Set the Supabase Auth session in a cookie
  const cookieStore = await cookies()
  cookieStore.set("sb-access-token", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: data.session.expires_in,
    path: "/",
    sameSite: "lax",
  })
  cookieStore.set("sb-refresh-token", data.session.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    sameSite: "lax",
  })
  // Set admin_session cookie for middleware
  cookieStore.set("admin_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  })

  return { success: true }
}

export async function logout() {
  // Remove Supabase Auth cookies
  const cookieStore = await cookies()
  cookieStore.delete("sb-access-token")
  cookieStore.delete("sb-refresh-token")
  cookieStore.delete("admin_session")
  redirect("/login")
}

export async function checkAuth() {
  // Check for Supabase Auth access token cookie
  const cookieStore = await cookies()
  const session = cookieStore.get("sb-access-token")
  return !!session?.value
}

export async function requireAuth() {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    redirect("/login")
  }
}
