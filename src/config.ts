import type { Department, DocType } from './types/queue'
import type { Office } from './types/map'

export const CONFIG = {
  university: 'Centro Escolar University - Malolos',
  kioskName: 'University Service Kiosk',
  version: '1.1.0',
  queuePrefixes: { 'document-request': 'A', 'claim-document': 'B', inquiry: 'C', certification: 'D', cashier: 'CA', accounting: 'AC' } as Record<string, string>,
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
    { id: 'tor', name: 'Transcript of Records (TOR)'},
    { id: 'coe', name: 'Certificate of Enrollment (COE)'},
    { id: 'cog', name: 'Certificate of Grades (COG)'},
    { id: 'diploma', name: 'Diploma'},
    { id: 'honorable-dismissal', name: 'Honorable Dismissal'},
    { id: 'certificate-graduation', name: 'Certificate of Graduation'},
    { id: 'good-moral', name: 'Certificate of Good Moral'},
    { id: 'others', name: 'Other Documents'},
  ] as DocType[],
  purposes: ['Transfer to Another School', 'Employment Requirement', 'Scholarship Application', 'Graduate School Application', 'Board Exam Requirement', 'Personal Record', 'Government Requirement', 'Others'],
}

export const DEPARTMENTS: Record<Department, { id: Department; label: string; icon: string; counters: string[]; transferTargets: Department[] }> = {
  registrar: { id: 'registrar', label: 'Registrar', icon: '📄', counters: CONFIG.counters.slice(0, 3), transferTargets: ['cashier', 'accounting'] },
  cashier: { id: 'cashier', label: 'Cashier', icon: '💰', counters: ['Cashier Counter 1', 'Cashier Counter 2'], transferTargets: ['accounting'] },
  accounting: { id: 'accounting', label: 'Accounting', icon: '🧾', counters: ['Accounting Counter 1', 'Accounting Counter 2'], transferTargets: [] },
}

export const ADMIN_ACCOUNTS = [
  { username: 'admin', password: 'admin123', name: 'Juan Dela Cruz', role: 'Registrar Administrator', department: 'registrar' as Department },
  { username: 'cashier', password: 'cashier123', name: 'Maria Santos', role: 'Cashier Administrator', department: 'cashier' as Department },
  { username: 'accounting', password: 'acctg123', name: 'Pedro Reyes', role: 'Accounting Administrator', department: 'accounting' as Department },
]

export type AdminAccount = (typeof ADMIN_ACCOUNTS)[number]

export const ADMIN_NAV_BY_DEPARTMENT: Record<Department, readonly { id: string; icon: string; label: string }[]> = {
  registrar: [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'queue', icon: '👥', label: 'Queue' },
    { id: 'requests', icon: '📄', label: 'Documents' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ],
  cashier: [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'queue', icon: '👥', label: 'Queue' },
  ],
  accounting: [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'queue', icon: '👥', label: 'Queue' },
  ],
}
