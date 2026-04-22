import type { Session } from '@supabase/supabase-js'
import { getSupabaseClient } from './supabaseClient'

export async function signInWithPassword(email: string, password: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signUpWithPassword(email: string, password: string) {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
}

export async function signOut() {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}
