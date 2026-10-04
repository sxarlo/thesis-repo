import IndoorMap from '../../features/indoorMap/IndoorMap'
import '../../features/indoorMap/indoor-map.css'
import KioskHeader from './KioskHeader'

interface MapScreenProps {
  active: boolean
  onBack: () => void
}

export default function MapScreen({ active, onBack }: MapScreenProps) {
  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <KioskHeader
        title="Campus Map & Wayfinder"
        subtitle="Find any room and get easy, step-by-step walking directions"
        right={<button className="back-btn" onClick={onBack}>← Back</button>}
      />
      <div className="kiosk-body">
        <IndoorMap />
      </div>
    </div>
  )
}
