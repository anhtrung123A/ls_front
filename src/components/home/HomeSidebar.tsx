type HomeSidebarProps = {
  isCollapsed: boolean
}

export function HomeSidebar({ isCollapsed }: HomeSidebarProps) {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <a className="menu-item active" href="#">
        <span className="material-symbols-outlined">home</span>
        <span className="menu-label">Home</span>
      </a>
      <a className="menu-item" href="#">
        <span className="material-symbols-outlined">calendar_today</span>
        <span className="menu-label">Calendar</span>
      </a>
      <div className="divider" />
      <div className="section-title">Teaching</div>
      <a className="menu-item" href="#">
        <span className="material-symbols-outlined">assignment</span>
        <span className="menu-label">To review</span>
      </a>
      <div className="divider" />
      <a className="menu-item" href="#">
        <span className="material-symbols-outlined">archive</span>
        <span className="menu-label">Archived classes</span>
      </a>
      <a className="menu-item" href="#">
        <span className="material-symbols-outlined">settings</span>
        <span className="menu-label">Settings</span>
      </a>
    </aside>
  )
}

