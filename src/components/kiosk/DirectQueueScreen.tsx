import { DEPARTMENTS } from '../../config'
import type { CustomerType, Department, QueueEntry } from '../../types/queue'
import KioskHeader from './KioskHeader'
import TicketSuccess from './TicketSuccess'

interface DirectQueueScreenProps {
  active: boolean
  department: Department
  entry: QueueEntry | null
  name: string
  setName: (value: string) => void
  sid: string
  setSid: (value: string) => void
  customerType: CustomerType
  setCustomerType: (value: CustomerType) => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
  onTicketReset: () => void
}

export default function DirectQueueScreen({
  active,
  department,
  entry,
  name,
  setName,
  sid,
  setSid,
  customerType,
  setCustomerType,
  onSubmit,
  onBack,
  onTicketReset,
}: DirectQueueScreenProps) {
  const cfg = DEPARTMENTS[department]
  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <KioskHeader
        title={cfg.label}
        subtitle={`${cfg.icon} Get a ${cfg.label} queue number`}
        right={<button className="back-btn" onClick={onBack}>← Back</button>}
      />
      <div className="kiosk-body">
        {entry && entry.department === department ? (
          <TicketSuccess entry={entry} onReset={onTicketReset} />
        ) : (
          <div className="form-container">
            <form onSubmit={onSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Full Name *</label><input type="text" placeholder="Enter your full name" required value={name} onChange={e => setName(e.target.value)} /></div>
              </div>
              <div className="form-group"><label>Student ID (optional)</label><input type="text" placeholder="Enter your student ID" value={sid} onChange={e => setSid(e.target.value)} /></div>
              <div className="form-group">
                <label>I am a</label>
                <select value={customerType} onChange={e => setCustomerType(e.target.value as CustomerType)}>
                  <option value="student">Student</option>
                  <option value="enrollee">Enrollee</option>
                  <option value="walk-in">Walk-in</option>
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
