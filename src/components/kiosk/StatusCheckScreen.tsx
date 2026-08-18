import { useState } from 'react'
import type { DocEntry, QueueEntry } from '../../types/queue'
import { getDocLabel, getServiceLabel } from '../../utils/queue'
import KioskHeader from './KioskHeader'

interface StatusCheckScreenProps {
  active: boolean
  queue: QueueEntry[]
  documents: DocEntry[]
  onBack: () => void
  onShowMap: () => void
  notify: (msg: string, type?: string) => void
}

export default function StatusCheckScreen({ active, queue, documents, onBack, onShowMap, notify }: StatusCheckScreenProps) {
  const [statusInput, setStatusInput] = useState('')
  const [statusResult, setStatusResult] = useState<QueueEntry | null>(null)

  const handleStatusCheck = () => {
    if (!statusInput.trim()) { notify('Enter a queue number.', 'info'); return }
    const result = queue.find(q => q.number.toUpperCase() === statusInput.trim().toUpperCase())
    setStatusResult(result || null)
  }

  const docByQueue = (qid: string) => documents.find(d => d.queueId === qid)

  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <KioskHeader
        title="Transaction Status"
        subtitle="Check your queue or document status"
        right={<button className="back-btn" onClick={onBack}>← Back</button>}
      />
      <div className="kiosk-body">
        <div className="status-check">
          <div style={{ fontSize: 56 }}>🔍</div>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>Enter your Queue Number</h2>
          <p style={{ color: 'var(--gray-500)', textAlign: 'center' }}>Enter the queue number you received from the kiosk to check your transaction status.</p>
          <div className="input-group">
            <input type="text" placeholder="e.g. A042" style={{ textTransform: 'uppercase' }} value={statusInput} onChange={e => setStatusInput(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleStatusCheck()} />
            <button className="btn btn-primary btn-lg" onClick={handleStatusCheck}>Check</button>
          </div>
          <div className={`status-result${statusResult !== null ? ' show' : ''}`}>
            {statusResult === null ? null : statusResult ? (
              (() => {
                const sm: Record<string, { icon: string; label: string; p: number }> = { pending: { icon: '⏳', label: 'In Queue', p: 25 }, serving: { icon: '✅', label: 'Now Serving', p: 60 }, completed: { icon: '🎉', label: 'Completed', p: 100 }, cancelled: { icon: '❌', label: 'Cancelled', p: 0 } }
                const st = sm[statusResult.status] || sm.pending
                const doc = docByQueue(statusResult.id)
                return <>
                  <div className="status-header"><div style={{ fontSize: 36 }}>{st.icon}</div><div><h3 style={{ fontSize: 18, fontWeight: 700 }}>{st.label}</h3><p style={{ fontSize: 14, color: 'var(--gray-500)' }}>Queue #{statusResult.number}</p></div></div>
                  <div className="status-detail">
                    <div className="status-detail-item"><div className="label">Service</div><div className="value">{getServiceLabel(statusResult.service)}</div></div>
                    <div className="status-detail-item"><div className="label">Student</div><div className="value">{statusResult.studentName}</div></div>
                    <div className="status-detail-item"><div className="label">Position</div><div className="value">{statusResult.status === 'pending' ? `#${statusResult.position}` : statusResult.status === 'serving' ? 'Now Serving' : 'Done'}</div></div>
                    <div className="status-detail-item"><div className="label">Counter</div><div className="value">{statusResult.counter || '—'}</div></div>
                  </div>
                  {doc ? <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>Document: <strong>{getDocLabel(doc.type)}</strong></span><span>Status: <strong>{doc.status}</strong></span></div> : null}
                  <div className="status-progress" style={{ marginTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--gray-500)' }}><span>Queued</span><span>Processing</span><span>Done</span></div>
                    <div className="progress-bar"><div className="fill" style={{ width: `${st.p}%` }}></div></div>
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button className="btn btn-secondary" onClick={() => { setStatusInput(''); setStatusResult(null) }}>Check Another</button>
                    <button className="btn btn-primary" onClick={onShowMap}>📍 Map</button>
                  </div>
                </>
              })()
            ) : (
              <div style={{ textAlign: 'center', padding: 20 }}><div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div><h3 style={{ fontSize: 18 }}>Not found</h3><p style={{ color: 'var(--gray-500)' }}>Queue "{statusInput}" not found.</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
