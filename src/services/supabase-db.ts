import { supabase } from '../lib/supabase'
import type { QueueEntry, DocEntry } from '../types/queue'

// ─── DIAGNOSTIC HELPERS ────────────────────────────────────────────────────────

function logDiag(label: string, payload: Record<string, unknown>, raw: unknown) {
  console.groupCollapsed(`[DIAG] ${label}`)
  console.log('Payload:', JSON.parse(JSON.stringify(payload)))
  console.log('Raw Supabase response:', JSON.parse(JSON.stringify(raw)))
  if (raw && typeof raw === 'object' && 'error' in raw) {
    const err = (raw as { error: unknown }).error
    if (err) {
      console.error('Error object:', JSON.parse(JSON.stringify(err)))
    }
  }
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const d = (raw as { data: unknown }).data
    console.log('Data returned:', JSON.parse(JSON.stringify(d)))
  }
  console.groupEnd()
}

// ─── INSERT ───────────────────────────────────────────────────────────────────

export async function insertTicket(entry: QueueEntry): Promise<string | null> {
  const { error } = await supabase.from('tickets').insert({
    id: entry.id,
    number: entry.number,
    student_name: entry.studentName,
    student_id: entry.studentId,
    service: entry.service,
    document_type: entry.documentType,
    counter: entry.counter,
    status: entry.status,
    created_at: entry.createdAt,
    called_at: null,
    completed_at: null,
    department: entry.department,
    customer_type: entry.customerType,
    source: entry.source,
    transferred_from: entry.transferredFrom,
  })
  return error ? error.message : null
}

export async function insertDocument(doc: DocEntry): Promise<string | null> {
  const { error } = await supabase.from('documents').insert({
    id: doc.id,
    queue_id: doc.queueId,
    student_name: doc.studentName,
    student_id: doc.studentId,
    type: doc.type,
    purpose: doc.purpose,
    copies: doc.copies,
    status: doc.status,
    notes: doc.notes,
    created_at: doc.createdAt,
    updated_at: doc.updatedAt,
  })
  return error ? error.message : null
}

// ─── SELECT ───────────────────────────────────────────────────────────────────

export async function selectTickets(): Promise<{ data: QueueEntry[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) return { data: null, error: error.message }
  const entries: QueueEntry[] = (data || []).map(row => ({
    id: row.id,
    number: row.number,
    studentName: row.student_name,
    studentId: row.student_id,
    service: row.service,
    documentType: row.document_type,
    counter: row.counter,
    status: row.status,
    position: 0,
    createdAt: row.created_at,
    estimatedWait: 0,
    department: row.department,
    customerType: row.customer_type,
    source: row.source,
    transferredFrom: row.transferred_from,
  }))
  return { data: entries, error: null }
}

export async function selectDocuments(): Promise<{ data: DocEntry[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) return { data: null, error: error.message }
  const entries: DocEntry[] = (data || []).map(row => ({
    id: row.id,
    queueId: row.queue_id,
    studentName: row.student_name,
    studentId: row.student_id,
    type: row.type,
    purpose: row.purpose,
    copies: row.copies,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
  return { data: entries, error: null }
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updateTicketStatus(id: string, status: string, timestampField?: 'called_at' | 'completed_at'): Promise<string | null> {
  const update: Record<string, unknown> = { status }
  if (timestampField) update[timestampField] = new Date().toISOString()
  const raw = await supabase.from('tickets').update(update).eq('id', id).select()
  logDiag('updateTicketStatus', { id, ...update }, raw)

  const { data, error } = raw
  if (error) {
    console.error(`[DIAG] updateTicketStatus FAILED — id=${id} status=${status}`)
    console.error('[DIAG] Full error:', error)
    console.error('[DIAG] error.code:', error.code)
    console.error('[DIAG] error.message:', error.message)
    console.error('[DIAG] error.details:', error.details)
    console.error('[DIAG] error.hint:', error.hint)
    return error.message
  }
  if (!data || data.length === 0) {
    console.warn(`[DIAG] updateTicketStatus: 0 rows matched — id=${id}`)
  }
  return null
}

export async function updateTicketCalled(id: string, counter: string): Promise<string | null> {
  const payload = { status: 'serving', counter, called_at: new Date().toISOString() }
  const raw = await supabase.from('tickets').update(payload).eq('id', id).select()
  logDiag('updateTicketCalled', { id, ...payload }, raw)

  const { data, error } = raw
  if (error) {
    console.error(`[DIAG] updateTicketCalled FAILED — id=${id} counter=${counter}`)
    console.error('[DIAG] Full error:', error)
    console.error('[DIAG] error.code:', error.code)
    console.error('[DIAG] error.message:', error.message)
    console.error('[DIAG] error.details:', error.details)
    console.error('[DIAG] error.hint:', error.hint)
    return error.message
  }
  if (!data || data.length === 0) {
    console.warn(`[DIAG] updateTicketCalled: 0 rows matched — id=${id}`)
  }
  return null
}

export async function updateTicketTransferred(id: string): Promise<string | null> {
  const payload = { status: 'transferred', counter: null }
  const raw = await supabase.from('tickets').update(payload).eq('id', id).select()
  logDiag('updateTicketTransferred', { id, ...payload }, raw)

  const { data, error } = raw
  if (error) {
    console.error(`[DIAG] updateTicketTransferred FAILED — id=${id}`)
    console.error('[DIAG] Full error:', error)
    console.error('[DIAG] error.code:', error.code)
    console.error('[DIAG] error.message:', error.message)
    console.error('[DIAG] error.details:', error.details)
    console.error('[DIAG] error.hint:', error.hint)
    return error.message
  }
  if (!data || data.length === 0) {
    console.warn(`[DIAG] updateTicketTransferred: 0 rows matched — id=${id}`)
  }
  return null
}

export async function updateDocumentStatus(id: string, status: string): Promise<string | null> {
  const payload = { status, updated_at: new Date().toISOString() }
  const raw = await supabase.from('documents').update(payload).eq('id', id).select()
  logDiag('updateDocumentStatus', { id, ...payload }, raw)

  const { data, error } = raw
  if (error) {
    console.error(`[DIAG] updateDocumentStatus FAILED — id=${id} status=${status}`)
    console.error('[DIAG] Full error:', error)
    console.error('[DIAG] error.code:', error.code)
    console.error('[DIAG] error.message:', error.message)
    console.error('[DIAG] error.details:', error.details)
    console.error('[DIAG] error.hint:', error.hint)
    return error.message
  }
  if (!data || data.length === 0) {
    console.warn(`[DIAG] updateDocumentStatus: 0 rows matched — id=${id}`)
  }
  return null
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteAllTickets(): Promise<string | null> {
  const { error } = await supabase.from('tickets').delete().neq('id', '')
  return error ? error.message : null
}

export async function deleteAllDocuments(): Promise<string | null> {
  const { error } = await supabase.from('documents').delete().neq('id', '')
  return error ? error.message : null
}

// ─── REALTIME ─────────────────────────────────────────────────────────────────

export type RealtimeEvent = 'tickets_change' | 'documents_change'

export function subscribeToChanges(
  onEvent: (event: RealtimeEvent) => void
): () => void {
  const channel = supabase
    .channel('db-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tickets' },
      () => onEvent('tickets_change')
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'documents' },
      () => onEvent('documents_change')
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
