import { CONFIG } from '../../config'
import type { QueueEntry } from '../../types/queue'
import KioskHeader from './KioskHeader'
import TicketSuccess from './TicketSuccess'

interface DocumentRequestScreenProps {
  active: boolean
  entry: QueueEntry | null
  name: string
  setName: (value: string) => void
  docType: string
  setDocType: (value: string) => void
  purpose: string
  setPurpose: (value: string) => void
  copies: number
  setCopies: (value: number) => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
  onTicketReset: () => void
}

export default function DocumentRequestScreen({
  active,
  entry,
  name,
  setName,
  docType,
  setDocType,
  purpose,
  setPurpose,
  copies,
  setCopies,
  onSubmit,
  onBack,
  onTicketReset,
}: DocumentRequestScreenProps) {
  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <KioskHeader
        title="Request Document"
        subtitle="Fill in your details"
        right={<button className="back-btn" onClick={onBack}>← Back</button>}
      />
      <div className="kiosk-body">
        {entry && entry.service === 'document-request' ? (
          <TicketSuccess entry={entry} onReset={onTicketReset} />
        ) : (
        <div className="form-container">
          <form onSubmit={onSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Full Name *</label><input type="text" placeholder="Enter your full name" required value={name} onChange={e => setName(e.target.value)} /></div>
            </div>
            <div className="form-group">
              <label>Document Type *</label>
              <select required value={docType} onChange={e => setDocType(e.target.value)}>
                <option value="">Select...</option>
                {CONFIG.documentTypes.map(d => <option key={d.id} value={d.id}>{d.name} {d.price}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Purpose</label>
              <select value={purpose} onChange={e => setPurpose(e.target.value)}>
                <option value="">Select purpose...</option>
                {CONFIG.purposes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Copies</label><input type="number" value={copies} min={1} max={10} onChange={e => setCopies(parseInt(e.target.value) || 1)} /></div>
            <button type="submit" className="btn btn-primary btn-block btn-lg mt-16">Submit &amp; Get Queue Number</button>
          </form>
        </div>
        )}
      </div>
    </div>
  )
}
