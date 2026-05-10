type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  errors?: unknown
}

type CheckEmailResult = {
  email: string
  exists: boolean
}

type LoginResult = {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
}

export async function checkEmail(email: string): Promise<CheckEmailResult> {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
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

  const payload = (await response.json()) as ApiResponse<CheckEmailResult>
  if (!payload.success || !payload.data) {
    throw new Error(payload.message || 'Email verification failed.')
  }

  return payload.data
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
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

  const payload = (await response.json()) as ApiResponse<LoginResult>
  if (!payload.success || !payload.data) {
    throw new Error(payload.message || 'Login failed.')
  }

  return payload.data
}
