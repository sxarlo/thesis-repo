import KioskHeader from './KioskHeader'

interface WelcomeScreenProps {
  active: boolean
  timeStr: string
  dateStr: string
  onAdminClick: () => void
  onStart: () => void
}

export default function WelcomeScreen({ active, timeStr, dateStr, onAdminClick, onStart }: WelcomeScreenProps) {
  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <KioskHeader
        title="Smart Registrar Service Kiosk"
        subtitle="Centro Escolar University - Malolos"
        right={
          <>
            <div className="kiosk-time"><span className="time">{timeStr}</span><span className="date" style={{ fontSize: 11, opacity: 0.7 }}>{dateStr}</span></div>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'var(--white)', padding: '8px 16px', fontSize: 12, borderRadius: 8 }} onClick={onAdminClick}>Admin</button>
          </>
        }
      />
      <div className="kiosk-body">
        <div className="welcome-screen">
          <div className="welcome-icon">🎓</div>
          <div className="welcome-content"><h2>Welcome to CEU Registrar</h2><p>Your self-service platform for document requests, queue management, and registrar office navigation.</p></div>
          <button className="welcome-btn" onClick={onStart}><span>Touch to Start</span> <span>→</span></button>
        </div>
      </div>
    </div>
  )
}
