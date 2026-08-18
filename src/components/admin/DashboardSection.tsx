import type { QueueEntry } from '../../types/queue'
import type { QueueStats } from '../../utils/queue'
import { getServiceLabel } from '../../utils/queue'

interface DashboardSectionProps {
  active: boolean
  stats: QueueStats
  queue: QueueEntry[]
  onViewAllPending: () => void
}

export default function DashboardSection({ active, stats, queue, onViewAllPending }: DashboardSectionProps) {
  return (
    <div className={`admin-screen${active ? ' active' : ''}`}>
      <div className="stats-grid">
        <div className="stat-card"><div className="icon pink">📋</div><div className="info"><div className="value">{stats.total}</div><div className="label">Total Today</div></div></div>
        <div className="stat-card"><div className="icon gold">⏳</div><div className="info"><div className="value">{stats.pending}</div><div className="label">In Queue</div></div></div>
        <div className="stat-card"><div className="icon blue">✅</div><div className="info"><div className="value">{stats.serving}</div><div className="label">Now Serving</div></div></div>
        <div className="stat-card"><div className="icon gold">🎉</div><div className="info"><div className="value">{stats.completed}</div><div className="label">Completed</div></div></div>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-header"><h3>Recent Activity</h3></div>
          <div className="dashboard-card-body">
            {[...queue].filter(q => q.status !== 'cancelled').reverse().slice(0, 8).map(q => {
              const t = new Date(q.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              const ic = q.status === 'pending' ? '⏳' : q.status === 'serving' ? '✅' : q.status === 'completed' ? '🎉' : '❌'
              return <div key={q.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--gray-100)', gap: 10 }}><span>{ic}</span><div style={{ flex: 1 }}><span style={{ fontWeight: 600, fontSize: 13 }}>{q.number}</span><span style={{ fontSize: 12, color: 'var(--gray-500)', marginLeft: 8 }}>{q.studentName}</span></div><span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{t}</span></div>
            })}
          </div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-header"><h3>Pending</h3><span style={{ cursor: 'pointer', fontSize: 13, color: 'var(--ceu-pink)', fontWeight: 600 }} onClick={onViewAllPending}>View All →</span></div>
          <div className="dashboard-card-body">
            {queue.filter(q => q.status === 'pending').slice(0, 5).map(q => (
              <div key={q.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--gray-100)', gap: 10 }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--ceu-pink)', minWidth: 50 }}>{q.number}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{q.studentName}</span>
                <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{getServiceLabel(q.service)}</span>
              </div>
            ))}
            {stats.pending === 0 && <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 16 }}>No pending transactions</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
