import { useState } from 'react'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import './Trips.css'

const initialAvailableVehicles = [
  { id: 1, name: 'VAN-05',  capacity: 500 },
  { id: 2, name: 'MINI-03', capacity: 1000 },
]

const initialAvailableDrivers = [
  { id: 1, name: 'Alex' },
  { id: 3, name: 'Priya' },
]

const initialTrips = [
  { id: 1, tripNo: 'TR001', route: 'Gandhinagar Depot → Ahmedabad Hub',        vehicle: 'VAN-05 / ALEX',     status: 'Dispatched', eta: '45 min' },
  { id: 2, tripNo: 'TR004', route: 'Vatva Industrial Area → Sanand Warehouse', vehicle: 'TRUCK-04 / SURESH', status: 'Draft',      eta: 'Awaiting driver' },
  { id: 3, tripNo: 'TR006', route: 'Mansa → Kalol Depot',                      vehicle: 'Unassigned',        status: 'Cancelled',  eta: 'Vehicle went to shop' },
]

const LIFECYCLE = [
  { label: 'Draft',     icon: '1' },
  { label: 'Dispatched', icon: '2' },
  { label: 'Completed', icon: '3' },
  { label: 'Cancelled', icon: '4' },
]

const emptyTrip   = { source: '', destination: '', vehicleId: '', driverId: '', cargoWeight: '', plannedDistance: '' }
const emptyDriver = { name: '', license: '', category: 'LMV', expiry: '', contact: '' }

let tripCounter = 7

