import { useState } from 'react'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import './FuelExpenses.css'

const vehicleOptions = ['VAN-05', 'TRUCK-11', 'MINI-08', 'VAN-09']
const tripOptions    = ['TR001', 'TR002', 'TR003', 'TR004']

const initialFuelLogs = [
  { id: 1, vehicle: 'VAN-05',   date: '05 Jul 2026', liters: '42 L', cost: 3150 },
  { id: 2, vehicle: 'TRUCK-11', date: '06 Jul 2026', liters: '110 L', cost: 8400 },
  { id: 3, vehicle: 'MINI-08',  date: '06 Jul 2026', liters: '28 L', cost: 2050 },
]

const initialExpenses = [
  { id: 1, trip: 'TR001', vehicle: 'VAN-05',   toll: 120, other: 0,   maintLinked: 0,      status: 'Available' },
  { id: 2, trip: 'TR002', vehicle: 'TRK-12',   toll: 340, other: 150, maintLinked: 18000,  status: 'Completed' },
]

const emptyFuel    = { vehicle: '', liters: '', cost: '', date: '' }
const emptyExpense = { trip: '', vehicle: '', toll: '', other: '', maintLinked: '' }

export default function FuelExpenses() {
  const [fuelLogs,  setFuelLogs]  = useState(initialFuelLogs)
  const [expenses,  setExpenses]  = useState(initialExpenses)
  const [showFuel,  setShowFuel]  = useState(false)
  const [showExp,   setShowExp]   = useState(false)
  const [fuelForm,  setFuelForm]  = useState(emptyFuel)
  const [expForm,   setExpForm]   = useState(emptyExpense)
  const [fuelErr,   setFuelErr]   = useState({})
  const [expErr,    setExpErr]    = useState({})

  const updateFuel = (f) => (e) => setFuelForm({ ...fuelForm, [f]: e.target.value })
  const updateExp  = (f) => (e) => setExpForm({ ...expForm,   [f]: e.target.value })

  const validateFuel = () => {
    const err = {}
    if (!fuelForm.vehicle) err.vehicle = 'Select a vehicle'
    if (!fuelForm.liters)  err.liters  = 'Enter liters consumed'
    if (!fuelForm.cost)    err.cost    = 'Enter fuel cost'
    if (!fuelForm.date)    err.date    = 'Enter date'
    return err
  }

  const validateExp = () => {
    const err = {}
    if (!expForm.vehicle) err.vehicle = 'Select a vehicle'
    return err
  }

  const handleAddFuel = () => {
    const err = validateFuel()
    if (Object.keys(err).length > 0) { setFuelErr(err); return }
    setFuelLogs([...fuelLogs, {
      id: Date.now(),
      vehicle: fuelForm.vehicle,
      date: new Date(fuelForm.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      liters: `${fuelForm.liters} L`,
      cost: Number(fuelForm.cost),
    }])
    setFuelForm(emptyFuel); setFuelErr({}); setShowFuel(false)
  }

  const handleAddExp = () => {
    const err = validateExp()
    if (Object.keys(err).length > 0) { setExpErr(err); return }
    setExpenses([...expenses, {
      id: Date.now(),
      trip: expForm.trip || '—',
      vehicle: expForm.vehicle,
      toll: Number(expForm.toll) || 0,
      other: Number(expForm.other) || 0,
      maintLinked: Number(expForm.maintLinked) || 0,
      status: 'Available',
    }])
    setExpForm(emptyExpense); setExpErr({}); setShowExp(false)
  }

  const totalFuelCost  = fuelLogs.reduce((s, f) => s + f.cost, 0)
  const totalExpenses  = expenses.reduce((s, e) => s + e.toll + e.other + e.maintLinked, 0)
  const grandTotal     = totalFuelCost + totalExpenses

  return (
    <div className="page-content">
      {/* Fuel Logs Section */}
      <div className="fuel-section">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <div className="section-title" style={{ marginBottom: 0, flex: 1 }}>Fuel Logs</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={() => { setFuelForm(emptyFuel); setFuelErr({}); setShowFuel(true) }}>
              + Log Fuel
            </button>
            <button className="btn-primary" onClick={() => { setExpForm(emptyExpense); setExpErr({}); setShowExp(true) }}>
              + Add Expense
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr><th>Vehicle</th><th>Date</th><th>Liters</th><th>Fuel Cost (₹)</th></tr>
          </thead>
          <tbody>
            {fuelLogs.map((f) => (
              <tr key={f.id}>
                <td style={{ fontWeight: 700 }}>{f.vehicle}</td>
                <td>{f.date}</td>
                <td>{f.liters}</td>
                <td>₹ {f.cost.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Other Expenses Section */}
      <div className="fuel-section" style={{ marginTop: 28 }}>
        <div className="section-title">Other Expenses (Toll / Misc)</div>
        <table className="data-table">
          <thead>
            <tr><th>Trip</th><th>Vehicle</th><th>Toll (₹)</th><th>Other (₹)</th><th>Maint. Linked (₹)</th><th>Total (₹)</th></tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td style={{ fontWeight: 700 }}>{e.trip}</td>
                <td>{e.vehicle}</td>
                <td>{e.toll}</td>
                <td>{e.other}</td>
                <td>{e.maintLinked.toLocaleString('en-IN')}</td>
                <td style={{ fontWeight: 700, color: 'var(--accent)' }}>
                  {(e.toll + e.other + e.maintLinked).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grand Total */}
      <div className="total-cost-row">
        <span>Total Operational Cost (Auto) = Fuel + Maintenance</span>
        <span className="total-cost-value">₹ {grandTotal.toLocaleString('en-IN')}</span>
      </div>

      {/* Log Fuel Modal */}
      {showFuel && (
        <Modal title="Log Fuel Entry" onClose={() => setShowFuel(false)}>
          <div className="form-group">
            <label className="form-label">Vehicle <span style={{ color: '#f87171' }}>*</span></label>
            <select className={`form-input ${fuelErr.vehicle ? 'input-err' : ''}`} value={fuelForm.vehicle} onChange={updateFuel('vehicle')}>
              <option value="">— Select Vehicle —</option>
              {vehicleOptions.map((v) => <option key={v}>{v}</option>)}
            </select>
            {fuelErr.vehicle && <div className="form-err-msg">{fuelErr.vehicle}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Date <span style={{ color: '#f87171' }}>*</span></label>
            <input className={`form-input ${fuelErr.date ? 'input-err' : ''}`} type="date" value={fuelForm.date} onChange={updateFuel('date')} />
            {fuelErr.date && <div className="form-err-msg">{fuelErr.date}</div>}
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Liters Consumed <span style={{ color: '#f87171' }}>*</span></label>
              <input className={`form-input ${fuelErr.liters ? 'input-err' : ''}`} type="number" placeholder="e.g. 42" value={fuelForm.liters} onChange={updateFuel('liters')} />
              {fuelErr.liters && <div className="form-err-msg">{fuelErr.liters}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Total Cost (₹) <span style={{ color: '#f87171' }}>*</span></label>
              <input className={`form-input ${fuelErr.cost ? 'input-err' : ''}`} type="number" placeholder="e.g. 3150" value={fuelForm.cost} onChange={updateFuel('cost')} />
              {fuelErr.cost && <div className="form-err-msg">{fuelErr.cost}</div>}
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setShowFuel(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAddFuel}>Save Fuel Log</button>
          </div>
        </Modal>
      )}

      {/* Add Expense Modal */}
      {showExp && (
        <Modal title="Add Other Expense" onClose={() => setShowExp(false)}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Trip (Optional)</label>
              <select className="form-input" value={expForm.trip} onChange={updateExp('trip')}>
                <option value="">— No trip linked —</option>
                {tripOptions.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle <span style={{ color: '#f87171' }}>*</span></label>
              <select className={`form-input ${expErr.vehicle ? 'input-err' : ''}`} value={expForm.vehicle} onChange={updateExp('vehicle')}>
                <option value="">— Select Vehicle —</option>
                {vehicleOptions.map((v) => <option key={v}>{v}</option>)}
              </select>
              {expErr.vehicle && <div className="form-err-msg">{expErr.vehicle}</div>}
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Toll Amount (₹)</label>
              <input className="form-input" type="number" placeholder="0" value={expForm.toll} onChange={updateExp('toll')} />
            </div>
            <div className="form-group">
              <label className="form-label">Other / Misc (₹)</label>
              <input className="form-input" type="number" placeholder="0" value={expForm.other} onChange={updateExp('other')} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Maintenance Linked (₹)</label>
            <input className="form-input" type="number" placeholder="0 — pulled from maintenance cost" value={expForm.maintLinked} onChange={updateExp('maintLinked')} />
          </div>

          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setShowExp(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAddExp}>Save Expense</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
