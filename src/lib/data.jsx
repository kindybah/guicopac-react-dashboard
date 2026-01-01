import { createContext, useContext, useMemo } from 'react'
import Papa from 'papaparse'
import { DB_KEYS, uuid } from './storage'
import { useLocalStore } from './useLocalStore'

const DataCtx = createContext(null)

export function DataProvider({ children }) {
  const [partners, setPartners] = useLocalStore(DB_KEYS.PARTNERS, [])
  const [drivers, setDrivers] = useLocalStore(DB_KEYS.DRIVERS, [])
  const [deliveries, setDeliveries] = useLocalStore(DB_KEYS.DELIVERIES, [])
  const [incidents, setIncidents] = useLocalStore(DB_KEYS.INCIDENTS, [])
  const [targets, setTargets] = useLocalStore(DB_KEYS.TARGETS, { onTime: 98, completion: 99, pod: 100, temp: 100, incidentMax: 0.5 })
  const [filters, setFilters] = useLocalStore(DB_KEYS.FILTERS, { partner: 'ALL', from: '', to: '', driverId: 'ALL' })

  const value = useMemo(() => {
    function addPartner(name, code) {
      const c = String(code).toUpperCase().replace(/\s+/g, '')
      const n = String(name).trim()
      if (!c || !n) return { ok: false, message: 'Partner name and code required.' }
      const idx = partners.findIndex((p) => p.code === c)
      const next = [...partners]
      const row = { name: n, code: c }
      if (idx >= 0) next[idx] = row
      else next.push(row)
      setPartners(next)
      return { ok: true }
    }

    function removePartner(code) {
      const c = String(code).toUpperCase()
      setPartners(partners.filter((p) => p.code !== c))
      // keep data; partner field may still reference old code
    }

    function upsertDriver(d) {
      const cleaned = {
        id: String(d.id || '').trim() || uuid('DRV'),
        name: String(d.name || '').trim(),
        phone: String(d.phone || '').trim(),
        email: String(d.email || '').trim(),
        photoDataUrl: String(d.photoDataUrl || '')
      }
      if (!cleaned.name) return { ok: false, message: 'Driver name is required.' }
      const idx = drivers.findIndex((x) => x.id === cleaned.id)
      const next = [...drivers]
      if (idx >= 0) next[idx] = cleaned
      else next.push(cleaned)
      setDrivers(next)
      return { ok: true, id: cleaned.id }
    }

    function removeDriver(id) {
      setDrivers(drivers.filter((d) => d.id !== id))
    }

    function upsertDelivery(row) {
      const cleaned = {
        id: String(row.id || '').trim() || uuid('DEL'),
        partner: String(row.partner || partners[0]?.code || 'PARTNER').toUpperCase(),
        date: String(row.date || new Date().toISOString().slice(0, 10)).slice(0, 10),
        route: String(row.route || '').trim(),
        status: String(row.status || 'DELIVERED').toUpperCase(),
        onTime: !!row.onTime,
        pod: !!row.pod,
        tempOk: row.tempOk !== false,
        driverId: String(row.driverId || '').trim(),
        driverName: String(row.driverName || '').trim()
      }
      const idx = deliveries.findIndex((d) => d.id === cleaned.id)
      const next = [...deliveries]
      if (idx >= 0) next[idx] = cleaned
      else next.push(cleaned)
      setDeliveries(next)
      return { ok: true, id: cleaned.id }
    }

    function removeDelivery(id) {
      setDeliveries(deliveries.filter((d) => d.id !== id))
    }

    function upsertIncident(row) {
      const cleaned = {
        id: String(row.id || '').trim() || uuid('INC'),
        partner: String(row.partner || partners[0]?.code || 'PARTNER').toUpperCase(),
        date: String(row.date || new Date().toISOString().slice(0, 10)).slice(0, 10),
        type: String(row.type || 'LATE').toUpperCase(),
        severity: String(row.severity || 'MED').toUpperCase(),
        notes: String(row.notes || ''),
        driverId: String(row.driverId || '').trim(),
        driverName: String(row.driverName || '').trim()
      }
      const idx = incidents.findIndex((i) => i.id === cleaned.id)
      const next = [...incidents]
      if (idx >= 0) next[idx] = cleaned
      else next.push(cleaned)
      setIncidents(next)
      return { ok: true, id: cleaned.id }
    }

    function removeIncident(id) {
      setIncidents(incidents.filter((i) => i.id !== id))
    }

    function importCsv(text, type) {
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
      if (parsed.errors?.length) return { ok: false, message: parsed.errors[0].message }
      const rows = parsed.data || []

      if (type === 'deliveries') {
        rows.forEach((r) =>
          upsertDelivery({
            ...r,
            onTime: String(r.onTime).toLowerCase() === 'true' || r.onTime === '1',
            pod: String(r.pod).toLowerCase() === 'true' || r.pod === '1',
            tempOk: !(String(r.tempOk).toLowerCase() === 'false' || r.tempOk === '0')
          })
        )
        return { ok: true, count: rows.length }
      }

      if (type === 'incidents') {
        rows.forEach((r) => upsertIncident(r))
        return { ok: true, count: rows.length }
      }

      if (type === 'drivers') {
        rows.forEach((r) => upsertDriver(r))
        return { ok: true, count: rows.length }
      }

      return { ok: false, message: 'Unknown import type.' }
    }

    return {
      partners,
      drivers,
      deliveries,
      incidents,
      targets,
      filters,
      setFilters,
      setTargets,
      addPartner,
      removePartner,
      upsertDriver,
      removeDriver,
      upsertDelivery,
      removeDelivery,
      upsertIncident,
      removeIncident,
      importCsv
    }
  }, [partners, drivers, deliveries, incidents, targets, filters, setFilters, setTargets, setPartners, setDrivers, setDeliveries, setIncidents])

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>
}

export function useData() {
  const ctx = useContext(DataCtx)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
