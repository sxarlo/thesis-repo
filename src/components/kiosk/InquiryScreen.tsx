import type { QueueEntry } from '../../types/queue'
import KioskHeader from './KioskHeader'
import TicketSuccess from './TicketSuccess'

interface InquiryScreenProps {
  active: boolean
  entry: QueueEntry | null
  name: string
  setName: (value: string) => void
  message: string
  setMessage: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
  onTicketReset: () => void
}

export default function InquiryScreen({
  active,
  entry,
  name,
  setName,
  message,
  setMessage,
  onSubmit,
  onBack,
  onTicketReset,
}: InquiryScreenProps) {
  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <KioskHeader
        title="Registrar Inquiry"
        subtitle="Ask a question"
        right={<button className="back-btn" onClick={onBack}>← Back</button>}
      />
      <div className="kiosk-body">
        {entry && entry.service === 'inquiry' ? (
          <TicketSuccess entry={entry} onReset={onTicketReset} />
        ) : (
        <div className="form-container">
          <form onSubmit={onSubmit}>
            <div className="form-group"><label>Full Name *</label><input type="text" placeholder="Enter your full name" required value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="form-group"><label>Your Inquiry *</label><textarea placeholder="Type your question or concern here..." required value={message} onChange={e => setMessage(e.target.value)}></textarea></div>
            <button type="submit" className="btn btn-primary btn-block btn-lg mt-16">Submit Inquiry</button>
          </form>
        </div>
        )}
      </div>
    </div>
  )
}
