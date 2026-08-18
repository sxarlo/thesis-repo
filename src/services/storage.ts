import type { DB, QueueStatus } from '../types/queue'

export function getDefaultDB(): DB {
  return {
    queue: [],
    documents: [],
    settings: { autoCallNext: true, estimatedMinutesPerTransaction: 10, maxQueuePerCounter: 15 },
    history: [],
    lastUpdated: new Date().toISOString(),
  }
}

export function normalizeStatus(st: string | null | undefined): QueueStatus {
  const v = (st || '').trim().toLowerCase()
  if (v === 'serving' || v === 'completed') return v
  if (v === 'cancelled' || v === 'canceled' || v === 'skip' || v === 'skipped' || v === 'noshow' || v === 'no-show' || v === 'no show') return 'cancelled'
  return 'pending'
}

export function normalizeDB(raw: DB): DB {
  const queue = (raw.queue || []).map(q => ({ ...q, status: normalizeStatus(q.status) }))
  const cancelledIds = new Set(queue.filter(q => q.status === 'cancelled').map(q => q.id))
  const documents = (raw.documents || []).map(doc => cancelledIds.has(doc.queueId) && doc.status !== 'cancelled'
    ? { ...doc, status: 'cancelled', updatedAt: new Date().toISOString() }
    : doc
  )
  return { ...raw, queue, documents, settings: raw.settings, history: raw.history || [], lastUpdated: raw.lastUpdated }
}

export function loadFromStorage(): DB | null {
  try {
    const s = localStorage.getItem('ceu_kiosk_db')
    if (s) return normalizeDB(JSON.parse(s) as DB)
  } catch { /* ignore */ }
  return null
}

export function saveToStorage(db: DB) {
  try { localStorage.setItem('ceu_kiosk_db', JSON.stringify(db)) } catch { /* ignore */ }
}
