import { authFetch } from './authApi'
import { COMMON_PAGINATION } from '../constants/common'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

type PagedResponse<T> = {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type MyClass = {
  classStudentId: number
  classId: number
  classCode: string | null
  className: string | null
  courseId: number
  courseName: string | null
  startDate: string | null
  endDate: string | null
  classStatus: number
  classStudentStatus: number
  joinedAt: string
  leftAt: string | null
}

export type MyClassSession = {
  classSessionId: number
  classId: number
  classCode: string | null
  className: string | null
  sessionDate: string
  startTime: string | null
  endTime: string | null
  teacherId: number | null
  roomId: number | null
  roomName: string | null
  roomLocation: string | null
  status: number
}

export async function getMyClasses() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
  const params = new URLSearchParams({
    Keyword: '',
    Status: '',
    OrderBy: '',
    OrderDir: '',
    CourseId: '',
    Type: '',
    Page: String(COMMON_PAGINATION.DEFAULT_PAGE),
    PageSize: String(COMMON_PAGINATION.DEFAULT_PAGE_SIZE),
  })

  const response = await authFetch(`${apiBaseUrl}/api/students/my_classes?${params.toString()}`, {
    method: 'GET',
  })

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED')
  }

  if (!response.ok) {
    throw new Error('Unable to load classes.')
  }

  const payload = (await response.json()) as ApiResponse<PagedResponse<MyClass>>
  if (!payload.success || !payload.data) {
    throw new Error(payload.message || 'Unable to load classes.')
  }

  return payload.data
}

type GetMyClassSessionsParams = {
  classId?: string
  sessionDateFrom?: string
  sessionDateTo?: string
}

export async function getMyClassSessions(params: GetMyClassSessionsParams) {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
  const searchParams = new URLSearchParams({
    ClassId: params.classId ?? '',
    SessionDateFrom: params.sessionDateFrom ?? '',
    SessionDateTo: params.sessionDateTo ?? '',
    Status: '',
    OrderBy: '',
    OrderDir: '',
    Page: '1',
    PageSize: '100',
  })

  const response = await authFetch(
    `${apiBaseUrl}/api/students/my_class_sessions?${searchParams.toString()}`,
    {
      method: 'GET',
    },
  )

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED')
  }

  if (!response.ok) {
    throw new Error('Unable to load class sessions.')
  }

  const payload = (await response.json()) as ApiResponse<PagedResponse<MyClassSession>>
  if (!payload.success || !payload.data) {
    throw new Error(payload.message || 'Unable to load class sessions.')
  }

  return payload.data
}
