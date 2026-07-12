import { useState } from 'react'
import './Settings.css'

const rbacData = [
  { role: 'Fleet Manager',     fleet: '✓', drivers: '✓',    trips: '—',    fuel: '—',    analytics: '✓' },
  { role: 'Dispatcher',        fleet: 'View', drivers: '—', trips: '✓',    fuel: '—',    analytics: '—' },
  { role: 'Safety Officer',    fleet: '—', drivers: '✓',    trips: 'View', fuel: '—',    analytics: '—' },
  { role: 'Financial Analyst', fleet: 'View', drivers: '—', trips: '—',    fuel: '✓',    analytics: '✓' },
]

export default function Settings() {
  const [form, setForm] = useState({
    depot: 'Gandhinagar Depot GJ4',
    currency: 'INR (Rs.)',
    distanceUnit: 'Kilometers',
  })
  const [saved, setSaved] = useState(false)

  const update = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const rbacClass = (val) => {
    if (val === '✓')    return 'rbac-yes'
    if (val === 'View') return 'rbac-view'
    return 'rbac-no'
  }

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
              <tr key={r.role}>
                <td style={{ fontWeight: 700 }}>{r.role}</td>
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
