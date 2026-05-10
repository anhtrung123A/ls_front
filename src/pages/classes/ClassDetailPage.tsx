import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { logout } from '../../services/authApi'
import { getUserProfile, type UserProfile } from '../../services/usersApi'
import { getClassDetail, type ClassDetail } from '../../services/classesApi'
import { HomeTopBar } from '../../components/home/HomeTopBar'
import { HomeSidebar } from '../../components/home/HomeSidebar'
import { AccountModal } from '../../components/home/AccountModal'
import '../home/home-page.css'

const CLASS_IMAGE_URL = 'https://gstatic.com/classroom/themes/img_bookclub.jpg'

function getInitials(nameOrEmail: string) {
  const trimmed = nameOrEmail.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return trimmed[0].toUpperCase()
}

function formatDate(value: string | null) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
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

export function ClassDetailPage() {
  const { classId } = useParams<{ classId: string }>()
  const { tokens, clearTokens } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'stream' | 'classwork' | 'people' | 'grades'>('stream')
  const avatarTriggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const parsedClassId = Number(classId)
    if (!Number.isFinite(parsedClassId)) {
      setError('Invalid class id.')
      setIsLoading(false)
      return
    }

    let mounted = true
    async function loadData() {
      setIsLoading(true)
      setError('')
      try {
        const [profileResult, classResult] = await Promise.all([
          getUserProfile(),
          getClassDetail(parsedClassId),
        ])
        if (!mounted) return
        setProfile(profileResult)
        setClassDetail(classResult)
      } catch (requestError) {
        if (!mounted) return
        const message =
          requestError instanceof Error ? requestError.message : 'Unable to load class detail.'
        if (message === 'UNAUTHORIZED') {
          clearTokens()
          return
        }
        setError(message)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    void loadData()
    return () => {
      mounted = false
    }
  }, [classId, clearTokens])

  async function handleLogout() {
    try {
      if (tokens?.refreshToken) {
        await logout(tokens.refreshToken)
      }
    } catch (logoutError) {
      console.error(logoutError)
    } finally {
      clearTokens()
    }
  }

  if (isLoading) {
    return <div className="home-root" style={{ display: 'grid', placeItems: 'center' }}>Loading...</div>
  }

  if (!profile || !classDetail || error) {
    return <div className="home-root" style={{ display: 'grid', placeItems: 'center' }}>{error || 'Cannot load class detail.'}</div>
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
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onLogout={() => void handleLogout()}
        profile={profile}
        avatarTriggerRef={avatarTriggerRef}
      />

      <div className="main-container">
        <HomeSidebar isCollapsed={isSidebarCollapsed} />
        <main className="content class-detail-content">
          <div className="class-detail-tabs">
            <div className="class-detail-tabs-left">
              <button
                type="button"
                className={`class-detail-tab${activeTab === 'stream' ? ' active' : ''}`}
                onClick={() => setActiveTab('stream')}
              >
                Bảng tin
              </button>
              <button
                type="button"
                className={`class-detail-tab${activeTab === 'classwork' ? ' active' : ''}`}
                onClick={() => setActiveTab('classwork')}
              >
                Bài tập trên lớp
              </button>
              <button
                type="button"
                className={`class-detail-tab${activeTab === 'people' ? ' active' : ''}`}
                onClick={() => setActiveTab('people')}
              >
                Mọi người
              </button>
              <button
                type="button"
                className={`class-detail-tab${activeTab === 'grades' ? ' active' : ''}`}
                onClick={() => setActiveTab('grades')}
              >
                Điểm
              </button>
            </div>
            <div className="class-detail-tabs-right">
              <button type="button" className="icon-btn"><span className="material-symbols-outlined">event</span></button>
              <button type="button" className="icon-btn"><span className="material-symbols-outlined">drive_folder_upload</span></button>
              <button type="button" className="icon-btn"><span className="material-symbols-outlined">settings</span></button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="class-detail-stream"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            >
              <section className="class-detail-hero">
                <img src={CLASS_IMAGE_URL} alt="Class banner" className="class-detail-hero-image" />
                <div className="class-detail-hero-overlay" />
                <div className="class-detail-hero-content">
                  <h1>{classDetail.name || classDetail.classCode}</h1>
                  <p>{classDetail.classCode}</p>
                </div>
              </section>

              {activeTab === 'stream' ? (
                <div className="class-detail-layout">
                  <aside className="class-detail-left">
                    <article className="class-detail-card">
                      <div className="class-detail-card-head">
                        <h3>Mã lớp</h3>
                        <span className="material-symbols-outlined">more_vert</span>
                      </div>
                      <p className="class-detail-code">{classDetail.classCode}</p>
                    </article>
                    <article className="class-detail-card">
                      <h3>Sắp đến hạn</h3>
                      <p className="class-detail-muted">Chưa có bài tập sắp đến hạn.</p>
                    </article>
                  </aside>

                  <section className="class-detail-right">
                    <div className="class-detail-actions">
                      <button type="button" className="class-detail-announce-btn">
                        <span className="material-symbols-outlined">edit_document</span>
                        Thông báo mới
                      </button>
                      <button type="button" className="class-detail-reuse-btn">
                        <span className="material-symbols-outlined">sync_alt</span>
                        Dùng lại
                      </button>
                    </div>

                    <article className="class-detail-post">
                      <div className="class-detail-post-icon">
                        <span className="material-symbols-outlined">assignment</span>
                      </div>
                      <div className="class-detail-post-content">
                        <div className="class-detail-post-title">
                          {profile.fullName || profile.email} đã đăng thông tin lớp.
                        </div>
                        <div className="class-detail-post-time">
                          Start: {formatDate(classDetail.startDate)} • End: {formatDate(classDetail.endDate)}
                        </div>
                        <div className="class-detail-post-time">
                          Teacher: {classDetail.teacherFullName || 'N/A'} • Students: {classDetail.currentCount}/{classDetail.maxStudents}
                        </div>
                      </div>
                      <button type="button" className="icon-btn">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </article>
                  </section>
                </div>
              ) : (
                <section className="class-detail-card class-detail-tab-panel">
                  {activeTab === 'classwork' ? <h3>Bài tập trên lớp</h3> : null}
                  {activeTab === 'people' ? <h3>Mọi người</h3> : null}
                  {activeTab === 'grades' ? <h3>Điểm</h3> : null}
                  <p className="class-detail-muted">Nội dung tab đang được chuẩn bị.</p>
                </section>
              )}
            </motion.div>
          </AnimatePresence>

        </main>
      </div>

      <div className="help-fab">
        <span className="material-symbols-outlined">help_outline</span>
      </div>
    </div>
  )
}
