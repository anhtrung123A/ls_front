import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { UserProfile } from '../../services/usersApi'

type AccountModalProps = {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
  profile: UserProfile
  avatarTriggerRef: RefObject<HTMLButtonElement | null>
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

export function AccountModal({
  isOpen,
  onClose,
  onLogout,
  profile,
  avatarTriggerRef,
}: AccountModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node
      if (!modalRef.current || !avatarTriggerRef.current) return
      if (!modalRef.current.contains(target) && !avatarTriggerRef.current.contains(target)) {
        onClose()
      }
    }

    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [avatarTriggerRef, onClose])

  return (
    <div ref={modalRef} className={`account-modal ${isOpen ? 'show' : ''}`}>
      <button className="close-modal-btn" type="button" onClick={onClose}>
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
        <button type="button" className="action-btn" onClick={onLogout}>
          <span className="material-symbols-outlined">logout</span>
          Sign out
        </button>
      </div>
      <div className="modal-footer">
        <a href="#">Privacy Policy</a> • <a href="#">Terms of Service</a>
      </div>
    </div>
  )
}
