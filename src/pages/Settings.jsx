import { useMemo, useState } from 'react'
import { useAuth } from '../lib/auth'
import { useData } from '../lib/data'

export default function Settings() {
  const auth = useAuth()
  const data = useData()

  const [targets, setTargets] = useState(data.targets)
  const [pName, setPName] = useState('')
  const [pCode, setPCode] = useState('')
  const [uEmail, setUEmail] = useState('')
  const [uPass, setUPass] = useState('')
  const [uRole, setURole] = useState('OPS')

  const saveTargets = () => {
    data.setTargets({
      onTime: Number(targets.onTime),
      completion: Number(targets.completion),
      pod: Number(targets.pod),
      temp: Number(targets.temp),
      incidentMax: Number(targets.incidentMax)
    })
    alert('Targets saved')
  }

  const addPartner = () => {
    const res = data.addPartner(pName, pCode)
    if (!res.ok) return alert(res.message)
    setPName('')
    setPCode('')
  }

  const addUser = () => {
    if (!auth.isAdmin) return
    if (!uEmail || !uPass) return alert('Email and password required')
    auth.upsertUser({ email: uEmail, pass: uPass, role: uRole })
    setUEmail('')
    setUPass('')
    setURole('OPS')
  }

  const users = useMemo(() => {
    // read directly from storage via auth helpers output by add/update
    try {
      return JSON.parse(localStorage.getItem('gpc_users') || '[]')
    } catch {
      return []
    }
  }, [auth.session, data.partners, data.targets])

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h1 className="text-xl font-extrabold">Settings</h1>
        <div className="text-sm text-slate-500 mt-1">Business-standard controls: SLA targets, partner list, and role-based users.</div>
      </div>

      <div className="card p-4">
        <div className="font-extrabold">SLA Targets</div>
        <div className="text-sm text-slate-500 mt-1">These targets drive KPI status colors and scorecard thresholds.</div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            ['onTime', 'On-Time %'],
            ['completion', 'Completion %'],
            ['pod', 'POD %'],
            ['temp', 'Temp %'],
            ['incidentMax', 'Incident Max %']
          ].map(([k, label]) => (
            <div key={k}>
              <label className="text-xs font-bold text-slate-600">{label}</label>
              <input className="field mt-1" value={targets[k]} onChange={(e) => setTargets((p) => ({ ...p, [k]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn btn-primary" onClick={saveTargets}>Save Targets</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="font-extrabold">Partners</div>
          <div className="text-sm text-slate-500 mt-1">Admin can add/remove partners (Medifleet, US Pack, Marken, etc.).</div>

          {!auth.isAdmin ? (
            <div className="mt-3 text-sm text-slate-500">Only Admin can modify partner list.</div>
          ) : (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
              <input className="field" placeholder="Partner name" value={pName} onChange={(e) => setPName(e.target.value)} />
              <input className="field" placeholder="Code (e.g., USPAC)" value={pCode} onChange={(e) => setPCode(e.target.value)} />
              <button className="btn btn-primary" onClick={addPartner}>Add/Update</button>
            </div>
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 border-b">
                <tr>
                  <th className="py-2 text-left">Name</th>
                  <th className="py-2 text-left">Code</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.partners.map((p) => (
                  <tr key={p.code} className="border-b">
                    <td className="py-2 font-bold">{p.name}</td>
                    <td className="py-2 text-slate-500">{p.code}</td>
                    <td className="py-2 text-right">
                      {auth.isAdmin ? (
                        <button className="btn btn-danger" onClick={() => confirm('Remove partner?') && data.removePartner(p.code)}>Remove</button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-4">
          <div className="font-extrabold">Users & Roles</div>
          <div className="text-sm text-slate-500 mt-1">Admin can add/update users (email + password + role). Stored in browser localStorage for internal use.</div>

          {!auth.isAdmin ? (
            <div className="mt-3 text-sm text-slate-500">Only Admin can manage users.</div>
          ) : (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2">
              <input className="field" placeholder="email" value={uEmail} onChange={(e) => setUEmail(e.target.value)} />
              <input className="field" placeholder="password" value={uPass} onChange={(e) => setUPass(e.target.value)} />
              <select className="field" value={uRole} onChange={(e) => setURole(e.target.value)}>
                <option value="ADMIN">ADMIN</option>
                <option value="OPS">OPS</option>
                <option value="VIEWER">VIEWER</option>
              </select>
              <button className="btn btn-primary" onClick={addUser}>Add/Update</button>
            </div>
          )}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 border-b">
                <tr>
                  <th className="py-2 text-left">Email</th>
                  <th className="py-2 text-left">Role</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.email} className="border-b">
                    <td className="py-2 font-bold">{u.email}</td>
                    <td className="py-2 text-slate-500">{u.role}</td>
                    <td className="py-2 text-right">
                      {auth.isAdmin && u.email !== auth.email ? (
                        <button className="btn btn-danger" onClick={() => confirm('Delete this user?') && auth.deleteUser(u.email) && window.location.reload()}>Delete</button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
