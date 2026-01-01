import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Truck, AlertTriangle, Upload, FileText, Settings, Users } from 'lucide-react'
import { useAuth } from '../lib/auth'

const item = (to, label, Icon) => ({ to, label, Icon })

const links = [
  item('/', 'Dashboard', LayoutDashboard),
  item('/deliveries', 'Deliveries', Truck),
  item('/drivers', 'Drivers', Users),
  item('/incidents', 'Incidents', AlertTriangle),
  item('/import', 'Import CSV', Upload),
  item('/scorecard', 'Export Scorecard', FileText),
  item('/settings', 'Settings', Settings)
]

export default function Sidebar({ className = '' }) {
  const auth = useAuth()

  return (
    <aside className={`no-print ${className}`}>
      <div className="rounded-[22px] bg-[radial-gradient(circle_at_top,rgba(250,204,21,.18),transparent_50%),linear-gradient(180deg,#0b0f19,#0b0f19)] text-white p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gpc-yellow text-gpc-black font-extrabold flex items-center justify-center">GP</div>
          <div>
            <div className="font-extrabold">Guicopac LLC</div>
            <div className="text-xs text-slate-300">Internal Ops Dashboard</div>
          </div>
        </div>

        <div className="mt-4 text-xs font-extrabold tracking-wider text-slate-300">NAVIGATION</div>
        <nav className="mt-3 space-y-2">
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 w-full px-3 py-2 rounded-2xl ${isActive ? 'bg-white/10 text-white' : 'text-slate-200 hover:bg-white/5'}`
              }
            >
              <Icon size={18} />
              <span className="font-extrabold text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 glass rounded-2xl p-3">
          <div className="text-xs text-slate-300 font-bold">ROLE</div>
          <div className="font-extrabold">{auth.role || '—'}</div>
          <div className="text-xs text-slate-300 mt-1">Admin: full • Ops: add/edit • Viewer: read-only</div>
        </div>

        <button onClick={auth.logout} className="mt-4 w-full btn btn-ghost">Logout</button>
      </div>
    </aside>
  )
}
