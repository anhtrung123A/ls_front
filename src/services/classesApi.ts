import { authFetch } from './authApi'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type ClassDetail = {
  id: number
  courseId: number
  classCode: string
  name: string | null
  startDate: string | null
  endDate: string | null
  maxStudents: number
  currentCount: number
  type: number
  status: number
  teacherId: number | null
  teacherFullName: string | null
  teacherEmail: string | null
  teacherAvatarUrl: string | null
  createdBy: number | null
  createdAt: string
}

export async function getClassDetail(classId: number): Promise<ClassDetail> {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
  const response = await authFetch(`${apiBaseUrl}/api/classes/${classId}`, {
    method: 'GET',
  })

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED')
  }

  if (!response.ok) {
    throw new Error('Unable to load class detail.')
  }

  const payload = (await response.json()) as ApiResponse<ClassDetail>
  if (!payload.success || !payload.data) {
    throw new Error(payload.message || 'Unable to load class detail.')
  }

  return payload.data
}
