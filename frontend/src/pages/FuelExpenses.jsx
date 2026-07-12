import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Modal from '../components/Modal'
import { getFuelLogs, addFuelLog, getExpenses, addExpense, clearFuelMessage } from '../features/fuelExpense/fuelExpenseSlice'
import { getVehicals } from '../features/vehical/vehicalSlice'
import './FuelExpenses.css'

const emptyFuel    = { vehicle_id: '', liters: '', cost: '', date: '' }
const emptyExpense = { vehicle_id: '', trip_id: '', expense_type: 'Toll', amount: '', expense_date: '', description: '' }

export default function FuelExpenses() {
  const dispatch = useDispatch()
  const { fuelLogs, expenses, loading, submitting, message, error } = useSelector((s) => s.fuelExpense)
  const { items: vehicles } = useSelector((s) => s.vehicle)
  const userRole = useSelector((s) => s.auth.user?.role)

  const isFinancialAnalyst = userRole === 'Financial Analyst'

  const [showFuel,  setShowFuel]  = useState(false)
  const [showExp,   setShowExp]   = useState(false)
  const [fuelForm,  setFuelForm]  = useState(emptyFuel)
  const [expForm,   setExpForm]   = useState(emptyExpense)
  const [fuelErr,   setFuelErr]   = useState({})
  const [expErr,    setExpErr]    = useState({})

  useEffect(() => {
    dispatch(getFuelLogs())
    dispatch(getExpenses())
    dispatch(getVehicals())
  }, [dispatch])

  useEffect(() => {
    if (message || error) {
      const t = setTimeout(() => dispatch(clearFuelMessage()), 3000)
      return () => clearTimeout(t)
    }
  }, [message, error, dispatch])

  const updateFuel = (f) => (e) => setFuelForm({ ...fuelForm, [f]: e.target.value })
  const updateExp  = (f) => (e) => setExpForm({ ...expForm,   [f]: e.target.value })

  const validateFuel = () => {
    const err = {}
    if (!fuelForm.vehicle_id) err.vehicle_id = 'Select a vehicle'
    if (!fuelForm.liters)     err.liters  = 'Enter liters consumed'
    if (!fuelForm.cost)       err.cost    = 'Enter fuel cost'
    if (!fuelForm.date)       err.date    = 'Enter date'
    return err
  }

  const validateExp = () => {
    const err = {}
    if (!expForm.vehicle_id)    err.vehicle_id = 'Select a vehicle'
    if (!expForm.amount)        err.amount = 'Enter amount'
    if (!expForm.expense_date)  err.expense_date = 'Enter date'
    return err
  }

  const handleAddFuel = () => {
    const err = validateFuel()
    if (Object.keys(err).length > 0) { setFuelErr(err); return }
    dispatch(addFuelLog({
      vehicle_id: fuelForm.vehicle_id,
      liters: Number(fuelForm.liters),
      cost: Number(fuelForm.cost),
      log_date: fuelForm.date,
    }))
    setFuelForm(emptyFuel); setFuelErr({}); setShowFuel(false)
  }

  const handleAddExp = () => {
    const err = validateExp()
    if (Object.keys(err).length > 0) { setExpErr(err); return }
    dispatch(addExpense({
      vehicle_id: expForm.vehicle_id,
      trip_id: expForm.trip_id || null,
      expense_type: expForm.expense_type,
      amount: Number(expForm.amount),
      expense_date: expForm.expense_date,
      description: expForm.description || null,
    }))
    setExpForm(emptyExpense); setExpErr({}); setShowExp(false)
  }

  const totalFuelCost  = fuelLogs.reduce((s, f) => s + Number(f.cost || 0), 0)
  const totalExpenses  = expenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const grandTotal     = totalFuelCost + totalExpenses

  return (
    <div className="page-content">
      {message && <div className="toast-success" style={{ marginBottom: 12 }}>✓ {message}</div>}
      {error && <div className="toast-error" style={{ marginBottom: 12 }}>✗ {error}</div>}

      {/* Fuel Logs Section */}
      <div className="fuel-section">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <div className="section-title" style={{ marginBottom: 0, flex: 1 }}>Fuel Logs</div>
          {isFinancialAnalyst && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" onClick={() => { setFuelForm(emptyFuel); setFuelErr({}); setShowFuel(true) }}>
                + Log Fuel
              </button>
              <button className="btn-primary" onClick={() => { setExpForm(emptyExpense); setExpErr({}); setShowExp(true) }}>
                + Add Expense
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '20px 0' }}>Loading...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Vehicle</th><th>Date</th><th>Liters</th><th>Fuel Cost (₹)</th></tr>
            </thead>
            <tbody>
              {fuelLogs.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 700 }}>{f.vehicle_name || f.registration_number || '—'}</td>
                  <td>{f.log_date ? new Date(f.log_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td>{Number(f.liters)} L</td>
                  <td>₹ {Number(f.cost).toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {fuelLogs.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No fuel logs yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Other Expenses Section */}
      <div className="fuel-section" style={{ marginTop: 28 }}>
        <div className="section-title">Other Expenses (Toll / Misc)</div>
        <table className="data-table">
          <thead>
            <tr><th>Vehicle</th><th>Type</th><th>Amount (₹)</th><th>Date</th><th>Description</th></tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td style={{ fontWeight: 700 }}>{e.vehicle_name || e.registration_number || '—'}</td>
                <td>{e.expense_type}</td>
                <td style={{ fontWeight: 700, color: 'var(--accent)' }}>₹ {Number(e.amount).toLocaleString('en-IN')}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 11 }}>
                  {e.expense_date ? new Date(e.expense_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{e.description || '—'}</td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>No expenses yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Grand Total */}
      <div className="total-cost-row">
        <span>Total Operational Cost (Auto) = Fuel + Expenses</span>
        <span className="total-cost-value">₹ {grandTotal.toLocaleString('en-IN')}</span>
      </div>

      {/* Log Fuel Modal */}
      {showFuel && (
        <Modal title="Log Fuel Entry" onClose={() => setShowFuel(false)}>
          <div className="form-group">
            <label className="form-label">Vehicle <span style={{ color: '#f87171' }}>*</span></label>
            <select className={`form-input ${fuelErr.vehicle_id ? 'input-err' : ''}`} value={fuelForm.vehicle_id} onChange={updateFuel('vehicle_id')}>
              <option value="">— Select Vehicle —</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.name_model} ({v.registration_number})</option>
              ))}
            </select>
            {fuelErr.vehicle_id && <div className="form-err-msg">{fuelErr.vehicle_id}</div>}
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
            <button className="btn-primary" onClick={handleAddFuel} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Fuel Log'}
            </button>
          </div>
        </Modal>
      )}

      {/* Add Expense Modal */}
      {showExp && (
        <Modal title="Add Expense" onClose={() => setShowExp(false)}>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Vehicle <span style={{ color: '#f87171' }}>*</span></label>
              <select className={`form-input ${expErr.vehicle_id ? 'input-err' : ''}`} value={expForm.vehicle_id} onChange={updateExp('vehicle_id')}>
                <option value="">— Select Vehicle —</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.name_model} ({v.registration_number})</option>
                ))}
              </select>
              {expErr.vehicle_id && <div className="form-err-msg">{expErr.vehicle_id}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Expense Type <span style={{ color: '#f87171' }}>*</span></label>
              <select className="form-input" value={expForm.expense_type} onChange={updateExp('expense_type')}>
                <option value="Toll">Toll</option>
                <option value="Parking">Parking</option>
                <option value="Misc">Misc</option>
                <option value="Penalty">Penalty</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Amount (₹) <span style={{ color: '#f87171' }}>*</span></label>
              <input className={`form-input ${expErr.amount ? 'input-err' : ''}`} type="number" placeholder="e.g. 120" value={expForm.amount} onChange={updateExp('amount')} />
              {expErr.amount && <div className="form-err-msg">{expErr.amount}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Date <span style={{ color: '#f87171' }}>*</span></label>
              <input className={`form-input ${expErr.expense_date ? 'input-err' : ''}`} type="date" value={expForm.expense_date} onChange={updateExp('expense_date')} />
              {expErr.expense_date && <div className="form-err-msg">{expErr.expense_date}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <input className="form-input" type="text" placeholder="e.g. Highway toll" value={expForm.description} onChange={updateExp('description')} />
          </div>

          <div className="modal-actions">
            <button className="btn-secondary" onClick={() => setShowExp(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAddExp} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
