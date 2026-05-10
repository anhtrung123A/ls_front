import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { logout } from '../../services/authApi'
import { getUserProfile, type UserProfile } from '../../services/usersApi'
import {
  getMyClasses,
  getMyClassSessions,
  type MyClass,
  type MyClassSession,
} from '../../services/studentsApi'
import { AuthLinearProgress } from '../../components/auth/AuthLinearProgress'
import { HomeTopBar } from '../../components/home/HomeTopBar'
import { HomeSidebar } from '../../components/home/HomeSidebar'
import { AccountModal } from '../../components/home/AccountModal'
import '../home/home-page.css'

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_MS = 24 * 60 * 60 * 1000

function toLocalDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getStartOfWeek(date: Date) {
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = normalized.getDay()
  const diff = day === 0 ? -6 : 1 - day
  normalized.setDate(normalized.getDate() + diff)
  return normalized
}

function parseWeekKeyToStartDate(weekKey: string | undefined) {
  const thisWeekStart = getStartOfWeek(new Date())
  if (!weekKey || weekKey === 'this-week') {
    return thisWeekStart
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekKey)) {
    return null
  }
  const parsed = new Date(`${weekKey}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  return getStartOfWeek(parsed)
}

function getWeekKeyFromStartDate(startDate: Date) {
  return toLocalDateKey(startDate)
}

function formatTimeRange(startTime: string | null, endTime: string | null) {
  if (!startTime && !endTime) return 'Time TBD'
  if (startTime && endTime) return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`
  return startTime ? startTime.slice(0, 5) : endTime!.slice(0, 5)
}

function getInitials(nameOrEmail: string) {
  const trimmed = nameOrEmail.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return trimmed[0].toUpperCase()
}

function UserAvatar({ profile }: { profile: UserProfile }) {
  const fallbackText = getInitials(profile.fullName || profile.email)
  return (
    <div className="home-avatar">
      {profile.avatarUrl ? (
        <img src={profile.avatarUrl} alt={profile.fullName || profile.email} />
      ) : (
        <div className="home-avatar-fallback">{fallbackText}</div>
      )}
    </div>
  )
}

