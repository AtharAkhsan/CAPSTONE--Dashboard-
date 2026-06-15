# Precision IQC — Dashboard Kontrol Kualitas Industri

Dashboard kontrol kualitas real-time untuk verifikasi jumlah micro-part di lingkungan manufaktur. Dibangun dengan React, Vite, dan Supabase.

## Ringkasan

Dashboard ini merupakan **lapisan monitoring web** dari pipeline inspeksi industri yang lebih besar, menggabungkan estimasi densitas berbasis AI, fusi sensor load cell, dan verifikasi visual berbasis kamera. Fitur yang disediakan:

- **Telemetri real-time** — Data sensor langsung dari stasiun operator melalui Supabase Realtime (Postgres Changes)
- **Log inspeksi** — Keputusan PASS/REJECT otomatis berdasarkan threshold toleransi yang dapat dikonfigurasi (default: 3%)
- **Feed kamera langsung** — Snapshot inspeksi semi-live yang diambil dari Supabase Storage
- **Analitik QC** — Grafik dan KPI dari log verifikasi, laporan NG, dan data klaim vendor
- **Klaim Vendor** — Alur kerja klaim end-to-end dengan pelacakan status, linking laporan NG, dan portal aksi vendor
- **Akses berbasis peran** — Peran internal (admin/manager) dan vendor viewer dengan Supabase Auth + RLS

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Styling | TailwindCSS 4 |
| Backend | Supabase (Database, Auth, Storage, Realtime) |
| Grafik | Recharts |
| Animasi | Framer Motion |
| Ikon | Lucide React |

## Struktur Proyek

```
src/
├── App.tsx                 # Aplikasi utama — routing, layout, LiveInspection, MasterData, DiscrepancyLogs
├── main.tsx                # Entry point
├── index.css               # Gaya global & design token
├── types.ts                # Interface TypeScript
├── context/
│   └── AuthContext.tsx      # Provider Auth Supabase (session, profil, peran)
├── hooks/
│   └── useQCData.ts        # Hook data Analitik QC (log verifikasi, NG, klaim)
├── lib/
│   ├── supabase.ts         # Inisialisasi client Supabase
│   └── utils.ts            # Fungsi utilitas (cn)
└── pages/
    ├── LoginPage.tsx        # Halaman autentikasi
    ├── QCAnalytics.tsx      # Dashboard Analitik QC (grafik, KPI, alert)
    └── VendorClaims.tsx     # Manajemen klaim vendor (alur kerja, laporan NG, aksi)
```

## Skema Database

| Tabel | Kegunaan |
|---|---|
| `users` | Profil pengguna dengan peran dan asosiasi vendor |
| `vendors` | Registrasi vendor |
| `parts` | Katalog part (kode, nama, berat, toleransi) |
| `verification_logs` | Hasil inspeksi (target, aktual, AI count, load cell, status) |
| `telemetry_logs` | Telemetri sensor real-time dari stasiun operator |
| `ng_reports` | Laporan kualitas Non-Good dengan kategori dan pelacakan status |
| `claim_reports` | Pelacakan siklus hidup klaim vendor dengan status alur kerja |

**Bucket Storage:** `camera_snapshots` — Frame inspeksi terbaru dan gambar bukti per log.

## Prasyarat

- Node.js v18+
- Proyek Supabase dengan skema di atas

## Instalasi

1. **Install dependensi:**

   ```bash
   npm install
   ```

2. **Konfigurasi variabel environment** — buat file `.env`:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Jalankan server development:**

   ```bash
   npm run dev
   ```

   Aplikasi berjalan di `http://localhost:3000`.

## Perintah

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan server development |
| `npm run build` | Build untuk produksi |
| `npm run preview` | Preview build produksi secara lokal |
| `npm run lint` | Pengecekan tipe TypeScript |
| `npm run clean` | Menghapus folder `dist` |

## Deployment

Build dan deploy folder `dist` ke hosting statis manapun:

```bash
npm run build
```

Platform yang direkomendasikan: **Vercel**, Netlify, atau Cloudflare Pages.

> **Catatan:** Variabel environment (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) harus dikonfigurasi di dashboard penyedia hosting Anda.

## Arsitektur

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Stasiun Operator   │     │     Supabase      │     │   Web Dashboard     │
│  (Streamlit/Python) │────▶│  Database/Storage │◀────│   (Proyek Ini)      │
│                     │     │  Realtime/Auth    │     │                     │
│  • AI Counting      │     └──────────────────┘     │  • Telemetri Live   │
│  • Sensor Load Cell │                               │  • Log Inspeksi     │
│  • Capture Kamera   │                               │  • Analitik QC      │
└─────────────────────┘                               └─────────────────────┘
```

## Fitur Utama

### Inspeksi Live
- Telemetri real-time melalui subscription Supabase Postgres Changes
- Feed kamera semi-live (polling 1,5 detik dari Storage)
- Status PASS/REJECT dinamis dengan indikator berkode warna

### Riwayat Inspeksi
- Catatan lengkap seluruh hasil inspeksi dengan filter rentang tanggal
- Filter status (PASS/REJECT)
- Ekspor CSV

### Laporan Diskrepansi
- Log inspeksi yang ditolak dan memerlukan peninjauan
- Gambar bukti inspeksi per log
- Pengajuan permintaan klaim ke vendor secara inline (khusus admin)

### Analitik QC
- Kartu KPI (Total Inspeksi, Reject Rate, Jumlah Klaim)
- Pie chart distribusi, grafik tren, bar perbandingan sensor
- Breakdown kategori NG dan ranking vendor
- Alert otomatis untuk anomali dan pelanggaran threshold

### Klaim Vendor
- Alur kerja klaim end-to-end: Submitted → Under Review → Accepted → Replacement Sent → Resolved
- Aksi berbasis peran (vendor dapat accept/reject/kirim pengganti)
- Laporan NG terkait per klaim dengan modal detail
- Ringkasan KPI (total klaim, aksi pending, jumlah resolved)

### Master Data
- Registrasi part dengan operasi CRUD
- Overview kesehatan inventaris (tingkat kepatuhan, diskrepansi kritis)

## Peran & Akses

| Peran | Akses |
|---|---|
| `superadmin` / `admin` / `manager` | Semua halaman termasuk Inspeksi Live, Master Data, dan pembuatan klaim |
| `vendor_viewer` | Analitik QC, Riwayat Inspeksi, Laporan Diskrepansi, dan Klaim (dengan kemampuan aksi) |

## Lisensi

© 2026 IQC Precision Systems. Hak cipta dilindungi undang-undang.
