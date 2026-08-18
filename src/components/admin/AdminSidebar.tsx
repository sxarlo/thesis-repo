import { ADMIN_CREDENTIALS } from '../../config'

interface AdminSidebarProps {
  activeScreen: string
  pendingCount: number
  onNavigate: (id: string) => void
  onLogout: () => void
}

export default function AdminSidebar({ activeScreen, pendingCount, onNavigate, onLogout }: AdminSidebarProps) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header"><div className="logo-small"><img src="/celp-logo.svg" alt="CEU" /></div><div className="text"><h2>Registrar Admin</h2><span>CEU Malolos</span></div></div>
      <nav className="admin-nav">
        {(['dashboard', 'queue', 'requests', 'analytics', 'settings'] as const).map(item => (
          <button key={item} className={`admin-nav-item${activeScreen === `admin-${item}` ? ' active' : ''}`} onClick={() => onNavigate(`admin-${item}`)}>
            <span className="icon">{{ dashboard: '📊', queue: '👥', requests: '📄', analytics: '📈', settings: '⚙️' }[item]}</span>
            {{ dashboard: 'Dashboard', queue: 'Queue', requests: 'Documents', analytics: 'Analytics', settings: 'Settings' }[item]}
            {item === 'queue' && pendingCount > 0 && <span className="badge">{pendingCount}</span>}
          </button>
        ))}
      </nav>
      <div className="admin-sidebar-footer">
        <div className="avatar">JD</div>
        <div className="info"><div className="name">{ADMIN_CREDENTIALS.name}</div><div className="role">{ADMIN_CREDENTIALS.role}</div></div>
        <button className="logout-btn" onClick={onLogout} title="Logout">🚪</button>
      </div>
    </aside>
  )
}
