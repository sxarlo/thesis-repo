interface AdminLoginScreenProps {
  active: boolean
  loginError: boolean
  username: string
  password: string
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  showPassword: boolean
  onShowPasswordChange: (checked: boolean) => void
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
  showPassword,
  onShowPasswordChange,
  onSubmit,
  onBack,
}: AdminLoginScreenProps) {
  return (
    <div className={`screen${active ? ' active' : ''}`}>
      <div className="login-screen">
        <div className="login-card">
          <div className="logo-area"><div className="logo-icon"><img src="/celp-logo.svg" alt="CEU" /></div><h2>Admin Login</h2><p>Smart Queue Management System — CEU Malolos</p></div>
          <form onSubmit={onSubmit}>
            <div className={`login-error${loginError ? ' show' : ''}`}>Invalid username or password.</div>
            <div className="form-group"><label>Username</label><input type="text" placeholder="Enter admin username" required value={username} onChange={e => onUsernameChange(e.target.value)} /></div>
            <div className="form-group"><label>Password</label><input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" required value={password} onChange={e => onPasswordChange(e.target.value)} /></div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--gray-600)', cursor: 'pointer', marginBottom: 14, userSelect: 'none' }}>
              <input type="checkbox" checked={showPassword} onChange={e => onShowPasswordChange(e.target.checked)} />
              Show password
            </label>
            <button type="submit" className="btn btn-primary btn-block btn-lg">Sign In</button>
            <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--gray-50)', borderRadius: 8, fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--gray-600)' }}>Demo accounts:</strong><br />
              Registrar — admin / admin123<br />
              Cashier — cashier / cashier123<br />
              Accounting — accounting / acctg123
            </div>
            <div className="text-center mt-16"><button type="button" className="btn btn-secondary" onClick={onBack}>← Back to Kiosk</button></div>
          </form>
        </div>
      </div>
    </div>
  )
}
