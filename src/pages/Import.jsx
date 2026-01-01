import { useState } from 'react'
import { useData } from '../lib/data'
import { useAuth } from '../lib/auth'

const templates = {
  deliveries: 'id,partner,date,route,status,onTime,pod,tempOk,driverId,driverName\nDEL-0001,USPACK,2026-01-01,EWR→NYC,DELIVERED,true,true,true,DRV-1001,Alpha Diallo',
  incidents: 'id,partner,date,type,severity,notes,driverId,driverName\nINC-0001,MARKEN,2026-01-01,LATE,MED,Traffic delay,DRV-1001,Alpha Diallo',
  drivers: 'id,name,phone,email\nDRV-1003,New Driver,555-555-5555,newdriver@example.com'
}

export default function Import() {
  const auth = useAuth()
  const data = useData()
  const [type, setType] = useState('deliveries')
  const [text, setText] = useState(templates.deliveries)
  const [msg, setMsg] = useState('')

  const onFile = async (file) => {
    if (!file) return
    const t = await file.text()
    setText(t)
  }

  const runImport = () => {
    const res = data.importCsv(text, type)
    if (!res.ok) return setMsg(`❌ ${res.message}`)
    setMsg(`✅ Imported ${res.count} rows into ${type}.`)
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h1 className="text-xl font-extrabold">Import (CSV)</h1>
        <div className="text-sm text-slate-500 mt-1">Paste CSV or upload a file. Imported rows are saved to browser storage.</div>
      </div>

      {!auth.canEdit ? (
        <div className="card p-4">
          <div className="font-extrabold text-red-700">Read-only account</div>
          <div className="text-sm text-slate-500 mt-1">Only Admin/Ops can import.</div>
        </div>
      ) : null}

      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-600">Import type</label>
            <select className="field mt-1" value={type} onChange={(e) => {
              const v = e.target.value
              setType(v)
              setText(templates[v])
              setMsg('')
            }}>
              <option value="deliveries">Deliveries</option>
              <option value="incidents">Incidents</option>
              <option value="drivers">Drivers</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600">Upload CSV</label>
            <input className="mt-1" type="file" accept=".csv,text/csv" onChange={(e) => onFile(e.target.files?.[0])} />
          </div>
          <div className="flex items-end">
            <button className="btn btn-primary w-full" onClick={runImport} disabled={!auth.canEdit}>Import Now</button>
          </div>
        </div>

        <textarea className="field" style={{ minHeight: 240 }} value={text} onChange={(e) => setText(e.target.value)} />

        {msg ? <div className="text-sm font-bold">{msg}</div> : null}

        <div className="text-sm text-slate-500">
          Tip: Include <span className="font-extrabold">driverId</span> in deliveries/incidents to enable per-driver reporting.
        </div>
      </div>
    </div>
  )
}
