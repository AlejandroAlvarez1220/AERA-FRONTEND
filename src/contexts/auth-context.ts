import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export interface AuthContextValue {
  loading: boolean
  session: Session | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
