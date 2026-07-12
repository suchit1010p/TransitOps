import { useTheme } from '../context/ThemeContext'
import { useSelector } from 'react-redux'

const THEME_OPTIONS = [
  { value: 'dark',   icon: '🌙' },
  { value: 'light',  icon: '☀️' },
  { value: 'system', icon: '💻' },
]

export default function Header({ onMenuClick }) {
  const { theme, setTheme } = useTheme()
  const user = useSelector((state) => state.auth.user)

  const fullName = user?.fullName || user?.name || 'Guest'
  const role = user?.role || 'User'

  // Shorten name: "Raven Kumar" -> "Raven K."
  const nameParts = fullName.trim().split(' ')
  const displayName = nameParts.length > 1
    ? `${nameParts[0]} ${nameParts[1][0]}.`
    : nameParts[0]

  // Initials for avatar: "Raven Kumar" -> "RK"
  const initials = nameParts.map(p => p[0]?.toUpperCase()).slice(0, 2).join('')

  return (
    <header className="top-header">
      {/* Hamburger — mobile only */}
      <button className="hamburger-btn" onClick={onMenuClick} aria-label="Open menu">
        <span /><span /><span />
      </button>

      <input className="search-bar" type="text" placeholder="Search..." />
      <div className="header-spacer" />

      {/* Theme pill toggle */}
      <div className="theme-pill">
        {THEME_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`theme-pill-btn ${theme === opt.value ? 'active' : ''}`}
            onClick={() => setTheme(opt.value)}
            title={opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}
          >
            {opt.icon}
          </button>
        ))}
      </div>

      {/* User profile */}
      <div className="header-user">
        <span className="header-user-name">{displayName}</span>
        <div className="user-badge">
          <span>{role}</span>
          <div className="user-avatar">{initials}</div>
        </div>
      </div>
    </header>
  )
}
