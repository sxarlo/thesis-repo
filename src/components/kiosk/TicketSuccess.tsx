import type { QueueEntry } from '../../types/queue'
import { getServiceLabel } from '../../utils/queue'

interface TicketSuccessProps {
  entry: QueueEntry
  onReset: () => void
}

export default function TicketSuccess({ entry, onReset }: TicketSuccessProps) {
  return (
    <div className="ticket-success">
      <div className="ticket-success-icon">✅</div>
      <div className="ticket-success-title">Queue Assigned!</div>
      <div className="ticket-success-number">{entry.number}</div>
      <div className="ticket-success-name">{entry.studentName}</div>
      <div className="ticket-success-info">
        <div className="ticket-success-item"><span>Position</span><strong>#{entry.position}</strong></div>
        <div className="ticket-success-item"><span>Est. Wait</span><strong>{entry.estimatedWait} mins</strong></div>
        <div className="ticket-success-item"><span>Service</span><strong>{getServiceLabel(entry.service)}</strong></div>
      </div>
      <button className="btn btn-primary btn-lg" onClick={onReset}>Create Another</button>
    </div>
  )
}
