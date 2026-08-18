import { useCallback, useState } from 'react'
import './App.css'
import { useAdminAuth } from './hooks/useAdminAuth'
import { useClock } from './hooks/useClock'
import { useNotification } from './hooks/useNotification'
import { useQueueDB } from './hooks/useQueueDB'
import { useTransactionForms } from './hooks/useTransactionForms'
import { getQueueStats } from './utils/queue'
import AdminLoginScreen from './components/admin/AdminLoginScreen'
import AdminSidebar from './components/admin/AdminSidebar'
import AnalyticsSection from './components/admin/AnalyticsSection'
import DashboardSection from './components/admin/DashboardSection'
import DocumentRequestsSection from './components/admin/DocumentRequestsSection'
import QueueManagementSection from './components/admin/QueueManagementSection'
import SettingsSection from './components/admin/SettingsSection'
import ClaimDocumentScreen from './components/kiosk/ClaimDocumentScreen'
import DocumentRequestScreen from './components/kiosk/DocumentRequestScreen'
import InquiryScreen from './components/kiosk/InquiryScreen'
import MapScreen from './components/kiosk/MapScreen'
import QueueMonitorScreen from './components/kiosk/QueueMonitorScreen'
import QueueResultScreen from './components/kiosk/QueueResultScreen'
import ServicesScreen from './components/kiosk/ServicesScreen'
import StatusCheckScreen from './components/kiosk/StatusCheckScreen'
import WelcomeScreen from './components/kiosk/WelcomeScreen'

