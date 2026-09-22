import { ADMIN_NAV_BY_DEPARTMENT, DEPARTMENTS } from '../../config'
import type { AdminProfile } from '../../types/admin'
import type { Department } from '../../types/queue'

interface AdminSidebarProps {
  activeScreen: string
  department: Department
  account: AdminProfile
  pendingCount: number
  onNavigate: (id: string) => void
  onRequestLogout: () => void
}

export default function AdminSidebar({ activeScreen, department, account, pendingCount, onNavigate, onRequestLogout }: AdminSidebarProps) {
  const initials = account.display_name.split(' ').map(p => p[0]).slice(0, 2).join('')
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header"><div className="logo-small"><img src="/celp-logo.svg" alt="CEU" /></div><div className="text"><h2>{DEPARTMENTS[department].label} Admin</h2><span>CEU Malolos</span></div></div>
      <nav className="admin-nav">
        {ADMIN_NAV_BY_DEPARTMENT[department].map(item => (
          <button key={item.id} className={`admin-nav-item${activeScreen === `admin-${item.id}` ? ' active' : ''}`} onClick={() => onNavigate(`admin-${item.id}`)}>
            <span className="icon">{item.icon}</span>
            {item.label}
            {item.id === 'queue' && pendingCount > 0 && <span className="badge">{pendingCount}</span>}
          </button>
        ))}
      </nav>
      <div className="admin-sidebar-footer">
        <div className="avatar">{initials}</div>
        <div className="info"><div className="name">{account.display_name}</div><div className="role">{account.role}</div></div>
        <button className="logout-btn" onClick={onRequestLogout} title="Logout">🚪</button>
      </div>
    </aside>
  )
}
