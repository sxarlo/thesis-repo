import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { AdminProfile } from '../types/admin'
import type { Department } from '../types/queue'

export interface UseAdminAuthOptions {
  onNavigate: (screen: string) => void
}

export function useAdminAuth({ onNavigate: showScreen }: UseAdminAuthOptions) {
  const [adminScreen, setAdminScreen] = useState('admin-dashboard')
  const [account, setAccount] = useState<AdminProfile | null>(null)
  const [loginError, setLoginError] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const isLoggingInRef = useRef(false)

  // Listen for auth state changes (session expiry, sign out from other tabs)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAccount(null)
        setAdminScreen('admin-dashboard')
        // Skip redirect during login — handleLogin calls signOut() to clear
        // stale sessions before signInWithPassword(), which fires this listener
        // with session=null. The login handler navigates to admin-panel on success.
        if (isLoggingInRef.current) return
        showScreen('kiosk-welcome')
      }
    })
    return () => subscription.unsubscribe()
  }, [showScreen])

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(false)
    setLoginLoading(true)
    isLoggingInRef.current = true

    try {
      // Clear any stale session before logging in
      await supabase.auth.signOut()

      // Step 1: Look up admin profile by username to get email
      const { data: profile, error: profileError } = await supabase
        .from('admin_profiles')
        .select('id, email, username, display_name, role, department')
        .eq('username', loginUsername)
        .eq('is_active', true)
        .single()

      if (profileError || !profile) {
        setLoginError(true)
        return
      }

      // Step 2: Sign in with Supabase Auth using the email
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: loginPassword,
      })

      if (authError) {
        setLoginError(true)
        return
      }

      // Step 3: Store the admin profile
      setAccount({
        id: profile.id,
        email: profile.email,
        username: profile.username,
        display_name: profile.display_name,
        role: profile.role,
        department: profile.department as Department,
      })
      setAdminScreen('admin-dashboard')
      showScreen('admin-panel')
    } catch {
      setLoginError(true)
    } finally {
      isLoggingInRef.current = false
      setLoginLoading(false)
    }
  }, [loginUsername, loginPassword, showScreen])

  const handleLogout = useCallback(async () => {
    // Replace current history entry so Back cannot restore admin panel
    window.history.replaceState(null, '', window.location.href)
    window.history.replaceState(null, '', window.location.href)

    await supabase.auth.signOut()
    setAccount(null)
    setAdminScreen('admin-dashboard')
    setLoginUsername('')
    setLoginPassword('')
    setLoginError(false)
    showScreen('kiosk-welcome')
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
    loginLoading,
    handleLogin,
    handleLogout,
  }
}
