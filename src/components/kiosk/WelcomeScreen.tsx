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
    <div className={`screen${active ? ' active' : ''} welcome-home`}>
      <KioskHeader
        title="University Service Kiosk"
        subtitle="Centro Escolar University - Malolos"
        onBrandingTap={onAdminClick}
        right={
          <div className="kiosk-time"><span className="time">{timeStr}</span><span className="date" style={{ fontSize: 11 }}>{dateStr}</span></div>
        }
      />
      <div className="kiosk-body">
        <div className="welcome-screen">
          <div className="welcome-icon">🎓</div>
          <div className="welcome-content"><h2>Welcome to CEU</h2><p>Get a queue ticket or explore the campus map. Touch start to continue.</p></div>
          <button className="welcome-btn" onClick={onStart}><span>Touch to Start</span> <span>→</span></button>
        </div>
      </div>
    </div>
  )
}
