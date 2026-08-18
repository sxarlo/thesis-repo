import { useCallback, useState } from 'react'
import { ADMIN_CREDENTIALS } from '../config'

export interface UseAdminAuthOptions {
  onNavigate: (screen: string) => void
}

export function useAdminAuth({ onNavigate: showScreen }: UseAdminAuthOptions) {
  const [adminScreen, setAdminScreen] = useState('admin-dashboard')
  const [, setLoggedIn] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (loginUsername === ADMIN_CREDENTIALS.username && loginPassword === ADMIN_CREDENTIALS.password) {
      setLoginError(false)
      setLoggedIn(true)
      setAdminScreen('admin-dashboard')
      showScreen('admin-panel')
    } else {
      setLoginError(true)
    }
  }, [loginUsername, loginPassword, showScreen])

  const handleLogout = useCallback(() => {
    setLoggedIn(false)
    showScreen('admin-login-screen')
  }, [showScreen])

  return {
    adminScreen,
    setAdminScreen,
    loginError,
    loginUsername,
    loginPassword,
    setLoginUsername,
    setLoginPassword,
    handleLogin,
    handleLogout,
  }
}
