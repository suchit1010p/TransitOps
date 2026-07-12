import { useTheme } from '../context/ThemeContext'

const THEME_OPTIONS = [
  { value: 'dark',   icon: '🌙' },
  { value: 'light',  icon: '☀️' },
  { value: 'system', icon: '💻' },
]

export default function Header({ onMenuClick }) {
  const { theme, setTheme } = useTheme()

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
        <span className="header-user-name">Raven K.</span>
        <div className="user-badge">
          <span>Dispatcher</span>
          <div className="user-avatar">RK</div>
        </div>
      </div>
    </header>
  )
}
