import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { getTrips, addTrip, updateTripStatus, clearTripMessage } from '../features/trip/tripSlice'
import { getVehicals } from '../features/vehical/vehicalSlice'
import { getDrivers } from '../features/driver/driverSlice'
import './Trips.css'

const LIFECYCLE = [
  { label: 'Draft',      icon: '1' },
  { label: 'Dispatched', icon: '2' },
  { label: 'Completed',  icon: '3' },
  { label: 'Cancelled',  icon: '4' },
]

const emptyTrip = { source: '', destination: '', vehicle_id: '', driver_id: '', cargoWeight: '', plannedDistance: '' }

export default function Trips() {
  const dispatch = useDispatch()
  const { items: trips, loading, submitting, message, error } = useSelector((s) => s.trip)
  const { items: vehicles } = useSelector((s) => s.vehicle)
  const { items: drivers } = useSelector((s) => s.driver)
  const userRole = useSelector((s) => s.auth.user?.role)

  const isDispatcher = userRole === 'Dispatcher'

  const [form, setForm] = useState(emptyTrip)
  const [errors, setErrors] = useState({})
  const [capacityError, setCapacityError] = useState(null)

  useEffect(() => {
    dispatch(getTrips())
    dispatch(getVehicals())
    dispatch(getDrivers())
  }, [dispatch])

  useEffect(() => {
    if (message || error) {
      const t = setTimeout(() => dispatch(clearTripMessage()), 4000)
      return () => clearTimeout(t)
    }
  }, [message, error, dispatch])

  // Refresh trips after dispatching or updating status
  useEffect(() => {
    if (message) {
      dispatch(getTrips())
      dispatch(getVehicals())
      dispatch(getDrivers())
    }
  }, [message, dispatch])

  // Filter: only Available vehicles (not In Shop, Retired, On Trip)
  const availableVehicles = vehicles.filter(v => v.status === 'Available')
  // Filter: only Available drivers with valid license
  const availableDrivers = drivers.filter(d => {
    if (d.status !== 'Available') return false
    if (d.license_expiry && new Date(d.license_expiry) < new Date()) return false
    if (d.safety_status === 'Suspended') return false
    return true
  })

  const update = (f) => (e) => {
    const val = e.target.value
    const newForm = { ...form, [f]: val }
    setForm(newForm)

    // Cargo weight validation (max 500 kg)
    if (f === 'cargoWeight') {
      const cargo = Number(val)
      if (cargo > 500) {
        setCapacityError({ cap: 500, cargo, over: cargo - 500 })
      } else {
        setCapacityError(null)
      }
    }
  }

  const validateTrip = () => {
    const err = {}
    if (!form.source.trim())      err.source = 'Source is required'
    if (!form.destination.trim()) err.destination = 'Destination is required'
    if (!form.vehicle_id)         err.vehicle_id = 'Select a vehicle'
    if (!form.driver_id)          err.driver_id = 'Select a driver'
    if (!form.cargoWeight)        err.cargoWeight = 'Enter cargo weight'
    if (capacityError)            err.cargoWeight = 'Cargo exceeds 500 kg limit — dispatch blocked'
    return err
  }

  const handleDispatch = () => {
    const err = validateTrip()
    if (Object.keys(err).length > 0) { setErrors(err); return }
    dispatch(addTrip({
      source: form.source,
      destination: form.destination,
      vehicle_id: form.vehicle_id,
      driver_id: form.driver_id,
      cargo_weight_kg: Number(form.cargoWeight),
      planned_distance_km: Number(form.plannedDistance) || 0,
    }))
    setForm(emptyTrip)
    setErrors({})
    setCapacityError(null)
  }

  const handleStatusChange = (tripId, newStatus) => {
    dispatch(updateTripStatus({ id: tripId, status: newStatus }))
  }

  // Determine active lifecycle step from most recent trip
  const getActiveStep = () => {
    if (trips.length === 0) return 0
    const latest = trips[0]
    const idx = LIFECYCLE.findIndex(s => s.label === latest.status)
    return idx >= 0 ? idx : 0
  }
  const activeStep = getActiveStep()

  return (
    <div className="page-content trips-layout">
      {/* LEFT: Create Trip */}
      <div className="trips-left">
        {/* Lifecycle Stepper */}
        <div className="section-title">Trip Lifecycle</div>
        <div className="lifecycle-stepper">
          {LIFECYCLE.map((step, i) => {
            const isDone = i < activeStep
            const isActive = i === activeStep
            return (
              <div key={step.label} className="lifecycle-step-item">
                <div className={`step-circle ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                  {isDone ? '✓' : step.icon}
                </div>
                <div className={`step-label ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                  {step.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Create Trip Form */}
        <div className="section-title">Create Trip</div>

        {message && <div className="toast-success" style={{ marginBottom: 10 }}>✓ {message}</div>}
        {error && <div className="toast-error" style={{ marginBottom: 10 }}>✗ {error}</div>}

        <div className="form-group">
          <label className="form-label">Source <span style={{ color: '#f87171' }}>*</span></label>
          <input className={`form-input ${errors.source ? 'input-err' : ''}`} placeholder="e.g. Gandhinagar Depot" value={form.source} onChange={update('source')} disabled={!isDispatcher} />
          {errors.source && <div className="form-err-msg">{errors.source}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Destination <span style={{ color: '#f87171' }}>*</span></label>
          <input className={`form-input ${errors.destination ? 'input-err' : ''}`} placeholder="e.g. Ahmedabad Hub" value={form.destination} onChange={update('destination')} disabled={!isDispatcher} />
          {errors.destination && <div className="form-err-msg">{errors.destination}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Vehicle (Available Only) <span style={{ color: '#f87171' }}>*</span></label>
          <select className={`form-input ${errors.vehicle_id ? 'input-err' : ''}`} value={form.vehicle_id} onChange={update('vehicle_id')} disabled={!isDispatcher}>
            <option value="">— Select Vehicle —</option>
            {availableVehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.name_model} ({v.registration_number})</option>
            ))}
          </select>
          {errors.vehicle_id && <div className="form-err-msg">{errors.vehicle_id}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Driver (Available Only) <span style={{ color: '#f87171' }}>*</span></label>
          <select className={`form-input ${errors.driver_id ? 'input-err' : ''}`} value={form.driver_id} onChange={update('driver_id')} disabled={!isDispatcher}>
            <option value="">— Select Driver —</option>
            {availableDrivers.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {errors.driver_id && <div className="form-err-msg">{errors.driver_id}</div>}
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Cargo Weight (kg) <span style={{ color: '#f87171' }}>*</span></label>
            <input
              className={`form-input ${errors.cargoWeight || capacityError ? 'input-err' : ''}`}
              type="number" min="0" placeholder="e.g. 450"
              value={form.cargoWeight}
              onChange={update('cargoWeight')}
              disabled={!isDispatcher}
            />
            {errors.cargoWeight && <div className="form-err-msg">{errors.cargoWeight}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Planned Distance (km)</label>
            <input className="form-input" type="number" min="0" placeholder="e.g. 38" value={form.plannedDistance} onChange={update('plannedDistance')} disabled={!isDispatcher} />
          </div>
        </div>

        {capacityError && (
          <div className="capacity-error">
            Max Capacity: {capacityError.cap} kg &nbsp;·&nbsp; Cargo: {capacityError.cargo} kg<br />
            ✕ Exceeded by {capacityError.over} kg — dispatch blocked
          </div>
        )}

        {isDispatcher ? (
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button
              className="btn-primary"
              style={{ flex: 1, opacity: capacityError ? 0.45 : 1 }}
              onClick={handleDispatch}
              disabled={!!capacityError || submitting}
            >
              {submitting ? 'Dispatching...' : 'Dispatch Trip'}
            </button>
            <button className="btn-outline" onClick={() => { setForm(emptyTrip); setErrors({}); setCapacityError(null) }}>
              Clear
            </button>
          </div>
        ) : (
          <div className="rule-notice" style={{ marginTop: 14 }}>
            Only Dispatchers can create and manage trips.
          </div>
        )}

        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 14, fontStyle: 'italic' }}>
          On Complete: odometer → updated · vehicle &amp; driver revert to Available
        </div>
      </div>

      {/* RIGHT: Live Board */}
      <div className="trips-right">
        <div className="section-title">Live Board</div>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>Loading trips...</div>
        ) : trips.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>No trips yet</div>
        ) : (
          trips.map((t) => (
            <div key={t.id} className="live-card">
              <div className="live-card-top">
                <div className="live-card-id">{t.trip_no || '—'}</div>
                <div className="live-card-vehicle">
                  {t.vehicle_name || '—'} / {t.driver_name?.toUpperCase() || '—'}
                </div>
              </div>
              <div className="live-card-route">{t.source} → {t.destination}</div>
              <div className="live-card-bottom">
                <StatusBadge status={t.status} />
                <div className="live-card-eta">
                  {t.planned_distance ? `${t.planned_distance} km` : '—'}
                </div>
              </div>
              {/* Status transition buttons for Dispatchers */}
              {isDispatcher && (
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {t.status === 'Draft' && (
                    <button className="btn-sm-action dispatch" onClick={() => handleStatusChange(t.id, 'Dispatched')} disabled={submitting}>
                      → Dispatch
                    </button>
                  )}
                  {t.status === 'Dispatched' && (
                    <>
                      <button className="btn-sm-action complete" onClick={() => handleStatusChange(t.id, 'Completed')} disabled={submitting}>
                        ✓ Complete
                      </button>
                      <button className="btn-sm-action cancel" onClick={() => handleStatusChange(t.id, 'Cancelled')} disabled={submitting}>
                        ✕ Cancel
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
