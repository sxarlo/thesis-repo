export type QueueStatus = 'pending' | 'serving' | 'completed' | 'cancelled' | 'transferred'

export type Department = 'registrar' | 'cashier' | 'accounting'

export type CustomerType = 'student' | 'enrollee' | 'walk-in'

export type TicketSource = 'kiosk' | 'transfer'

export interface QueueEntry {
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
  department: Department
  customerType: CustomerType
  source: TicketSource
  transferredFrom: string | null
}

export interface AddToQueueOptions {
  department?: Department
  customerType?: CustomerType
  source?: TicketSource
  transferredFrom?: string | null
}

export interface DocEntry {
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

export interface DB {
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

export interface DocType {
  id: string
  name: string
  icon: string
  price: string
}

export interface SettingsForm {
  autoCallNext: boolean
  interval: number
}

export type AssignNextResult = { queue: QueueEntry[]; called: QueueEntry; counter: string } | { reason: 'empty' | 'full' }
