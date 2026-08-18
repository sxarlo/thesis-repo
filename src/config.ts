import type { DocType } from './types/queue'
import type { Office } from './types/map'

export const CONFIG = {
  university: 'Centro Escolar University - Malolos',
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

export const ADMIN_CREDENTIALS = { username: 'admin', password: 'admin123', name: 'Juan Dela Cruz', role: 'Registrar Administrator' }
