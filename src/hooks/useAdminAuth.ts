import { useCallback, useState } from 'react'
import { ADMIN_ACCOUNTS } from '../config'
import type { AdminAccount } from '../config'
import type { Department } from '../types/queue'

export interface UseAdminAuthOptions {
  onNavigate: (screen: string) => void
}

export function useAdminAuth({ onNavigate: showScreen }: UseAdminAuthOptions) {
  const [adminScreen, setAdminScreen] = useState('admin-dashboard')
  const [account, setAccount] = useState<AdminAccount | null>(null)
  const [loginError, setLoginError] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const matched = ADMIN_ACCOUNTS.find(
      a => a.username === loginUsername && a.password === loginPassword
    )
    if (matched) {
      setLoginError(false)
      setAccount(matched)
      setAdminScreen('admin-dashboard')
      showScreen('admin-panel')
    } else {
      setLoginError(true)
    }
  }, [loginUsername, loginPassword, showScreen])

  const handleLogout = useCallback(() => {
    setAccount(null)
    showScreen('admin-login-screen')
  }, [showScreen])

  return {
    adminScreen,
    setAdminScreen,
    account,
    department: (account?.department ?? 'registrar') as Department,
    loginError,
    setLoginError,
    loginUsername,
    loginPassword,
    setLoginUsername,
    setLoginPassword,
    showPassword,
    setShowPassword,
    handleLogin,
    handleLogout,
  }
}
