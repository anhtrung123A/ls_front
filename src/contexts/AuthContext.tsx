import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  type AuthTokens,
  clearAuthTokens,
  getAuthTokens,
  setAuthTokens,
  subscribeAuthTokens,
} from '../services/authSession'

type AuthContextValue = {
  tokens: AuthTokens | null
  isAuthenticated: boolean
  setTokens: (tokens: AuthTokens) => void
  clearTokens: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [tokens, setTokensState] = useState<AuthTokens | null>(() => getAuthTokens())

  useEffect(() => {
    return subscribeAuthTokens((nextTokens) => setTokensState(nextTokens))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      tokens,
      isAuthenticated: Boolean(tokens?.accessToken),
      setTokens: (nextTokens) => setAuthTokens(nextTokens),
      clearTokens: () => clearAuthTokens(),
    }),
    [tokens],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.')
  }
  return context
}
