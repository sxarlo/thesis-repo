import type { QueueEntry } from '../../types/queue'
import type { QueueStats } from '../../utils/queue'
import { getServiceLabel } from '../../utils/queue'

interface QueueManagementSectionProps {
  active: boolean
  stats: QueueStats
  queue: QueueEntry[]
  filter: string
  onFilterChange: (value: string) => void
  search: string
  onSearchChange: (value: string) => void
  onCallNext: () => void
  onSkip: (id: string) => void
  onDone: (id: string) => void
  onNoShow: (id: string) => void
}

export default function QueueManagementSection({
  active,
  stats,
  queue,
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onCallNext,
  onSkip,
  onDone,
  onNoShow,
}: QueueManagementSectionProps) {
  const filteredQueue = queue.filter(q => {
    if (q.status.trim().toLowerCase() !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      if (!q.number.toLowerCase().includes(s) && !q.studentName.toLowerCase().includes(s)) return false
    }
    return true
  })

  return (
    <div className={`admin-screen${active ? ' active' : ''}`}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--gray-50)', padding: '8px 16px', borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 800 }}>{stats.pending}</div><div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Pending</div></div>
          <div style={{ background: 'var(--success-light)', padding: '8px 16px', borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)' }}>{stats.serving}</div><div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Serving</div></div>
          <div style={{ background: 'var(--info-light)', padding: '8px 16px', borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 800, color: 'var(--info)' }}>{stats.completed}</div><div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Completed</div></div>
          <div style={{ background: 'var(--warning-light)', padding: '8px 16px', borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 800, color: '#856404' }}>{stats.total}</div><div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Total</div></div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div className="table-controls">
          <select value={filter} onChange={e => onFilterChange(e.target.value)}>
            <option value="pending">Pending</option><option value="serving">Serving</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
          </select>
          <input type="text" placeholder="Search..." value={search} onChange={e => onSearchChange(e.target.value)} />
        </div>
        <button className="btn btn-success" onClick={onCallNext}>📞 Call Next</button>
      </div>
      <div className="dashboard-card">
        <div className="dashboard-card-body" style={{ overflowX: 'auto' }}>
          <table className="queue-table">
            <thead><tr><th>Queue #</th><th>Name</th><th>Service</th><th>Counter</th><th>Status</th><th>Time</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredQueue.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--gray-400)' }}>No entries found.</td></tr> :
                filteredQueue.map(q => {
                  const t = new Date(q.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                  return <tr key={q.id}>
                    <td><strong>{q.number}</strong></td><td>{q.studentName}</td><td>{getServiceLabel(q.service)}</td><td>{q.counter || '—'}</td>
                    <td><span className={`status-badge ${q.status}`}>{q.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{t}</td>
                    <td><div style={{ display: 'flex', gap: 4 }}>
                      {q.status === 'pending' ? <><button className="action-btn call" onClick={onCallNext}>Call</button><button className="action-btn skip" onClick={() => onSkip(q.id)}>Skip</button></> : ''}
                      {q.status === 'serving' ? <><button className="action-btn done" onClick={() => onDone(q.id)}>Done</button><button className="action-btn remove" onClick={() => onNoShow(q.id)}>No Show</button></> : ''}
                    </div></td>
                  </tr>
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
