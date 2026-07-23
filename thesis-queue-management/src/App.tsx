import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

type QueueStatus = 'pending' | 'serving' | 'completed' | 'cancelled'
interface QueueEntry {
  id: string
  number: string
  studentName: string
  studentId: string
  service: string
  documentType: string | null
  counter: string | null
  status: QueueStatus
  position: number
  createdAt: string
  estimatedWait: number
}

interface DocEntry {
  id: string
  queueId: string
  studentName: string
  studentId: string
  type: string
  purpose: string
  copies: number
  status: string
  notes: string
  createdAt: string
  updatedAt: string
}

interface DB {
  queue: QueueEntry[]
  documents: DocEntry[]
  settings: {
    autoCallNext: boolean
    estimatedMinutesPerTransaction: number
    maxQueuePerCounter: number
  }
  history: string[]
  lastUpdated: string
}

interface Office {
  id: string
  name: string
  color: string
  info: string
}

interface Room {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: string
  color: string
}

interface DocType {
  id: string
  name: string
  icon: string
  price: string
}

const CONFIG = {
  university: 'Centro Escolar Las Piñas',
  kioskName: 'Smart Registrar Service Kiosk',
  version: '1.0.0',
  queuePrefixes: { 'document-request': 'A', 'claim-document': 'B', inquiry: 'C', certification: 'D' } as Record<string, string>,
  counters: ['Counter 1', 'Counter 2', 'Counter 3', 'Counter 4'],
  offices: [
    { id: 'registrar', name: 'Registrar Office', color: '#B83B5E', info: 'Main registrar services, document requests, and inquiries.' },
    { id: 'cashier', name: 'Cashier', color: '#FF8F00', info: 'Payment processing and official receipts.' },
    { id: 'assessment', name: 'Assessment', color: '#1565C0', info: 'Student account assessment and billing.' },
    { id: 'guidance', name: 'Guidance Office', color: '#6A1B9A', info: 'Counseling and student support services.' },
    { id: 'osas', name: 'OSAS', color: '#C62828', info: 'Office of Student Affairs and Services.' },
    { id: 'waiting', name: 'Waiting Area', color: '#78909C', info: 'Please wait for your queue number to be called.' },
  ] as Office[],
  documentTypes: [
    { id: 'tor', name: 'Transcript of Records (TOR)', icon: '📜', price: '₱100.00' },
    { id: 'coe', name: 'Certificate of Enrollment (COE)', icon: '📋', price: '₱30.00' },
    { id: 'cog', name: 'Certificate of Grades (COG)', icon: '📊', price: '₱30.00' },
    { id: 'diploma', name: 'Diploma', icon: '🎓', price: '₱150.00' },
    { id: 'honorable-dismissal', name: 'Honorable Dismissal', icon: '📄', price: '₱50.00' },
    { id: 'certificate-graduation', name: 'Certificate of Graduation', icon: '🏆', price: '₱50.00' },
    { id: 'good-moral', name: 'Certificate of Good Moral', icon: '⭐', price: '₱30.00' },
    { id: 'others', name: 'Other Documents', icon: '📁', price: 'Varies' },
  ] as DocType[],
  purposes: ['Transfer to Another School', 'Employment Requirement', 'Scholarship Application', 'Graduate School Application', 'Board Exam Requirement', 'Personal Record', 'Government Requirement', 'Others'],
}

const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123', name: 'Juan Dela Cruz', role: 'Registrar Administrator' }

function getDefaultDB(): DB {
  const n = new Date()
  const g = (h: number, m: number) => {
    const d = new Date(n); d.setHours(h, m, 0, 0); return d.toISOString()
  }
  return {
    queue: [
      { id: 'Q001', number: 'A042', studentName: 'Maria Santos', studentId: 'CELP-2024-0001', service: 'document-request', documentType: 'tor', counter: 'Counter 1', status: 'serving', position: 1, createdAt: g(9, 5), estimatedWait: 5 },
      { id: 'Q002', number: 'A043', studentName: 'Juan Cruz', studentId: 'CELP-2024-0002', service: 'document-request', documentType: 'coe', counter: null, status: 'pending', position: 2, createdAt: g(9, 12), estimatedWait: 15 },
      { id: 'Q003', number: 'A044', studentName: 'Pedro Reyes', studentId: 'CELP-2024-0003', service: 'document-request', documentType: 'cog', counter: null, status: 'pending', position: 3, createdAt: g(9, 18), estimatedWait: 25 },
      { id: 'Q004', number: 'A045', studentName: 'Ana Gonzales', studentId: 'CELP-2024-0004', service: 'claim-document', documentType: 'tor', counter: null, status: 'pending', position: 4, createdAt: g(9, 20), estimatedWait: 20 },
      { id: 'Q005', number: 'A046', studentName: 'Jose Garcia', studentId: 'CELP-2024-0005', service: 'inquiry', documentType: null, counter: null, status: 'pending', position: 5, createdAt: g(9, 25), estimatedWait: 10 },
      { id: 'Q006', number: 'A047', studentName: 'Luisa Torres', studentId: 'CELP-2024-0006', service: 'document-request', documentType: 'diploma', counter: null, status: 'pending', position: 6, createdAt: g(9, 30), estimatedWait: 35 },
      { id: 'Q007', number: 'A048', studentName: 'Carlos Mendoza', studentId: 'CELP-2024-0007', service: 'document-request', documentType: 'tor', counter: null, status: 'pending', position: 7, createdAt: g(9, 35), estimatedWait: 40 },
      { id: 'Q008', number: 'A049', studentName: 'Sofia Lopez', studentId: 'CELP-2024-0008', service: 'document-request', documentType: 'honorable-dismissal', counter: null, status: 'pending', position: 8, createdAt: g(9, 40), estimatedWait: 45 },
      { id: 'Q009', number: 'A050', studentName: 'Miguel Flores', studentId: 'CELP-2024-0009', service: 'claim-document', documentType: 'coe', counter: null, status: 'pending', position: 9, createdAt: g(9, 42), estimatedWait: 30 },
      { id: 'Q010', number: 'A051', studentName: 'Isabella Ramos', studentId: 'CELP-2024-0010', service: 'document-request', documentType: 'certificate-graduation', counter: null, status: 'pending', position: 10, createdAt: g(9, 45), estimatedWait: 50 },
    ],
    documents: [
      { id: 'D001', queueId: 'Q001', studentName: 'Maria Santos', studentId: 'CELP-2024-0001', type: 'tor', purpose: 'Employment Requirement', copies: 2, status: 'processing', notes: '', createdAt: g(9, 5), updatedAt: g(9, 10) },
      { id: 'D002', queueId: 'Q002', studentName: 'Juan Cruz', studentId: 'CELP-2024-0002', type: 'coe', purpose: 'Scholarship Application', copies: 1, status: 'pending', notes: '', createdAt: g(9, 12), updatedAt: g(9, 12) },
    ],
    settings: { autoCallNext: true, estimatedMinutesPerTransaction: 10, maxQueuePerCounter: 15 },
    history: [],
    lastUpdated: new Date().toISOString(),
  }
}

