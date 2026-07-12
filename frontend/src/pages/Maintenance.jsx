import { useState } from 'react'
import StatusBadge from '../components/StatusBadge'
import './Maintenance.css'

const vehicleOptions = ['VAN-05', 'TRUCK-11', 'MINI-03', 'VAN-09']

const initialLogs = [
  { id: 1, vehicle: 'VAN-05',   service: 'Oil Change',    cost: '2,500',  date: '07/07/2026', status: 'In Shop' },
  { id: 2, vehicle: 'TRUCK-11', service: 'Engine Repair', cost: '18,000', date: '06/07/2026', status: 'Completed' },
  { id: 3, vehicle: 'MINI-03',  service: 'Tyre Replace',  cost: '6,200',  date: '05/07/2026', status: 'In Shop' },
]

const emptyForm = { vehicle: '', serviceType: '', cost: '', date: '', notes: '' }

export default function Maintenance() {
  const [logs, setLogs] = useState(initialLogs)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)

  const update = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const validate = () => {
    const err = {}
    if (!form.vehicle)          err.vehicle = 'Select a vehicle'
    if (!form.serviceType.trim()) err.serviceType = 'Service type is required'
    if (!form.cost.trim())      err.cost = 'Cost is required'
    if (!form.date)             err.date = 'Date is required'
    return err
  }

  const handleSave = () => {
    const err = validate()
    if (Object.keys(err).length > 0) { setErrors(err); return }
    setLogs([{
      id: Date.now(),
      vehicle: form.vehicle,
      service: form.serviceType,
      cost: form.cost,
      date: new Date(form.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'In Shop', // Adding a record always sets to In Shop
    }, ...logs])
    setForm(emptyForm)
    setErrors({})
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const closeRecord = (id) => {
    setLogs(logs.map((l) => l.id === id ? { ...l, status: 'Completed' } : l))
  }

  return (
    <div className="page-content maintenance-layout">
      {/* Left: Form */}
      <div className="maint-left">
        <div className="section-title">Log Service Record</div>

        {saved && <div className="toast-success">✓ Record saved — vehicle status changed to In Shop</div>}

        <div className="form-group">
          <label className="form-label">Vehicle <span style={{ color: '#f87171' }}>*</span></label>
          <select className={`form-input ${errors.vehicle ? 'input-err' : ''}`} value={form.vehicle} onChange={update('vehicle')}>
            <option value="">— Select Vehicle —</option>
            {vehicleOptions.map((v) => <option key={v}>{v}</option>)}
          </select>
          {errors.vehicle && <div className="form-err-msg">{errors.vehicle}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Service Type <span style={{ color: '#f87171' }}>*</span></label>
          <input
            className={`form-input ${errors.serviceType ? 'input-err' : ''}`}
            placeholder="e.g. Oil Change, Engine Repair, Tyre Replace"
            value={form.serviceType}
            onChange={update('serviceType')}
          />
          {errors.serviceType && <div className="form-err-msg">{errors.serviceType}</div>}
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Cost (₹) <span style={{ color: '#f87171' }}>*</span></label>
            <input
              className={`form-input ${errors.cost ? 'input-err' : ''}`}
              placeholder="e.g. 2500"
              value={form.cost}
              onChange={update('cost')}
            />
            {errors.cost && <div className="form-err-msg">{errors.cost}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Date <span style={{ color: '#f87171' }}>*</span></label>
            <input
              className={`form-input ${errors.date ? 'input-err' : ''}`}
              type="date"
              value={form.date}
              onChange={update('date')}
            />
            {errors.date && <div className="form-err-msg">{errors.date}</div>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes (Optional)</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="Additional details about the service..."
            value={form.notes}
            onChange={update('notes')}
            style={{ resize: 'vertical' }}
          />
        </div>

        <button className="btn-primary" style={{ width: '100%', padding: 12 }} onClick={handleSave}>
          Save Record
        </button>

        {/* Status Flow Diagram */}
        <div className="status-flow" style={{ marginTop: 20 }}>
          <div className="flow-row">
            <span className="flow-badge available">Available</span>
            <span className="flow-arrow"> ──[add record]──► </span>
            <span className="flow-badge in-shop">In Shop</span>
          </div>
          <div className="flow-row" style={{ marginTop: 8 }}>
            <span className="flow-badge in-shop">In Shop</span>
            <span className="flow-arrow"> ──[close record]──► </span>
            <span className="flow-badge available">Available</span>
          </div>
        </div>
        <div className="rule-notice" style={{ marginTop: 10 }}>
          Note: In Shop vehicles are removed from the dispatch pool.
        </div>
      </div>

      {/* Right: Service Log */}
      <div className="maint-right">
        <div className="section-title">Service Log</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Vehicle</th><th>Service</th><th>Cost</th><th>Date</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 700 }}>{s.vehicle}</td>
                <td>{s.service}</td>
                <td>₹ {s.cost}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{s.date}</td>
                <td><StatusBadge status={s.status} /></td>
                <td>
                  {s.status === 'In Shop' && (
                    <button className="btn-outline" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => closeRecord(s.id)}>
                      Close
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No records yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
