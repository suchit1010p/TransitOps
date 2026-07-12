import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import StatusBadge from '../components/StatusBadge'
import './Dashboard.css'

const API = 'http://localhost:8000/api/v1'

const STATUS_COLORS = {
  Available: '#22c55e',
  'On Trip': '#3b82f6',
  'In Shop': '#f97316',
  Retired: '#f87171',
}

export default function Dashboard() {
  const token = useSelector((state) => state.auth.token)
  const [dash, setDash] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch(`${API}/dispatcher-dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(j => { setDash(j.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  const kpis = dash?.kpis || {}
  const recentTrips = dash?.recentTrips || []
  const breakdown = dash?.vehicleStatusBreakdown || []
  const totalVehicles = breakdown.reduce((s, v) => s + Number(v.count), 0) || 1

  const fmt = (n) => String(n ?? 0).padStart(2, '0')

  return (
    <div className="page-content">
      {/* Filters */}
      <div className="filter-bar">
        <label className="filter-label">FILTERS</label>
        <select className="filter-select"><option>Vehicle Type: All</option><option>Van</option><option>Truck</option><option>Mini</option></select>
        <select className="filter-select"><option>Status: All</option><option>Available</option><option>On Trip</option></select>
        <select className="filter-select"><option>Region: All</option><option>North</option><option>South</option></select>
      </div>

      {/* Stats Row */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>Loading dashboard...</div>
      ) : (
        <div className="stats-row">
          <div className="stat-card"><div className="stat-card-label">Active Vehicles</div><div className="stat-card-value">{fmt(kpis.activeVehicles)}</div></div>
          <div className="stat-card"><div className="stat-card-label">Available Vehicles</div><div className="stat-card-value">{fmt(kpis.availableVehicles)}</div></div>
          <div className="stat-card"><div className="stat-card-label">Vehicles in Maintenance</div><div className="stat-card-value orange">{fmt(kpis.inMaintenance)}</div></div>
          <div className="stat-card"><div className="stat-card-label">Active Trips</div><div className="stat-card-value">{fmt(kpis.activeTrips)}</div></div>
          <div className="stat-card"><div className="stat-card-label">Pending Trips</div><div className="stat-card-value">{fmt(kpis.pendingTrips)}</div></div>
          <div className="stat-card"><div className="stat-card-label">Drivers on Duty</div><div className="stat-card-value">{fmt(kpis.driversOnDuty)}</div></div>
          <div className="stat-card"><div className="stat-card-label">Fleet Utilization</div><div className="stat-card-value">{kpis.fleetUtilization ?? 0}%</div></div>
        </div>
      )}

      {/* Bottom Grid */}
      <div className="dashboard-grid">
        {/* Recent Trips */}
        <div className="dashboard-trips">
          <div className="section-title">Recent Trips</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Source → Dest</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.length === 0 ? (
                <tr><td colSpan={4} style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No trips yet</td></tr>
              ) : recentTrips.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.source} → {t.destination}</td>
                  <td>{t.vehicle_name || '—'}</td>
                  <td>{t.driver_name || '—'}</td>
                  <td><StatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vehicle Status */}
        <div className="dashboard-vehicle-status">
          <div className="section-title">Vehicle Status</div>
          {['Available', 'On Trip', 'In Shop', 'Retired'].map((label) => {
            const entry = breakdown.find(b => b.status === label)
            const count = entry ? Number(entry.count) : 0
            const pct = Math.round((count / totalVehicles) * 100)
            return (
              <div key={label} className="vs-row">
                <div className="vs-label">{label}</div>
                <div className="vs-bar-track">
                  <div className="vs-bar-fill" style={{ width: `${pct}%`, background: STATUS_COLORS[label] }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8, minWidth: 24 }}>{count}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
