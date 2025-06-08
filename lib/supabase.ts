import { createClient } from "@supabase/supabase-js"
import { cache } from "react"
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"

// Create a Supabase client for server-side with cookie-based auth
export const createServerSupabaseClient = (cookieStore: ReadonlyRequestCookies) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
        storage: {
          getItem: async (key) => cookieStore.get(key)?.value ?? null,
          setItem: () => {},
          removeItem: () => {},
        },
      },
    }
  )
}

// Cached version for use in Server Components to prevent fetch waterfalls
export const createCachedServerSupabaseClient = cache(() => {
  return createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "")
})

// Create a single supabase client for client-side
let clientSupabaseClient: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  if (clientSupabaseClient) return clientSupabaseClient

  clientSupabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  )

  return clientSupabaseClient
}