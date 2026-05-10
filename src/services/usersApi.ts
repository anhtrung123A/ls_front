import { authFetch } from './authApi'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type UserProfile = {
  id: number
  fullName: string | null
  email: string
  phone: string | null
  role: number | null
  avatarUrl: string | null
  isActive: boolean
}

export async function getUserProfile(): Promise<UserProfile> {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
  const response = await authFetch(`${apiBaseUrl}/api/users/user_profile`, {
    method: 'GET',
  })

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED')
  }

  if (!response.ok) {
    throw new Error('Unable to load user profile.')
  }

  const payload = (await response.json()) as ApiResponse<UserProfile>
  if (!payload.success || !payload.data) {
    throw new Error(payload.message || 'Unable to load user profile.')
  }

  return payload.data
}