export function CalendarPage() {
  const navigate = useNavigate()
  const { weekKey, classKey } = useParams<{ weekKey: string; classKey: string }>()
  const { tokens, clearTokens } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [classes, setClasses] = useState<MyClass[]>([])
  const [isLoadingClasses, setIsLoadingClasses] = useState(false)
  const [classesError, setClassesError] = useState('')
  const [sessions, setSessions] = useState<MyClassSession[]>([])
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const avatarTriggerRef = useRef<HTMLButtonElement | null>(null)
  const classDropdownRef = useRef<HTMLDivElement | null>(null)
  const weekStartDate = useMemo(() => parseWeekKeyToStartDate(weekKey), [weekKey])
  const selectedClassStudentId = classKey ?? 'all'
  const resolvedWeekStart = useMemo(
    () => weekStartDate ?? getStartOfWeek(new Date()),
    [weekStartDate],
  )
  const weekEndDate = useMemo(
    () => new Date(resolvedWeekStart.getTime() + 6 * DAY_MS),
    [resolvedWeekStart],
  )
  const sessionDateFrom = useMemo(() => toLocalDateKey(resolvedWeekStart), [resolvedWeekStart])
  const sessionDateTo = useMemo(() => toLocalDateKey(weekEndDate), [weekEndDate])

  async function navigateCalendar(nextWeekKey: string, nextClassKey: string, replace = false) {
    const nextUrl = `/calendar/${nextWeekKey}/class/${nextClassKey}`
    if (isNavigating || nextUrl === window.location.pathname) {
      return
    }
    setIsNavigating(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    navigate(nextUrl, { replace })
    setIsNavigating(false)
  }

  async function handleLogout() {
    try {
      if (tokens?.refreshToken) {
        await logout(tokens.refreshToken)
      }
    } catch (error) {
      console.error(error)
    } finally {
      clearTokens()
    }
  }

  useEffect(() => {
    const hasValidClassKey =
      typeof classKey === 'string' && (classKey === 'all' || /^\d+$/.test(classKey))
    if (weekStartDate && hasValidClassKey) return
    const fallbackWeekKey = weekStartDate ? weekKey ?? 'this-week' : 'this-week'
    void navigateCalendar(fallbackWeekKey, 'all', true)
  }, [classKey, isNavigating, weekKey, weekStartDate])

  useEffect(() => {
    let mounted = true
    async function loadProfile() {
      setIsLoadingProfile(true)
      setProfileError('')
      try {
        const userProfile = await getUserProfile()
        if (!mounted) return
        setProfile(userProfile)
      } catch (error) {
        if (!mounted) return
        const message = error instanceof Error ? error.message : 'Unable to load profile.'
        if (message === 'UNAUTHORIZED') {
          clearTokens()
          return
        }
        setProfileError(message)
      } finally {
        if (mounted) setIsLoadingProfile(false)
      }
    }
    void loadProfile()
    return () => {
      mounted = false
    }
  }, [clearTokens])

  async function loadClasses() {
    setIsLoadingClasses(true)
    setClassesError('')
    try {
      const result = await getMyClasses()
      const nextItems = result.items ?? []
      setClasses(nextItems)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load classes.'
      if (message === 'UNAUTHORIZED') {
        clearTokens()
        return
      }
      setClassesError(message)
    } finally {
      setIsLoadingClasses(false)
    }
  }

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node
      if (classDropdownRef.current && !classDropdownRef.current.contains(target)) {
        setIsClassDropdownOpen(false)
      }
    }

    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  useEffect(() => {
    const selectedClass = classes.find((item) => String(item.classStudentId) === selectedClassStudentId)
    const classIdParam = selectedClass ? String(selectedClass.classId) : ''

    async function loadSessions() {
      try {
        const result = await getMyClassSessions({
          classId: classIdParam,
          sessionDateFrom,
          sessionDateTo,
        })
        setSessions(result.items ?? [])
        console.log('[Calendar] my_class_sessions params:', {
          classId: classIdParam || 'all',
          sessionDateFrom,
          sessionDateTo,
        })
        console.log('[Calendar] my_class_sessions result:', result)
      } catch (error) {
        setSessions([])
        const message = error instanceof Error ? error.message : 'Unable to load class sessions.'
        if (message === 'UNAUTHORIZED') {
          clearTokens()
          return
        }
        console.error('[Calendar] my_class_sessions error:', message)
      }
    }

    void loadSessions()
  }, [classes, clearTokens, selectedClassStudentId, sessionDateFrom, sessionDateTo])

  if (isLoadingProfile) {
    return <div className="home-root" style={{ display: 'grid', placeItems: 'center' }}>Loading...</div>
  }

  if (!weekStartDate) {
    return null
  }

  if (!profile || profileError) {
    return <div className="home-root" style={{ display: 'grid', placeItems: 'center' }}>{profileError || 'Cannot load calendar.'}</div>
  }

  const todayKey = toLocalDateKey(new Date())
  const weekColumns = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(resolvedWeekStart.getTime() + index * DAY_MS)
    return {
      date,
      dayName: WEEKDAY_NAMES[date.getDay()],
      dayNumber: date.getDate(),
      isToday: toLocalDateKey(date) === todayKey,
    }
  })
  const weekDateText = `${resolvedWeekStart.toLocaleString('en-US', { month: 'short' })} ${resolvedWeekStart.getDate()} - ${weekEndDate.toLocaleString('en-US', { month: 'short' })} ${weekEndDate.getDate()}, ${weekEndDate.getFullYear()}`
  const isCurrentWeek = weekKey === 'this-week'

  async function goToWeek(offset: number) {
    const nextStart = new Date(resolvedWeekStart.getTime() + offset * 7 * DAY_MS)
    const currentWeekStart = getStartOfWeek(new Date())
    if (toLocalDateKey(nextStart) === toLocalDateKey(currentWeekStart)) {
      await navigateCalendar('this-week', selectedClassStudentId)
      return
    }
    await navigateCalendar(getWeekKeyFromStartDate(nextStart), selectedClassStudentId)
  }

  const selectedClassLabel =
    selectedClassStudentId === 'all'
      ? 'Tất cả các lớp học'
      : classes.find((item) => String(item.classStudentId) === selectedClassStudentId)?.className ||
        classes.find((item) => String(item.classStudentId) === selectedClassStudentId)?.classCode ||
        `Class ${selectedClassStudentId}`
  const sessionsByDate = sessions.reduce<Record<string, MyClassSession[]>>((acc, session) => {
    const key = session.sessionDate
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(session)
    return acc
  }, {})

  return (
    <div className="home-root">
      <HomeTopBar
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        avatarTriggerRef={avatarTriggerRef}
        onAvatarClick={(event) => {
          event.stopPropagation()
          setIsAccountModalOpen((prev) => !prev)
        }}
        avatarNode={<UserAvatar profile={profile} />}
      />
      {isNavigating ? (
        <div className="calendar-route-progress">
          <AuthLinearProgress isVisible />
        </div>
      ) : null}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onLogout={() => void handleLogout()}
        profile={profile}
        avatarTriggerRef={avatarTriggerRef}
      />

      <div className="main-container">
        <HomeSidebar isCollapsed={isSidebarCollapsed} />
        <main className="content calendar-content">
          <div className="calendar-toolbar">
            <div
              ref={classDropdownRef}
              className={`calendar-class-dropdown-wrap${isClassDropdownOpen ? ' open' : ''}`}
            >
              <button
                className="calendar-class-dropdown"
                type="button"
                onClick={async () => {
                  if (isLoadingClasses || isNavigating) return
                  if (!isClassDropdownOpen) {
                    await loadClasses()
                    setIsClassDropdownOpen(true)
                    return
                  }
                  setIsClassDropdownOpen(false)
                }}
                disabled={isLoadingClasses || isNavigating}
                aria-haspopup="listbox"
                aria-expanded={isClassDropdownOpen}
              >
                <span>{isLoadingClasses ? 'Loading classes...' : selectedClassLabel}</span>
                <span className="material-symbols-outlined calendar-dropdown-icon">
                  {isClassDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>
              {isClassDropdownOpen ? (
                <div className="calendar-class-dropdown-menu" role="listbox" aria-label="Class filter options">
                  <button
                    type="button"
                    className={`calendar-class-option${selectedClassStudentId === 'all' ? ' selected' : ''}`}
                    onClick={() => {
                      void navigateCalendar(weekKey ?? 'this-week', 'all')
                      setIsClassDropdownOpen(false)
                    }}
                  >
                    Tất cả các lớp học
                  </button>
                  {classes.map((classItem) => (
                    <button
                      key={classItem.classStudentId}
                      type="button"
                      className={`calendar-class-option${selectedClassStudentId === String(classItem.classStudentId) ? ' selected' : ''}`}
                      onClick={() => {
                        void navigateCalendar(weekKey ?? 'this-week', String(classItem.classStudentId))
                        setIsClassDropdownOpen(false)
                      }}
                    >
                      {classItem.className || classItem.classCode || `Class ${classItem.classId}`}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="calendar-date-nav">
              <button
                className="icon-btn"
                type="button"
                aria-label="Previous week"
                onClick={() => void goToWeek(-1)}
                disabled={isNavigating}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="calendar-date-text">{weekDateText}</span>
              <button
                className="icon-btn"
                type="button"
                aria-label="Next week"
                onClick={() => void goToWeek(1)}
                disabled={isNavigating}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
            <button
              className={`icon-btn calendar-today-btn${isCurrentWeek ? ' active' : ''}`}
              type="button"
              aria-label="Go to this week"
              onClick={() => void navigateCalendar('this-week', selectedClassStudentId)}
              disabled={isNavigating}
            >
              <span className="material-symbols-outlined">today</span>
            </button>
          </div>
          {classesError ? <div className="calendar-classes-error">{classesError}</div> : null}

          <section className="calendar-grid" aria-label="Weekly calendar">
            {weekColumns.map((day) => {
              const dayKey = toLocalDateKey(day.date)
              const daySessions = sessionsByDate[dayKey] ?? []
              return (
                <article key={dayKey} className="calendar-grid-col">
                  <header className={`calendar-col-header${day.isToday ? ' today' : ''}`}>
                    <div className="calendar-day-name">{day.dayName}</div>
                    <div className="calendar-day-number">{day.dayNumber}</div>
                  </header>
                  <div className="calendar-col-body">
                    {daySessions.map((session) => (
                      <div key={session.classSessionId} className="calendar-event-block">
                        <div className="calendar-event-title">
                          {session.className || session.classCode || `Class ${session.classId}`}
                        </div>
                        <div>{formatTimeRange(session.startTime, session.endTime)}</div>
                        {session.roomName ? <div>Room: {session.roomName}</div> : null}
                      </div>
                    ))}
                  </div>
                </article>
              )
            })}
          </section>
        </main>
      </div>

      <div className="help-fab">
        <span className="material-symbols-outlined">help_outline</span>
      </div>
    </div>
  )
}
