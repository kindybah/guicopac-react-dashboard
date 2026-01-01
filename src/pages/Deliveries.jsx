import { useMemo, useState } from 'react'
import Modal from '../components/Modal'
import { useAuth } from '../lib/auth'
import { useData } from '../lib/data'
import { partnerLabel } from '../lib/storage'

const statuses = ['DELIVERED', 'IN_TRANSIT', 'FAILED']

export default function Deliveries() {
  const auth = useAuth()
  const data = useData()
  const { deliveries, partners, drivers } = data
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    id: '',
    partner: partners[0]?.code || 'MEDIFLEET',
    date: new Date().toISOString().slice(0, 10),
    route: '',
    status: 'DELIVERED',
    onTime: true,
    pod: true,
    tempOk: true,
    driverId: '',
    driverName: ''
  })

  const sorted = useMemo(() => [...deliveries].sort((a, b) => String(b.date).localeCompare(String(a.date))), [deliveries])

  function openAdd() {
    setEditing(null)
    setForm({
      id: '',
      partner: partners[0]?.code || 'MEDIFLEET',
      date: new Date().toISOString().slice(0, 10),
      route: '',
      status: 'DELIVERED',
      onTime: true,
      pod: true,
      tempOk: true,
      driverId: '',
      driverName: ''
    })
    setOpen(true)
  }

  function openEdit(row) {
    setEditing(row.id)
    setForm({ ...row })
    setOpen(true)
  }

  function onDriverChange(id) {
    const d = drivers.find((x) => x.id === id)
    setForm((s) => ({ ...s, driverId: id, driverName: d?.name || s.driverName }))
  }

  function save() {
    const res = data.upsertDelivery(form)
    if (!res.ok) return
    setOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-start justify-between gap-3 flex-col md:flex-row">
        <div>
          <h1 className="text-2xl font-extrabold">Deliveries</h1>
          <div className="text-sm text-slate-500 mt-1">Manual entry, edits, and assignment to drivers. Viewer is read-only.</div>
        </div>
        {auth.canEdit ? (
          <button className="btn btn-primary" onClick={openAdd}>+ Add Delivery</button>
        ) : null}
      </div>

      <div className="card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-slate-500 border-b">
            <tr>
              <th className="py-2 text-left">ID</th>
              <th className="py-2 text-left">Partner</th>
              <th className="py-2 text-left">Date</th>
              <th className="py-2 text-left">Route</th>
              <th className="py-2 text-left">Driver</th>
              <th className="py-2 text-left">Status</th>
              <th className="py-2 text-left">OnTime</th>
              <th className="py-2 text-left">POD</th>
              <th className="py-2 text-left">TempOk</th>
              {auth.canEdit ? <th className="py-2 text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr key={d.id} className="border-b last:border-0">
                <td className="py-2 font-bold">{d.id}</td>
                <td className="py-2">{partnerLabel(String(d.partner).toUpperCase())}</td>
                <td className="py-2">{String(d.date).slice(0, 10)}</td>
                <td className="py-2">{d.route}</td>
                <td className="py-2">
                  <div className="font-bold">{d.driverName || '—'}</div>
                  <div className="text-xs text-slate-500">{d.driverId || ''}</div>
                </td>
                <td className="py-2"><span className="badge badge-gray">{d.status}</span></td>
                <td className="py-2">{d.onTime ? '✅' : '❌'}</td>
                <td className="py-2">{d.pod ? '✅' : '❌'}</td>
                <td className="py-2">{(d.tempOk ?? true) ? '✅' : '❌'}</td>
                {auth.canEdit ? (
                  <td className="py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-ghost" onClick={() => openEdit(d)}>Edit</button>
                      {auth.isAdmin ? <button className="btn btn-danger" onClick={() => data.removeDelivery(d.id)}>Delete</button> : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} title={editing ? `Edit Delivery — ${editing}` : 'Add Delivery'} onClose={() => setOpen(false)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-600">ID</label>
            <input className="field mt-1" value={form.id} onChange={(e) => setForm((s) => ({ ...s, id: e.target.value }))} placeholder="DEL-1001" />
            <div className="text-xs text-slate-500 mt-1">Leave blank to auto-generate.</div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600">Partner</label>
            <select className="field mt-1" value={form.partner} onChange={(e) => setForm((s) => ({ ...s, partner: e.target.value }))}>
              {partners.map((p) => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600">Date</label>
            <input type="date" className="field mt-1" value={String(form.date).slice(0, 10)} onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600">Route</label>
            <input className="field mt-1" value={form.route} onChange={(e) => setForm((s) => ({ ...s, route: e.target.value }))} placeholder="EWR → NYC" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600">Driver</label>
            <select className="field mt-1" value={form.driverId} onChange={(e) => onDriverChange(e.target.value)}>
              <option value="">— Select driver —</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600">Driver Name (optional)</label>
            <input className="field mt-1" value={form.driverName} onChange={(e) => setForm((s) => ({ ...s, driverName: e.target.value }))} placeholder="Auto-filled when you select a driver" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600">Status</label>
            <select className="field mt-1" value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-slate-50 border p-3">
            <div className="text-xs font-extrabold text-slate-500">SLA FLAGS</div>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.onTime} onChange={(e) => setForm((s) => ({ ...s, onTime: e.target.checked }))} /> On-Time</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.pod} onChange={(e) => setForm((s) => ({ ...s, pod: e.target.checked }))} /> POD</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.tempOk !== false} onChange={(e) => setForm((s) => ({ ...s, tempOk: e.target.checked }))} /> Temp OK</label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>{editing ? 'Save Changes' : 'Save Delivery'}</button>
        </div>
      </Modal>
    </div>
  )
}
