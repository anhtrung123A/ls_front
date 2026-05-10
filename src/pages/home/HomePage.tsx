import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getUserProfile, type UserProfile } from '../../services/usersApi'
import { getMyClasses, type MyClass } from '../../services/studentsApi'
import { HomeTopBar } from '../../components/home/HomeTopBar'
import { HomeSidebar } from '../../components/home/HomeSidebar'
import './home-page.css'

function getInitials(nameOrEmail: string) {
  const trimmed = nameOrEmail.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return trimmed[0].toUpperCase()
}

function getOrdinal(day: number) {
  if (day >= 11 && day <= 13) return `${day}th`
  switch (day % 10) {
    case 1:
      return `${day}st`
    case 2:
      return `${day}nd`
    case 3:
      return `${day}rd`
    default:
      return `${day}th`
  }
}

function formatDisplayDate(value: string | null) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'

  const day = getOrdinal(date.getDate())
  const month = date.toLocaleString('en-US', { month: 'long' })
  const year = date.getFullYear()
  return `${day} ${month}, ${year}`
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

export function HomePage() {
  const { clearTokens } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [classes, setClasses] = useState<MyClass[]>([])
  const [isLoadingClasses, setIsLoadingClasses] = useState(true)
  const [classesError, setClassesError] = useState('')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const avatarTriggerRef = useRef<HTMLButtonElement | null>(null)

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

  useEffect(() => {
    let mounted = true
    async function loadClasses() {
      setIsLoadingClasses(true)
      setClassesError('')
      try {
        const result = await getMyClasses()
        if (!mounted) return
        setClasses(result.items ?? [])
      } catch (error) {
        if (!mounted) return
        const message = error instanceof Error ? error.message : 'Unable to load classes.'
        if (message === 'UNAUTHORIZED') {
          clearTokens()
          return
        }
        setClassesError(message)
      } finally {
        if (mounted) setIsLoadingClasses(false)
      }
    }
    void loadClasses()
    return () => {
      mounted = false
    }
  }, [clearTokens])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node
      if (!modalRef.current || !avatarTriggerRef.current) return
      if (!modalRef.current.contains(target) && !avatarTriggerRef.current.contains(target)) {
        setIsAccountModalOpen(false)
      }
    }

    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  if (isLoadingProfile) {
    return <div className="home-root" style={{ display: 'grid', placeItems: 'center' }}>Loading...</div>
  }

  if (!profile || profileError) {
    return <div className="home-root" style={{ display: 'grid', placeItems: 'center' }}>{profileError || 'Cannot load homepage.'}</div>
  }

  if (isLoadingClasses) {
    return <div className="home-root" style={{ display: 'grid', placeItems: 'center' }}>Loading classes...</div>
  }

  if (classesError) {
    return <div className="home-root" style={{ display: 'grid', placeItems: 'center' }}>{classesError}</div>
  }

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

      <div ref={modalRef} className={`account-modal ${isAccountModalOpen ? 'show' : ''}`}>
        <button className="close-modal-btn" type="button" onClick={() => setIsAccountModalOpen(false)}>
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="account-info">
          <div className="email-text">{profile.email}</div>
          <div className="large-avatar-container">
            <div className="large-avatar">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.fullName || profile.email} />
              ) : (
                getInitials(profile.fullName || profile.email)
              )}
            </div>
            <div className="camera-icon">
              <span className="material-symbols-outlined">photo_camera</span>
            </div>
          </div>
          <div className="greeting-text">Hi {profile.fullName || 'there'},</div>
          <button type="button" className="manage-account-btn">
            Manage your Google Account
          </button>
        </div>

        <div className="account-actions">
          <button type="button" className="action-btn">
            <span className="material-symbols-outlined">add</span>
            Add account
          </button>
          <button type="button" className="action-btn" onClick={clearTokens}>
            <span className="material-symbols-outlined">logout</span>
            Sign out
          </button>
        </div>

        <div className="modal-footer">
          <a href="#">Privacy Policy</a> • <a href="#">Terms of Service</a>
        </div>
      </div>

      <div className="main-container">
        <HomeSidebar isCollapsed={isSidebarCollapsed} />

        <main className="content">
          {classes.length > 0 ? (
            <div className="state-populated">
              <div className="banner">
                <div className="banner-placeholder">[Illustration]</div>
                <div className="banner-text">
                  <h2>Join research to improve Classroom</h2>
                  <p>Share your expertise to help shape the future of education technology.</p>
                  <a href="#">Learn more</a>
                </div>
              </div>

              <div className="class-grid">
                {classes.map((classroom) => (
                  <div className="class-card" key={classroom.classStudentId}>
                    <div className="class-header">
                      <h3>{classroom.className || classroom.classCode || 'Class'}</h3>
                      <p>{classroom.courseName || ''}</p>
                    </div>
                    <div className="class-body">
                      <div className="assignment">Starts from: {formatDisplayDate(classroom.startDate)}</div>
                      <div className="assignment-time">Ends at: {formatDisplayDate(classroom.endDate)}</div>
                    </div>
                    <div className="class-footer">
                      <span className="material-symbols-outlined">trending_up</span>
                      <span className="material-symbols-outlined">folder_open</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="state-empty">
              <div className="empty-box">
                <img src="https://ssl.gstatic.com/classroom/empty_states_home.svg" alt="Empty state" />
                <p>You have no classes yet</p>
                <div className="empty-actions">
                  <button className="btn btn-text" type="button">Create class</button>
                  <button className="btn btn-primary" type="button">Join class</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <div className="help-fab">
        <span className="material-symbols-outlined">help_outline</span>
      </div>
    </div>
  )
}
