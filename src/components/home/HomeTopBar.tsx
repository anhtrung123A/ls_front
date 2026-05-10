import type { MouseEvent, RefObject, ReactNode } from 'react'

type HomeTopBarProps = {
  isSidebarCollapsed: boolean
  onToggleSidebar: () => void
  avatarTriggerRef: RefObject<HTMLButtonElement | null>
  onAvatarClick: (event: MouseEvent<HTMLButtonElement>) => void
  avatarNode: ReactNode
}

export function HomeTopBar({
  isSidebarCollapsed,
  onToggleSidebar,
  avatarTriggerRef,
  onAvatarClick,
  avatarNode,
}: HomeTopBarProps) {
  return (
    <header className="home-navbar">
      <div className="nav-left">
        <button
          className="icon-btn"
          type="button"
          onClick={onToggleSidebar}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="logo-area">
          <img
            className="logo-image"
            src="https://www.gstatic.com/classroom/logo_square_rounded.svg"
            alt="Classroom logo"
          />
          <span className="logo-text">Classroom</span>
        </div>
      </div>
      <div className="nav-right">
        <button className="icon-btn" type="button">
          <span className="material-symbols-outlined">add</span>
        </button>
        <button className="icon-btn" type="button">
          <span className="material-symbols-outlined">apps</span>
        </button>
        <button
          ref={avatarTriggerRef}
          className="avatar-trigger"
          type="button"
          onClick={onAvatarClick}
        >
          {avatarNode}
        </button>
      </div>
    </header>
  )
}
