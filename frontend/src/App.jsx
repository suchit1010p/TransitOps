import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Fleet from './pages/Fleet'
import Drivers from './pages/Drivers'
import Trips from './pages/Trips'
import Maintenance from './pages/Maintenance'
import FuelExpenses from './pages/FuelExpenses'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import ProtectedRoute from './routes/ProtectedRoute'

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-main">
        <Header onMenuClick={() => setSidebarOpen((o) => !o)} />
        {children}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"          element={<Login />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"     element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/fleet"         element={<DashboardLayout><Fleet /></DashboardLayout>} />
            <Route path="/drivers"       element={<DashboardLayout><Drivers /></DashboardLayout>} />
            <Route path="/trips"         element={<DashboardLayout><Trips /></DashboardLayout>} />
            <Route path="/maintenance"   element={<DashboardLayout><Maintenance /></DashboardLayout>} />
            <Route path="/fuel-expenses" element={<DashboardLayout><FuelExpenses /></DashboardLayout>} />
            <Route path="/analytics"     element={<DashboardLayout><Analytics /></DashboardLayout>} />
            <Route path="/settings"      element={<DashboardLayout><Settings /></DashboardLayout>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
