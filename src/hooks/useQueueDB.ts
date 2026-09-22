import { useCallback, useEffect, useRef, useState } from 'react'
import { CONFIG, DEPARTMENTS } from '../config'
import { getDefaultDB, loadFromStorage, saveToStorage } from '../services/storage'
import {
  insertTicket,
  insertDocument,
  updateTicketCalled,
  updateTicketStatus,
  updateTicketTransferred,
  updateDocumentStatus,
  selectTickets,
  selectDocuments,
  deleteAllTickets,
  deleteAllDocuments,
  subscribeToChanges,
} from '../services/supabase-db'
import type { AddToQueueOptions, DB, Department, DocEntry, QueueEntry, SettingsForm } from '../types/queue'
import { assignNextPending } from '../utils/queue'

export interface UseQueueDBOptions {
  notify: (msg: string, type?: string) => void
}

export function useQueueDB({ notify: showNotif }: UseQueueDBOptions) {
  const [db, setDb] = useState<DB>(() => {
    const loaded = loadFromStorage()
    if (loaded) {
      const cleaned: DB = {
        ...loaded,
        queue: loaded.queue.filter(q => q.status !== 'cancelled'),
        documents: loaded.documents.filter(d => d.status !== 'cancelled'),
      }
      saveToStorage(cleaned)
      return cleaned
    }
    return getDefaultDB()
  })

  const [settingsForm, setSettingsForm] = useState<SettingsForm>({
    autoCallNext: db.settings.autoCallNext,
    interval: db.settings.estimatedMinutesPerTransaction,
  })

  const loadedRef = useRef(false)

  // ─── Load from Supabase on mount ──────────────────────────────────────────
  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true

    async function loadFromSupabase() {
      const [ticketsResult, docsResult] = await Promise.all([
        selectTickets(),
        selectDocuments(),
      ])

      if (ticketsResult.error) {
        console.warn('[Supabase] selectTickets:', ticketsResult.error)
        return
      }

      const tickets = ticketsResult.data || []
      const docs = docsResult.data || []

      const settings = loadFromStorage()?.settings || getDefaultDB().settings

      const supabaseDB: DB = {
        queue: tickets,
        documents: docs,
        settings,
        history: [],
        lastUpdated: new Date().toISOString(),
      }

      setDb(supabaseDB)
      saveToStorage(supabaseDB)
    }

    loadFromSupabase()
  }, [])

  // ─── Realtime subscription + polling fallback ───────────────────────────────
  useEffect(() => {
    let destroyed = false

    async function refetchAll() {
      const [ticketsResult, docsResult] = await Promise.all([
        selectTickets(),
        selectDocuments(),
      ])
      if (destroyed) return
      if (ticketsResult.error) {
        console.warn('[Supabase] realtime selectTickets:', ticketsResult.error)
        return
      }
      const tickets = ticketsResult.data || []
      const docs = docsResult.data || []
      setDb(prev => {
        const updated: DB = {
          ...prev,
          queue: tickets,
          documents: docs,
          lastUpdated: new Date().toISOString(),
        }
        saveToStorage(updated)
        return updated
      })
    }

    const unsubscribe = subscribeToChanges(async (event) => {
      if (event === 'tickets_change' || event === 'documents_change') {
        await refetchAll()
      }
    })

    // Polling fallback: refetch every 3s to catch any missed Realtime events
    const pollId = setInterval(() => { refetchAll() }, 3000)

    return () => {
      destroyed = true
      unsubscribe()
      clearInterval(pollId)
    }
  }, [])

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const updateDB = useCallback((fn: (d: DB) => DB) => {
    setDb(prev => {
      const next = fn(prev)
      saveToStorage(next)
      return next
    })
  }, [])

  const idCounter = useRef(0)

  // ─── Recalculate positions ────────────────────────────────────────────────
  const recalcPositions = (queue: QueueEntry[]): QueueEntry[] => {
    const counts: Record<string, number> = {}
    return queue.map(q => {
      if (q.status === 'pending') {
        counts[q.department] = (counts[q.department] || 0) + 1
        const pos = counts[q.department]
        return { ...q, position: pos, estimatedWait: pos * 8 }
      }
      return { ...q, position: 0, estimatedWait: 0 }
    })
  }

  // ─── ADD TO QUEUE ──────────────────────────────────────────────────────────
  const addToQueue = useCallback(async (name: string, sid: string, svc: string, docType: string | null, opts: AddToQueueOptions = {}): Promise<QueueEntry> => {
    const department = opts.department ?? 'registrar'
    let maxNum = 0
    db.queue.forEach(q => {
      const m = parseInt(q.number.replace(/[A-Z]/g, ''), 10)
      if (!isNaN(m) && m > maxNum) maxNum = m
    })
    const prefix = CONFIG.queuePrefixes[svc] || 'A'
    const number = prefix + String(maxNum + 1).padStart(3, '0')
    const now = new Date().toISOString()
    idCounter.current += 1
    const id = 'Q' + Date.now() + '-' + idCounter.current
    const cnt = db.queue.filter(q => q.status === 'pending' || q.status === 'serving').length + 1
    const entry: QueueEntry = {
      id,
      number,
      studentName: name,
      studentId: sid || '',
      service: svc,
      documentType: docType,
      counter: null,
      status: 'pending',
      position: cnt,
      createdAt: now,
      estimatedWait: cnt * 8,
      department,
      customerType: opts.customerType ?? 'student',
      source: opts.source ?? 'kiosk',
      transferredFrom: opts.transferredFrom ?? null,
    }

    let docEntry: DocEntry | null = null
    if (svc === 'document-request' && docType) {
      docEntry = {
        id: 'D' + Date.now() + '-' + idCounter.current,
        queueId: entry.id,
        studentName: name,
        studentId: sid || '',
        type: docType,
        purpose: '',
        copies: 1,
        status: 'pending',
        notes: '',
        createdAt: now,
        updatedAt: now,
      }
    }

    // Write to Supabase first (authoritative)
    const ticketErr = await insertTicket(entry)
    if (ticketErr) {
      console.warn('[Supabase] insertTicket:', ticketErr)
      showNotif('Failed to save ticket to cloud. Saved locally.', 'warning')
    }

    if (docEntry) {
      const docErr = await insertDocument(docEntry)
      if (docErr) {
        console.warn('[Supabase] insertDocument:', docErr)
      }
    }

    // Update local state and localStorage
    updateDB(d => {
      const newQueue = [...d.queue, entry]
      let newDocuments = d.documents
      if (docEntry) {
        newDocuments = [...d.documents, docEntry]
      }
      return { ...d, queue: newQueue, documents: newDocuments }
    })

    return entry
  }, [db.queue, updateDB, showNotif])

  // ─── CALL NEXT ─────────────────────────────────────────────────────────────
  const callNext = useCallback(async (department: Department) => {
    const counters = DEPARTMENTS[department].counters
    const result = assignNextPending(db.queue.filter(q => q.department === department), counters)
    if ('reason' in result) {
      showNotif(result.reason === 'empty' ? 'No pending entries.' : 'The counter is full.', 'warning')
      return
    }

    // Write to Supabase first
    const err = await updateTicketCalled(result.called.id, result.counter)
    if (err) {
      showNotif(`Called ${result.called.number} → ${result.counter} (DB sync failed)`, 'warning')
      return
    }
    showNotif(`Called ${result.called.number} → ${result.counter}`, 'success')

    // Update local state only on success
    updateDB(d => ({
      ...d,
      queue: recalcPositions(d.queue.map(q => q.id === result.called.id
        ? { ...q, counter: result.counter, status: 'serving' as const, estimatedWait: 0 }
        : q
      )),
    }))
  }, [db.queue, updateDB, showNotif])

  // ─── AUTO CALL ─────────────────────────────────────────────────────────────
  const autoCall = useCallback(async () => {
    const calls: { id: string; number: string; counter: string }[] = []
    const updatedIds = new Map<string, string>()
    ;(Object.keys(DEPARTMENTS) as Department[]).forEach(dept => {
      let deptQueue = db.queue.filter(q => q.department === dept)
      const counters = DEPARTMENTS[dept].counters
      for (let i = 0; i < counters.length; i++) {
        const r = assignNextPending(deptQueue, counters)
        if ('reason' in r) break
        calls.push({ id: r.called.id, number: r.called.number, counter: r.counter })
        updatedIds.set(r.called.id, r.counter)
        deptQueue = deptQueue.map(q => q.id === r.called.id
          ? { ...q, counter: r.counter, status: 'serving' as const, estimatedWait: 0 }
          : q
        )
      }
    })
    if (calls.length === 0) return

    // Write to Supabase first
    const errors = await Promise.all(calls.map(c => updateTicketCalled(c.id, c.counter)))
    const failed = errors.filter(Boolean)
    if (failed.length > 0) {
      showNotif(`Auto-called ${calls.map(c => `${c.number} → ${c.counter}`).join(', ')} (DB sync failed)`, 'warning')
      return
    }
    showNotif(`Auto-called ${calls.map(c => `${c.number} → ${c.counter}`).join(', ')}`, 'success')

    // Update local state only on success
    updateDB(d => ({
      ...d,
      queue: recalcPositions(d.queue.map(q => {
        const counter = updatedIds.get(q.id)
        return counter ? { ...q, counter, status: 'serving' as const, estimatedWait: 0 } : q
      })),
    }))
  }, [db.queue, updateDB, showNotif])

  const autoCallRef = useRef<() => void>(() => {})
  useEffect(() => {
    autoCallRef.current = autoCall
  })

  useEffect(() => {
    if (!db.settings.autoCallNext) return
    const minutes = Math.max(1, Number(db.settings.estimatedMinutesPerTransaction) || 10)
    const id = setInterval(() => autoCallRef.current(), minutes * 60 * 1000)
    return () => clearInterval(id)
  }, [db.settings.autoCallNext, db.settings.estimatedMinutesPerTransaction])

  // ─── TRANSFER ──────────────────────────────────────────────────────────────
  const transferTicket = useCallback(async (id: string, target: Department) => {
    const origin = db.queue.find(q => q.id === id)
    if (!origin) return
    if (origin.status !== 'serving') {
      showNotif('Only the currently serving ticket can be transferred.', 'warning')
      return
    }
    if (origin.department !== 'registrar') {
      showNotif('Only Registrar can transfer tickets.', 'warning')
      return
    }
    const tcfg = DEPARTMENTS[target]
    let maxNum = 0
    db.queue.forEach(q => {
      const m = parseInt(q.number.replace(/[A-Z]/g, ''), 10)
      if (!isNaN(m) && m > maxNum) maxNum = m
    })
    idCounter.current += 1
    const cnt = db.queue.filter(q => q.department === target && (q.status === 'pending' || q.status === 'serving')).length + 1
    const entry: QueueEntry = {
      id: 'Q' + Date.now() + '-' + idCounter.current,
      number: (CONFIG.queuePrefixes[target] || 'X') + String(maxNum + 1).padStart(3, '0'),
      studentName: origin.studentName,
      studentId: origin.studentId,
      service: target,
      documentType: null,
      counter: null,
      status: 'pending',
      position: cnt,
      createdAt: new Date().toISOString(),
      estimatedWait: cnt * 8,
      department: target,
      customerType: origin.customerType,
      source: 'transfer',
      transferredFrom: origin.number,
    }

    // Write to Supabase first
    const [transferErr, insertErr] = await Promise.all([
      updateTicketTransferred(id),
      insertTicket(entry),
    ])
    if (transferErr || insertErr) {
      showNotif(`Transfer failed. (DB sync failed)`, 'warning')
      return
    }
    showNotif(`${origin.number} passed to ${tcfg.label} as ${entry.number}.`, 'success')

    // Update local state only on success
    updateDB(d => ({
      ...d,
      queue: recalcPositions([
        ...d.queue.map(q => q.id === id ? { ...q, status: 'transferred' as const, counter: null } : q),
        entry,
      ]),
    }))
  }, [db.queue, updateDB, showNotif])

  // ─── SKIP ──────────────────────────────────────────────────────────────────
  const skip = useCallback(async (id: string) => {
    const docsToUpdate = db.documents.filter(doc => doc.queueId === id)

    // Write to Supabase first
    const errors = await Promise.all([
      updateTicketStatus(id, 'cancelled'),
      ...docsToUpdate.map(doc => updateDocumentStatus(doc.id, 'cancelled')),
    ])
    const failed = errors.filter(Boolean)
    if (failed.length > 0) {
      showNotif('Skip failed. (DB sync failed)', 'warning')
      return
    }
    showNotif('Skipped.', 'info')

    // Update local state only on success
    updateDB(d => {
      const now = new Date().toISOString()
      const newQueue = d.queue.map(q => q.id === id ? { ...q, status: 'cancelled' as const } : q)
      const newDocuments = d.documents.map(doc => doc.queueId === id
        ? { ...doc, status: 'cancelled', updatedAt: now }
        : doc
      )
      return { ...d, queue: recalcPositions(newQueue), documents: newDocuments }
    })
  }, [db.documents, updateDB, showNotif])

  // ─── DONE ──────────────────────────────────────────────────────────────────
  const done = useCallback(async (id: string) => {
    const docsToUpdate = db.documents.filter(doc => doc.queueId === id)

    // Write to Supabase first
    const errors = await Promise.all([
      updateTicketStatus(id, 'completed', 'completed_at'),
      ...docsToUpdate.map(doc => updateDocumentStatus(doc.id, 'completed')),
    ])
    const failed = errors.filter(Boolean)
    if (failed.length > 0) {
      showNotif('Completed failed. (DB sync failed)', 'warning')
      return
    }
    showNotif('Completed!', 'success')

    // Update local state only on success
    updateDB(d => {
      const now = new Date().toISOString()
      const newQueue = d.queue.map(q => q.id === id ? { ...q, status: 'completed' as const } : q)
      const newDocuments = d.documents.map(doc => doc.queueId === id
        ? { ...doc, status: 'completed', updatedAt: now }
        : doc
      )
      return { ...d, queue: recalcPositions(newQueue), documents: newDocuments }
    })
  }, [db.documents, updateDB, showNotif])

  // ─── NO SHOW ───────────────────────────────────────────────────────────────
  const noShow = useCallback(async (id: string) => {
    const docsToUpdate = db.documents.filter(doc => doc.queueId === id)

    // Write to Supabase first
    const errors = await Promise.all([
      updateTicketStatus(id, 'cancelled'),
      ...docsToUpdate.map(doc => updateDocumentStatus(doc.id, 'cancelled')),
    ])
    const failed = errors.filter(Boolean)
    if (failed.length > 0) {
      showNotif('No Show failed. (DB sync failed)', 'warning')
      return
    }
    showNotif('No Show.', 'info')

    // Update local state only on success
    updateDB(d => {
      const now = new Date().toISOString()
      const newQueue = d.queue.map(q => q.id === id ? { ...q, status: 'cancelled' as const } : q)
      const newDocuments = d.documents.map(doc => doc.queueId === id
        ? { ...doc, status: 'cancelled', updatedAt: now }
        : doc
      )
      return { ...d, queue: recalcPositions(newQueue), documents: newDocuments }
    })
  }, [db.documents, updateDB, showNotif])

  // ─── UPDATE DOC STATUS ─────────────────────────────────────────────────────
  const updateDocStatus = useCallback(async (docId: string, st: string) => {
    // Write to Supabase first
    const err = await updateDocumentStatus(docId, st)
    if (err) {
      showNotif(`Document status update failed. (DB sync failed)`, 'warning')
      return
    }

    // Update local state only on success
    updateDB(d => {
      const now = new Date().toISOString()
      const newDocuments = d.documents.map(doc => doc.id === docId
        ? { ...doc, status: st, updatedAt: now }
        : doc
      )
      return { ...d, documents: newDocuments }
    })
  }, [updateDB, showNotif])

  // ─── SETTINGS ──────────────────────────────────────────────────────────────
  const saveSettings = useCallback(() => {
    updateDB(d => ({
      ...d,
      settings: {
        ...d.settings,
        autoCallNext: settingsForm.autoCallNext,
        estimatedMinutesPerTransaction: Math.max(1, settingsForm.interval || 10),
      },
    }))
    showNotif('Settings saved!', 'success')
  }, [settingsForm, updateDB, showNotif])

  // ─── RESET ─────────────────────────────────────────────────────────────────
  const resetSystem = useCallback(async () => {
    const [ticketsErr, docsErr] = await Promise.all([
      deleteAllTickets(),
      deleteAllDocuments(),
    ])
    if (ticketsErr || docsErr) {
      console.warn('[Supabase] resetSystem delete:', ticketsErr || docsErr)
      showNotif('Reset failed. Cloud data could not be deleted.', 'warning')
      return
    }

    const def = getDefaultDB()
    setDb(def)
    saveToStorage(def)
    setSettingsForm({ autoCallNext: def.settings.autoCallNext, interval: def.settings.estimatedMinutesPerTransaction })
    showNotif('Reset done.', 'info')
  }, [showNotif])

  return {
    db,
    settingsForm,
    setSettingsForm,
    addToQueue,
    callNext,
    transferTicket,
    skip,
    done,
    noShow,
    updateDocStatus,
    saveSettings,
    resetSystem,
  }
}
