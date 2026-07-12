import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { registerAuth } from '../features/auth/authSlice.js'
import './Login.css'
import './Register.css'

export default function Register() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'Dispatcher' })
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const validate = () => {
    const err = {}
    if (!form.name.trim())             err.name = 'Full name is required'
    if (!form.email.includes('@'))     err.email = 'Enter a valid email'
    if (form.password.length < 6)     err.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm) err.confirm = 'Passwords do not match'
    return err
  }

  const handleRegister = async () => {
    const err = validate()
    if (Object.keys(err).length > 0) { setErrors(err); return }
    setErrors({})

    const result = await dispatch(registerAuth({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    }))

    if (registerAuth.fulfilled.match(result)) {
      setSuccess(true)
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

        <div className="register-info-box">
          <div className="register-info-title">📋 Creating an account?</div>
          <div className="register-info-body">
            <p>Each account is linked to a single role. Your access within the platform is determined by the role you select during registration.</p>
            <div style={{ marginTop: 12 }}>
              <div className="register-role-chip">Fleet Manager — Fleet, Maintenance</div>
              <div className="register-role-chip">Dispatcher — Dashboard, Trips</div>
              <div className="register-role-chip">Safety Officer — Drivers, Compliance</div>
              <div className="register-role-chip">Financial Analyst — Fuel &amp; Expenses, Analytics</div>
            </div>
          </div>
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
          {success ? (
            <div className="register-success">
              <div className="register-success-icon">✅</div>
              <h2 className="login-title" style={{ fontSize: 18 }}>Account Created!</h2>
              <p className="login-subtitle" style={{ marginBottom: 20 }}>
                Your <strong style={{ color: 'var(--accent)' }}>{form.role}</strong> account for <strong>{form.email}</strong> is ready.
              </p>
              <p style={{ fontSize: 11, color: '#666', marginBottom: 20, fontStyle: 'italic' }}>
                In production, an admin would verify your account before access is granted.
              </p>
              <button className="login-btn" onClick={() => navigate('/')}>
                Go to Sign In →
              </button>
            </div>
          ) : (
            <>
              <h1 className="login-title">Create your account</h1>
              <p className="login-subtitle">Fill in the details to get started</p>

              {error && (
                <div className="login-error-box">
                  <div className="login-error-label">✕ Registration Failed</div>
                  <div className="login-error-item">{typeof error === 'string' ? error : error.message || 'Unable to create account.'}</div>
                </div>
              )}

              <div className="login-field-group">
                <label className="login-label">Full Name</label>
                <input
                  className={`login-input ${errors.name ? 'input-error' : ''}`}
                  type="text"
                  placeholder="e.g. Raven Kumar"
                  value={form.name}
                  onChange={update('name')}
                />
                {errors.name && <div className="field-error">{errors.name}</div>}
              </div>

              <div className="login-field-group">
                <label className="login-label">Work Email</label>
                <input
                  className={`login-input ${errors.email ? 'input-error' : ''}`}
                  type="email"
                  placeholder="e.g. raven@transitops.in"
                  value={form.email}
                  onChange={update('email')}
                />
                {errors.email && <div className="field-error">{errors.email}</div>}
              </div>

              <div className="login-field-group">
                <label className="login-label">Role (RBAC)</label>
                <select className="login-input login-select" value={form.role} onChange={update('role')}>
                  <option>Fleet Manager</option>
                  <option>Dispatcher</option>
                  <option>Safety Officer</option>
                  <option>Financial Analyst</option>
                </select>
              </div>

              <div className="login-field-group">
                <label className="login-label">Password</label>
                <input
                  className={`login-input ${errors.password ? 'input-error' : ''}`}
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={update('password')}
                />
                {errors.password && <div className="field-error">{errors.password}</div>}
              </div>

              <div className="login-field-group">
                <label className="login-label">Confirm Password</label>
                <input
                  className={`login-input ${errors.confirm ? 'input-error' : ''}`}
                  type="password"
                  placeholder="Re-enter password"
                  value={form.confirm}
                  onChange={update('confirm')}
                />
                {errors.confirm && <div className="field-error">{errors.confirm}</div>}
              </div>

              <button className="login-btn" onClick={handleRegister} disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="register-signin-link">
                Already have an account?{' '}
                <span onClick={() => navigate('/')} className="register-link">Sign In →</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
