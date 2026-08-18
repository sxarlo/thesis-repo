import { CONFIG } from '../../config'
import type { QueueEntry } from '../../types/queue'
import KioskHeader from './KioskHeader'
import TicketSuccess from './TicketSuccess'

interface ClaimDocumentScreenProps {
  active: boolean
  entry: QueueEntry | null
  name: string
  setName: (value: string) => void
  docType: string
  setDocType: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
  onTicketReset: () => void
}

export default function ClaimDocumentScreen({
  active,
  entry,
  name,
  setName,
  docType,
  setDocType,
  onSubmit,
  onBack,
  onTicketReset,
}: ClaimDocumentScreenProps) {
  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <KioskHeader
        title="Claim Document"
        subtitle="Claim your processed document"
        right={<button className="back-btn" onClick={onBack}>← Back</button>}
      />
      <div className="kiosk-body">
        {entry && entry.service === 'claim-document' ? (
          <TicketSuccess entry={entry} onReset={onTicketReset} />
        ) : (
        <div className="form-container">
          <form onSubmit={onSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Full Name *</label><input type="text" placeholder="Enter your full name" required value={name} onChange={e => setName(e.target.value)} /></div>
            </div>
            <div className="form-group">
              <label>Document to Claim</label>
              <select value={docType} onChange={e => setDocType(e.target.value)}>
                <option value="">Select...</option>
                {CONFIG.documentTypes.map(d => <option key={d.id} value={d.id}>{d.name} {d.price}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg mt-16">Get Queue Number</button>
          </form>
        </div>
        )}
      </div>
    </div>
  )
}
