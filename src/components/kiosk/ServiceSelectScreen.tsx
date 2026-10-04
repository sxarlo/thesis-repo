import KioskHeader from './KioskHeader'

interface ServiceSelectScreenProps {
  active: boolean
  onBack: () => void
  onCreateQueue: () => void
  onExploreMap: () => void
}

export default function ServiceSelectScreen({ active, onBack, onCreateQueue, onExploreMap }: ServiceSelectScreenProps) {
  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <KioskHeader
        title="Select a Service"
        subtitle="How can we help you today?"
        right={<button className="back-btn" onClick={onBack}>← Back</button>}
      />
      <div className="kiosk-body">
        <div className="service-select">
          <div className="service-select-intro">
            <h2>Welcome</h2>
            <p>Please select a service to continue.</p>
          </div>
          <div className="service-select-grid">
            <div className="service-card" onClick={onCreateQueue}>
              <div className="icon pink">🎫</div>
              <h3>CREATE A QUEUE TICKET</h3>
              <p>Get a queue number for the Registrar, Cashier, or Accounting</p>
            </div>
            <div className="service-card" onClick={onExploreMap}>
              <div className="icon gold">🗺️</div>
              <h3>EXPLORE THE MAP</h3>
              <p>Find any room and get step-by-step walking directions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
