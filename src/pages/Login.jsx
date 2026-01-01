import { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function Login() {
  const auth = useAuth()
  const [email, setEmail] = useState('admin@guicopac.com')
  const [pass, setPass] = useState('Admin123!')
  const [error, setError] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    const res = auth.login(email, pass)
    if (!res.ok) setError(res.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(circle_at_top,rgba(250,204,21,.18),transparent_55%),linear-gradient(180deg,#0b0f19,#0b0f19)]">
      <div className="w-full max-w-md card p-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gpc-black text-gpc-yellow font-extrabold flex items-center justify-center border border-slate-200">GP</div>
          <div>
            <div className="font-extrabold text-xl">Guicopac Ops Dashboard</div>
            <div className="text-sm text-slate-500">Internal use only • Role-based access</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-extrabold text-slate-600">Email</label>
            <input className="field mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-extrabold text-slate-600">Password</label>
            <input className="field mt-1" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
          </div>
          {error ? <div className="text-sm text-red-600 font-bold">{error}</div> : null}
          <button className="btn btn-primary w-full" type="submit">Login</button>
        </form>

        <div className="mt-6 text-xs text-slate-500">
          Default users are stored in your browser <span className="font-bold">localStorage</span>.
          You can manage users in Settings (Admin only).
        </div>
      </div>
    </div>
  )
}
