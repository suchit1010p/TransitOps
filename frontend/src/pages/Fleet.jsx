import { useState } from 'react'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'

const initialVehicles = [
  { id: 1, reg: 'GJ01AB452', name: 'VAN-05',   type: 'Van',   capacity: '500 kg', odometer: '74,000',  cost: '6,20,000',   status: 'Available' },
  { id: 2, reg: 'GJ01AB998', name: 'TRUCK-11', type: 'Truck', capacity: '5 Ton',  odometer: '182,000', cost: '24,50,000',  status: 'On Trip' },
  { id: 3, reg: 'GJ01AB120', name: 'MINI-03',  type: 'Mini',  capacity: '1 Ton',  odometer: '66,000',  cost: '4,10,000',   status: 'In Shop' },
  { id: 4, reg: 'GJ01AB008', name: 'VAN-09',   type: 'Van',   capacity: '750 kg', odometer: '241,900', cost: '5,90,000',   status: 'Retired' },
]

const emptyForm = { reg: '', name: '', type: 'Van', capacity: '', odometer: '', cost: '', status: 'Available' }

export default function Fleet() {
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [filterType, setFilterType] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [search, setSearch] = useState('')

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const validate = () => {
    const err = {}
    if (!form.reg.trim())      err.reg = 'Registration No. is required'
    if (!form.name.trim())     err.name = 'Vehicle name is required'
    if (!form.capacity.trim()) err.capacity = 'Capacity is required'
    if (!form.cost.trim())     err.cost = 'Acquisition cost is required'
    return err
  }

  const handleAdd = () => {
    const err = validate()
    if (Object.keys(err).length > 0) { setErrors(err); return }
    setVehicles([...vehicles, { ...form, id: Date.now() }])
    setForm(emptyForm)
    setErrors({})
    setShowModal(false)
  }

  const filtered = vehicles.filter((v) => {
    const matchType   = filterType   === 'All' || v.type === filterType
    const matchStatus = filterStatus === 'All' || v.status === filterStatus
    const matchSearch = v.reg.toLowerCase().includes(search.toLowerCase()) || v.name.toLowerCase().includes(search.toLowerCase())
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

      <table className="data-table">
        <thead>
          <tr>
            <th>Reg. No. (Unique)</th><th>Name/Model</th><th>Type</th>
            <th>Capacity</th><th>Odometer</th><th>Acq. Cost</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((v) => (
            <tr key={v.id}>
              <td style={{ fontWeight: 700, fontStyle: 'italic' }}>{v.reg}</td>
              <td style={{ fontWeight: 700 }}>{v.name}</td>
              <td>{v.type}</td>
              <td>{v.capacity}</td>
              <td>{v.odometer}</td>
              <td>{v.cost}</td>
              <td><StatusBadge status={v.status} /></td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No vehicles found</td></tr>
          )}
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
