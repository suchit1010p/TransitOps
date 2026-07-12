import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { addVehicles, getVehicals, updateVehicalStatus } from '../features/vehical/vehicalSlice.js'

const emptyForm = { reg: '', name: '', type: 'Van', capacity: '', odometer: '', cost: '', status: 'Available' }

const VALID_VEHICLE_STATUS = ['Available', 'On Trip', 'In Shop', 'Retired']

const normalizeVehicleStatus = (value) => {
  return VALID_VEHICLE_STATUS.includes(value) ? value : 'Available'
}

export default function Fleet() {
  const dispatch = useDispatch()
  const { items: vehicles, loading, error, message } = useSelector((state) => state.vehicle)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [filterType, setFilterType] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(getVehicals())
  }, [dispatch])

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  const validate = () => {
    const err = {}
    if (!form.reg.trim()) err.reg = 'Registration No. is required'
    if (!form.name.trim()) err.name = 'Vehicle name is required'
    if (!form.capacity.trim()) err.capacity = 'Capacity is required'
    if (!form.cost.trim()) err.cost = 'Acquisition cost is required'
    return err
  }

  const handleAdd = async () => {
    const err = validate()
    if (Object.keys(err).length > 0) {
      setErrors(err)
      return
    }

    const result = await dispatch(addVehicles({
      registration_number: form.reg,
      name_model: form.name,
      type: form.type,
      max_load_capacity: form.capacity,
      odometer: form.odometer || 0,
      acquisition_cost: form.cost,
      status: normalizeVehicleStatus(form.status),
    }))

    if (addVehicles.fulfilled.match(result)) {
      setForm(emptyForm)
      setErrors({})
      setShowModal(false)
    }
  }

  const handleStatusChange = (id, status) => {
    dispatch(updateVehicalStatus({ id, status: normalizeVehicleStatus(status) }))
  }

  const filtered = (vehicles || []).filter((vehicle) => {
    const matchType = filterType === 'All' || vehicle.type === filterType
    const matchStatus = filterStatus === 'All' || vehicle.status === filterStatus
    const matchSearch = `${vehicle.registration_number || ''} ${vehicle.name_model || ''}`.toLowerCase().includes(search.toLowerCase())
    return matchType && matchStatus && matchSearch
  })

  return (
    <div className="page-content">
      <div className="filter-bar">
        <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option>All</option><option>Van</option><option>Truck</option><option>Mini</option>
        </select>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option>All</option><option>Available</option><option>On Trip</option><option>In Shop</option><option>Retired</option>
        </select>
        <input className="filter-input" type="text" placeholder="Search reg. no..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="filter-spacer" />
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setErrors({}); setShowModal(true) }}>
          + Add Vehicle
        </button>
      </div>

      {error && <div className="form-err-msg" style={{ marginBottom: 12 }}>{error}</div>}
      {message && <div style={{ color: '#22c55e', marginBottom: 12 }}>{message}</div>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Reg. No. (Unique)</th><th>Name/Model</th><th>Type</th>
            <th>Capacity</th><th>Odometer</th><th>Acq. Cost</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading && !vehicles.length ? (
            <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading vehicles...</td></tr>
          ) : filtered.length === 0 ? (
            <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No vehicles found</td></tr>
          ) : filtered.map((vehicle) => (
            <tr key={vehicle.id}>
              <td style={{ fontWeight: 700, fontStyle: 'italic' }}>{vehicle.registration_number}</td>
              <td style={{ fontWeight: 700 }}>{vehicle.name_model}</td>
              <td>{vehicle.type}</td>
              <td>{vehicle.max_load_capacity}</td>
              <td>{vehicle.odometer}</td>
              <td>{vehicle.acquisition_cost}</td>
              <td>
                <select
                  className="form-input"
                  value={vehicle.status || 'Available'}
                  onChange={(event) => handleStatusChange(vehicle.id, event.target.value)}
                  style={{ minWidth: 120 }}
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="rule-notice">
        Rule: Registration No. must be unique · Retired/In Shop vehicles are hidden from Trip Dispatcher
      </div>

      {/* Add Vehicle Modal */}
      {showModal && (
        <Modal title="Add New Vehicle" onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label className="form-label">Registration No. <span style={{color:'#f87171'}}>*</span></label>
            <input className={`form-input ${errors.reg ? 'input-err' : ''}`} placeholder="e.g. GJ01AB999" value={form.reg} onChange={update('reg')} />
            {errors.reg && <div className="form-err-msg">{errors.reg}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Vehicle Name / Model <span style={{color:'#f87171'}}>*</span></label>
            <input className={`form-input ${errors.name ? 'input-err' : ''}`} placeholder="e.g. VAN-10" value={form.name} onChange={update('name')} />
            {errors.name && <div className="form-err-msg">{errors.name}</div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={form.type} onChange={update('type')}>
                <option>Van</option><option>Truck</option><option>Mini</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={update('status')}>
                <option>Available</option><option>In Shop</option><option>Retired</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Capacity <span style={{color:'#f87171'}}>*</span></label>
            <input className={`form-input ${errors.capacity ? 'input-err' : ''}`} placeholder="e.g. 500 kg or 2 Ton" value={form.capacity} onChange={update('capacity')} />
            {errors.capacity && <div className="form-err-msg">{errors.capacity}</div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Odometer (km)</label>
              <input className="form-input" placeholder="e.g. 0" value={form.odometer} onChange={update('odometer')} />
            </div>
            <div className="form-group">
              <label className="form-label">Acquisition Cost <span style={{color:'#f87171'}}>*</span></label>
              <input className={`form-input ${errors.cost ? 'input-err' : ''}`} placeholder="e.g. 5,00,000" value={form.cost} onChange={update('cost')} />
              {errors.cost && <div className="form-err-msg">{errors.cost}</div>}
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAdd}>Add Vehicle</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
