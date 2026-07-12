import StatusBadge from '../components/StatusBadge'
import './Dashboard.css'

const recentTrips = [
  { trip: 'TR001', vehicle: 'VAN-05', driver: 'Alex', status: 'On Trip', eta: '45 min' },
  { trip: 'TR002', vehicle: 'TRK-12', driver: 'John', status: 'Completed', eta: '—' },
  { trip: 'TR003', vehicle: 'MINI-08', driver: 'Priya', status: 'Dispatched', eta: 'In 10m' },
  { trip: 'TR004', vehicle: '—', driver: '—', status: 'Draft', eta: 'Awaiting vehicle' },
]

const vehicleStatus = [
  { label: 'Available', pct: 75, color: '#22c55e' },
  { label: 'On Trip', pct: 30, color: '#3b82f6' },
  { label: 'In Shop', pct: 10, color: '#f97316' },
  { label: 'Retired', pct: 5, color: '#f87171' },
]

export default function Dashboard() {
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
      <div className="stats-row">
        <div className="stat-card"><div className="stat-card-label">Active Vehicles</div><div className="stat-card-value">53</div></div>
        <div className="stat-card"><div className="stat-card-label">Available Vehicles</div><div className="stat-card-value">42</div></div>
        <div className="stat-card"><div className="stat-card-label">Vehicles in Maintenance</div><div className="stat-card-value orange">05</div></div>
        <div className="stat-card"><div className="stat-card-label">Active Trips</div><div className="stat-card-value">18</div></div>
        <div className="stat-card"><div className="stat-card-label">Pending Trips</div><div className="stat-card-value">09</div></div>
        <div className="stat-card"><div className="stat-card-label">Drivers on Duty</div><div className="stat-card-value">26</div></div>
        <div className="stat-card"><div className="stat-card-label">Fleet Utilization</div><div className="stat-card-value">81%</div></div>
      </div>

      {/* Bottom Grid */}
      <div className="dashboard-grid">
        {/* Recent Trips */}
        <div className="dashboard-trips">
          <div className="section-title">Recent Trips</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Trip</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Status</th>
                <th>ETA</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map((t) => (
                <tr key={t.trip}>
                  <td style={{ fontWeight: 700 }}>{t.trip}</td>
                  <td>{t.vehicle}</td>
                  <td>{t.driver}</td>
                  <td><StatusBadge status={t.status} /></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{t.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vehicle Status */}
        <div className="dashboard-vehicle-status">
          <div className="section-title">Vehicle Status</div>
          {vehicleStatus.map((v) => (
            <div key={v.label} className="vs-row">
              <div className="vs-label">{v.label}</div>
              <div className="vs-bar-track">
                <div className="vs-bar-fill" style={{ width: `${v.pct}%`, background: v.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
