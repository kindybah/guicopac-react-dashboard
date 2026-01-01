import { useData } from '../lib/data'
import { partnerLabel } from '../lib/storage'

export default function FiltersBar() {
  const { partners, drivers, filters, setFilters } = useData()

  return (
    <div className="card p-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-extrabold tracking-widest text-slate-500">LIVE FILTERS</div>
          <div className="text-lg font-extrabold mt-1">Partner & Date Range</div>
          <div className="text-sm text-slate-500 mt-1">KPIs update instantly when you change filters (manual entry + imports).</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full lg:w-auto">
          <div>
            <label className="text-xs font-extrabold text-slate-600">Partner</label>
            <select className="field mt-1" value={filters.partner} onChange={(e) => setFilters({ ...filters, partner: e.target.value })}>
              <option value="ALL">All Partners</option>
              {partners.map((p) => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">Driver</label>
            <select className="field mt-1" value={filters.driverId} onChange={(e) => setFilters({ ...filters, driverId: e.target.value })}>
              <option value="ALL">All Drivers</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">From</label>
            <input type="date" className="field mt-1" value={filters.from || ''} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-600">To</label>
            <input type="date" className="field mt-1" value={filters.to || ''} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="mt-3 text-sm text-slate-500">
        Showing: <span className="font-extrabold text-slate-900">{partnerLabel(filters.partner)}</span>
      </div>
    </div>
  )
}
