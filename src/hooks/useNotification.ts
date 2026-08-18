import { useCallback, useEffect, useRef, useState } from 'react'

export function useNotification() {
  const [notification, setNotification] = useState<{ msg: string; type: string } | null>(null)
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showNotif = useCallback((msg: string, type: string = 'success') => {
    if (notifTimer.current) clearTimeout(notifTimer.current)
    setNotification({ msg, type })
    notifTimer.current = setTimeout(() => {
      setNotification(null)
    }, 3500)
  }, [])

  useEffect(() => {
    return () => { if (notifTimer.current) clearTimeout(notifTimer.current) }
  }, [])

  return { notification, showNotif }
}
