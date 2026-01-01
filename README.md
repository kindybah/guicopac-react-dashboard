# Guicopac LLC — Internal Ops Dashboard (React)

A modern, internal-only operations dashboard with:
- Role-based login (Admin / Ops / Viewer)
- Deliveries, Incidents, and Drivers modules
- Driver Profiles (photo + driver ID) + per-driver report page
- Real-time KPI recalculation (updates instantly on add/edit/import)
- CSV import for deliveries / incidents / drivers
- PDF export (overall scorecard + driver report)
- Partner management (Admin can add/remove partners)

## Default logins
- **Admin**: `admin@guicopac.com` / `Admin123!`
- **Ops**: `ops@guicopac.com` / `Ops123!`
- **Viewer**: `viewer@guicopac.com` / `View123!`

> All data is stored in **localStorage** (no backend). Suitable for internal, manual entry.

## Local setup
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy to Vercel (step by step)

### Option A — GitHub (recommended)
1. Create a new GitHub repo and push this folder.
2. In Vercel: **New Project** → import the repo.
3. Framework preset: **Vite**.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

### Option B — Vercel CLI
```bash
npm i -g vercel
vercel
```
- When prompted:
  - Framework: **Vite**
  - Build command: `npm run build`
  - Output directory: `dist`

## CSV templates
You can copy templates from **Import CSV** page.

### Deliveries
`id,partner,date,route,status,onTime,pod,tempOk,driverId,driverName`

### Drivers
`id,name,phone,email,photoDataUrl`

### Incidents
`id,partner,date,type,severity,notes,driverId,driverName`

---
**Note:** For route URLs on Vercel, `vercel.json` includes a rewrite so React Router deep links work.
# guicopac-react-dashboard
