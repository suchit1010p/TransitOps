import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginAuth } from '../features/auth/authSlice.js'
import './Login.css'

const DEMO_USERS = [
  { email: 'fleet@transitops.in', password: 'fleet123', role: 'Fleet Manager' },
  { email: 'dispatch@transitops.in', password: 'dispatch123', role: 'Dispatcher' },
  { email: 'safety@transitops.in', password: 'safety123', role: 'Safety Officer' },
  { email: 'finance@transitops.in', password: 'finance123', role: 'Financial Analyst' },
]

export default function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error, token } = useSelector((state) => state.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Dispatcher')

  const handleSignIn = async () => {
    const result = await dispatch(loginAuth({ email, password, role }))
    if (loginAuth.fulfilled.match(result)) {
      navigate('/dashboard')
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

          {error && (
            <div className="login-error-box">
              <div className="login-error-label">✕ Login Failed</div>
              <div className="login-error-item">{typeof error === 'string' ? error : error.message || 'Invalid credentials.'}</div>
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
            />
          </div>

          <div className="login-field-group">
            <label className="login-label">ROLE (RBAC)</label>
            <select
              className="login-input login-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
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

          <button className="login-btn" onClick={handleSignIn} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
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
