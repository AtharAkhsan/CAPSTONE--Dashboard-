# IQC Precision — Industrial Inspection Dashboard

Real-time quality control dashboard for micro-part quantity verification in manufacturing environments. Built with React, Vite, and Supabase.

## Overview

This dashboard is the **web monitoring layer** of a larger industrial inspection pipeline that combines AI-based density estimation, load cell sensor fusion, and camera-based visual verification. It provides:

- **Real-time telemetry** — Live sensor data from the operator station (Streamlit) via Supabase Realtime (Postgres Changes)
- **Inspection logs** — Automated PASS/REJECT decisions based on a configurable tolerance threshold (default: 3%)
- **Live camera feed** — Semi-live inspection snapshots fetched from Supabase Storage
- **QC Analytics** — Charts and KPIs derived from verification logs, NG reports, and vendor claim data
- **Role-based access** — Internal (admin/manager) and vendor viewer roles with Supabase Auth + RLS

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Styling | TailwindCSS 4 |
| Backend | Supabase (Database, Auth, Storage, Realtime) |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |

## Project Structure

```
src/
├── App.tsx                 # Main app — routing, layout, LiveInspection, MasterData, DiscrepancyLogs
├── main.tsx                # Entry point
├── index.css               # Global styles & design tokens
├── types.ts                # TypeScript interfaces
├── context/
│   └── AuthContext.tsx      # Supabase Auth provider (session, profile, roles)
├── hooks/
│   └── useQCData.ts        # QC Analytics data hook (verification logs, NG, claims)
├── lib/
│   ├── supabase.ts         # Supabase client initialization
│   └── utils.ts            # Utility functions (cn)
└── pages/
    ├── LoginPage.tsx        # Authentication page
    └── QCAnalytics.tsx      # QC Analytics dashboard (charts, KPIs, alerts)
```

## Database Schema

| Table | Purpose |
|---|---|
| `users` | User profiles with role and vendor association |
| `vendors` | Vendor registry |
| `parts` | Part catalog (code, name, weight, tolerance) |
| `verification_logs` | Inspection results (target, actual, AI count, load cell, status) |
| `telemetry_logs` | Real-time sensor telemetry from operator station |
| `ng_reports` | Non-Good quality reports |
| `claim_reports` | Vendor claim tracking |

**Storage Bucket:** `camera_snapshots` — Latest inspection frame and per-log proof images.

## Prerequisites

- Node.js v18+
- A Supabase project with the schema above

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables** — create `.env.local`:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Start the dev server:**

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:3000`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | TypeScript type checking |
| `npm run clean` | Remove `dist` folder |

## Deployment

Build and deploy the `dist` folder to any static hosting:

```bash
npm run build
```

Recommended platforms: **Vercel**, Netlify, or Cloudflare Pages.

> **Note:** Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) must be configured in your hosting provider's dashboard.

## Architecture

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Operator Station   │     │     Supabase      │     │   Web Dashboard     │
│  (Streamlit/Python) │────▶│  Database/Storage │◀────│   (This Project)    │
│                     │     │  Realtime/Auth    │     │                     │
│  • AI Counting      │     └──────────────────┘     │  • Live Telemetry   │
│  • Load Cell Sensor │                               │  • Inspection Logs  │
│  • Camera Capture   │                               │  • QC Analytics     │
└─────────────────────┘                               └─────────────────────┘
```

## Key Features

### Live Inspection
- Real-time telemetry via Supabase Postgres Changes subscription
- Semi-live camera feed (1.5s polling from Storage)
- Dynamic PASS/REJECT status with color-coded indicators

### Discrepancy Logs
- Filterable by date range and status (PASS/REJECT)
- Per-log inspection proof images
- CSV export functionality
- Detailed variance analysis panel

### QC Analytics
- KPI cards (Total Inspections, NG Rate, Claim Amount)
- Distribution pie chart, trend lines, sensor comparison bars
- NG category breakdown and vendor ranking
- Smart alerts for anomalies and threshold breaches

### Master Data
- Part registry with CRUD operations
- Inventory health overview (compliance rate, critical discrepancies)
