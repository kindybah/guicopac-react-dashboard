import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '../components/Modal'
import Avatar from '../components/Avatar'
import { useAuth } from '../lib/auth'
import { useData } from '../lib/data'

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function Drivers() {
  const auth = useAuth()
  const data = useData()
  const { drivers } = data

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const editing = useMemo(() => drivers.find((d) => d.id === editingId) || null, [drivers, editingId])

  const [form, setForm] = useState({ id: '', name: '', phone: '', email: '', photoDataUrl: '' })

  const openAdd = () => {
    setEditingId(null)
    setForm({ id: '', name: '', phone: '', email: '', photoDataUrl: '' })
    setOpen(true)
  }

  const openEdit = (d) => {
    setEditingId(d.id)
    setForm({ ...d })
    setOpen(true)
  }

  const save = async () => {
    const res = data.upsertDriver(form)
    if (!res.ok) return alert(res.message)
    setOpen(false)
  }

  const onPhoto = async (file) => {
    if (!file) return
    const url = await fileToDataUrl(file)
    setForm((p) => ({ ...p, photoDataUrl: url }))
  }

  return (
    <div className="space-y-4">
      <div className="card p-4 flex items-start justify-between gap-4 flex-col lg:flex-row">
        <div>
          <h1 className="text-xl font-extrabold">Drivers</h1>
          <div className="text-sm text-slate-500 mt-1">Driver profiles (photo + ID) and individual performance reports.</div>
        </div>
        {auth.canEdit ? (
          <button className="btn btn-primary" onClick={openAdd}>
            + Add Driver
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {drivers.map((d) => (
          <div key={d.id} className="card p-4">
            <div className="flex items-center gap-3">
              <Avatar name={d.name} src={d.photoDataUrl} size={52} />
              <div className="min-w-0">
                <div className="font-extrabold truncate">{d.name}</div>
                <div className="text-sm text-slate-500">ID: {d.id}</div>
              </div>
            </div>

            <div className="mt-3 text-sm text-slate-600">
              <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="font-bold">{d.phone || '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-bold">{d.email || '—'}</span></div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Link className="btn btn-ghost" to={`/drivers/${encodeURIComponent(d.id)}`}>View Report</Link>
              {auth.canEdit ? (
                <>
                  <button className="btn btn-ghost" onClick={() => openEdit(d)}>Edit</button>
                  <button className="btn btn-danger" onClick={() => confirm('Remove this driver?') && data.removeDriver(d.id)}>Remove</button>
                </>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} title={editing ? `Edit Driver — ${editing.name}` : 'Add Driver'} onClose={() => setOpen(false)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-600">Driver ID</label>
            <input className="field mt-1" value={form.id} placeholder="e.g., DRV-1003" onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))} />
            <div className="text-xs text-slate-500 mt-1">Leave blank to auto-generate.</div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600">Name *</label>
            <input className="field mt-1" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600">Phone</label>
            <input className="field mt-1" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600">Email</label>
            <input className="field mt-1" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-600">Photo</label>
            <div className="mt-2 flex items-center gap-3">
              <Avatar name={form.name || 'Driver'} src={form.photoDataUrl} size={64} />
              <input type="file" accept="image/*" onChange={(e) => onPhoto(e.target.files?.[0])} />
              {form.photoDataUrl ? <button className="btn btn-ghost" onClick={() => setForm((p) => ({ ...p, photoDataUrl: '' }))}>Remove Photo</button> : null}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Save</button>
        </div>
      </Modal>
    </div>
  )
}
