import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Admin client bypasses RLS – only use in server-side trusted code (server actions, admin pages).
// Created lazily so builds without env vars don't crash on import.
let client: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SECRET_KEY
    if (!url || !key) throw new Error('Supabase ist nicht konfiguriert (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY fehlen).')
    client = createClient(url, key, { auth: { persistSession: false } })
  }
  return client
}
