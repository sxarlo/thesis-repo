import { DEPARTMENTS } from '../../config'
import type { Department } from '../../types/queue'
import KioskHeader from './KioskHeader'

interface DepartmentSelectScreenProps {
  active: boolean
  onSelectDepartment: (dept: Department) => void
  onViewMonitor: (dept: Department) => void
}

const DEPT_ICON_CLASS: Record<Department, string> = {
  registrar: 'pink',
  cashier: 'gold',
  accounting: 'blue',
}

const DEPT_DESCRIPTION: Record<Department, string> = {
  registrar: 'Document requests, claiming documents, and inquiries',
  cashier: 'Get a queue number for cashier transactions',
  accounting: 'Get a queue number for accounting concerns',
}

export default function DepartmentSelectScreen({ active, onSelectDepartment, onViewMonitor }: DepartmentSelectScreenProps) {
  const depts = Object.keys(DEPARTMENTS) as Department[]
  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <KioskHeader
        title="Select Department"
        subtitle="Which office do you need?"
      />
      <div className="kiosk-body">
        <div className="services-grid">
          {depts.map(dept => (
            <div key={dept} className="service-card department-card" onClick={() => onSelectDepartment(dept)}>
              <div className={`icon ${DEPT_ICON_CLASS[dept]}`}>{DEPARTMENTS[dept].icon}</div>
              <h3>{DEPARTMENTS[dept].label}</h3>
              <p>{DEPT_DESCRIPTION[dept]}</p>
            </div>
          ))}
        </div>
        <div className="monitor-links">
          <span>Just checking the line?</span>
          {depts.map(dept => (
            <button key={dept} className="btn btn-secondary" onClick={() => onViewMonitor(dept)}>
              👥 {DEPARTMENTS[dept].label} Queue
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
