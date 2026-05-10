import { clearAuthTokens, getAuthTokens, setAuthTokens, type AuthTokens } from './authSession'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  errors?: unknown
}

type CheckEmailResult = {
  email: string
  exists: boolean
  avatarUrl: string | null
}

type LoginResult = {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

async function parseApiResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = (await response.json()) as ApiResponse<T>
  if (!payload.success || !payload.data) {
    throw new Error(payload.message || fallbackMessage)
  }
  return payload.data
}

async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  const response = await fetch(`${apiBaseUrl}/api/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    throw new Error('Refresh token expired.')
  }

  const data = await parseApiResponse<LoginResult>(response, 'Unable to refresh token.')
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    accessTokenExpiresAt: data.accessTokenExpiresAt,
  }
}

export async function authFetch(input: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const tokens = getAuthTokens()
  const headers = new Headers(init.headers)
  if (tokens?.accessToken) {
    headers.set('Authorization', `Bearer ${tokens.accessToken}`)
  }

  const response = await fetch(input, {
    ...init,
    headers,
  })

  if (response.status !== 401 || !retry) {
    return response
  }

  if (!tokens?.refreshToken) {
    clearAuthTokens()
    return response
  }

  try {
    const nextTokens = await refreshAccessToken(tokens.refreshToken)
    setAuthTokens(nextTokens)
    return authFetch(input, init, false)
  } catch {
    clearAuthTokens()
    return response
  }
}

export async function checkEmail(email: string): Promise<CheckEmailResult> {
  const response = await fetch(`${apiBaseUrl}/api/auth/check-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    throw new Error('Unable to verify email.')
  }

  return parseApiResponse<CheckEmailResult>(response, 'Email verification failed.')
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error('Invalid email or password.')
  }

  return parseApiResponse<LoginResult>(response, 'Login failed.')
}
