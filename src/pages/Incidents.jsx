import { useMemo, useState } from 'react'
import Modal from '../components/Modal'
import { useAuth } from '../lib/auth'
import { useData } from '../lib/data'

const severities = ['LOW', 'MED', 'HIGH']
const types = ['LATE', 'POD_MISSING', 'TEMP_EXCURSION', 'DAMAGE', 'OTHER']

export default function Incidents() {
  const auth = useAuth()
  const data = useData()
  const { incidents, partners, drivers } = data

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const editing = useMemo(() => incidents.find((x) => x.id === editingId) || null, [incidents, editingId])

  const [form, setForm] = useState({
    id: '',
    partner: partners[0]?.code || 'MEDIFLEET',
    date: new Date().toISOString().slice(0, 10),
    type: 'LATE',
    severity: 'MED',
    notes: '',
    driverId: '',
    driverName: ''
  })

  const openAdd = () => {
    setEditingId(null)
    setForm({ id: '', partner: partners[0]?.code || 'MEDIFLEET', date: new Date().toISOString().slice(0, 10), type: 'LATE', severity: 'MED', notes: '', driverId: '', driverName: '' })
    setOpen(true)
  }

  const openEdit = (i) => {
    setEditingId(i.id)
    setForm({ ...i })
    setOpen(true)
  }

  const save = () => {
    const res = data.upsertIncident(form)
    if (!res.ok) return alert(res.message)
    setOpen(false)
  }

  const setDriver = (driverId) => {
    const d = drivers.find((x) => x.id === driverId)
    setForm((p) => ({ ...p, driverId, driverName: d?.name || p.driverName }))
  }

  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-start justify-between gap-4 flex-col lg:flex-row">
        <div>
          <h1 className="text-xl font-extrabold">Incidents</h1>
          <div className="text-sm text-slate-500 mt-1">Exception log for SLA analysis and corrective action tracking.</div>
        </div>
        {auth.canEdit ? (
          <button className="btn btn-primary" onClick={openAdd}>
            + Add Incident
          </button>
        ) : null}
      </div>

      <div className="card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-slate-500 border-b">
            <tr>
              <th className="py-2 text-left">ID</th>
              <th className="py-2 text-left">Partner</th>
              <th className="py-2 text-left">Date</th>
              <th className="py-2 text-left">Driver</th>
              <th className="py-2 text-left">Type</th>
              <th className="py-2 text-left">Severity</th>
              <th className="py-2 text-left">Notes</th>
              <th className="py-2 text-right no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((i) => (
              <tr key={i.id} className="border-b last:border-0">
                <td className="py-2 font-bold">{i.id}</td>
                <td className="py-2">{i.partner}</td>
                <td className="py-2">{String(i.date || '').slice(0, 10)}</td>
                <td className="py-2">{i.driverName || i.driverId || '—'}</td>
                <td className="py-2">{i.type}</td>
                <td className="py-2">{i.severity}</td>
                <td className="py-2 max-w-[260px] truncate">{i.notes || '—'}</td>
                <td className="py-2 text-right no-print">
                  {auth.canEdit ? (
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-ghost" onClick={() => openEdit(i)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => confirm('Delete this incident?') && data.removeIncident(i.id)}>
                        Delete
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400">Read-only</span>
                  )}
                </td>
              </tr>
            ))}
            {incidents.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-6 text-center text-slate-500">
                  No incidents yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Modal open={open} title={editing ? `Edit Incident — ${editing.id}` : 'Add Incident'} onClose={() => setOpen(false)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-600">ID</label>
            <input className="field mt-1" value={form.id} placeholder="INC-..." onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600">Partner</label>
            <select className="field mt-1" value={form.partner} onChange={(e) => setForm((p) => ({ ...p, partner: e.target.value }))}>
              {partners.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600">Date</label>
            <input type="date" className="field mt-1" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600">Driver</label>
            <select className="field mt-1" value={form.driverId} onChange={(e) => setDriver(e.target.value)}>
              <option value="">— None —</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600">Type</label>
            <select className="field mt-1" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600">Severity</label>
            <select className="field mt-1" value={form.severity} onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value }))}>
              {severities.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-600">Notes</label>
            <textarea className="field mt-1" rows="3" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save}>
            Save
          </button>
        </div>
      </Modal>
    </div>
  )
}
