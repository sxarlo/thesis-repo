import { CONFIG } from '../config'
import type { AssignNextResult, DB, QueueEntry } from '../types/queue'

export function getServiceLabel(s: string): string {
  return { 'document-request': 'Document Request', 'claim-document': 'Claim Document', inquiry: 'Inquiry', certification: 'Certification' }[s] ?? s
}

export function getDocLabel(t: string | null): string {
  const d = CONFIG.documentTypes.find(x => x.id === t)
  return d ? d.name : 'N/A'
}

export function getDocPrice(t: string | null): string {
  const d = CONFIG.documentTypes.find(x => x.id === t)
  return d ? d.price : '—'
}

export function getDailyStats7(db: DB): { date: string; label: string; total: number; completed: number }[] {
  const s: { date: string; label: string; total: number; completed: number }[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    const ds = d.toISOString().split('T')[0]
    const dq = db.queue.filter(q => q.createdAt.startsWith(ds))
    s.push({
      date: ds,
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total: dq.length,
      completed: dq.filter(q => q.status === 'completed').length,
    })
  }
  return s
}

export function getServiceStats(db: DB): Record<string, number> {
  const s: Record<string, number> = {}
  db.queue.forEach(q => {
    const l = getServiceLabel(q.service)
    s[l] = (s[l] || 0) + 1
  })
  return s
}

export interface QueueStats {
  total: number
  pending: number
  serving: number
  completed: number
}

export function getQueueStats(db: DB): QueueStats {
  return {
    total: db.queue.length,
    pending: db.queue.filter(x => x.status === 'pending').length,
    serving: db.queue.filter(x => x.status === 'serving').length,
    completed: db.queue.filter(x => x.status === 'completed').length,
  }
}

export function assignNextPending(queue: QueueEntry[]): AssignNextResult {
  const next = queue.find(q => q.status === 'pending')
  if (!next) return { reason: 'empty' }
  const occupiedCounters = new Set(
    queue.filter(q => q.status === 'serving' && q.counter).map(q => q.counter as string)
  )
  const freeCounter = CONFIG.counters.slice(0, 3).find(c => !occupiedCounters.has(c))
  if (!freeCounter) return { reason: 'full' }
  return {
    queue: queue.map(q => q.id === next.id
      ? { ...q, counter: freeCounter, status: 'serving' as const, estimatedWait: 0 }
      : q
    ),
    called: next,
    counter: freeCounter,
  }
}