export default function Trips() {
  const [trips,             setTrips]             = useState(initialTrips)
  const [drivers,           setDrivers]           = useState(initialAvailableDrivers)
  const [form,              setForm]              = useState(emptyTrip)
  const [errors,            setErrors]            = useState({})
  const [capacityError,     setCapacityError]     = useState(null)
  const [activeStep,        setActiveStep]        = useState(1) // 0=Draft, 1=Dispatched
  const [showAddDriver,     setShowAddDriver]     = useState(false)
  const [driverForm,        setDriverForm]        = useState(emptyDriver)
  const [driverErrors,      setDriverErrors]      = useState({})

  /* ── Trip form handlers ── */
  const update = (f) => (e) => {
    const val = e.target.value
    const newForm = { ...form, [f]: val }
    setForm(newForm)

    if (f === 'cargoWeight' || f === 'vehicleId') {
      const vehicle = initialAvailableVehicles.find((v) => v.id === Number(f === 'vehicleId' ? val : newForm.vehicleId))
      const cargo   = Number(f === 'cargoWeight' ? val : newForm.cargoWeight)
      if (vehicle && cargo > 0) {
        setCapacityError(cargo > vehicle.capacity
          ? { cap: vehicle.capacity, cargo, over: cargo - vehicle.capacity }
          : null)
      } else {
        setCapacityError(null)
      }
    }
  }

  const validateTrip = () => {
    const err = {}
    if (!form.source.trim())      err.source      = 'Source is required'
    if (!form.destination.trim()) err.destination = 'Destination is required'
    if (!form.vehicleId)          err.vehicleId   = 'Select a vehicle'
    if (!form.driverId)           err.driverId    = 'Select a driver'
    if (!form.cargoWeight)        err.cargoWeight = 'Enter cargo weight'
    if (capacityError)            err.cargoWeight = 'Cargo exceeds vehicle capacity — dispatch blocked'
    return err
  }

  const handleDispatch = () => {
    const err = validateTrip()
    if (Object.keys(err).length > 0) { setErrors(err); return }
    const vehicle = initialAvailableVehicles.find((v) => v.id === Number(form.vehicleId))
    const driver  = drivers.find((d) => d.id === Number(form.driverId))
    setTrips([{
      id: Date.now(),
      tripNo: `TR00${tripCounter++}`,
      route: `${form.source} → ${form.destination}`,
      vehicle: `${vehicle?.name} / ${driver?.name.toUpperCase()}`,
      status: 'Dispatched',
      eta: form.plannedDistance ? `${form.plannedDistance} km` : '—',
    }, ...trips])
    setActiveStep(1)
    setForm(emptyTrip)
    setErrors({})
    setCapacityError(null)
  }

  /* ── Add Driver handlers ── */
  const updateDriver = (f) => (e) => setDriverForm({ ...driverForm, [f]: e.target.value })

  const validateDriver = () => {
    const err = {}
    if (!driverForm.name.trim())    err.name    = 'Name is required'
    if (!driverForm.license.trim()) err.license = 'License number is required'
    if (!driverForm.expiry)         err.expiry  = 'Expiry date is required'
    if (!driverForm.contact.trim()) err.contact = 'Contact is required'
    return err
  }

  const handleAddDriver = () => {
    const err = validateDriver()
    if (Object.keys(err).length > 0) { setDriverErrors(err); return }
    const newDriver = { id: Date.now(), name: driverForm.name }
    setDrivers([...drivers, newDriver])
    setDriverForm(emptyDriver)
    setDriverErrors({})
    setShowAddDriver(false)
  }

  return (
    <div className="page-content trips-layout">
      {/* ── LEFT: Create Trip ── */}
      <div className="trips-left">

        {/* Lifecycle Stepper */}
        <div className="section-title">Trip Lifecycle</div>
        <div className="lifecycle-stepper">
          {LIFECYCLE.map((step, i) => {
            const isDone   = i < activeStep
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

        <div className="form-group">
          <label className="form-label">Source <span style={{ color: '#f87171' }}>*</span></label>
          <input className={`form-input ${errors.source ? 'input-err' : ''}`} placeholder="e.g. Gandhinagar Depot" value={form.source} onChange={update('source')} />
          {errors.source && <div className="form-err-msg">{errors.source}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Destination <span style={{ color: '#f87171' }}>*</span></label>
          <input className={`form-input ${errors.destination ? 'input-err' : ''}`} placeholder="e.g. Ahmedabad Hub" value={form.destination} onChange={update('destination')} />
          {errors.destination && <div className="form-err-msg">{errors.destination}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Vehicle (Available Only) <span style={{ color: '#f87171' }}>*</span></label>
          <select className={`form-input ${errors.vehicleId ? 'input-err' : ''}`} value={form.vehicleId} onChange={update('vehicleId')}>
            <option value="">— Select Vehicle —</option>
            {initialAvailableVehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.name} – {v.capacity} kg capacity</option>
            ))}
          </select>
          {errors.vehicleId && <div className="form-err-msg">{errors.vehicleId}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Driver (Available Only) <span style={{ color: '#f87171' }}>*</span>
          </label>
          <select className={`form-input ${errors.driverId ? 'input-err' : ''}`} value={form.driverId} onChange={update('driverId')}>
            <option value="">— Select Driver —</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          {errors.driverId && <div className="form-err-msg">{errors.driverId}</div>}
          <span className="add-driver-link" onClick={() => { setDriverForm(emptyDriver); setDriverErrors({}); setShowAddDriver(true) }}>
            + Add new driver
          </span>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Cargo Weight (kg) <span style={{ color: '#f87171' }}>*</span></label>
            <input
              className={`form-input ${errors.cargoWeight || capacityError ? 'input-err' : ''}`}
              type="number" min="0" placeholder="e.g. 450"
              value={form.cargoWeight}
              onChange={update('cargoWeight')}
            />
            {errors.cargoWeight && <div className="form-err-msg">{errors.cargoWeight}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Planned Distance (km)</label>
            <input className="form-input" type="number" min="0" placeholder="e.g. 38" value={form.plannedDistance} onChange={update('plannedDistance')} />
          </div>
        </div>

        {/* Capacity warning — only when exceeded */}
        {capacityError && (
          <div className="capacity-error">
            Vehicle Capacity: {capacityError.cap} kg &nbsp;·&nbsp; Cargo: {capacityError.cargo} kg<br />
            ✕ Exceeded by {capacityError.over} kg — dispatch blocked
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button
            className="btn-primary"
            style={{ flex: 1, opacity: capacityError ? 0.45 : 1 }}
            onClick={handleDispatch}
            disabled={!!capacityError}
          >
            Dispatch Trip
          </button>
          <button
            className="btn-outline"
            onClick={() => { setForm(emptyTrip); setErrors({}); setCapacityError(null) }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* ── RIGHT: Live Board ── */}
      <div className="trips-right">
        <div className="section-title">Live Board</div>
        {trips.map((t) => (
          <div key={t.id} className="live-card">
            <div className="live-card-top">
              <div className="live-card-id">{t.tripNo}</div>
              <div className="live-card-vehicle">{t.vehicle}</div>
            </div>
            <div className="live-card-route">{t.route}</div>
            <div className="live-card-bottom">
              <StatusBadge status={t.status} />
              <div className="live-card-eta">{t.eta}</div>
            </div>
          </div>
        ))}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, fontStyle: 'italic' }}>
          On Complete: odometer → updated · vehicle &amp; driver revert to Available
        </div>
      </div>

      {/* ── Add Driver Modal ── */}
      {showAddDriver && (
        <Modal title="Add New Driver" onClose={() => setShowAddDriver(false)}>
          <div className="form-group">
            <label className="form-label">Full Name <span style={{ color: '#f87171' }}>*</span></label>
            <input className={`form-input ${driverErrors.name ? 'input-err' : ''}`} placeholder="e.g. Ramesh Kumar" value={driverForm.name} onChange={updateDriver('name')} />
            {driverErrors.name && <div className="form-err-msg">{driverErrors.name}</div>}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">License Number <span style={{ color: '#f87171' }}>*</span></label>
              <input className={`form-input ${driverErrors.license ? 'input-err' : ''}`} placeholder="e.g. DL-99001" value={driverForm.license} onChange={updateDriver('license')} />
              {driverErrors.license && <div className="form-err-msg">{driverErrors.license}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={driverForm.category} onChange={updateDriver('category')}>
                <option>LMV</option><option>HMV</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">License Expiry <span style={{ color: '#f87171' }}>*</span></label>
              <input
                className={`form-input ${driverErrors.expiry ? 'input-err' : ''}`}
                type="date"
                value={driverForm.expiry}
                onChange={updateDriver('expiry')}
              />
              {driverErrors.expiry && <div className="form-err-msg">{driverErrors.expiry}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Contact <span style={{ color: '#f87171' }}>*</span></label>
              <input className={`form-input ${driverErrors.contact ? 'input-err' : ''}`} placeholder="e.g. 9876500000" value={driverForm.contact} onChange={updateDriver('contact')} />
              {driverErrors.contact && <div className="form-err-msg">{driverErrors.contact}</div>}
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setShowAddDriver(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAddDriver}>Add &amp; Select</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
