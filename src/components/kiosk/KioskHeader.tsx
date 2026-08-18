import type { ReactNode } from 'react'

interface KioskHeaderProps {
  title: string
  subtitle: string
  right?: ReactNode
}

export default function KioskHeader({ title, subtitle, right }: KioskHeaderProps) {
  return (
    <div className="kiosk-header">
      <div className="kiosk-header-left">
        <div className="kiosk-logo"><img src="/celp-logo.svg" alt="CEU" /></div>
        <div className="kiosk-title"><h1>{title}</h1><span>{subtitle}</span></div>
      </div>
      <div className="kiosk-header-right">{right}</div>
    </div>
  )
}
