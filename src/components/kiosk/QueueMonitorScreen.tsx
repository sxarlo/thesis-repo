import type { QueueEntry } from '../../types/queue'
import KioskHeader from './KioskHeader'

interface QueueMonitorScreenProps {
  active: boolean
  queue: QueueEntry[]
  onCheckStatus: () => void
  onBack: () => void
}

export default function QueueMonitorScreen({ active, queue, onCheckStatus, onBack }: QueueMonitorScreenProps) {
  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <KioskHeader
        title="Queue Monitor"
        subtitle="Live queue status"
        right={<button className="back-btn" onClick={onBack}>← Back</button>}
      />
      <div className="kiosk-body">
        <div className="queue-monitor">
          <div className="now-serving">
            <div className="label">Now Serving</div>
            <div className="number pulse">{queue.find(q => q.status === 'serving')?.number || '—'}</div>
            <div className="counter">{queue.find(q => q.status === 'serving') ? `Counter: ${queue.find(q => q.status === 'serving')?.counter || 'TBD'} • ${queue.find(q => q.status === 'serving')?.studentName}` : 'No active transactions'}</div>
            <div style={{ marginTop: 20 }}><button className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.2)', color: 'var(--white)', border: '2px solid rgba(255,255,255,0.3)' }} onClick={onCheckStatus}>🔍 Check Your Queue</button></div>
          </div>
          <div className="queue-list-container">
            <h3>Upcoming Queue</h3>
            <div className="queue-list">
              {queue.filter(q => q.status !== 'completed' && q.status !== 'cancelled').map(q => (
                <div key={q.id} className={`queue-item ${q.status}`}>
                  <span className="q-number">{q.number}</span>
                  <span className="q-name">{q.studentName}{q.counter ? ` → ${q.counter}` : ''}</span>
                  <span className="q-status">{q.status === 'pending' ? `#${q.position}` : q.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
