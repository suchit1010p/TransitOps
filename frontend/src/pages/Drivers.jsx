import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import { addDriver, getDrivers, updateDriverSafety, updateDriverStatus } from '../features/driver/driverSlice.js'

const TODAY = new Date().toISOString().split('T')[0]

const VALID_DRIVER_VALUES = ['Available', 'On Trip', 'Off Duty', 'Suspended']

const emptyForm = {
  name: '',
  license: '',
  category: 'LMV',
  expiry: '',
  contact: '',
  status: 'Available',
  safety_status: 'Available',
}

const isExpired = (dateStr) => dateStr && new Date(dateStr) < new Date()

const normalizeDriverValue = (value) => {
  return VALID_DRIVER_VALUES.includes(value) ? value : 'Available'
}

export default function Drivers() {
  const dispatch = useDispatch()
  const { items: drivers, loading, error, message } = useSelector((state) => state.driver)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    dispatch(getDrivers())
  }, [dispatch])

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value })

  const validate = () => {
    const err = {}
    if (!form.name.trim()) err.name = 'Driver name is required'
    if (!form.license.trim()) err.license = 'License number is required'
    if (!form.expiry) err.expiry = 'License expiry date is required'
    if (!form.contact.trim()) err.contact = 'Contact number is required'
    return err
  }

  const handleAdd = async () => {
    const err = validate()
    if (Object.keys(err).length > 0) {
      setErrors(err)
      return
    }

    const result = await dispatch(addDriver({
      name: form.name,
      license_number: form.license,
      license_category: form.category,
      license_expiry_date: form.expiry,
      contact_number: form.contact,
      status: normalizeDriverValue(form.status),
      safety_status: normalizeDriverValue(form.safety_status),
    }))

    if (addDriver.fulfilled.match(result)) {
      setForm(emptyForm)
      setErrors({})
      setShowModal(false)
    }
  }

  const handleStatusChange = (id, status) => {
    dispatch(updateDriverStatus({ id, status: normalizeDriverValue(status) }))
  }

  const handleSafetyChange = (id, safety_status) => {
    dispatch(updateDriverSafety({ id, safety_status: normalizeDriverValue(safety_status) }))
  }

  const formatDate = (date) => {
    if (!date) return '—'
    const parsed = new Date(date)
    return `${String(parsed.getMonth() + 1).padStart(2, '0')}/${parsed.getFullYear()}`
  }

  return (
    <div className="page-content">
      <div className="filter-bar">
        <div className="filter-spacer" />
        <button className="btn-primary" onClick={() => { setForm(emptyForm); setErrors({}); setShowModal(true) }}>
          + Add Driver
        </button>
      </div>

      {error && <div className="form-err-msg" style={{ marginBottom: 12 }}>{error}</div>}
      {message && <div style={{ color: '#22c55e', marginBottom: 12 }}>{message}</div>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Driver</th>
            <th>License No</th>
            <th>Category</th>
            <th>Expiry</th>
            <th>Contact</th>
            <th>Safety</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading && !drivers.length ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>Loading drivers...</td>
            </tr>
          ) : !drivers.length ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>No drivers found.</td>
            </tr>
          ) : drivers.map((driver) => (
            <tr key={driver.id}>
              <td style={{ fontWeight: 700 }}>{driver.name}</td>
              <td>{driver.license_number}</td>
              <td>{driver.license_category}</td>
              <td style={{ color: isExpired(driver.license_expiry_date) ? '#f87171' : 'inherit' }}>
                {formatDate(driver.license_expiry_date)}{isExpired(driver.license_expiry_date) ? ' EXPIRED' : ''}
              </td>
              <td>{driver.contact_number || '—'}</td>
              <td>
                <select
                  className="form-input"
                  value={driver.safety_status || 'Available'}
                  onChange={(event) => handleSafetyChange(driver.id, event.target.value)}
                  style={{ minWidth: 110 }}
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </td>
              <td>
                <select
                  className="form-input"
                  value={driver.status || 'Available'}
                  onChange={(event) => handleStatusChange(driver.id, event.target.value)}
                  style={{ minWidth: 110 }}
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 20 }}>
        <div className="section-title">Toggle Status Legend</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['Available', 'On Trip', 'Off Duty', 'Suspended'].map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </div>

      <div className="rule-notice" style={{ marginTop: 12 }}>
        Rule: Expired license or Suspended status → blocked from trip assignment
      </div>

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
                <option value="LMV">LMV</option>
                <option value="HMV">HMV</option>
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

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={update('status')}>
                <option value="Available">Available</option>
                <option value="Off Duty">Off Duty</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Safety Status</label>
              <select className="form-input" value={form.safety_status} onChange={update('safety_status')}>
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="Off Duty">Off Duty</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
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
