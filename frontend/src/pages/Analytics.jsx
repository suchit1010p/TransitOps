import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import './Analytics.css'

const COLORS = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#f43f5e']
const STATUS_COLORS = {
  Draft: '#6b7280',
  Dispatched: '#3b82f6',
  Completed: '#22c55e',
  Cancelled: '#f43f5e',
}

const API = 'http://localhost:8000/api/v1'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 14px' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#3b82f6', fontWeight: 700 }}>₹{Number(payload[0].value).toLocaleString()}</p>
      </div>
    )
  }
  return null
}


export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const token = useSelector((state) => state.auth.token)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API}/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Failed to fetch analytics')
        const json = await res.json()
        setData(json.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchAnalytics()
    else setLoading(false)
  }, [token])

  if (loading) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading analytics...</div>
    </div>
  )

  if (error) return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ color: '#f43f5e', fontSize: 14 }}>Error: {error}</div>
    </div>
  )

  const kpis = data?.kpis || {}
  const monthlyRevenue = (data?.monthlyRevenue || []).map(r => ({
    month: r.month,
    revenue: Number(r.revenue)
  }))
  const costliestVehicles = data?.costliestVehicles || []
  const tripStatusBreakdown = data?.tripStatusBreakdown || []
  const topDrivers = (data?.topDrivers || []).map(d => ({
    name: d.name,
    trips: Number(d.trip_count)
  }))

  const maxCost = Math.max(...costliestVehicles.map(v => Number(v.total_cost)), 1)

  return (
    <div className="page-content">
      {/* KPI Cards */}
      <div className="stats-row" style={{ marginBottom: 8 }}>
        <div className="stat-card">
          <div className="stat-card-label" style={{ borderLeft: '3px solid #3b82f6', paddingLeft: 6 }}>Fuel Efficiency</div>
          <div className="stat-card-value">{kpis.fuelEfficiency ?? '—'} <span style={{ fontSize: 14 }}>km/l</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label" style={{ borderLeft: '3px solid #22c55e', paddingLeft: 6 }}>Fleet Utilization</div>
          <div className="stat-card-value">{kpis.fleetUtilization ?? '—'}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label" style={{ borderLeft: '3px solid #f97316', paddingLeft: 6 }}>Operational Cost</div>
          <div className="stat-card-value orange">₹{Number(kpis.operationalCost || 0).toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label" style={{ borderLeft: '3px solid #a855f7', paddingLeft: 6 }}>Vehicle ROI</div>
          <div className="stat-card-value">{kpis.roi ?? '—'}%</div>
        </div>
      </div>

      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 20 }}>
        ROI = (Revenue – (Maintenance + Fuel)) / Acquisition Cost &nbsp;|&nbsp; Revenue estimated at ₹50/km for completed trips
      </div>

      {/* Row 1: Monthly Revenue + Trip Status Pie */}
      <div className="analytics-grid" style={{ marginBottom: 28 }}>
        {/* Monthly Revenue Bar Chart */}
        <div>
          <div className="section-title">Monthly Revenue (₹)</div>
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={monthlyRevenue} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={50} tickFormatter={v => `₹${v/1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              No completed trips yet
            </div>
          )}
        </div>

        {/* Trip Status Pie */}
        <div>
          <div className="section-title">Trip Status Breakdown</div>
          {tripStatusBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={tripStatusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="40%"
                  cy="50%"
                  outerRadius={60}
                  paddingAngle={3}
                >
                  {tripStatusBreakdown.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6b7280'} />
                  ))}
                </Pie>
                <Legend
                  formatter={(val) => <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{val}</span>}
                />
                <Tooltip formatter={(val, name) => [val, name]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              No trips yet
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Costliest Vehicles + Top Drivers */}
      <div className="analytics-grid">
        {/* Top Costliest Vehicles (horizontal bars) */}
        <div>
          <div className="section-title">Top Costliest Vehicles</div>
          {costliestVehicles.length > 0 ? costliestVehicles.map((v, i) => (
            <div key={v.registration_number} className="vs-row" style={{ marginBottom: 14 }}>
              <div className="vs-label">{v.name_model}</div>
              <div className="vs-bar-track">
                <div
                  className="vs-bar-fill"
                  style={{
                    width: `${(Number(v.total_cost) / maxCost) * 100}%`,
                    background: COLORS[i % COLORS.length]
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8, whiteSpace: 'nowrap' }}>
                ₹{Number(v.total_cost).toLocaleString()}
              </div>
            </div>
          )) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 24 }}>No cost data yet</div>
          )}
        </div>

        {/* Top Active Drivers */}
        <div>
          <div className="section-title">Top Active Drivers</div>
          {topDrivers.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={topDrivers} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={(v) => [v, 'Trips']} />
                <Bar dataKey="trips" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
              No driver data yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
