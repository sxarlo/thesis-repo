import KioskHeader from './KioskHeader'

interface ServicesScreenProps {
  active: boolean
  onNavigate: (screen: string) => void
}

export default function ServicesScreen({ active, onNavigate }: ServicesScreenProps) {
  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <KioskHeader
        title="Registrar Services"
        subtitle="Choose a registrar transaction"
        right={<button className="back-btn" onClick={() => onNavigate('select-department')}>← Back</button>}
      />
      <div className="kiosk-body">
        <div className="services-grid">
          <div className="service-card" onClick={() => onNavigate('document-request')}><div className="icon pink">📄</div><h3>Request Document</h3><p>Request TOR, COE, Diploma, and other academic documents</p></div>
          <div className="service-card" onClick={() => onNavigate('claim-document')}><div className="icon blue">📥</div><h3>Claim Document</h3><p>Claim your requested or processed documents</p></div>
          <div className="service-card" onClick={() => onNavigate('inquiry')}><div className="icon gold">❓</div><h3>Registrar Inquiry</h3><p>Ask questions about registrar procedures and services</p></div>
          <div className="service-card" onClick={() => onNavigate('monitor-registrar')}><div className="icon pink">👥</div><h3>View Queue</h3><p>See which number is being served and who is next</p></div>
          <div className="service-card" onClick={() => onNavigate('status-check')}><div className="icon blue">🔍</div><h3>Check Transaction Status</h3><p>Track the status of your document request</p></div>
          <div className="service-card" onClick={() => onNavigate('interactive-map')}><div className="icon gold">📍</div><h3>Interactive Map</h3><p>Find offices, counters, and service areas</p></div>
        </div>
      </div>
    </div>
  )
}
