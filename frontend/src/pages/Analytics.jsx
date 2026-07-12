import './Analytics.css'

const monthlyRevenue = [45, 52, 48, 61, 58, 72, 68, 80, 76]

const costlyVehicles = [
  { name: 'TRUCK-11', pct: 85, color: '#f87171' },
  { name: 'MINI-03', pct: 38, color: '#f97316' },
  { name: 'VAN-05', pct: 15, color: '#3b82f6' },
]

export default function Analytics() {
  const maxRevenue = Math.max(...monthlyRevenue)

  return (
    <div className="page-content">
      {/* KPI Cards */}
      <div className="stats-row" style={{ marginBottom: 8 }}>
        <div className="stat-card">
          <div className="stat-card-label" style={{ borderLeft: '3px solid #3b82f6', paddingLeft: 6 }}>Fuel Efficiency</div>
          <div className="stat-card-value">8.4 <span style={{ fontSize: 14 }}>km/l</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label" style={{ borderLeft: '3px solid #22c55e', paddingLeft: 6 }}>Fleet Utilization</div>
          <div className="stat-card-value">81%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label" style={{ borderLeft: '3px solid #f97316', paddingLeft: 6 }}>Operational Cost</div>
          <div className="stat-card-value orange">34,070</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label" style={{ borderLeft: '3px solid #a855f7', paddingLeft: 6 }}>Vehicle ROI</div>
          <div className="stat-card-value">14.2%</div>
        </div>
      </div>

      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 20 }}>
        ROI = (Revenue – (Maintenance + Fuel)) / Acquisition Cost
      </div>

      {/* Charts Grid */}
      <div className="analytics-grid">
        {/* Monthly Revenue Bar Chart */}
        <div>
          <div className="section-title">Monthly Revenue</div>
          <div className="bar-chart">
            {monthlyRevenue.map((val, i) => (
              <div key={i} className="bar-col">
                <div className="bar-fill" style={{ height: `${(val / maxRevenue) * 120}px` }} />
              </div>
            ))}
          </div>
        </div>

        {/* Top Costliest Vehicles */}
        <div>
          <div className="section-title">Top Costliest Vehicles</div>
          {costlyVehicles.map((v) => (
            <div key={v.name} className="vs-row" style={{ marginBottom: 14 }}>
              <div className="vs-label">{v.name}</div>
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
