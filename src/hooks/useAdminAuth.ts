import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { AdminProfile } from '../types/admin'
import type { Department } from '../types/queue'

export interface UseAdminAuthOptions {
  onNavigate: (screen: string) => void
}

const PROFILE_COLUMNS = 'id, email, username, display_name, role, department, is_active'

interface ProfileRow {
  id: string
  email: string
  username: string
  display_name: string
  role: string
  department: string
  is_active: boolean
}

function toProfile(row: ProfileRow): AdminProfile {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    display_name: row.display_name,
    role: row.role,
    department: row.department as Department,
    is_active: row.is_active,
  }
}

export function useAdminAuth({ onNavigate: showScreen }: UseAdminAuthOptions) {
  const [adminScreen, setAdminScreen] = useState('admin-dashboard')
  const [account, setAccount] = useState<AdminProfile | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
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

  // Restore admin identity from an existing session (survives page refresh).
  // The profile is re-read from admin_profiles for the session user; if it is
  // missing or deactivated, the session is revoked and account stays null.
  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (cancelled || !session) return

        const { data: profile, error } = await supabase
          .from('admin_profiles')
          .select(PROFILE_COLUMNS)
          .eq('id', session.user.id)
          .maybeSingle()

        if (cancelled) return

        if (error) {
          // Could not verify the profile (e.g. transient failure): deny the
          // admin UI for this load without destroying a valid session.
          setAccount(null)
        } else if (!profile || !profile.is_active) {
          // Profile missing or deactivated: revoke the session entirely.
          await supabase.auth.signOut()
          setAccount(null)
        } else {
          setAccount(toProfile(profile))
          setAdminScreen('admin-dashboard')
        }
      } catch {
        if (!cancelled) setAccount(null)
      } finally {
        if (!cancelled) setSessionReady(true)
      }
    }

    restoreSession()
    return () => { cancelled = true }
  }, [])

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(false)
    setLoginLoading(true)
    isLoggingInRef.current = true

    try {
      // Clear any stale session before logging in
      await supabase.auth.signOut()

      // Step 1: Look up admin profile by username to get email (anon — runs
      // before sign-in; requires the anon SELECT policy on admin_profiles)
      const { data: profile, error: profileError } = await supabase
        .from('admin_profiles')
        .select(PROFILE_COLUMNS)
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
      setAccount(toProfile(profile))
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
    sessionReady,
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
