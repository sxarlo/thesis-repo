import { useEffect, useRef } from 'react'

interface UseHiddenAdminGestureOptions {
  enabled: boolean
  requiredClicks?: number
  timeoutMs?: number
  onTrigger: () => void
}

export function useHiddenAdminGesture({
  enabled,
  requiredClicks = 5,
  timeoutMs = 2500,
  onTrigger,
}: UseHiddenAdminGestureOptions) {
  const clickCountRef = useRef(0)
  const resetTimerRef = useRef<number | null>(null)
  const onTriggerRef = useRef(onTrigger)

  useEffect(() => {
    onTriggerRef.current = onTrigger
  }, [onTrigger])

  useEffect(() => {
    if (!enabled) return

    const handleClick = (event: MouseEvent) => {
      if (event.button !== 0) return

      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
        resetTimerRef.current = null
      }

      clickCountRef.current += 1

      if (clickCountRef.current >= requiredClicks) {
        clickCountRef.current = 0
        onTriggerRef.current()
        return
      }

      resetTimerRef.current = window.setTimeout(() => {
        clickCountRef.current = 0
        resetTimerRef.current = null
      }, timeoutMs)
    }

    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('click', handleClick)
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
        resetTimerRef.current = null
      }
      clickCountRef.current = 0
    }
  }, [enabled, requiredClicks, timeoutMs])
}
