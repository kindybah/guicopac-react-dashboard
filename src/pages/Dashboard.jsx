import { useMemo } from 'react'
import KpiCard from '../components/KpiCard'
import ChartCard from '../components/ChartCard'
import FiltersBar from '../components/FiltersBar'
import { useData } from '../lib/data'
import { computeKPIs, computeHealthScore, buildInsights, getFilteredData, groupTrendByDay, incidentTypes, statusMix } from '../lib/analytics'

export default function Dashboard() {
  const { deliveries, incidents } = useData()

  const { f, del, inc } = useMemo(() => getFilteredData(), [deliveries, incidents])

  const kpis = useMemo(() => computeKPIs({ del, inc }), [del, inc])
  const health = useMemo(() => computeHealthScore(kpis), [kpis])
  const insights = useMemo(() => buildInsights({ del, inc, health }), [del, inc, health])
  const trend = useMemo(() => groupTrendByDay(del), [del])
  const mix = useMemo(() => statusMix(del), [del])
  const incType = useMemo(() => incidentTypes(inc), [inc])

  const trendConfig = useMemo(() => ({
    type: 'line',
    data: {
      labels: trend.days,
      datasets: [
        { label: 'Delivered', data: trend.deliveredSeries, tension: 0.35 },
        { label: 'Failed', data: trend.failedSeries, tension: 0.35 }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: { x: { ticks: { maxTicksLimit: 8 } } }
    }
  }), [trend])

  const mixConfig = useMemo(() => ({
    type: 'doughnut',
    data: {
      labels: Object.keys(mix),
      datasets: [{ label: 'Status', data: Object.values(mix) }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  }), [mix])

  const incConfig = useMemo(() => ({
    type: 'bar',
    data: {
      labels: incType.types,
      datasets: [{ label: 'Incidents', data: incType.counts }]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { maxTicksLimit: 8 } } } }
  }), [incType])

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-col lg:flex-row">
        <div>
          <h1 className="text-2xl font-extrabold">Operations Overview</h1>
          <div className="text-sm text-slate-500 mt-1">Live KPIs update instantly as you add/edit deliveries, drivers, incidents, or imports.</div>
        </div>
        <div className="card p-4 w-full lg:w-auto">
          <div className="text-xs text-slate-500 font-extrabold tracking-widest">HEALTH SCORE</div>
          <div className="mt-1 text-4xl font-extrabold">{health.toFixed(0)}<span className="text-base text-slate-500">/100</span></div>
          <div className="text-xs text-slate-500 mt-1">Range: {f.from || '—'} to {f.to || '—'}</div>
        </div>
      </div>

      <FiltersBar />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.key} kpi={k} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <ChartCard title="Delivered vs Failed Trend" subtitle="By day (based on current filters)" config={trendConfig} />
        </div>
        <ChartCard title="Status Mix" subtitle="Delivered / In Transit / Failed" config={mixConfig} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <ChartCard title="Incidents by Type" subtitle="What is driving exceptions" config={incConfig} />

        <div className="card p-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-extrabold">Operational Insights</div>
              <div className="text-sm text-slate-500 mt-1">Auto-generated action prompts from selected data.</div>
            </div>
            <span className="badge badge-gray">REAL-TIME</span>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((x) => (
              <div key={x.title} className="rounded-2xl border border-slate-200 p-3 bg-slate-50">
                <div className="text-xs font-extrabold tracking-widest text-slate-500">{x.title.toUpperCase()}</div>
                <div className="mt-1 font-bold">{x.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
