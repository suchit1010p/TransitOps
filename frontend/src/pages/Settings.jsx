import { useState } from 'react'
import { useSelector } from 'react-redux'
import './Settings.css'

const rbacData = [
  { role: 'Fleet Manager',     fleet: '✓', drivers: '✓',    trips: '—',    fuel: '—',    analytics: '✓' },
  { role: 'Dispatcher',        fleet: 'View', drivers: '—', trips: '✓',    fuel: '—',    analytics: '—' },
  { role: 'Safety Officer',    fleet: '—', drivers: '✓',    trips: 'View', fuel: '—',    analytics: '—' },
  { role: 'Financial Analyst', fleet: 'View', drivers: '—', trips: '—',    fuel: '✓',    analytics: '✓' },
]

const defaultSettings = {
  depot: 'Gandhinagar Depot GJ4',
  currency: 'INR (Rs.)',
  distanceUnit: 'Kilometers',
}

function loadSettings() {
  try {
    const saved = localStorage.getItem('transitops_settings')
    return saved ? JSON.parse(saved) : defaultSettings
  } catch {
    return defaultSettings
  }
}

export default function Settings() {
  const userRole = useSelector((s) => s.auth.user?.role)
  const userName = useSelector((s) => s.auth.user?.name)

  const [form, setForm] = useState(loadSettings)
  const [saved, setSaved] = useState(false)

  const update = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const handleSave = () => {
    localStorage.setItem('transitops_settings', JSON.stringify(form))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const rbacClass = (val) => {
    if (val === '✓')    return 'rbac-yes'
    if (val === 'View') return 'rbac-view'
    return 'rbac-no'
  }

  // Highlight the current user's role row
  const isCurrentRole = (role) => role === userRole

  return (
    <div className="page-content settings-layout">
      {/* General Settings */}
      <div className="settings-left">
        <div className="section-title">General</div>

        {saved && <div className="toast-success">✓ Settings saved successfully</div>}

        <div className="form-group">
          <label className="form-label">Depot Name</label>
          <input className="form-input" type="text" value={form.depot} onChange={update('depot')} />
        </div>
        <div className="form-group">
          <label className="form-label">Currency</label>
          <select className="form-input" value={form.currency} onChange={update('currency')}>
            <option>INR (Rs.)</option>
            <option>USD ($)</option>
            <option>EUR (€)</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Distance Unit</label>
          <select className="form-input" value={form.distanceUnit} onChange={update('distanceUnit')}>
            <option>Kilometers</option>
            <option>Miles</option>
          </select>
        </div>

        <button className="btn-save" onClick={handleSave}>Save changes</button>

        {/* User Info */}
        <div style={{ marginTop: 28, padding: '14px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Logged in as</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{userName || 'Guest'}</div>
          <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 2 }}>{userRole || 'No Role'}</div>
        </div>
      </div>

      {/* RBAC Table */}
      <div className="settings-right">
        <div className="section-title">Role-Based Access (RBAC)</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Role</th><th>Fleet?</th><th>Drivers?</th><th>Trips?</th><th>Fuel/Exp.</th><th>Analytics</th>
            </tr>
          </thead>
          <tbody>
            {rbacData.map((r) => (
              <tr key={r.role} style={isCurrentRole(r.role) ? { background: 'rgba(59,130,246,0.08)', borderLeft: '2px solid #3b82f6' } : {}}>
                <td style={{ fontWeight: 700 }}>{r.role} {isCurrentRole(r.role) && <span style={{ fontSize: 9, color: '#3b82f6' }}>(you)</span>}</td>
                <td className={rbacClass(r.fleet)}>{r.fleet}</td>
                <td className={rbacClass(r.drivers)}>{r.drivers}</td>
                <td className={rbacClass(r.trips)}>{r.trips}</td>
                <td className={rbacClass(r.fuel)}>{r.fuel}</td>
                <td className={rbacClass(r.analytics)}>{r.analytics}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="rbac-legend">
          <span className="rbac-yes">✓ = Full Edit Access</span>
          <span className="rbac-view">View = Read Only</span>
          <span className="rbac-no">— = No Access</span>
        </div>
      </div>
    </div>
  )
}
