import { useCallback, useEffect, useRef, useState } from 'react'
import { CONFIG, DEPARTMENTS } from '../config'
import { getDefaultDB, loadFromStorage, saveToStorage } from '../services/storage'
import type { AddToQueueOptions, DB, Department, QueueEntry, SettingsForm } from '../types/queue'
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

  const updateDB = useCallback((fn: (d: DB) => DB) => {
    setDb(prev => {
      const next = fn(prev)
      saveToStorage(next)
      return next
    })
  }, [])

  const idCounter = useRef(0)

  const addToQueue = useCallback((name: string, sid: string, svc: string, docType: string | null, opts: AddToQueueOptions = {}): QueueEntry => {
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
    updateDB(d => {
      const newQueue = [...d.queue, entry]
      let newDocuments = d.documents
      if (svc === 'document-request' && docType) {
        newDocuments = [...d.documents, {
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
        }]
      }
      return { ...d, queue: newQueue, documents: newDocuments }
    })
    return entry
  }, [db.queue, updateDB])

  const callNext = useCallback((department: Department) => {
    const counters = DEPARTMENTS[department].counters
    const result = assignNextPending(db.queue.filter(q => q.department === department), counters)
    if ('reason' in result) {
      showNotif(result.reason === 'empty' ? 'No pending entries.' : 'The counter is full.', 'warning')
      return
    }
    updateDB(d => ({
      ...d,
      queue: d.queue.map(q => q.id === result.called.id
        ? { ...q, counter: result.counter, status: 'serving' as const, estimatedWait: 0 }
        : q
      ),
    }))
    showNotif(`Called ${result.called.number} → ${result.counter}`, 'success')
  }, [db.queue, updateDB, showNotif])

  const autoCall = useCallback(() => {
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
    updateDB(d => ({
      ...d,
      queue: d.queue.map(q => {
        const counter = updatedIds.get(q.id)
        return counter ? { ...q, counter, status: 'serving' as const, estimatedWait: 0 } : q
      }),
    }))
    showNotif(`Auto-called ${calls.map(c => `${c.number} → ${c.counter}`).join(', ')}`, 'success')
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

  const transferTicket = useCallback((id: string, target: Department) => {
    const origin = db.queue.find(q => q.id === id)
    if (!origin) return
    if (origin.status !== 'serving') {
      showNotif('Only the currently serving ticket can be transferred.', 'warning')
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
    updateDB(d => ({
      ...d,
      queue: [
        ...d.queue.map(q => q.id === id ? { ...q, status: 'transferred' as const, counter: null } : q),
        entry,
      ],
    }))
    showNotif(`${origin.number} passed to ${tcfg.label} as ${entry.number}.`, 'success')
  }, [db.queue, updateDB, showNotif])

  const skip = useCallback((id: string) => {
    updateDB(d => {
      const now = new Date().toISOString()
      const newQueue = d.queue.map(q => q.id === id ? { ...q, status: 'cancelled' as const } : q)
      const newDocuments = d.documents.map(doc => doc.queueId === id
        ? { ...doc, status: 'cancelled', updatedAt: now }
        : doc
      )
      return { ...d, queue: newQueue, documents: newDocuments }
    })
    showNotif('Skipped.', 'info')
  }, [updateDB, showNotif])

  const done = useCallback((id: string) => {
    updateDB(d => {
      const now = new Date().toISOString()
      const newQueue = d.queue.map(q => q.id === id ? { ...q, status: 'completed' as const } : q)
      const newDocuments = d.documents.map(doc => doc.queueId === id
        ? { ...doc, status: 'completed', updatedAt: now }
        : doc
      )
      return { ...d, queue: newQueue, documents: newDocuments }
    })
    showNotif('Completed!', 'success')
  }, [updateDB, showNotif])

  const noShow = useCallback((id: string) => {
    updateDB(d => {
      const now = new Date().toISOString()
      const newQueue = d.queue.map(q => q.id === id ? { ...q, status: 'cancelled' as const } : q)
      const newDocuments = d.documents.map(doc => doc.queueId === id
        ? { ...doc, status: 'cancelled', updatedAt: now }
        : doc
      )
      return { ...d, queue: newQueue, documents: newDocuments }
    })
    showNotif('No Show.', 'info')
  }, [updateDB, showNotif])

  const updateDocStatus = useCallback((docId: string, st: string) => {
    updateDB(d => {
      const now = new Date().toISOString()
      const newDocuments = d.documents.map(doc => doc.id === docId
        ? { ...doc, status: st, updatedAt: now }
        : doc
      )
      return { ...d, documents: newDocuments }
    })
  }, [updateDB])

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

  const resetSystem = useCallback(() => {
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
