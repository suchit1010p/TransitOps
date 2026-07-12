import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import StatusBadge from '../components/StatusBadge'
import {
  getMaintenanceLogs,
  addMaintenanceLog,
  closeMaintenanceLog,
  clearMessage,
} from '../features/maintenance/maintenanceSlice'
import { getVehicals } from '../features/vehical/vehicalSlice'
import './Maintenance.css'

const emptyForm = { vehicle_id: '', serviceType: '', cost: '', date: '' }

export default function Maintenance() {
  const dispatch = useDispatch()
  const { items: logs, loading, submitting, message, error } = useSelector((s) => s.maintenance)
  const { items: vehicles } = useSelector((s) => s.vehicle)
  const userRole = useSelector((s) => s.auth.user?.role)

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const isFleetManager = userRole === 'Fleet Manager'

  useEffect(() => {
    dispatch(getMaintenanceLogs())
    dispatch(getVehicals())
  }, [dispatch])

  // Auto-clear success/error messages after 3s
  useEffect(() => {
    if (message || error) {
      const t = setTimeout(() => dispatch(clearMessage()), 3000)
      return () => clearTimeout(t)
    }
  }, [message, error, dispatch])

  const update = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const validate = () => {
    const err = {}
    if (!form.vehicle_id)          err.vehicle_id = 'Select a vehicle'
    if (!form.serviceType.trim())  err.serviceType = 'Service type is required'
    if (!form.cost.trim())         err.cost = 'Cost is required'
    if (!form.date)                err.date = 'Date is required'
    return err
  }

  const handleSave = () => {
    const err = validate()
    if (Object.keys(err).length > 0) { setErrors(err); return }
    dispatch(addMaintenanceLog({
      vehicle_id: form.vehicle_id,
      service_type: form.serviceType,
      cost: Number(form.cost),
      date: form.date,
      status: 'Open',
    }))
    setForm(emptyForm)
    setErrors({})
  }

  const handleClose = (id) => {
    dispatch(closeMaintenanceLog(id))
  }

  // Available vehicles only in dropdown (not In Shop / Retired)
  const availableVehicles = vehicles.filter(v => v.status === 'Available')

  return (
    <div className="page-content maintenance-layout">
      {/* Left: Form */}
      <div className="maint-left">
        <div className="section-title">Log Service Record</div>

        {message && <div className="toast-success">✓ {message}</div>}
        {error && <div className="toast-error">✗ {error}</div>}

        <div className="form-group">
          <label className="form-label">Vehicle <span style={{ color: '#f87171' }}>*</span></label>
          <select
            className={`form-input ${errors.vehicle_id ? 'input-err' : ''}`}
            value={form.vehicle_id}
            onChange={update('vehicle_id')}
            disabled={!isFleetManager}
          >
            <option value="">— Select Vehicle —</option>
            {availableVehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.name_model} ({v.registration_number})</option>
            ))}
          </select>
          {errors.vehicle_id && <div className="form-err-msg">{errors.vehicle_id}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Service Type <span style={{ color: '#f87171' }}>*</span></label>
          <input
            className={`form-input ${errors.serviceType ? 'input-err' : ''}`}
            placeholder="e.g. Oil Change, Engine Repair, Tyre Replace"
            value={form.serviceType}
            onChange={update('serviceType')}
            disabled={!isFleetManager}
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
              type="number"
              disabled={!isFleetManager}
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
              disabled={!isFleetManager}
            />
            {errors.date && <div className="form-err-msg">{errors.date}</div>}
          </div>
        </div>

        {isFleetManager ? (
          <button
            className="btn-primary"
            style={{ width: '100%', padding: 12 }}
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Record'}
          </button>
        ) : (
          <div className="rule-notice" style={{ marginTop: 8 }}>
            Only Fleet Managers can log maintenance records.
          </div>
        )}


      </div>

      {/* Right: Service Log */}
      <div className="maint-right">
        <div className="section-title">Service Log</div>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>Loading...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th><th>Service</th><th>Cost</th><th>Date</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700 }}>{s.vehicle_name || s.registration_number || '—'}</td>
                  <td>{s.service_type}</td>
                  <td>₹ {Number(s.cost).toLocaleString()}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
                    {s.date ? new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td><StatusBadge status={s.status === 'Open' ? 'In Shop' : 'Completed'} /></td>
                  <td>
                    {s.status === 'Open' && isFleetManager && (
                      <button
                        className="btn-outline"
                        style={{ fontSize: 10, padding: '3px 8px' }}
                        onClick={() => handleClose(s.id)}
                        disabled={submitting}
                      >
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
        )}
      </div>
    </div>
  )
}
