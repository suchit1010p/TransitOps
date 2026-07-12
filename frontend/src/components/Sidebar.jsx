import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/dashboard',     label: 'Dashboard' },
  { path: '/fleet',         label: 'Fleet' },
  { path: '/drivers',       label: 'Drivers' },
  { path: '/trips',         label: 'Trips' },
  { path: '/maintenance',   label: 'Maintenance' },
  { path: '/fuel-expenses', label: 'Fuel & Expenses' },
  { path: '/analytics',     label: 'Analytics' },
  { path: '/settings',      label: 'Settings' },
]

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onClose()
    navigate('/login')
  }

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      {/* Header with logo + mobile close */}
      <div className="sidebar-header">
        <div className="sidebar-logo">TransitOps</div>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">✕</button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout — pinned to bottom */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-icon">⏻</span>
          Logout
        </button>
      </div>
    </aside>
  )
}
