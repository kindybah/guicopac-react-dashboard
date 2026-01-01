import clsx from 'clsx'

const map = {
  green: 'badge badge-green',
  yellow: 'badge badge-yellow',
  red: 'badge badge-red',
  gray: 'badge badge-gray'
}

export default function KpiCard({ kpi }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-slate-500 font-extrabold tracking-widest">KPI</div>
          <div className="text-lg font-extrabold mt-1">{kpi.label}</div>
        </div>
        <span className={clsx(map[kpi.status] || map.gray)}>
          {kpi.status === 'green' ? 'ON TRACK' : kpi.status === 'yellow' ? 'AT RISK' : 'OFF TRACK'}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="text-3xl font-extrabold">
          {kpi.current}
          <span className="text-base font-bold text-slate-500 ml-1">{kpi.unit}</span>
        </div>
        <div className="text-sm text-slate-500">
          Target: <span className="font-extrabold text-slate-900">{kpi.target}{kpi.unit}</span>
        </div>
      </div>
    </div>
  )
}
