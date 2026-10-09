import { useEffect, useRef, useState, type ReactNode } from 'react'

interface KioskHeaderProps {
  title: string
  subtitle: string
  right?: ReactNode
  /**
   * Hidden maintenance gesture: five rapid taps on the branding area opens the
   * admin login. Omit the prop and the branding stays completely inert.
   */
  onBrandingTap?: () => void
}

const TAP_TARGET = 5
const TAP_RESET_MS = 2500

export default function KioskHeader({ title, subtitle, right, onBrandingTap }: KioskHeaderProps) {
  const [tapCount, setTapCount] = useState(0)
  const tapTimerRef = useRef<number | null>(null)

  // Never leave an inactivity timer behind when the screen unmounts.
  useEffect(
    () => () => {
      if (tapTimerRef.current !== null) window.clearTimeout(tapTimerRef.current)
      tapTimerRef.current = null
    },
    [],
  )

  const handleBrandingTap = () => {
    if (!onBrandingTap) return

    if (tapTimerRef.current !== null) {
      window.clearTimeout(tapTimerRef.current)
      tapTimerRef.current = null
    }

    const nextCount = tapCount + 1

    if (nextCount >= TAP_TARGET) {
      setTapCount(0)
      onBrandingTap()
      return
    }

    setTapCount(nextCount)
    tapTimerRef.current = window.setTimeout(() => {
      setTapCount(0)
      tapTimerRef.current = null
    }, TAP_RESET_MS)
  }

  return (
    <div className="kiosk-header">
      <div
        className={`kiosk-header-left${onBrandingTap ? ' kiosk-tappable' : ''}`}
        onClick={onBrandingTap ? handleBrandingTap : undefined}
      >
        <div className="kiosk-logo"><img src="/celp-logo.svg" alt="CEU" /></div>
        <div className="kiosk-title"><h1>{title}</h1><span>{subtitle}</span></div>
      </div>
      <div className="kiosk-header-right">{right}</div>
    </div>
  )
}