function App() {
  const [screen, setScreen] = useState('kiosk-welcome')
  const [queueFilter, setQueueFilter] = useState('pending')
  const [queueSearch, setQueueSearch] = useState('')

  const showScreen = useCallback((id: string) => {
    setScreen(id)
  }, [])

  const { notification, showNotif } = useNotification()
  const { timeStr, dateStr } = useClock()
  const queueDB = useQueueDB({ notify: showNotif })
  const forms = useTransactionForms({ addToQueue: queueDB.addToQueue, notify: showNotif })
  const {
    adminScreen,
    setAdminScreen,
    loginError,
    loginUsername,
    loginPassword,
    setLoginUsername,
    setLoginPassword,
    handleLogin,
    handleLogout,
  } = useAdminAuth({ onNavigate: showScreen })

  const handleAdminNav = useCallback((id: string) => {
    if (id === 'admin-logout') { handleLogout(); return }
    setAdminScreen(id)
  }, [handleLogout, setAdminScreen])

  const stats = getQueueStats(queueDB.db)

  return (
    <div className="app-container">
      {notification && <div className={`notification ${notification.type}`}>{notification.msg}</div>}

      <WelcomeScreen
        active={screen === 'kiosk-welcome'}
        timeStr={timeStr}
        dateStr={dateStr}
        onAdminClick={() => showScreen('admin-login-screen')}
        onStart={() => showScreen('kiosk-services')}
      />

      <ServicesScreen
        active={screen === 'kiosk-services'}
        onNavigate={showScreen}
      />

      <DocumentRequestScreen
        active={screen === 'document-request'}
        entry={forms.lastQueueEntry}
        name={forms.reqName}
        setName={forms.setReqName}
        docType={forms.reqDocType}
        setDocType={forms.setReqDocType}
        purpose={forms.reqPurpose}
        setPurpose={forms.setReqPurpose}
        copies={forms.reqCopies}
        setCopies={forms.setReqCopies}
        onSubmit={forms.handleDocRequest}
        onBack={() => { forms.setLastQueueEntry(null); showScreen('kiosk-services') }}
        onTicketReset={() => forms.setLastQueueEntry(null)}
      />

      <ClaimDocumentScreen
        active={screen === 'claim-document'}
        entry={forms.lastQueueEntry}
        name={forms.claimName}
        setName={forms.setClaimName}
        docType={forms.claimDocType}
        setDocType={forms.setClaimDocType}
        onSubmit={forms.handleClaim}
        onBack={() => { forms.setLastQueueEntry(null); showScreen('kiosk-services') }}
        onTicketReset={() => forms.setLastQueueEntry(null)}
      />

      <InquiryScreen
        active={screen === 'inquiry'}
        entry={forms.lastQueueEntry}
        name={forms.inquiryName}
        setName={forms.setInquiryName}
        message={forms.inquiryMsg}
        setMessage={forms.setInquiryMsg}
        onSubmit={forms.handleInquiry}
        onBack={() => { forms.setLastQueueEntry(null); showScreen('kiosk-services') }}
        onTicketReset={() => forms.setLastQueueEntry(null)}
      />

      <QueueResultScreen
        active={screen === 'queue-result'}
        entry={forms.lastQueueEntry}
        onNavigate={showScreen}
      />

      <QueueMonitorScreen
        active={screen === 'queue-monitor'}
        queue={queueDB.db.queue}
        onCheckStatus={() => showScreen('status-check')}
        onBack={() => showScreen('kiosk-services')}
      />

      <StatusCheckScreen
        active={screen === 'status-check'}
        queue={queueDB.db.queue}
        documents={queueDB.db.documents}
        onBack={() => showScreen('kiosk-services')}
        onShowMap={() => showScreen('interactive-map')}
        notify={showNotif}
      />

      <MapScreen
        active={screen === 'interactive-map'}
        onBack={() => showScreen('kiosk-services')}
      />

      <AdminLoginScreen
        active={screen === 'admin-login-screen'}
        loginError={loginError}
        username={loginUsername}
        password={loginPassword}
        onUsernameChange={setLoginUsername}
        onPasswordChange={setLoginPassword}
        onSubmit={handleLogin}
        onBack={() => showScreen('kiosk-welcome')}
      />

      <div className={`screen${screen === 'admin-panel' ? ' active' : ''}`}>
        <div className="admin-layout">
          <AdminSidebar
            activeScreen={adminScreen}
            pendingCount={stats.pending}
            onNavigate={handleAdminNav}
            onLogout={handleLogout}
          />
          <main className="admin-main">
            <div className="admin-topbar">
              <h2>{({ 'admin-dashboard': 'Dashboard', 'admin-queue': 'Queue Management', 'admin-requests': 'Document Requests', 'admin-analytics': 'Analytics', 'admin-settings': 'Settings' } as Record<string, string>)[adminScreen] || 'Dashboard'}</h2>
              <div className="admin-actions"><span className="date">{dateStr}</span><button className="btn btn-secondary" onClick={() => showScreen('kiosk-welcome')}>← Switch to Kiosk</button></div>
            </div>
            <div className="admin-content">
              <DashboardSection
                active={adminScreen === 'admin-dashboard'}
                stats={stats}
                queue={queueDB.db.queue}
                onViewAllPending={() => { setAdminScreen('admin-queue'); setQueueFilter('pending') }}
              />
              <QueueManagementSection
                active={adminScreen === 'admin-queue'}
                stats={stats}
                queue={queueDB.db.queue}
                filter={queueFilter}
                onFilterChange={setQueueFilter}
                search={queueSearch}
                onSearchChange={setQueueSearch}
                onCallNext={queueDB.callNext}
                onSkip={queueDB.skip}
                onDone={queueDB.done}
                onNoShow={queueDB.noShow}
              />
              <DocumentRequestsSection
                active={adminScreen === 'admin-requests'}
                documents={queueDB.db.documents}
                onUpdateDocStatus={queueDB.updateDocStatus}
              />
              <AnalyticsSection
                active={adminScreen === 'admin-analytics'}
                db={queueDB.db}
              />
              <SettingsSection
                active={adminScreen === 'admin-settings'}
                settingsForm={queueDB.settingsForm}
                onSettingsFormChange={queueDB.setSettingsForm}
                onSave={queueDB.saveSettings}
                onReset={queueDB.resetSystem}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