function loadFromStorage(): DB | null {
  try {
    const s = localStorage.getItem('ceu_kiosk_db')
    if (s) return JSON.parse(s) as DB
  } catch { /* ignore */ }
  return null
}

function saveToStorage(db: DB) {
  try { localStorage.setItem('ceu_kiosk_db', JSON.stringify(db)) } catch { /* ignore */ }
}

function getServiceLabel(s: string): string {
  return { 'document-request': 'Document Request', 'claim-document': 'Claim Document', inquiry: 'Inquiry', certification: 'Certification' }[s] ?? s
}

function getDocLabel(t: string | null): string {
  const d = CONFIG.documentTypes.find(x => x.id === t)
  return d ? d.name : 'N/A'
}

function getDocPrice(t: string | null): string {
  const d = CONFIG.documentTypes.find(x => x.id === t)
  return d ? d.price : '—'
}

function getDailyStats7(db: DB): { date: string; label: string; total: number; completed: number }[] {
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

function getServiceStats(db: DB): Record<string, number> {
  const s: Record<string, number> = {}
  db.queue.forEach(q => {
    const l = getServiceLabel(q.service)
    s[l] = (s[l] || 0) + 1
  })
  return s
}

function getQueueStats(db: DB) {
  return {
    total: db.queue.length,
    pending: db.queue.filter(x => x.status === 'pending').length,
    serving: db.queue.filter(x => x.status === 'serving').length,
    completed: db.queue.filter(x => x.status === 'completed').length,
  }
}

// ----- Map Module (imperative via ref) -----
function hexRGBA(h: string, a: number): string {
  return `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},${a})`
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function getRooms(w: number, h: number): Room[] {
  const m = 40, g = 16
  const uW = w - m * 2, uH = h - m * 2
  const rW = (uW - g * 2) / 3, rH = (uH - g * 2) / 3
  return [
    { id: 'registrar', x: m, y: m, w: rW * 2 + g, h: rH, label: 'Registrar Office', color: '#B83B5E' },
    { id: 'cashier', x: m + rW * 2 + g * 2, y: m, w: rW, h: rH, label: 'Cashier', color: '#FF8F00' },
    { id: 'assessment', x: m, y: m + rH + g, w: rW, h: rH, label: 'Assessment', color: '#1565C0' },
    { id: 'guidance', x: m + rW + g, y: m + rH + g, w: rW, h: rH, label: 'Guidance Office', color: '#6A1B9A' },
    { id: 'osas', x: m + rW * 2 + g * 2, y: m + rH + g, w: rW, h: rH, label: 'OSAS', color: '#C62828' },
    { id: 'waiting', x: m, y: m + (rH + g) * 2, w: rW * 2 + g, h: rH, label: 'Waiting Area', color: '#78909C' },
    { id: 'entrance', x: m + rW * 2 + g * 2, y: m + (rH + g) * 2, w: rW, h: rH, label: 'Entrance / Exit', color: '#37474F' },
  ]
}

function renderMap(canvas: HTMLCanvasElement, selected: string | null, hovered: string | null) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width, h = canvas.height
  ctx.clearRect(0, 0, w, h)
  const rooms = getRooms(w, h)
  rooms.forEach(r => {
    const isSel = selected === r.id, isHov = hovered === r.id
    const alpha = isSel ? 1 : isHov ? 0.9 : 0.8
    ctx.save()
    if (isSel) {
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 20
      ctx.shadowOffsetY = 4
    }
    ctx.fillStyle = hexRGBA(r.color, alpha)
    ctx.strokeStyle = isSel ? '#FFD700' : 'rgba(255,255,255,0.6)'
    ctx.lineWidth = isSel ? 4 : 2
    roundRect(ctx, r.x, r.y, r.w, r.h, 10)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
    if (isSel) {
      ctx.save()
      ctx.shadowColor = 'rgba(255,215,0,0.5)'
      ctx.shadowBlur = 30
      ctx.strokeStyle = '#FFD700'
      ctx.lineWidth = 4
      roundRect(ctx, r.x, r.y, r.w, r.h, 10)
      ctx.stroke()
      ctx.restore()
    }
    ctx.fillStyle = 'rgba(255,255,255,0.95)'
    ctx.font = `bold ${Math.min(r.h * 0.16, 18)}px 'Segoe UI',sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(r.label, r.x + r.w / 2, r.y + r.h / 2)
  })
  ctx.fillStyle = '#FFD700'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('★ You are here', 40, h - 20)
}

function App() {
  const [screen, setScreen] = useState('kiosk-welcome')
  const [adminScreen, setAdminScreen] = useState('admin-dashboard')
  const [timeStr, setTimeStr] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [, setLoggedIn] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [db, setDb] = useState<DB>(() => {
    return loadFromStorage() || getDefaultDB()
  })
  const [notification, setNotification] = useState<{ msg: string; type: string } | null>(null)
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null)
  const [hoveredOffice, setHoveredOffice] = useState<string | null>(null)

  // Form states
  const [reqStudentId, setReqStudentId] = useState('')
  const [reqName, setReqName] = useState('')
  const [reqDocType, setReqDocType] = useState('')
  const [reqPurpose, setReqPurpose] = useState('')
  const [reqCopies, setReqCopies] = useState(1)
  const [claimStudentId, setClaimStudentId] = useState('')
  const [claimName, setClaimName] = useState('')
  const [claimDocType, setClaimDocType] = useState('')
  const [inquiryName, setInquiryName] = useState('')
  const [inquiryMsg, setInquiryMsg] = useState('')
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [statusInput, setStatusInput] = useState('')
  const [statusResult, setStatusResult] = useState<QueueEntry | null>(null)
  const [lastQueueEntry, setLastQueueEntry] = useState<QueueEntry | null>(null)
  const [queueFilter, setQueueFilter] = useState('all')
  const [queueSearch, setQueueSearch] = useState('')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showNotif = useCallback((msg: string, type: string = 'success') => {
    if (notifTimer.current) clearTimeout(notifTimer.current)
    setNotification({ msg, type })
    notifTimer.current = setTimeout(() => {
      setNotification(null)
    }, 3500)
  }, [])

  const updateDB = useCallback((fn: (d: DB) => DB) => {
    setDb(prev => {
      const next = fn(prev)
      saveToStorage(next)
      return next
    })
  }, [])

  // Clock
  useEffect(() => {
    const update = () => {
      const n = new Date()
      setTimeStr(n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }))
      setDateStr(n.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  // Map canvas resize
  useEffect(() => {
    if (screen !== 'interactive-map') return
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const r = canvas.parentElement?.getBoundingClientRect()
      if (!r) return
      canvas.width = r.width
      canvas.height = r.height
      renderMap(canvas, selectedOffice, hoveredOffice)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [screen, selectedOffice, hoveredOffice])

  // Map canvas render on selection change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || screen !== 'interactive-map') return
    renderMap(canvas, selectedOffice, hoveredOffice)
  }, [selectedOffice, hoveredOffice, screen])

  // Notif auto-dismiss
  useEffect(() => {
    return () => { if (notifTimer.current) clearTimeout(notifTimer.current) }
  }, [])

  const showScreen = useCallback((id: string) => {
    setScreen(id)
  }, [])

  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (loginUsername === ADMIN_CREDENTIALS.username && loginPassword === ADMIN_CREDENTIALS.password) {
      setLoginError(false)
      setLoggedIn(true)
      setAdminScreen('admin-dashboard')
      showScreen('admin-panel')
    } else {
      setLoginError(true)
    }
  }, [loginUsername, loginPassword, showScreen])

  const handleLogout = useCallback(() => {
    setLoggedIn(false)
    showScreen('admin-login-screen')
  }, [showScreen])

  const idCounter = useRef(0)
  const addToQueueFn = useCallback((name: string, sid: string, svc: string, docType: string | null): QueueEntry => {
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

  const handleDocRequest = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!reqName || !reqDocType) { showNotif('Please fill all required fields.', 'error'); return }
    const entry = addToQueueFn(reqName, reqStudentId, 'document-request', reqDocType)
    setLastQueueEntry(entry)
    setReqStudentId(''); setReqName(''); setReqDocType(''); setReqPurpose(''); setReqCopies(1)
    showNotif(`Queue #${entry.number} assigned!`, 'success')
  }, [reqName, reqStudentId, reqDocType, addToQueueFn, showNotif])

  const handleClaim = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!claimName) { showNotif('Please fill in your name.', 'error'); return }
    const entry = addToQueueFn(claimName, claimStudentId, 'claim-document', claimDocType || null)
    setLastQueueEntry(entry)
    setClaimStudentId(''); setClaimName(''); setClaimDocType('')
    showNotif(`Queue #${entry.number} assigned!`, 'success')
  }, [claimName, claimStudentId, claimDocType, addToQueueFn, showNotif])

  const handleInquiry = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!inquiryName || !inquiryMsg) { showNotif('Please fill all fields.', 'error'); return }
    const entry = addToQueueFn(inquiryName, '', 'inquiry', null)
    setLastQueueEntry(entry)
    setInquiryName(''); setInquiryMsg('')
    showNotif(`Queue #${entry.number} assigned!`, 'success')
  }, [inquiryName, inquiryMsg, addToQueueFn, showNotif])

  const handleStatusCheck = useCallback(() => {
    if (!statusInput.trim()) { showNotif('Enter a queue number.', 'error'); return }
    const result = db.queue.find(q => q.number.toUpperCase() === statusInput.trim().toUpperCase())
    setStatusResult(result || null)
  }, [statusInput, db.queue, showNotif])

  const callNextFn = useCallback(() => {
    const next = db.queue.find(q => q.status === 'pending')
    if (!next) { showNotif('No pending entries.', 'warning'); return }
    const sc = db.queue.filter(q => q.status === 'serving').length
    updateDB(d => {
      const newQueue = d.queue.map(q => q.id === next.id
        ? { ...q, counter: CONFIG.counters[sc % CONFIG.counters.length], status: 'serving' as const, estimatedWait: 0 }
        : q
      )
      return { ...d, queue: newQueue }
    })
    showNotif(`Called ${next.number} → ${CONFIG.counters[sc % CONFIG.counters.length]}`, 'success')
  }, [db.queue, updateDB, showNotif])

  const skipQueue = useCallback((id: string) => {
    updateDB(d => {
      const newQueue = d.queue.map(q => q.id === id ? { ...q, status: 'cancelled' as const } : q)
      return { ...d, queue: newQueue }
    })
    showNotif('Skipped.', 'info')
  }, [updateDB, showNotif])

  const doneQueue = useCallback((id: string) => {
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

  const noshowQueue = useCallback((id: string) => {
    updateDB(d => {
      const newQueue = d.queue.map(q => q.id === id ? { ...q, status: 'cancelled' as const } : q)
      return { ...d, queue: newQueue }
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

  const resetSystem = useCallback(() => {
    const def = getDefaultDB()
    setDb(def)
    saveToStorage(def)
    showNotif('Reset done.', 'info')
  }, [showNotif])

  const handleMapClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const r = canvas.getBoundingClientRect()
    const x = (e.clientX - r.left) * (canvas.width / r.width)
    const y = (e.clientY - r.top) * (canvas.height / r.height)
    const rooms = getRooms(canvas.width, canvas.height)
    const clicked = rooms.find(rm => x >= rm.x && x <= rm.x + rm.w && y >= rm.y && y <= rm.y + rm.h)
    if (clicked) setSelectedOffice(clicked.id)
  }, [])

  const handleMapMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const r = canvas.getBoundingClientRect()
    const x = (e.clientX - r.left) * (canvas.width / r.width)
    const y = (e.clientY - r.top) * (canvas.height / r.height)
    const rooms = getRooms(canvas.width, canvas.height)
    const hov = rooms.find(rm => x >= rm.x && x <= rm.x + rm.w && y >= rm.y && y <= rm.y + rm.h)
    const id = hov ? hov.id : null
    setHoveredOffice(id)
    canvas.style.cursor = hov ? 'pointer' : 'default'
  }, [])

  const selectOffice = useCallback((id: string) => {
    setSelectedOffice(id)
  }, [])

  const selectedOfficeInfo = selectedOffice ? CONFIG.offices.find(o => o.id === selectedOffice) : null

  // Admin nav handler
  const handleAdminNav = useCallback((id: string) => {
    if (id === 'admin-logout') { handleLogout(); return }
    setAdminScreen(id)
  }, [handleLogout])

  const stats = getQueueStats(db)
  const filteredQueue = db.queue.filter(q => {
    if (queueFilter !== 'all' && q.status !== queueFilter) return false
    if (queueSearch) {
      const s = queueSearch.toLowerCase()
      if (!q.number.toLowerCase().includes(s) && !q.studentName.toLowerCase().includes(s)) return false
    }
    return true
  })

  const docByQueue = (qid: string) => db.documents.find(d => d.queueId === qid)

  return (
    <div className="app-container">
      {notification && <div className={`notification ${notification.type}`}>{notification.msg}</div>}

      {/* KIOSK - WELCOME */}
      <div className={`screen${screen === 'kiosk-welcome' ? ' active' : ''}`}>
        <div className="kiosk-header">
          <div className="kiosk-header-left">
            <div className="kiosk-logo"><img src="/celp-logo.svg" alt="CELP" /></div>
            <div className="kiosk-title"><h1>Smart Registrar Service Kiosk</h1><span>Centro Escolar Las Piñas</span></div>
          </div>
          <div className="kiosk-header-right">
            <div className="kiosk-time"><span className="time">{timeStr}</span><span className="date" style={{ fontSize: 11, opacity: 0.7 }}>{dateStr}</span></div>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--white)', padding: '8px 16px', fontSize: 12, borderRadius: 8 }} onClick={() => showScreen('admin-login-screen')}>Admin</button>
          </div>
        </div>
        <div className="kiosk-body">
          <div className="welcome-screen">
            <div className="welcome-icon">🎓</div>
            <div className="welcome-content"><h2>Welcome to CELP Registrar</h2><p>Your self-service platform for document requests, queue management, and registrar office navigation.</p></div>
            <button className="welcome-btn" onClick={() => showScreen('kiosk-services')}><span>Touch to Start</span> <span>→</span></button>
          </div>
        </div>
      </div>

      {/* KIOSK - SERVICES */}
      <div className={`screen${screen === 'kiosk-services' ? ' active' : ''}`}>
        <div className="kiosk-header">
          <div className="kiosk-header-left">
            <div className="kiosk-logo"><img src="/celp-logo.svg" alt="CELP" /></div>
            <div className="kiosk-title"><h1>Select Service</h1><span>Choose a transaction type</span></div>
          </div>
          <div className="kiosk-header-right"><button className="back-btn" onClick={() => showScreen('kiosk-welcome')}>← Back</button></div>
        </div>
        <div className="kiosk-body">
          <div className="services-grid">
            <div className="service-card" onClick={() => showScreen('document-request')}><div className="icon pink">📄</div><h3>Request Document</h3><p>Request TOR, COE, Diploma, and other academic documents</p></div>
            <div className="service-card" onClick={() => showScreen('claim-document')}><div className="icon blue">📥</div><h3>Claim Document</h3><p>Claim your requested or processed documents</p></div>
            <div className="service-card" onClick={() => showScreen('inquiry')}><div className="icon gold">❓</div><h3>Registrar Inquiry</h3><p>Ask questions about registrar procedures and services</p></div>
            <div className="service-card" onClick={() => showScreen('queue-monitor')}><div className="icon pink">👥</div><h3>View Queue</h3><p>Monitor real-time queue status and your position</p></div>
            <div className="service-card" onClick={() => showScreen('status-check')}><div className="icon blue">🔍</div><h3>Check Transaction Status</h3><p>Track the status of your document request</p></div>
            <div className="service-card" onClick={() => showScreen('interactive-map')}><div className="icon gold">📍</div><h3>Interactive Map</h3><p>Find offices, counters, and service areas</p></div>
          </div>
        </div>
      </div>

      {/* DOCUMENT REQUEST */}
      <div className={`screen${screen === 'document-request' ? ' active' : ''}`}>
        <div className="kiosk-header">
          <div className="kiosk-header-left">
            <div className="kiosk-logo"><img src="/celp-logo.svg" alt="CELP" /></div>
            <div className="kiosk-title"><h1>Request Document</h1><span>Fill in your details</span></div>
          </div>
          <div className="kiosk-header-right"><button className="back-btn" onClick={() => { setLastQueueEntry(null); showScreen('kiosk-services') }}>← Back</button></div>
        </div>
        <div className="kiosk-body">
          {lastQueueEntry && lastQueueEntry.service === 'document-request' ? (
            <div className="ticket-success">
              <div className="ticket-success-icon">✅</div>
              <div className="ticket-success-title">Queue Assigned!</div>
              <div className="ticket-success-number">{lastQueueEntry.number}</div>
              <div className="ticket-success-name">{lastQueueEntry.studentName}</div>
              <div className="ticket-success-info">
                <div className="ticket-success-item"><span>Position</span><strong>#{lastQueueEntry.position}</strong></div>
                <div className="ticket-success-item"><span>Est. Wait</span><strong>{lastQueueEntry.estimatedWait} mins</strong></div>
                <div className="ticket-success-item"><span>Service</span><strong>{getServiceLabel(lastQueueEntry.service)}</strong></div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => setLastQueueEntry(null)}>Create Another</button>
            </div>
          ) : (
          <div className="form-container">
            <form onSubmit={handleDocRequest}>
              <div className="form-row">
                <div className="form-group"><label>Student ID</label><input type="text" placeholder="e.g. CELP-2024-XXXX" value={reqStudentId} onChange={e => setReqStudentId(e.target.value)} /></div>
                <div className="form-group"><label>Full Name *</label><input type="text" placeholder="Enter your full name" required value={reqName} onChange={e => setReqName(e.target.value)} /></div>
              </div>
              <div className="form-group">
                <label>Document Type *</label>
                <select required value={reqDocType} onChange={e => setReqDocType(e.target.value)}>
                  <option value="">Select...</option>
                  {CONFIG.documentTypes.map(d => <option key={d.id} value={d.id}>{d.name} ({d.price})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Purpose</label>
                <select value={reqPurpose} onChange={e => setReqPurpose(e.target.value)}>
                  <option value="">Select purpose...</option>
                  {CONFIG.purposes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Copies</label><input type="number" value={reqCopies} min={1} max={10} onChange={e => setReqCopies(parseInt(e.target.value) || 1)} /></div>
              <button type="submit" className="btn btn-primary btn-block btn-lg mt-16">Submit &amp; Get Queue Number</button>
            </form>
          </div>
          )}
        </div>
      </div>

      {/* CLAIM */}
      <div className={`screen${screen === 'claim-document' ? ' active' : ''}`}>
        <div className="kiosk-header">
          <div className="kiosk-header-left">
            <div className="kiosk-logo"><img src="/celp-logo.svg" alt="CELP" /></div>
            <div className="kiosk-title"><h1>Claim Document</h1><span>Claim your processed document</span></div>
          </div>
          <div className="kiosk-header-right"><button className="back-btn" onClick={() => { setLastQueueEntry(null); showScreen('kiosk-services') }}>← Back</button></div>
        </div>
        <div className="kiosk-body">
          {lastQueueEntry && lastQueueEntry.service === 'claim-document' ? (
            <div className="ticket-success">
              <div className="ticket-success-icon">✅</div>
              <div className="ticket-success-title">Queue Assigned!</div>
              <div className="ticket-success-number">{lastQueueEntry.number}</div>
              <div className="ticket-success-name">{lastQueueEntry.studentName}</div>
              <div className="ticket-success-info">
                <div className="ticket-success-item"><span>Position</span><strong>#{lastQueueEntry.position}</strong></div>
                <div className="ticket-success-item"><span>Est. Wait</span><strong>{lastQueueEntry.estimatedWait} mins</strong></div>
                <div className="ticket-success-item"><span>Service</span><strong>{getServiceLabel(lastQueueEntry.service)}</strong></div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => setLastQueueEntry(null)}>Create Another</button>
            </div>
          ) : (
          <div className="form-container">
            <form onSubmit={handleClaim}>
              <div className="form-row">
                <div className="form-group"><label>Student ID</label><input type="text" placeholder="e.g. CELP-2024-XXXX" value={claimStudentId} onChange={e => setClaimStudentId(e.target.value)} /></div>
                <div className="form-group"><label>Full Name *</label><input type="text" placeholder="Enter your full name" required value={claimName} onChange={e => setClaimName(e.target.value)} /></div>
              </div>
              <div className="form-group">
                <label>Document to Claim</label>
                <select value={claimDocType} onChange={e => setClaimDocType(e.target.value)}>
                  <option value="">Select...</option>
                  {CONFIG.documentTypes.map(d => <option key={d.id} value={d.id}>{d.name} ({d.price})</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg mt-16">Get Queue Number</button>
            </form>
          </div>
          )}
        </div>
      </div>

      {/* INQUIRY */}
      <div className={`screen${screen === 'inquiry' ? ' active' : ''}`}>
        <div className="kiosk-header">
          <div className="kiosk-header-left">
            <div className="kiosk-logo"><img src="/celp-logo.svg" alt="CELP" /></div>
            <div className="kiosk-title"><h1>Registrar Inquiry</h1><span>Ask a question</span></div>
          </div>
          <div className="kiosk-header-right"><button className="back-btn" onClick={() => { setLastQueueEntry(null); showScreen('kiosk-services') }}>← Back</button></div>
        </div>
        <div className="kiosk-body">
          {lastQueueEntry && lastQueueEntry.service === 'inquiry' ? (
            <div className="ticket-success">
              <div className="ticket-success-icon">✅</div>
              <div className="ticket-success-title">Queue Assigned!</div>
              <div className="ticket-success-number">{lastQueueEntry.number}</div>
              <div className="ticket-success-name">{lastQueueEntry.studentName}</div>
              <div className="ticket-success-info">
                <div className="ticket-success-item"><span>Position</span><strong>#{lastQueueEntry.position}</strong></div>
                <div className="ticket-success-item"><span>Est. Wait</span><strong>{lastQueueEntry.estimatedWait} mins</strong></div>
                <div className="ticket-success-item"><span>Service</span><strong>{getServiceLabel(lastQueueEntry.service)}</strong></div>
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => setLastQueueEntry(null)}>Create Another</button>
            </div>
          ) : (
          <div className="form-container">
            <form onSubmit={handleInquiry}>
              <div className="form-group"><label>Full Name *</label><input type="text" placeholder="Enter your full name" required value={inquiryName} onChange={e => setInquiryName(e.target.value)} /></div>
              <div className="form-group"><label>Your Inquiry *</label><textarea placeholder="Type your question or concern here..." required value={inquiryMsg} onChange={e => setInquiryMsg(e.target.value)}></textarea></div>
              <button type="submit" className="btn btn-primary btn-block btn-lg mt-16">Submit Inquiry</button>
            </form>
          </div>
          )}
        </div>
      </div>

      {/* QUEUE RESULT */}
      <div className={`screen${screen === 'queue-result' ? ' active' : ''}`}>
        <div className="kiosk-header">
          <div className="kiosk-header-left">
            <div className="kiosk-logo"><img src="/celp-logo.svg" alt="CELP" /></div>
            <div className="kiosk-title"><h1>Queue Assigned</h1><span>Your transaction is in queue</span></div>
          </div>
          <div className="kiosk-header-right"><button className="back-btn" onClick={() => showScreen('kiosk-services')}>← New Transaction</button></div>
        </div>
        <div className="kiosk-body">
          {lastQueueEntry && <div className="queue-result">
            <div className="queue-number-display">
              <div className="label">Your Queue Number</div>
              <div className="number bounce-in">{lastQueueEntry.number}</div>
              <div className="sub">{lastQueueEntry.studentName}</div>
            </div>
            <div className="queue-info">
              <div className="queue-info-item"><div className="value">{lastQueueEntry.position}</div><div className="label">Position</div></div>
              <div className="queue-info-item"><div className="value">{lastQueueEntry.estimatedWait} mins</div><div className="label">Est. Wait</div></div>
              <div className="queue-info-item"><div className="value">{getServiceLabel(lastQueueEntry.service)}</div><div className="label">Service</div></div>
              {lastQueueEntry.documentType && getDocPrice(lastQueueEntry.documentType) !== '—' ? (
                <div className="queue-info-item"><div className="value">{getDocPrice(lastQueueEntry.documentType)}</div><div className="label">Fee</div></div>
              ) : null}
            </div>
            <div className="queue-actions">
              <button className="btn btn-secondary btn-lg" onClick={() => showScreen('status-check')}>🔍 Track</button>
              <button className="btn btn-secondary btn-lg" onClick={() => showScreen('queue-monitor')}>👥 Queue</button>
              <button className="btn btn-secondary btn-lg" onClick={() => showScreen('interactive-map')}>📍 Map</button>
              <button className="btn btn-primary btn-lg" onClick={() => showScreen('kiosk-services')}>← New Transaction</button>
            </div>
          </div>}
        </div>
      </div>

      {/* QUEUE MONITOR */}
      <div className={`screen${screen === 'queue-monitor' ? ' active' : ''}`}>
        <div className="kiosk-header">
          <div className="kiosk-header-left">
            <div className="kiosk-logo"><img src="/celp-logo.svg" alt="CELP" /></div>
            <div className="kiosk-title"><h1>Queue Monitor</h1><span>Live queue status</span></div>
          </div>
          <div className="kiosk-header-right"><button className="back-btn" onClick={() => showScreen('kiosk-services')}>← Back</button></div>
        </div>
        <div className="kiosk-body">
          <div className="queue-monitor">
            <div className="now-serving">
              <div className="label">Now Serving</div>
              <div className="number pulse">{db.queue.find(q => q.status === 'serving')?.number || '—'}</div>
              <div className="counter">{db.queue.find(q => q.status === 'serving') ? `Counter: ${db.queue.find(q => q.status === 'serving')?.counter || 'TBD'} • ${db.queue.find(q => q.status === 'serving')?.studentName}` : 'No active transactions'}</div>
              <div style={{ marginTop: 20 }}><button className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.2)', color: 'var(--white)', border: '2px solid rgba(255,255,255,0.3)' }} onClick={() => showScreen('status-check')}>🔍 Check Your Queue</button></div>
            </div>
            <div className="queue-list-container">
              <h3>Upcoming Queue</h3>
              <div className="queue-list">
                {db.queue.filter(q => q.status !== 'completed' && q.status !== 'cancelled').map(q => (
                  <div key={q.id} className={`queue-item ${q.status}`}>
                    <span className="q-number">{q.number}</span>
                    <span className="q-name">{q.studentName}{q.counter ? ` → ${q.counter}` : ''}</span>
                    <span className="q-status">{q.status === 'pending' ? `#${q.position}` : q.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS CHECK */}
      <div className={`screen${screen === 'status-check' ? ' active' : ''}`}>
        <div className="kiosk-header">
          <div className="kiosk-header-left">
            <div className="kiosk-logo"><img src="/celp-logo.svg" alt="CELP" /></div>
            <div className="kiosk-title"><h1>Transaction Status</h1><span>Check your queue or document status</span></div>
          </div>
          <div className="kiosk-header-right"><button className="back-btn" onClick={() => showScreen('kiosk-services')}>← Back</button></div>
        </div>
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
                      <button className="btn btn-primary" onClick={() => showScreen('interactive-map')}>📍 Map</button>
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

      {/* INTERACTIVE MAP */}
      <div className={`screen${screen === 'interactive-map' ? ' active' : ''}`}>
        <div className="kiosk-header">
          <div className="kiosk-header-left">
            <div className="kiosk-logo"><img src="/celp-logo.svg" alt="CELP" /></div>
            <div className="kiosk-title"><h1>Interactive Map</h1><span>Find your way around</span></div>
          </div>
          <div className="kiosk-header-right"><button className="back-btn" onClick={() => showScreen('kiosk-services')}>← Back</button></div>
        </div>
        <div className="kiosk-body">
          <div className="map-container">
            <div className="map-canvas-area"><canvas ref={canvasRef} onClick={handleMapClick} onMouseMove={handleMapMove}></canvas></div>
            <div className="map-legend">
              <h3>Offices &amp; Areas</h3>
              <div className="map-offices">
                {CONFIG.offices.map(o => (
                  <button key={o.id} className={`map-office-btn${selectedOffice === o.id ? ' active' : ''}`} onClick={() => selectOffice(o.id)}>
                    <span className="dot" style={{ background: o.color }}></span><span className="name">{o.name}</span>
                  </button>
                ))}
              </div>
              <div className="map-office-info">
                {selectedOfficeInfo ? (
                  <><div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}><div style={{ width: 16, height: 16, borderRadius: 4, background: selectedOfficeInfo.color, flexShrink: 0 }}></div><h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-800)' }}>{selectedOfficeInfo.name}</h4></div><p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.5 }}>{selectedOfficeInfo.info}</p></>
                ) : (
                  <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Click a room or select an office.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN LOGIN */}
      <div className={`screen${screen === 'admin-login-screen' ? ' active' : ''}`}>
        <div className="login-screen">
          <div className="login-card">
            <div className="logo-area"><div className="logo-icon"><img src="/celp-logo.svg" alt="CELP" /></div><h2>Admin Login</h2><p>Smart Registrar Service Kiosk — CELP</p></div>
            <form onSubmit={handleLogin}>
              <div className={`login-error${loginError ? ' show' : ''}`}>Invalid username or password.</div>
              <div className="form-group"><label>Username</label><input type="text" placeholder="Enter admin username" required value={loginUsername} onChange={e => setLoginUsername(e.target.value)} /></div>
              <div className="form-group"><label>Password</label><input type="password" placeholder="Enter your password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} /></div>
              <button type="submit" className="btn btn-primary btn-block btn-lg">Sign In</button>
              <div className="text-center mt-16"><button type="button" className="btn btn-secondary" onClick={() => showScreen('kiosk-welcome')}>← Back to Kiosk</button></div>
            </form>
          </div>
        </div>
      </div>

      {/* ADMIN PANEL */}
      <div className={`screen${screen === 'admin-panel' ? ' active' : ''}`}>
        <div className="admin-layout">
          <aside className="admin-sidebar">
            <div className="admin-sidebar-header"><div className="logo-small"><img src="/celp-logo.svg" alt="CELP" /></div><div className="text"><h2>Registrar Admin</h2><span>CELP</span></div></div>
            <nav className="admin-nav">
              {(['dashboard', 'queue', 'requests', 'analytics', 'settings'] as const).map(item => (
                <button key={item} className={`admin-nav-item${adminScreen === `admin-${item}` ? ' active' : ''}`} onClick={() => handleAdminNav(`admin-${item}`)}>
                  <span className="icon">{{ dashboard: '📊', queue: '👥', requests: '📄', analytics: '📈', settings: '⚙️' }[item]}</span>
                  {{ dashboard: 'Dashboard', queue: 'Queue', requests: 'Documents', analytics: 'Analytics', settings: 'Settings' }[item]}
                  {item === 'queue' && stats.pending > 0 && <span className="badge">{stats.pending}</span>}
                </button>
              ))}
            </nav>
            <div className="admin-sidebar-footer">
              <div className="avatar">JD</div>
              <div className="info"><div className="name">{ADMIN_CREDENTIALS.name}</div><div className="role">{ADMIN_CREDENTIALS.role}</div></div>
              <button className="logout-btn" onClick={handleLogout} title="Logout">🚪</button>
            </div>
          </aside>
          <main className="admin-main">
            <div className="admin-topbar">
              <h2>{({ 'admin-dashboard': 'Dashboard', 'admin-queue': 'Queue Management', 'admin-requests': 'Document Requests', 'admin-analytics': 'Analytics', 'admin-settings': 'Settings' } as Record<string, string>)[adminScreen] || 'Dashboard'}</h2>
              <div className="admin-actions"><span className="date">{dateStr}</span><button className="btn btn-secondary" onClick={() => showScreen('kiosk-welcome')}>← Switch to Kiosk</button></div>
            </div>
            <div className="admin-content">

              {/* DASHBOARD */}
              <div className={`admin-screen${adminScreen === 'admin-dashboard' ? ' active' : ''}`}>
                <div className="stats-grid">
                  <div className="stat-card"><div className="icon pink">📋</div><div className="info"><div className="value">{stats.total}</div><div className="label">Total Today</div></div></div>
                  <div className="stat-card"><div className="icon gold">⏳</div><div className="info"><div className="value">{stats.pending}</div><div className="label">In Queue</div></div></div>
                  <div className="stat-card"><div className="icon blue">✅</div><div className="info"><div className="value">{stats.serving}</div><div className="label">Now Serving</div></div></div>
                  <div className="stat-card"><div className="icon gold">🎉</div><div className="info"><div className="value">{stats.completed}</div><div className="label">Completed</div></div></div>
                </div>
                <div className="dashboard-grid">
                  <div className="dashboard-card">
                    <div className="dashboard-card-header"><h3>Recent Activity</h3></div>
                    <div className="dashboard-card-body">
                      {[...db.queue].reverse().slice(0, 8).map(q => {
                        const t = new Date(q.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                        const ic = q.status === 'pending' ? '⏳' : q.status === 'serving' ? '✅' : q.status === 'completed' ? '🎉' : '❌'
                        return <div key={q.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--gray-100)', gap: 10 }}><span>{ic}</span><div style={{ flex: 1 }}><span style={{ fontWeight: 600, fontSize: 13 }}>{q.number}</span><span style={{ fontSize: 12, color: 'var(--gray-500)', marginLeft: 8 }}>{q.studentName}</span></div><span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{t}</span></div>
                      })}
                    </div>
                  </div>
                  <div className="dashboard-card">
                    <div className="dashboard-card-header"><h3>Pending</h3><span style={{ cursor: 'pointer', fontSize: 13, color: 'var(--ceu-pink)', fontWeight: 600 }} onClick={() => { setAdminScreen('admin-queue'); setQueueFilter('pending') }}>View All →</span></div>
                    <div className="dashboard-card-body">
                      {db.queue.filter(q => q.status === 'pending').slice(0, 5).map(q => (
                        <div key={q.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--gray-100)', gap: 10 }}>
                          <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--ceu-pink)', minWidth: 50 }}>{q.number}</span>
                          <span style={{ flex: 1, fontSize: 13 }}>{q.studentName}</span>
                          <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{getServiceLabel(q.service)}</span>
                        </div>
                      ))}
                      {stats.pending === 0 && <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 16 }}>No pending transactions</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* QUEUE MANAGEMENT */}
              <div className={`admin-screen${adminScreen === 'admin-queue' ? ' active' : ''}`}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ background: 'var(--gray-50)', padding: '8px 16px', borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 800 }}>{stats.pending}</div><div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Pending</div></div>
                    <div style={{ background: 'var(--success-light)', padding: '8px 16px', borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)' }}>{stats.serving}</div><div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Serving</div></div>
                    <div style={{ background: 'var(--info-light)', padding: '8px 16px', borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 800, color: 'var(--info)' }}>{stats.completed}</div><div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Completed</div></div>
                    <div style={{ background: 'var(--warning-light)', padding: '8px 16px', borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 800, color: '#856404' }}>{stats.total}</div><div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Total</div></div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div className="table-controls">
                    <select value={queueFilter} onChange={e => setQueueFilter(e.target.value)}>
                      <option value="all">All</option><option value="pending">Pending</option><option value="serving">Serving</option><option value="completed">Completed</option>
                    </select>
                    <input type="text" placeholder="Search..." value={queueSearch} onChange={e => setQueueSearch(e.target.value)} />
                  </div>
                  <button className="btn btn-success" onClick={callNextFn}>📞 Call Next</button>
                </div>
                <div className="dashboard-card">
                  <div className="dashboard-card-body" style={{ overflowX: 'auto' }}>
                    <table className="queue-table">
                      <thead><tr><th>Queue #</th><th>Name</th><th>Service</th><th>Counter</th><th>Status</th><th>Time</th><th>Actions</th></tr></thead>
                      <tbody>
                        {filteredQueue.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--gray-400)' }}>No entries found.</td></tr> :
                          filteredQueue.map(q => {
                            const t = new Date(q.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                            return <tr key={q.id}>
                              <td><strong>{q.number}</strong></td><td>{q.studentName}</td><td>{getServiceLabel(q.service)}</td><td>{q.counter || '—'}</td>
                              <td><span className={`status-badge ${q.status}`}>{q.status}</span></td>
                              <td style={{ fontSize: 12, color: 'var(--gray-400)' }}>{t}</td>
                              <td><div style={{ display: 'flex', gap: 4 }}>
                                {q.status === 'pending' ? <><button className="action-btn call" onClick={callNextFn}>Call</button><button className="action-btn skip" onClick={() => skipQueue(q.id)}>Skip</button></> : ''}
                                {q.status === 'serving' ? <><button className="action-btn done" onClick={() => doneQueue(q.id)}>Done</button><button className="action-btn remove" onClick={() => noshowQueue(q.id)}>No Show</button></> : ''}
                              </div></td>
                            </tr>
                          })
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* DOCUMENTS */}
              <div className={`admin-screen${adminScreen === 'admin-requests' ? ' active' : ''}`}>
                <div className="dashboard-card">
                  <div className="dashboard-card-header"><h3>📄 Document Requests</h3></div>
                  <div className="dashboard-card-body" style={{ overflowX: 'auto' }}>
                    <table className="queue-table">
                      <thead><tr><th>ID</th><th>Student</th><th>Document</th><th>Copies</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        {db.documents.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--gray-400)' }}>No requests.</td></tr> :
                          db.documents.map(d => <tr key={d.id}>
                            <td style={{ fontWeight: 600 }}>{d.id}</td>
                            <td>{d.studentName}<br /><span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{d.studentId}</span></td>
                            <td>{getDocLabel(d.type)}</td><td>{d.copies || 1}</td>
                            <td><span className="status-badge" style={{ background: 'var(--warning-light)', color: '#856404' }}>{d.status}</span></td>
                            <td><select value={d.status} onChange={e => updateDocStatus(d.id, e.target.value)} style={{ padding: '6px 10px', border: '2px solid var(--gray-200)', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font)' }}>
                              <option value="pending">Pending</option><option value="processing">Processing</option><option value="ready">Ready</option><option value="completed">Completed</option>
                            </select></td>
                          </tr>)
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ANALYTICS */}
              <div className={`admin-screen${adminScreen === 'admin-analytics' ? ' active' : ''}`}>
                {(function() {
                  const ds30 = getDailyStats7(db)
                  const t30 = ds30.reduce((s, d) => s + d.total, 0)
                  const c30 = ds30.reduce((s, d) => s + d.completed, 0)
                  const avg = t30 ? Math.round(t30 / 7) : 0
                  const rate = t30 ? Math.round((c30 / t30) * 100) : 0
                  return <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
                      <div style={{ background: 'var(--gray-50)', padding: 16, borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ceu-pink)' }}>{t30}</div><div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Total (7d)</div></div>
                      <div style={{ background: 'var(--success-light)', padding: 16, borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>{c30}</div><div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Completed</div></div>
                      <div style={{ background: 'var(--info-light)', padding: 16, borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: 'var(--info)' }}>{avg}</div><div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Avg/Day</div></div>
                      <div style={{ background: 'var(--warning-light)', padding: 16, borderRadius: 8, textAlign: 'center' }}><div style={{ fontSize: 24, fontWeight: 800, color: '#856404' }}>{rate}%</div><div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Rate</div></div>
                    </div>
                  </div>
                })()}
                <div className="analytics-grid">
                  <div className="analytics-card full">
                    <h3>Daily Transactions (7 Days)</h3>
                    <div className="chart-placeholder">
                      {(() => {
                        const ds = getDailyStats7(db)
                        const mx = Math.max(...ds.map(s => s.total), 1)
                        return ds.map((s, i) => {
                          const h = Math.max((s.total / mx) * 100, 4)
                          return <div key={i} className="chart-bar" style={{ height: `${h}%` }}><span className="bar-value">{s.total}</span><span className="bar-label">{s.label}</span></div>
                        })
                      })()}
                    </div>
                  </div>
                  <div className="analytics-card">
                    <h3>Service Distribution</h3>
                    <div>
                      {(() => {
                        const svcs = getServiceStats(db)
                        const entries = Object.entries(svcs)
                        const total = entries.reduce((s, c) => s + c[1], 0)
                        const colors = ['#B83B5E', '#D4617A', '#E8A0B4', '#8E1D40', '#F8B8C8']
                        return entries.map((e, i) => {
                          const pct = total ? Math.round((e[1] / total) * 100) : 0
                          return <div key={i} style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{e[0]}</span><span style={{ color: 'var(--gray-500)' }}>{e[1]} ({pct}%)</span></div>
                            <div style={{ height: 8, background: 'var(--gray-200)', borderRadius: 4, overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: colors[i % colors.length], borderRadius: 4 }}></div></div>
                          </div>
                        })
                      })()}
                    </div>
                  </div>
                  <div className="analytics-card">
                    <h3>System Info</h3>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}><span style={{ color: 'var(--gray-500)' }}>Version</span><span style={{ fontWeight: 600 }}>{CONFIG.version}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}><span style={{ color: 'var(--gray-500)' }}>University</span><span style={{ fontWeight: 600 }}>{CONFIG.university}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}><span style={{ color: 'var(--gray-500)' }}>Counters</span><span style={{ fontWeight: 600 }}>{CONFIG.counters.length}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}><span style={{ color: 'var(--gray-500)' }}>Total Queue</span><span style={{ fontWeight: 600 }}>{db.queue.length}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}><span style={{ color: 'var(--gray-500)' }}>Status</span><span style={{ fontWeight: 600, color: 'var(--success)' }}>● Active</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SETTINGS */}
              <div className={`admin-screen${adminScreen === 'admin-settings' ? ' active' : ''}`}>
                <div className="dashboard-card">
                  <div className="dashboard-card-header"><h3>⚙️ System Settings</h3></div>
                  <div className="dashboard-card-body">
                    <div style={{ maxWidth: 500 }}>
                      <div className="form-group">
                        <label>Auto-call next queue</label>
                        <select style={{ padding: '10px 14px', border: '2px solid var(--gray-200)', borderRadius: 8, fontSize: 14, fontFamily: 'var(--font)', width: '100%' }} defaultValue="true">
                          <option value="true">Enabled</option><option value="false">Disabled</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Minutes per transaction</label>
                        <input type="number" defaultValue={10} min={1} max={60} style={{ padding: '10px 14px', border: '2px solid var(--gray-200)', borderRadius: 8, fontSize: 14, fontFamily: 'var(--font)', width: '100%' }} />
                      </div>
                      <hr style={{ border: 'none', borderTop: '1px solid var(--gray-200)', margin: '16px 0' }} />
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" onClick={() => showNotif('Settings saved!', 'success')}>Save</button>
                        <button className="btn btn-danger" onClick={() => { if (confirm('Reset all data?')) { resetSystem() } }}>Reset Data</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App