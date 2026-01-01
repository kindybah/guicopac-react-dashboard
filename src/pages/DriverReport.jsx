import { useEffect, useMemo, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import ChartCard from '../components/ChartCard'
import Avatar from '../components/Avatar'
import KpiCard from '../components/KpiCard'
import FiltersBar from '../components/FiltersBar'
import { useData } from '../lib/data'
import { computeKPIs, computeHealthScore, getFilteredData, groupTrendByDay, statusMix } from '../lib/analytics'
import { exportNodeToPdf } from '../lib/exportPdf'

export default function DriverReport() {
  const { id } = useParams()
  const decoded = decodeURIComponent(id || '')
  const { drivers, setFilters, filters } = useData()
  const driver = useMemo(() => drivers.find((d) => d.id === decoded) || null, [drivers, decoded])

  // apply driver filter automatically for this view
  useEffect(() => {
    if (filters.driverId !== decoded) setFilters((p) => ({ ...p, driverId: decoded }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decoded])

  const { del, inc } = useMemo(() => getFilteredData(), [filters])
  const kpis = useMemo(() => computeKPIs({ del, inc }), [del, inc])
  const health = useMemo(() => computeHealthScore(kpis), [kpis])
  const trend = useMemo(() => groupTrendByDay(del), [del])
  const mix = useMemo(() => statusMix(del), [del])

  const wrapRef = useRef(null)

  const trendConfig = useMemo(() => ({
    type: 'line',
    data: { labels: trend.days, datasets: [{ label: 'Delivered', data: trend.deliveredSeries, tension: 0.35 }, { label: 'Failed', data: trend.failedSeries, tension: 0.35 }] },
    options: { responsive: true, plugins: { legend: { display: true } }, scales: { x: { ticks: { maxTicksLimit: 8 } } } }
  }), [trend])

  const mixConfig = useMemo(() => ({
    type: 'doughnut',
    data: { labels: Object.keys(mix), datasets: [{ label: 'Status', data: Object.values(mix) }] },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  }), [mix])

  if (!driver) {
    return (
      <div className="card p-4">
        <div className="font-extrabold">Driver not found</div>
        <div className="text-sm text-slate-500 mt-1">Return to Drivers list.</div>
        <Link to="/drivers" className="btn btn-primary mt-3">Back</Link>
      </div>
    )
  }

  return (
    <div className="space-y-4" ref={wrapRef}>
      <div className="card p-4 flex items-start justify-between gap-4 flex-col lg:flex-row">
        <div className="flex items-center gap-3">
          <Avatar name={driver.name} src={driver.photoDataUrl} size={64} />
          <div>
            <h1 className="text-xl font-extrabold">Driver Report</h1>
            <div className="text-sm text-slate-500">{driver.name} • ID: {driver.id}</div>
          </div>
        </div>
        <div className="no-print flex items-center gap-2">
          <Link className="btn btn-ghost" to="/drivers">Back</Link>
          <button className="btn btn-primary" onClick={() => exportNodeToPdf(wrapRef.current, `DriverReport-${driver.id}.pdf`)}>
            Export PDF
          </button>
        </div>
      </div>

      <FiltersBar />

      <div className="card p-4">
        <div className="text-xs text-slate-500 font-extrabold tracking-widest">HEALTH SCORE</div>
        <div className="mt-1 text-4xl font-extrabold">{health.toFixed(0)}<span className="text-base text-slate-500">/100</span></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.key} kpi={k} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ChartCard title="Delivered vs Failed" subtitle="By day" config={trendConfig} />
        </div>
        <ChartCard title="Status Mix" subtitle="Current window" config={mixConfig} />
      </div>

      <div className="card p-4">
        <div className="font-extrabold">Notes</div>
        <div className="text-sm text-slate-500 mt-1">Use deliveries/incidents pages to enter data with this driver ID for complete reporting.</div>
      </div>
    </div>
  )
}
