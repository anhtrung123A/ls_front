import { NavLink } from 'react-router-dom'

type HomeSidebarProps = {
  isCollapsed: boolean
}

export function HomeSidebar({ isCollapsed }: HomeSidebarProps) {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <NavLink to="/home" className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}>
        <span className="material-symbols-outlined">home</span>
        <span className="menu-label">Home</span>
      </NavLink>
      <NavLink
        to="/calendar"
        className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}
      >
        <span className="material-symbols-outlined">calendar_today</span>
        <span className="menu-label">Calendar</span>
      </NavLink>
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
