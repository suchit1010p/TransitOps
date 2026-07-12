import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

// Static demo credentials — no backend needed for now
const DEMO_USERS = [
  { email: 'fleet@transitops.in',     password: 'fleet123',     role: 'Fleet Manager' },
  { email: 'dispatch@transitops.in',  password: 'dispatch123',  role: 'Dispatcher' },
  { email: 'safety@transitops.in',    password: 'safety123',    role: 'Safety Officer' },
  { email: 'finance@transitops.in',   password: 'finance123',   role: 'Financial Analyst' },
]

const MAX_ATTEMPTS = 5

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Dispatcher')
  const [attempts, setAttempts] = useState(0)
  const [error, setError] = useState(null)
  const [locked, setLocked] = useState(false)

  const handleSignIn = () => {
    if (locked) return

    const match = DEMO_USERS.find(
      (u) => u.email === email && u.password === password && u.role === role
    )

    if (match) {
      setError(null)
      setAttempts(0)
      navigate('/dashboard')
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= MAX_ATTEMPTS) {
        setLocked(true)
        setError({ type: 'locked', remaining: 0 })
      } else {
        setError({ type: 'invalid', remaining: MAX_ATTEMPTS - newAttempts })
      }
    }
  }

  return (
    <div className="login-page">
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-logo-box">
          <div className="login-logo-icon">⊞</div>
          <div className="login-brand">TransitOps</div>
          <div className="login-tagline">Smart Transport Operations Platform</div>
        </div>

        {/* Demo Credentials Hint */}
        <div className="login-demo-box">
          <div className="login-demo-title">🔑 Demo Credentials</div>
          {DEMO_USERS.map((u) => (
            <div
              key={u.role}
              className="login-demo-row"
              onClick={() => { setEmail(u.email); setPassword(u.password); setRole(u.role) }}
              title="Click to auto-fill"
            >
              <span className="login-demo-role">{u.role}</span>
              <span className="login-demo-email">{u.email}</span>
            </div>
          ))}
          <div className="login-demo-hint">↑ Click any row to auto-fill</div>
        </div>

        <div className="login-roles">
          <div className="login-roles-title">One login, four roles:</div>
          <ul className="login-roles-list">
            <li><span className="dot" />Fleet Manager</li>
            <li><span className="dot" />Dispatcher</li>
            <li><span className="dot" />Safety Officer</li>
            <li><span className="dot" />Financial Analyst</li>
          </ul>
        </div>
        <div className="login-footer">TRANSITOPS © 2026 · RBAC ENAI</div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-form-card">
          <h1 className="login-title">Sign in to your account</h1>
          <p className="login-subtitle">Enter your credentials to continue</p>

          {/* Error — only shown after failed attempt(s) */}
          {error && (
            <div className={`login-error-box ${error.type === 'locked' ? 'locked' : ''}`}>
              {error.type === 'locked' ? (
                <>
                  <div className="login-error-label">🔒 Account Locked</div>
                  <div className="login-error-item">Too many failed attempts. Account is temporarily locked.</div>
                  <div className="login-error-item" style={{ marginTop: 4, color: '#fca5a5' }}>
                    Contact your administrator to unlock.
                  </div>
                </>
              ) : (
                <>
                  <div className="login-error-label">✕ Invalid Credentials</div>
                  <div className="login-error-item">Email, password, or role does not match.</div>
                  <div className="login-error-item" style={{ marginTop: 4, color: '#fca5a5' }}>
                    {error.remaining} attempt{error.remaining !== 1 ? 's' : ''} remaining before account lock.
                  </div>
                </>
              )}
            </div>
          )}

          <div className="login-field-group">
            <label className="login-label">EMAIL</label>
            <input
              className={`login-input ${error ? 'input-error' : ''}`}
              type="email"
              placeholder="e.g. dispatch@transitops.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={locked}
            />
          </div>

          <div className="login-field-group">
            <label className="login-label">PASSWORD</label>
            <input
              className={`login-input ${error ? 'input-error' : ''}`}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={locked}
            />
          </div>

          <div className="login-field-group">
            <label className="login-label">ROLE (RBAC)</label>
            <select
              className="login-input login-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={locked}
            >
              <option>Dispatcher</option>
              <option>Fleet Manager</option>
              <option>Safety Officer</option>
              <option>Financial Analyst</option>
            </select>
          </div>

          <div className="login-row">
            <label className="login-check-label">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <a href="#" className="login-forgot">Forgot password?</a>
          </div>

          <button className="login-btn" onClick={handleSignIn} disabled={locked}>
            {locked ? '🔒 Account Locked' : 'Sign In'}
          </button>

          <div className="register-signin-link">
            Don&apos;t have an account?{' '}
            <span onClick={() => navigate('/register')} className="register-link">Sign Up →</span>
          </div>

          <div className="login-scope">
            <div style={{ marginBottom: 6, color: '#888' }}>Access is scoped by role after login:</div>
            <div>• Fleet Manager → Fleet, Maintenance</div>
            <div>• Dispatcher → Dashboard, Trips</div>
            <div>• Safety Officer → Drivers, Compliance</div>
            <div>• Financial Analyst → Fuel &amp; Expenses, Analytics</div>
          </div>
        </div>
      </div>
    </div>
  )
}
