import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { ADMIN_ACCOUNTS } from './config'
import { useAdminAuth } from './hooks/useAdminAuth'
import { useClock } from './hooks/useClock'
import { useHiddenAdminGesture } from './hooks/useHiddenAdminGesture'
import { useKioskHistory } from './hooks/useKioskHistory'
import { useNotification } from './hooks/useNotification'
import { useQueueDB } from './hooks/useQueueDB'
import { useTransactionForms } from './hooks/useTransactionForms'
import AdminLoginScreen from './components/admin/AdminLoginScreen'
import AdminPanel from './components/admin/AdminPanel'
import ClaimDocumentScreen from './components/kiosk/ClaimDocumentScreen'
import DepartmentSelectScreen from './components/kiosk/DepartmentSelectScreen'
import DirectQueueScreen from './components/kiosk/DirectQueueScreen'
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

  const showScreen = useCallback((id: string) => {
    setScreen(id)
  }, [])

  useKioskHistory(screen, showScreen)

  useHiddenAdminGesture({
    enabled: screen === 'select-department',
    onTrigger: () => showScreen('admin-login-screen'),
  })

  const { notification, showNotif } = useNotification()
  const { timeStr, dateStr } = useClock()
  const queueDB = useQueueDB({ notify: showNotif })
  const forms = useTransactionForms({ addToQueue: queueDB.addToQueue, notify: showNotif })
  const {
    adminScreen,
    setAdminScreen,
    account,
    department,
    loginError,
    setLoginError,
    loginUsername,
    loginPassword,
    setLoginUsername,
    setLoginPassword,
    showPassword,
    setShowPassword,
    handleLogin,
    handleLogout,
  } = useAdminAuth({ onNavigate: showScreen })

  useEffect(() => {
    if (screen !== 'admin-login-screen') return
    setLoginUsername('')
    setLoginPassword('')
    setShowPassword(false)
    setLoginError(false)
  }, [screen, setLoginUsername, setLoginPassword, setShowPassword, setLoginError])

  return (
    <div className="app-container">
      {notification && <div className={`notification ${notification.type}`}>{notification.msg}</div>}

      {/* ---- KIOSK SCREENS ---- */}
      <WelcomeScreen
        active={screen === 'kiosk-welcome'}
        timeStr={timeStr}
        dateStr={dateStr}
        onAdminClick={() => showScreen('admin-login-screen')}
        onStart={() => showScreen('select-department')}
      />

      <DepartmentSelectScreen
        active={screen === 'select-department'}
        onSelectDepartment={dept => {
          forms.setLastQueueEntry(null)
          showScreen(dept === 'registrar' ? 'kiosk-services' : `${dept}-queue`)
        }}
        onViewMonitor={dept => showScreen(`monitor-${dept}`)}
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

      <DirectQueueScreen
        active={screen === 'cashier-queue'}
        department="cashier"
        entry={forms.lastQueueEntry}
        name={forms.directName}
        setName={forms.setDirectName}
        sid={forms.directSid}
        setSid={forms.setDirectSid}
        customerType={forms.directCustomerType}
        setCustomerType={forms.setDirectCustomerType}
        onSubmit={e => forms.handleDirectQueue(e, 'cashier')}
        onBack={() => { forms.setLastQueueEntry(null); showScreen('select-department') }}
        onTicketReset={() => forms.setLastQueueEntry(null)}
      />

      <DirectQueueScreen
        active={screen === 'accounting-queue'}
        department="accounting"
        entry={forms.lastQueueEntry}
        name={forms.directName}
        setName={forms.setDirectName}
        sid={forms.directSid}
        setSid={forms.setDirectSid}
        customerType={forms.directCustomerType}
        setCustomerType={forms.setDirectCustomerType}
        onSubmit={e => forms.handleDirectQueue(e, 'accounting')}
        onBack={() => { forms.setLastQueueEntry(null); showScreen('select-department') }}
        onTicketReset={() => forms.setLastQueueEntry(null)}
      />

      <QueueMonitorScreen
        active={screen === 'monitor-registrar'}
        department="registrar"
        queue={queueDB.db.queue}
        onCheckStatus={() => showScreen('status-check')}
        onBack={() => showScreen('select-department')}
      />

      <QueueMonitorScreen
        active={screen === 'monitor-cashier'}
        department="cashier"
        queue={queueDB.db.queue}
        onCheckStatus={() => showScreen('status-check')}
        onBack={() => showScreen('select-department')}
      />

      <QueueMonitorScreen
        active={screen === 'monitor-accounting'}
        department="accounting"
        queue={queueDB.db.queue}
        onCheckStatus={() => showScreen('status-check')}
        onBack={() => showScreen('select-department')}
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

      {/* ---- ADMIN ---- */}
      <AdminLoginScreen
        active={screen === 'admin-login-screen'}
        loginError={loginError}
        username={loginUsername}
        password={loginPassword}
        onUsernameChange={setLoginUsername}
        onPasswordChange={setLoginPassword}
        showPassword={showPassword}
        onShowPasswordChange={setShowPassword}
        onSubmit={handleLogin}
        onBack={() => showScreen('kiosk-welcome')}
      />

      <AdminPanel
        active={screen === 'admin-panel'}
        adminScreen={adminScreen}
        setAdminScreen={setAdminScreen}
        account={account ?? ADMIN_ACCOUNTS[0]}
        department={department}
        queueDB={queueDB}
        onLogout={handleLogout}
        onSwitchToKiosk={() => showScreen('kiosk-welcome')}
        dateStr={dateStr}
      />
    </div>
  )
}

export default App
