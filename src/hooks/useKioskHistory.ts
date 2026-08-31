import { useEffect, useRef } from 'react'

interface KioskHistoryState {
  sessionId: number
  screen: string
}

export function useKioskHistory(
  screen: string,
  showScreen: (id: string) => void,
) {
  const sessionIdRef = useRef(0)
  const screenRef = useRef(screen)
  const skipNextPushRef = useRef(false)
  const mountedRef = useRef(false)

  useEffect(() => {
    screenRef.current = screen
  })

  useEffect(() => {
    const sessionId = Date.now()
    sessionIdRef.current = sessionId

    window.history.replaceState(null, '')

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as KioskHistoryState | null
      if (state && state.sessionId === sessionId && typeof state.screen === 'string') {
        skipNextPushRef.current = true
        showScreen(state.screen)
        return
      }
      window.history.pushState(
        { sessionId, screen: screenRef.current } satisfies KioskHistoryState,
        '',
      )
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [showScreen])

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    if (skipNextPushRef.current) {
      skipNextPushRef.current = false
      return
    }
    window.history.pushState(
      { sessionId: sessionIdRef.current, screen } satisfies KioskHistoryState,
      '',
    )
  }, [screen])
}
