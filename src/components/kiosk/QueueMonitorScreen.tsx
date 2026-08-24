import type { Department, QueueEntry } from '../../types/queue'
import { DEPARTMENTS } from '../../config'
import KioskHeader from './KioskHeader'

interface QueueMonitorScreenProps {
  active: boolean
  department: Department
  queue: QueueEntry[]
  onCheckStatus: () => void
  onBack: () => void
}

export default function QueueMonitorScreen({ active, department, queue, onCheckStatus, onBack }: QueueMonitorScreenProps) {
  const cfg = DEPARTMENTS[department]
  const serving = queue.filter(q => q.department === department && q.status === 'serving')
  const upcoming = queue.filter(q => q.department === department && q.status === 'pending')
  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <KioskHeader
        title={`${cfg.label} Queue`}
        subtitle={`${cfg.icon} Who is being served and who is next`}
        right={<button className="back-btn" onClick={onBack}>← Back</button>}
      />
      <div className="kiosk-body">
        <div className="queue-monitor">
          <div className="now-serving">
            <div className="label">Now Serving</div>
            {serving.length === 0 ? (
              <>
                <div className="number">—</div>
                <div className="counter">No one is being served right now.</div>
              </>
            ) : (
              <div className="serving-grid">
                {serving.map(q => (
                  <div key={q.id} className="serving-item">
                    <span className="serving-counter">{q.counter || `${cfg.label} Counter`}</span>
                    <span className="number pulse">{q.number}</span>
                    <span className="serving-name">{q.studentName}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 20 }}><button className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.2)', color: 'var(--white)', border: '2px solid rgba(255,255,255,0.3)' }} onClick={onCheckStatus}>🔍 Check Your Queue</button></div>
          </div>
          <div className="queue-list-container">
            <h3>Upcoming</h3>
            <div className="queue-list">
              {upcoming.map(q => (
                <div key={q.id} className="queue-item pending">
                  <span className="q-number">{q.number}</span>
                  <span className="q-name">{q.studentName}</span>
                  <span className="q-status">#{q.position}</span>
                </div>
              ))}
              {upcoming.length === 0 && <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 16 }}>No one is waiting in line.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
