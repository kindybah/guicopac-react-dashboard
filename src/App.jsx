import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Deliveries from './pages/Deliveries'
import Incidents from './pages/Incidents'
import ImportPage from './pages/Import'
import Scorecard from './pages/Scorecard'
import Settings from './pages/Settings'
import Drivers from './pages/Drivers'
import DriverReport from './pages/DriverReport'
import { useAuth } from './lib/auth'

function Shell({ children }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-4">
      <Sidebar className="col-span-12 md:col-span-3" />
      <main className="col-span-12 md:col-span-9">{children}</main>
    </div>
  )
}

function Private({ children }) {
  const auth = useAuth()
  if (!auth.session) return <Navigate to="/login" replace />
  return <Shell>{children}</Shell>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Private><Dashboard /></Private>} />
        <Route path="/deliveries" element={<Private><Deliveries /></Private>} />
        <Route path="/incidents" element={<Private><Incidents /></Private>} />
        <Route path="/drivers" element={<Private><Drivers /></Private>} />
        <Route path="/drivers/:id" element={<Private><DriverReport /></Private>} />
        <Route path="/import" element={<Private><ImportPage /></Private>} />
        <Route path="/scorecard" element={<Private><Scorecard /></Private>} />
        <Route path="/settings" element={<Private><Settings /></Private>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
