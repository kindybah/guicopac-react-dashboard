export const DB_KEYS = {
  USERS: 'gpc_users',
  SESSION: 'gpc_session',
  DELIVERIES: 'gpc_deliveries',
  INCIDENTS: 'gpc_incidents',
  TARGETS: 'gpc_targets',
  FILTERS: 'gpc_filters',
  PARTNERS: 'gpc_partners',
  DRIVERS: 'gpc_drivers'
}

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const v = JSON.parse(raw)
    return v ?? fallback
  } catch {
    return fallback
  }
}

export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function uuid(prefix) {
  return `${prefix}-${Math.random().toString(16).slice(2, 8)}${Date.now().toString().slice(-5)}`
}

export function ensureDefaults() {
  if (!load(DB_KEYS.USERS, null)) {
    save(DB_KEYS.USERS, [
      { email: 'admin@guicopac.com', pass: 'Admin123!', role: 'ADMIN' },
      { email: 'ops@guicopac.com', pass: 'Ops123!', role: 'OPS' },
      { email: 'viewer@guicopac.com', pass: 'View123!', role: 'VIEWER' }
    ])
  }

  if (!load(DB_KEYS.TARGETS, null)) {
    save(DB_KEYS.TARGETS, { onTime: 98.0, completion: 99.0, pod: 100.0, temp: 100.0, incidentMax: 0.5 })
  }

  if (!load(DB_KEYS.PARTNERS, null)) {
    save(DB_KEYS.PARTNERS, [
      { name: 'Medifleet', code: 'MEDIFLEET' },
      { name: 'US Pack', code: 'USPACK' },
      { name: 'Marken', code: 'MARKEN' }
    ])
  }

  if (!load(DB_KEYS.FILTERS, null)) {
    const today = new Date()
    const to = today.toISOString().slice(0, 10)
    const fromDate = new Date(today.getTime() - 29 * 86400000)
    const from = fromDate.toISOString().slice(0, 10)
    save(DB_KEYS.FILTERS, { partner: 'ALL', from, to, driverId: 'ALL' })
  }

  if (!load(DB_KEYS.DELIVERIES, null)) save(DB_KEYS.DELIVERIES, [])
  if (!load(DB_KEYS.INCIDENTS, null)) save(DB_KEYS.INCIDENTS, [])

  if (!load(DB_KEYS.DRIVERS, null)) {
    save(DB_KEYS.DRIVERS, [
      {
        id: 'DRV-1001',
        name: 'Alpha Diallo',
        phone: '',
        email: '',
        photoDataUrl: ''
      },
      {
        id: 'DRV-1002',
        name: 'Foulamoussou Bah',
        phone: '',
        email: '',
        photoDataUrl: ''
      }
    ])
  }
}

export function partnerLabel(code) {
  if (code === 'ALL') return 'All'
  const partners = load(DB_KEYS.PARTNERS, [])
  const p = partners.find((x) => x.code === code)
  return p ? p.name : code
}

export function getRole() {
  return load(DB_KEYS.SESSION, null)?.role ?? null
}

export function canEdit() {
  return ['ADMIN', 'OPS'].includes(getRole())
}

export function isAdmin() {
  return getRole() === 'ADMIN'
}
