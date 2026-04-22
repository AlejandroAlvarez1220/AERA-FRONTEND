import { useEffect, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { getCurrentSession } from '../services/authService'
import { isSupabaseConfigured, supabase } from '../services/supabaseClient'
import { AuthContext } from './auth-context'
import type { Session } from '@supabase/supabase-js'

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return
    }

    let active = true

    void getCurrentSession()
      .then((currentSession) => {
        if (active) {
          setSession(currentSession)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setLoading(false)
        }
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ loading, session }}>{children}</AuthContext.Provider>
}
