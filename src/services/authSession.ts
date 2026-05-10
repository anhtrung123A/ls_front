export type AuthTokens = {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt?: string
}

const AUTH_STORAGE_KEY = 'auth_tokens'

let currentTokens: AuthTokens | null = readTokensFromStorage()
const listeners = new Set<(tokens: AuthTokens | null) => void>()

function readTokensFromStorage(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as Partial<AuthTokens>
    if (!parsed.accessToken || !parsed.refreshToken) {
      return null
    }

    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      accessTokenExpiresAt: parsed.accessTokenExpiresAt,
    }
  } catch {
    return null
  }
}

function notify() {
  listeners.forEach((listener) => listener(currentTokens))
}

export function getAuthTokens() {
  return currentTokens
}

export function setAuthTokens(tokens: AuthTokens) {
  currentTokens = tokens
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens))
  notify()
}

export function clearAuthTokens() {
  currentTokens = null
  localStorage.removeItem(AUTH_STORAGE_KEY)
  notify()
}

export function subscribeAuthTokens(listener: (tokens: AuthTokens | null) => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
