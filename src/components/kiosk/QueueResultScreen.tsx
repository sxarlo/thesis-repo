import type { QueueEntry } from '../../types/queue'
import { getDocPrice, getServiceLabel } from '../../utils/queue'
import KioskHeader from './KioskHeader'

interface QueueResultScreenProps {
  active: boolean
  entry: QueueEntry | null
  onNavigate: (screen: string) => void
}

export default function QueueResultScreen({ active, entry, onNavigate }: QueueResultScreenProps) {
  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <KioskHeader
        title="Queue Assigned"
        subtitle="Your transaction is in queue"
        right={<button className="back-btn" onClick={() => onNavigate('kiosk-services')}>← New Transaction</button>}
      />
      <div className="kiosk-body">
        {entry && <div className="queue-result">
          <div className="queue-number-display">
            <div className="label">Your Queue Number</div>
            <div className="number bounce-in">{entry.number}</div>
            <div className="sub">{entry.studentName}</div>
          </div>
          <div className="queue-info">
            <div className="queue-info-item"><div className="value">{entry.position}</div><div className="label">Position</div></div>
            <div className="queue-info-item"><div className="value">{entry.estimatedWait} mins</div><div className="label">Est. Wait</div></div>
            <div className="queue-info-item"><div className="value">{getServiceLabel(entry.service)}</div><div className="label">Service</div></div>
            {entry.documentType && getDocPrice(entry.documentType) !== '—' ? (
              <div className="queue-info-item"><div className="value">{getDocPrice(entry.documentType)}</div><div className="label">Fee</div></div>
            ) : null}
          </div>
          <div className="queue-actions">
            <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('status-check')}>🔍 Track</button>
            <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('queue-monitor')}>👥 Queue</button>
            <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('interactive-map')}>📍 Map</button>
            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('kiosk-services')}>← New Transaction</button>
          </div>
        </div>}
      </div>
    </div>
  )
}
