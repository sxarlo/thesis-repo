import { useEffect, useRef, useState } from 'react'
import { CONFIG } from '../../config'
import { getRooms, renderMap } from '../../utils/map'
import KioskHeader from './KioskHeader'

interface MapScreenProps {
  active: boolean
  onBack: () => void
}

export default function MapScreen({ active, onBack }: MapScreenProps) {
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null)
  const [hoveredOffice, setHoveredOffice] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const r = canvas.parentElement?.getBoundingClientRect()
      if (!r) return
      canvas.width = r.width
      canvas.height = r.height
      renderMap(canvas, selectedOffice, hoveredOffice)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [active, selectedOffice, hoveredOffice])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return
    renderMap(canvas, selectedOffice, hoveredOffice)
  }, [selectedOffice, hoveredOffice, active])

  const handleMapClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const r = canvas.getBoundingClientRect()
    const x = (e.clientX - r.left) * (canvas.width / r.width)
    const y = (e.clientY - r.top) * (canvas.height / r.height)
    const rooms = getRooms(canvas.width, canvas.height)
    const clicked = rooms.find(rm => x >= rm.x && x <= rm.x + rm.w && y >= rm.y && y <= rm.y + rm.h)
    if (clicked) setSelectedOffice(clicked.id)
  }

  const handleMapMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const r = canvas.getBoundingClientRect()
    const x = (e.clientX - r.left) * (canvas.width / r.width)
    const y = (e.clientY - r.top) * (canvas.height / r.height)
    const rooms = getRooms(canvas.width, canvas.height)
    const hov = rooms.find(rm => x >= rm.x && x <= rm.x + rm.w && y >= rm.y && y <= rm.y + rm.h)
    const id = hov ? hov.id : null
    setHoveredOffice(id)
    canvas.style.cursor = hov ? 'pointer' : 'default'
  }

  const selectedOfficeInfo = selectedOffice ? CONFIG.offices.find(o => o.id === selectedOffice) : null

  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <KioskHeader
        title="Interactive Map"
        subtitle="Find your way around"
        right={<button className="back-btn" onClick={onBack}>← Back</button>}
      />
      <div className="kiosk-body">
        <div className="map-container">
          <div className="map-canvas-area"><canvas ref={canvasRef} onClick={handleMapClick} onMouseMove={handleMapMove}></canvas></div>
          <div className="map-legend">
            <h3>Offices &amp; Areas</h3>
            <div className="map-offices">
              {CONFIG.offices.map(o => (
                <button key={o.id} className={`map-office-btn${selectedOffice === o.id ? ' active' : ''}`} onClick={() => setSelectedOffice(o.id)}>
                  <span className="dot" style={{ background: o.color }}></span><span className="name">{o.name}</span>
                </button>
              ))}
            </div>
            <div className="map-office-info">
              {selectedOfficeInfo ? (
                <><div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}><div style={{ width: 16, height: 16, borderRadius: 4, background: selectedOfficeInfo.color, flexShrink: 0 }}></div><h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-800)' }}>{selectedOfficeInfo.name}</h4></div><p style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.5 }}>{selectedOfficeInfo.info}</p></>
              ) : (
                <p style={{ color: 'var(--gray-400)', fontSize: 13 }}>Click a room or select an office.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
