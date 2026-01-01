import { load, DB_KEYS } from './storage'

export function inDateRange(isoDate, from, to) {
  if (!isoDate) return false
  const d = String(isoDate).slice(0, 10)
  if (from && d < from) return false
  if (to && d > to) return false
  return true
}

export function getFilteredData() {
  const f = load(DB_KEYS.FILTERS, { partner: 'ALL', from: '', to: '', driverId: 'ALL' })
  const deliveries = load(DB_KEYS.DELIVERIES, [])
  const incidents = load(DB_KEYS.INCIDENTS, [])

  const del = deliveries.filter((x) => {
    const pOk = f.partner === 'ALL' || String(x.partner).toUpperCase() === f.partner
    const dOk = f.driverId === 'ALL' || String(x.driverId || '') === f.driverId
    return pOk && dOk && inDateRange(String(x.date || ''), f.from, f.to)
  })

  const inc = incidents.filter((x) => {
    const pOk = f.partner === 'ALL' || String(x.partner).toUpperCase() === f.partner
    const dOk = f.driverId === 'ALL' || String(x.driverId || '') === f.driverId
    return pOk && dOk && inDateRange(String(x.date || ''), f.from, f.to)
  })

  return { f, del, inc }
}

export function pct(n, d) {
  return d === 0 ? 0 : (n / d) * 100
}

export function getStatus(current, target, higherIsBetter = true) {
  if (higherIsBetter) {
    if (current >= target) return 'green'
    if (current >= target * 0.9) return 'yellow'
    return 'red'
  }
  if (current <= target) return 'green'
  if (current <= target * 1.25) return 'yellow'
  return 'red'
}

export function computeKPIs({ del, inc }) {
  const targets = load(DB_KEYS.TARGETS, {})

  const total = del.length
  const delivered = del.filter((x) => String(x.status).toUpperCase() === 'DELIVERED').length
  const completion = pct(delivered, total)
  const onTime = pct(
    del.filter((x) => String(x.status).toUpperCase() === 'DELIVERED' && !!x.onTime).length,
    Math.max(delivered, 1)
  )
  const pod = pct(
    del.filter((x) => String(x.status).toUpperCase() === 'DELIVERED' && !!x.pod).length,
    Math.max(delivered, 1)
  )
  const temp = pct(
    del.filter((x) => String(x.status).toUpperCase() === 'DELIVERED' && (x.tempOk ?? true)).length,
    Math.max(delivered, 1)
  )
  const incidentRate = pct(inc.length, Math.max(total, 1))

  const kpis = [
    { key: 'ontime', label: 'On-Time', unit: '%', current: +onTime.toFixed(1), target: targets.onTime, status: getStatus(onTime, targets.onTime, true) },
    { key: 'completion', label: 'Completion', unit: '%', current: +completion.toFixed(1), target: targets.completion, status: getStatus(completion, targets.completion, true) },
    { key: 'pod', label: 'POD', unit: '%', current: +pod.toFixed(1), target: targets.pod, status: getStatus(pod, targets.pod, true) },
    { key: 'temp', label: 'Temp', unit: '%', current: +temp.toFixed(1), target: targets.temp, status: getStatus(temp, targets.temp, true) },
    { key: 'incidents', label: 'Incidents', unit: '%', current: +incidentRate.toFixed(2), target: targets.incidentMax, status: getStatus(incidentRate, targets.incidentMax, false) }
  ]

  return kpis
}

export function computeHealthScore(kpis) {
  const t = load(DB_KEYS.TARGETS, {})
  const w = { ontime: 0.25, completion: 0.25, pod: 0.2, temp: 0.2, incidents: 0.1 }
  const map = Object.fromEntries(kpis.map((k) => [k.key, k.current]))
  const invInc = Math.max(0, 100 - (map.incidents / Math.max(t.incidentMax, 0.01)) * 100)
  const score = map.ontime * w.ontime + map.completion * w.completion + map.pod * w.pod + map.temp * w.temp + invInc * w.incidents
  return Math.max(0, Math.min(100, score))
}

export function buildInsights({ del, inc, health }) {
  const delivered = del.filter((x) => String(x.status).toUpperCase() === 'DELIVERED')
  const lateCount = delivered.filter((x) => !x.onTime).length
  const podMissing = delivered.filter((x) => !x.pod).length
  const tempIssues = delivered.filter((x) => (x.tempOk ?? true) === false).length

  const topType = Object.entries(
    inc.reduce((a, x) => {
      const t = String(x.type || 'OTHER').toUpperCase()
      a[t] = (a[t] || 0) + 1
      return a
    }, {})
  ).sort((a, b) => b[1] - a[1])[0]

  const msgs = []
  msgs.push({ title: 'Health', text: `${health.toFixed(0)}/100 — ${health >= 85 ? 'Strong performance.' : 'Needs attention on key SLA metrics.'}` })
  msgs.push({ title: 'Late deliveries', text: `${lateCount} of ${delivered.length} delivered. Focus on dispatch timing + pickup buffers.` })
  msgs.push({ title: 'POD gaps', text: `${podMissing} missing POD. Enforce photo/signature before closeout.` })
  msgs.push({ title: 'Temperature', text: `${tempIssues} temp exceptions. Prioritize logger checks for clinical routes.` })
  msgs.push({ title: 'Top incident', text: topType ? `${topType[0]} (${topType[1]}). Add corrective actions + prevention steps.` : 'No incidents in selected range.' })
  return msgs
}

export function groupTrendByDay(del) {
  const byDay = {}
  del.forEach((d) => {
    const day = String(d.date || '').slice(0, 10)
    if (!day) return
    if (!byDay[day]) byDay[day] = { delivered: 0, failed: 0 }
    const st = String(d.status || '').toUpperCase()
    if (st === 'DELIVERED') byDay[day].delivered += 1
    if (st === 'FAILED') byDay[day].failed += 1
  })
  const days = Object.keys(byDay).sort()
  return {
    days,
    deliveredSeries: days.map((x) => byDay[x].delivered),
    failedSeries: days.map((x) => byDay[x].failed)
  }
}

export function statusMix(del) {
  const statusCounts = { DELIVERED: 0, IN_TRANSIT: 0, FAILED: 0 }
  del.forEach((d) => {
    const st = String(d.status || '').toUpperCase()
    if (statusCounts[st] !== undefined) statusCounts[st] += 1
  })
  return statusCounts
}

export function incidentTypes(inc) {
  const byType = {}
  inc.forEach((i) => {
    const t = String(i.type || 'OTHER').toUpperCase()
    byType[t] = (byType[t] || 0) + 1
  })
  const types = Object.keys(byType).sort((a, b) => byType[b] - byType[a])
  return { types, counts: types.map((t) => byType[t]) }
}
