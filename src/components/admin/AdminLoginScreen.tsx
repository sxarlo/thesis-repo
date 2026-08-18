interface AdminLoginScreenProps {
  active: boolean
  loginError: boolean
  username: string
  password: string
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
}

export default function AdminLoginScreen({
  active,
  loginError,
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onBack,
}: AdminLoginScreenProps) {
  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <div className="login-screen">
        <div className="login-card">
          <div className="logo-area"><div className="logo-icon"><img src="/celp-logo.svg" alt="CEU" /></div><h2>Admin Login</h2><p>Smart Registrar Service Kiosk — CEU Malolos</p></div>
          <form onSubmit={onSubmit}>
            <div className={`login-error${loginError ? ' show' : ''}`}>Invalid username or password.</div>
            <div className="form-group"><label>Username</label><input type="text" placeholder="Enter admin username" required value={username} onChange={e => onUsernameChange(e.target.value)} /></div>
            <div className="form-group"><label>Password</label><input type="password" placeholder="Enter your password" required value={password} onChange={e => onPasswordChange(e.target.value)} /></div>
            <button type="submit" className="btn btn-primary btn-block btn-lg">Sign In</button>
            <div className="text-center mt-16"><button type="button" className="btn btn-secondary" onClick={onBack}>← Back to Kiosk</button></div>
          </form>
        </div>
      </div>
    </div>
  )
}
