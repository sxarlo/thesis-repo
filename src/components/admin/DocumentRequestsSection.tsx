import type { DocEntry } from '../../types/queue'
import { getDocLabel } from '../../utils/queue'

interface DocumentRequestsSectionProps {
  active: boolean
  documents: DocEntry[]
  onUpdateDocStatus: (docId: string, st: string) => void
}

export default function DocumentRequestsSection({ active, documents, onUpdateDocStatus }: DocumentRequestsSectionProps) {
  return (
    <div className={`admin-screen${active ? ' active' : ''}`}>
      <div className="dashboard-card">
        <div className="dashboard-card-header"><h3>📄 Document Requests</h3></div>
        <div className="dashboard-card-body" style={{ overflowX: 'auto' }}>
          <table className="queue-table">
            <thead><tr><th>ID</th><th>Student</th><th>Document</th><th>Copies</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {documents.filter(d => d.status !== 'cancelled').length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--gray-400)' }}>No requests.</td></tr> :
                documents.filter(d => d.status !== 'cancelled').map(d => <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.id}</td>
                  <td>{d.studentName}<br /><span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{d.studentId}</span></td>
                  <td>{getDocLabel(d.type)}</td><td>{d.copies || 1}</td>
                  <td><span className="status-badge" style={{ background: 'var(--warning-light)', color: '#856404' }}>{d.status}</span></td>
                  <td><select value={d.status} onChange={e => onUpdateDocStatus(d.id, e.target.value)} style={{ padding: '6px 10px', border: '2px solid var(--gray-200)', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font)' }}>
                    <option value="pending">Pending</option><option value="processing">Processing</option><option value="ready">Ready</option><option value="completed">Completed</option>
                  </select></td>
                </tr>)
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
