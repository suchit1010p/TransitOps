import { useState } from 'react'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'

const TODAY = new Date().toISOString().split('T')[0]

const initialDrivers = [
  { id: 1, name: 'Alex',   license: 'DL-88213', category: 'LMV', expiry: '2028-12-01', contact: '98765xxxxx', completion: '96', status: 'Available' },
  { id: 2, name: 'John',   license: 'DL-44120', category: 'HMV', expiry: '2025-03-01', contact: '98220xxxxx', completion: '81', status: 'Suspended' },
  { id: 3, name: 'Priya',  license: 'DL-77031', category: 'LMV', expiry: '2026-08-01', contact: '99110xxxxx', completion: '99', status: 'On Trip' },
  { id: 4, name: 'Suresh', license: 'DL-90045', category: 'HMV', expiry: '2027-01-01', contact: '97440xxxxx', completion: '88', status: 'Off Duty' },
]

const emptyForm = { name: '', license: '', category: 'LMV', expiry: '', contact: '', status: 'Available' }

const isExpired = (dateStr) => dateStr && new Date(dateStr) < new Date()

export default function Drivers() {
  const [drivers,  setDrivers]  = useState(initialDrivers)
  const [showModal, setShowModal] = useState(false)
  const [form,     setForm]     = useState(emptyForm)
  const [errors,   setErrors]   = useState({})

  const update = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const validate = () => {
    const err = {}
    if (!form.name.trim())    err.name    = 'Driver name is required'
    if (!form.license.trim()) err.license = 'License number is required'
    if (!form.expiry)         err.expiry  = 'License expiry date is required'
    if (!form.contact.trim()) err.contact = 'Contact number is required'
    return err
  }

  const handleAdd = () => {
    const err = validate()
    if (Object.keys(err).length > 0) { setErrors(err); return }
    setDrivers([...drivers, { ...form, id: Date.now(), completion: '0' }])
    setForm(emptyForm)
    setErrors({})
    setShowModal(false)
  }

  const formatDate = (d) => {
    if (!d) return '—'
    const date = new Date(d)
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
  }

  return (
    <div className="page-content">
      <div className="filter-bar">
        <div className="filter-spacer" />
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setErrors({}); setShowModal(true) }}>
          + Add Driver
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Driver</th>
            <th>License No</th>
            <th>Category</th>
            <th>Expiry</th>
            <th>Contact</th>
            <th>Trip Compl.</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => (
            <tr key={d.id}>
              <td style={{ fontWeight: 700 }}>{d.name}</td>
              <td>{d.license}</td>
              <td>{d.category}</td>
              <td style={{ color: isExpired(d.expiry) ? '#f87171' : 'inherit' }}>
                {formatDate(d.expiry)}{isExpired(d.expiry) ? ' EXPIRED' : ''}
              </td>
              <td>{d.contact}</td>
              <td>{d.completion}%</td>
              <td><StatusBadge status={d.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20 }}>
        <div className="section-title">Toggle Status Legend</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['Available', 'On Trip', 'Off Duty', 'Suspended'].map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </div>

      <div className="rule-notice" style={{ marginTop: 12 }}>
        Rule: Expired license or Suspended status → blocked from trip assignment
      </div>

      {/* Add Driver Modal */}
      {showModal && (
        <Modal title="Add New Driver" onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label className="form-label">Full Name <span style={{ color: '#f87171' }}>*</span></label>
            <input
              className={`form-input ${errors.name ? 'input-err' : ''}`}
              placeholder="e.g. Ramesh Kumar"
              value={form.name}
              onChange={update('name')}
            />
            {errors.name && <div className="form-err-msg">{errors.name}</div>}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">License Number <span style={{ color: '#f87171' }}>*</span></label>
              <input
                className={`form-input ${errors.license ? 'input-err' : ''}`}
                placeholder="e.g. DL-99001"
                value={form.license}
                onChange={update('license')}
              />
              {errors.license && <div className="form-err-msg">{errors.license}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">License Category</label>
              <select className="form-input" value={form.category} onChange={update('category')}>
                <option>LMV</option>
                <option>HMV</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">License Expiry <span style={{ color: '#f87171' }}>*</span></label>
              <input
                className={`form-input ${errors.expiry ? 'input-err' : ''}`}
                type="date"
                min={TODAY}
                value={form.expiry}
                onChange={update('expiry')}
              />
              {errors.expiry && <div className="form-err-msg">{errors.expiry}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number <span style={{ color: '#f87171' }}>*</span></label>
              <input
                className={`form-input ${errors.contact ? 'input-err' : ''}`}
                placeholder="e.g. 9876500000"
                value={form.contact}
                onChange={update('contact')}
              />
              {errors.contact && <div className="form-err-msg">{errors.contact}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={form.status} onChange={update('status')}>
              <option>Available</option>
              <option>Off Duty</option>
              <option>Suspended</option>
            </select>
          </div>

          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAdd}>Add Driver</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
