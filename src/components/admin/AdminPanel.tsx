import { useCallback, useState } from 'react'
import { DEPARTMENTS } from '../../config'
import type { AdminProfile } from '../../types/admin'
import type { Department } from '../../types/queue'
import type { DB, SettingsForm } from '../../types/queue'
import { getDepartmentStats } from '../../utils/queue'
import AdminSidebar from './AdminSidebar'
import DashboardSection from './DashboardSection'
import QueueManagementSection from './QueueManagementSection'
import DocumentRequestsSection from './DocumentRequestsSection'
import AnalyticsSection from './AnalyticsSection'
import SettingsSection from './SettingsSection'

interface QueueDB {
  db: DB
  settingsForm: SettingsForm
  setSettingsForm: React.Dispatch<React.SetStateAction<SettingsForm>>
  callNext: (department: Department) => void | Promise<void>
  skip: (id: string) => void | Promise<void>
  done: (id: string) => void | Promise<void>
  noShow: (id: string) => void | Promise<void>
  transferTicket: (id: string, target: Department) => void | Promise<void>
  updateDocStatus: (docId: string, status: string) => void | Promise<void>
  saveSettings: () => void
  resetSystem: () => void
}

interface AdminPanelProps {
  active: boolean
  adminScreen: string
  setAdminScreen: (screen: string) => void
  account: AdminProfile
  department: Department
  queueDB: QueueDB
  onRequestLogout: () => void
  onSwitchToKiosk: () => void
  dateStr: string
}

export default function AdminPanel({
  active,
  adminScreen,
  setAdminScreen,
  account,
  department,
  queueDB,
  onRequestLogout,
  onSwitchToKiosk,
  dateStr,
}: AdminPanelProps) {
  const [queueFilter, setQueueFilter] = useState('pending')
  const [queueSearch, setQueueSearch] = useState('')

  const deptStats = getDepartmentStats(queueDB.db, department)
  const deptQueue = queueDB.db.queue.filter(q => q.department === department)
  const isRegistrar = department === 'registrar'

  const handleAdminNav = useCallback((id: string) => {
    setAdminScreen(id)
  }, [setAdminScreen])

  const handleTransfer = useCallback((id: string, target: Department) => {
    queueDB.transferTicket(id, target)
  }, [queueDB])

  const headingMap: Record<string, string> = {
    'admin-dashboard': `${DEPARTMENTS[department].label} Dashboard`,
    'admin-queue': 'Queue Management',
    'admin-requests': 'Document Requests',
    'admin-analytics': 'Analytics',
    'admin-settings': 'Settings',
  }

  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <div className="admin-layout">
        <AdminSidebar
          activeScreen={adminScreen}
          department={department}
          account={account}
          pendingCount={deptStats.pending}
          onNavigate={handleAdminNav}
          onRequestLogout={onRequestLogout}
        />
        <main className="admin-main">
          <div className="admin-topbar">
            <h2>{headingMap[adminScreen] || `${DEPARTMENTS[department].label} Dashboard`}</h2>
            <div className="admin-actions">
              <span className="date">{dateStr}</span>
              <button className="btn btn-secondary" onClick={onSwitchToKiosk}>← Switch to Kiosk</button>
            </div>
          </div>
          <div className="admin-content">
            <DashboardSection
              active={adminScreen === 'admin-dashboard'}
              stats={deptStats}
              queue={deptQueue}
              onViewAllPending={() => { setAdminScreen('admin-queue'); setQueueFilter('pending') }}
            />
            <QueueManagementSection
              active={adminScreen === 'admin-queue'}
              stats={deptStats}
              queue={deptQueue}
              filter={queueFilter}
              onFilterChange={setQueueFilter}
              search={queueSearch}
              onSearchChange={setQueueSearch}
              onCallNext={() => queueDB.callNext(department)}
              onSkip={queueDB.skip}
              onDone={queueDB.done}
              onNoShow={queueDB.noShow}
              transferTargets={DEPARTMENTS[department].transferTargets}
              onTransfer={handleTransfer}
            />
            {isRegistrar && (
              <DocumentRequestsSection
                active={adminScreen === 'admin-requests'}
                documents={queueDB.db.documents}
                onUpdateDocStatus={queueDB.updateDocStatus}
              />
            )}
            {isRegistrar && (
              <AnalyticsSection
                active={adminScreen === 'admin-analytics'}
                db={queueDB.db}
              />
            )}
            {isRegistrar && (
              <SettingsSection
                active={adminScreen === 'admin-settings'}
                settingsForm={queueDB.settingsForm}
                onSettingsFormChange={queueDB.setSettingsForm}
                onSave={queueDB.saveSettings}
                onReset={queueDB.resetSystem}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
