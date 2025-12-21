# 🗺️ Sistem Informasi Geografis (SIG) Desa Ngabul

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?style=flat-square&logo=supabase)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-199900?style=flat-square&logo=leaflet)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)

Aplikasi **Sistem Informasi Geografis (SIG)** interaktif untuk memetakan dan mengelola data infrastruktur, fasilitas publik, dan lokasi penting di **Desa Ngabul, Kecamatan Tahunan, Kabupaten Jepara, Jawa Tengah**.

---

## 📑 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#️-teknologi-yang-digunakan)
- [Prasyarat](#-prasyarat)
- [Instalasi](#-instalasi)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Struktur Proyek](#-struktur-proyek)
- [Panduan Penggunaan](#-panduan-penggunaan)
  - [Tampilan Publik](#1-tampilan-publik)
  - [Panel Admin](#2-panel-admin)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Troubleshooting](#-troubleshooting)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

### 🗺️ Peta Interaktif
- Visualisasi lokasi dengan marker berwarna berdasarkan kategori
- Dukungan multiple map styles (Streets, Outdoor, Dark, Light, Satellite)
- Batas wilayah desa dengan GeoJSON overlay
- Fly-to animation ketika memilih lokasi
- Zoom dan pan dengan pembatasan wilayah

### 🔍 Pencarian & Filter
- Pencarian lokasi real-time
- Filter berdasarkan kategori dan subkategori
- Filter berdasarkan kondisi (Baik, Rusak Ringan, Rusak Berat)

### 📊 Statistik & Visualisasi
- Dashboard statistik jumlah lokasi per kategori
- Grafik distribusi kondisi infrastruktur
- Panel detail lokasi dengan galeri gambar

### 🔐 Panel Admin
- CRUD lengkap untuk manajemen lokasi
- Manajemen kategori dan subkategori
- Bulk delete dan filter admin
- Scraping koordinat dari Google Maps
- Sistem laporan dari warga

### 🎨 UI/UX Modern
- Landing page 3D interaktif dengan Three.js
- Animasi smooth menggunakan Framer Motion
- Desain responsif untuk mobile dan desktop
- Dark mode support pada peta

---

## 🛠️ Teknologi yang Digunakan

| Kategori | Teknologi |
|----------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | TailwindCSS 4, Framer Motion |
| **Peta** | Leaflet, React-Leaflet, MapTiler SDK |
| **3D Graphics** | Three.js, React Three Fiber, Drei |
| **Database** | Supabase (PostgreSQL + PostGIS) |
| **Icons** | Lucide React |
| **Charts** | Recharts |

---

## 📋 Prasyarat

Pastikan sistem Anda sudah terinstal:

- **Node.js** >= 18.x
- **npm** >= 9.x atau **yarn** >= 1.22
- **Git** (opsional, untuk clone repository)
- Akun **Supabase** (gratis)
- API Key **MapTiler** (opsional, untuk satellite view)

---

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/harminto-qgis.git
cd harminto-qgis
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database Supabase

1. Buat project baru di [Supabase Dashboard](https://supabase.com/dashboard)
2. Buka **SQL Editor** di Supabase
3. Jalankan script `supabase_setup.sql` yang ada di root project
4. Verifikasi tabel sudah terbuat:
   - `categories`
   - `subcategories`
   - `locations`
   - `location_images`
   - `location_reports`

### 4. Import Data Awal (Opsional)

```bash
node scripts/import-locations.js data/ujung-pandan-locations.json
```

---

## ⚙️ Konfigurasi Environment

Buat file `.env.local` di root project:

```env
# Supabase Configuration (Wajib)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# MapTiler API (Opsional - untuk satellite view)
NEXT_PUBLIC_MAPTILER_API_KEY=your_maptiler_api_key

# Admin Authentication
ADMIN_PASSWORD=your_secure_admin_password

# Chrome/Chromium Path untuk Scraping (Opsional)
CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
```

### Cara Mendapatkan Credentials:

| Credential | Cara Mendapatkan |
|------------|-----------------|
| Supabase URL | Project Settings → API → Project URL |
| Supabase Anon Key | Project Settings → API → anon public |
| Service Role Key | Project Settings → API → service_role (rahasia!) |
| MapTiler API Key | [cloud.maptiler.com](https://cloud.maptiler.com) → API Keys |

---

## ▶️ Menjalankan Aplikasi

### Development Mode

```bash
npm run dev
```

Aplikasi akan berjalan di: **http://localhost:8274**

### Production Build

```bash
npm run build
npm run start
```

---

## 📁 Struktur Proyek

```
harminto_qgiss/
├── public/
│   ├── data/                    # GeoJSON boundaries
│   └── ngabul.geojson           # Batas wilayah desa
├── scripts/
│   └── import-locations.js      # Script import data
├── src/
│   ├── app/
│   │   ├── page.tsx             # Halaman utama (peta publik)
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Global styles
│   │   ├── admin/               # Panel admin
│   │   │   ├── page.tsx         # Dashboard admin
│   │   │   ├── categories/      # Manajemen kategori
│   │   │   ├── locations/       # CRUD lokasi
│   │   │   └── reports/         # Laporan warga
│   │   ├── api/                 # API routes
│   │   │   └── scrape-maps/     # Google Maps scraper
│   │   ├── login/               # Halaman login admin
│   │   └── report/              # Form laporan warga
│   ├── components/
│   │   ├── Map/                 # Komponen peta
│   │   │   ├── index.tsx        # Main map component
│   │   │   ├── LocationMarker.tsx
│   │   │   ├── FlyToLocation.tsx
│   │   │   └── MapTilerController.tsx
│   │   ├── Admin/               # Komponen admin UI
│   │   ├── ControlPanel/        # Panel kontrol peta
│   │   ├── Sidebar.tsx          # Sidebar navigasi
│   │   ├── LocationDetailPanel.tsx
│   │   └── ThreeLanding.tsx     # Landing page 3D
│   ├── constants/
│   │   └── index.ts             # Konstanta (koordinat, zoom, dll)
│   ├── hooks/
│   │   └── useSupabaseQuery.ts  # Custom hook untuk Supabase
│   ├── lib/
│   │   └── supabaseClient.ts    # Supabase client instance
│   └── types/
│       └── index.ts             # TypeScript interfaces
├── .env.local                   # Environment variables (gitignored)
├── supabase_setup.sql           # SQL schema setup
├── package.json
└── README.md
```

---

## 📖 Panduan Penggunaan

### 1. Tampilan Publik

#### Halaman Utama (`/`)

1. **Landing Page 3D**: Klik tombol "Masuk" untuk mengakses peta
2. **Peta Interaktif**:
   - Gunakan scroll untuk zoom in/out
   - Klik dan drag untuk menggeser peta
   - Klik marker untuk melihat detail lokasi

#### Sidebar Navigasi

| Icon | Fungsi |
|------|--------|
| 🗂️ **Layers** | Filter kategori dan subkategori |
| 📋 **List** | Daftar semua lokasi dengan pencarian |
| 👤 **Profile** | Informasi desa |
| ⚙️ **Settings** | Ubah style peta |
| 📊 **Statistics** | Statistik dan grafik |

#### Filter Lokasi

1. Buka panel **Layers** dari sidebar
2. Pilih kategori yang ingin ditampilkan
3. Gunakan filter kondisi (Baik/Rusak Ringan/Rusak Berat)
4. Marker akan terfilter secara otomatis di peta

#### Melihat Detail Lokasi

1. Klik marker pada peta
2. Panel detail akan muncul dengan informasi:
   - Nama lokasi
   - Alamat lengkap
   - Deskripsi
   - Kondisi
   - Galeri foto
   - Kontak (jika ada)

---

### 2. Panel Admin

#### Login Admin (`/login`)

1. Akses halaman `/login`
2. Masukkan password admin
3. Setelah login, akses `/admin`

#### Dashboard Admin (`/admin`)

Dashboard menampilkan:
- **Statistik**: Total lokasi, kategori, laporan pending
- **Tabel Lokasi**: Daftar semua lokasi dengan aksi CRUD

#### Manajemen Lokasi

##### Menambah Lokasi Baru

1. Klik tombol **"+ Tambah Lokasi"**
2. Isi form:
   - Nama lokasi (wajib)
   - Kategori dan subkategori
   - Koordinat (latitude, longitude)
   - Alamat, deskripsi, kondisi
   - Upload gambar (opsional)
3. Klik **Simpan**

##### Mengedit Lokasi

1. Klik icon **✏️ Edit** pada baris lokasi
2. Ubah data yang diperlukan
3. Klik **Simpan Perubahan**

##### Menghapus Lokasi

- **Single delete**: Klik icon **🗑️ Hapus** pada baris lokasi
- **Bulk delete**: Centang beberapa lokasi, klik "Hapus terpilih"
- **Filter delete**: Gunakan filter, klik "Hapus semua (filter)"

#### Manajemen Kategori (`/admin/categories`)

1. Akses menu **Kategori** dari dashboard
2. Tambah kategori baru dengan nama dan icon
3. Tambah subkategori di dalam kategori

#### Scraping Koordinat (`/admin/locations/sync-coordinates`)

Fitur untuk mendapatkan koordinat dari Google Maps:

1. Akses menu **Scraping Koordinat**
2. Pilih kategori yang ingin dicari
3. Klik **Mulai Scraping**
4. Review hasil pencarian
5. Pilih lokasi yang ingin disimpan
6. Klik **Simpan ke Database**

#### Laporan Warga (`/admin/reports`)

1. Lihat daftar laporan masuk dari warga
2. Review detail laporan (foto, kondisi, deskripsi)
3. Approve atau reject laporan

---

## 🗄️ Database Schema

### Tabel `categories`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | uuid | Primary key |
| `name` | text | Nama kategori |
| `icon` | text | Nama icon (emoji/lucide) |
| `created_at` | timestamp | Waktu dibuat |

### Tabel `subcategories`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | uuid | Primary key |
| `name` | text | Nama subkategori |
| `category_id` | uuid | Foreign key ke categories |
| `created_at` | timestamp | Waktu dibuat |

### Tabel `locations`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | uuid | Primary key |
| `name` | text | Nama lokasi |
| `latitude` | float8 | Koordinat latitude |
| `longitude` | float8 | Koordinat longitude |
| `geom` | geometry | PostGIS geometry (auto-generated) |
| `description` | text | Deskripsi lokasi |
| `address` | text | Alamat lengkap |
| `dusun` | text | Nama dusun |
| `contact` | text | Nomor kontak |
| `condition` | text | Kondisi (Baik/Rusak Ringan/Rusak Berat) |
| `category_id` | uuid | Foreign key ke categories |
| `subcategory_id` | uuid | Foreign key ke subcategories |
| `created_at` | timestamp | Waktu dibuat |
| `updated_at` | timestamp | Waktu diperbarui |

### Tabel `location_images`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | uuid | Primary key |
| `location_id` | uuid | Foreign key ke locations |
| `image_url` | text | URL gambar |
| `created_at` | timestamp | Waktu dibuat |

### Tabel `location_reports`

| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| `id` | uuid | Primary key |
| `location_id` | uuid | Foreign key ke locations (nullable) |
| `full_name` | text | Nama pelapor |
| `address` | text | Alamat pelapor |
| `phone` | text | Nomor telepon |
| `condition` | text | Kondisi yang dilaporkan |
| `image_url` | text | Foto bukti |
| `description` | text | Deskripsi laporan |
| `status` | text | Status (pending/approved/rejected) |
| `created_at` | timestamp | Waktu dibuat |

---

## 🔌 API Endpoints

### Public Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/` | Halaman utama dengan peta |
| GET | `/report` | Form laporan warga |
| POST | `/api/report` | Submit laporan baru |

### Admin Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/admin` | Dashboard admin |
| GET | `/admin/categories` | Manajemen kategori |
| GET | `/admin/locations/create` | Form tambah lokasi |
| GET | `/admin/locations/[id]/edit` | Form edit lokasi |
| GET | `/admin/reports` | Daftar laporan |
| POST | `/api/scrape-maps` | Scrape koordinat dari Google Maps |

---

## 🔧 Troubleshooting

### Peta tidak muncul

1. Pastikan koneksi internet aktif
2. Cek apakah `NEXT_PUBLIC_MAPTILER_API_KEY` valid (jika menggunakan MapTiler)
3. Bersihkan cache browser dan refresh

### Data tidak tampil

1. Pastikan `.env.local` sudah dikonfigurasi dengan benar
2. Verifikasi Supabase URL dan Anon Key
3. Cek koneksi ke database di Supabase Dashboard

### Error saat scraping

1. Pastikan Chrome/Chromium terinstal
2. Set `CHROME_PATH` di `.env.local` sesuai lokasi instalasi
3. Pastikan tidak ada Chrome instance lain yang berjalan

### Login admin gagal

1. Pastikan `ADMIN_PASSWORD` sudah di-set di `.env.local`
2. Restart server development setelah mengubah `.env.local`

### Error "SUPABASE_SERVICE_ROLE_KEY tidak ditemukan"

1. Gunakan Service Role Key, bukan Anon Key
2. Jangan expose Service Role Key di client-side code

---

## 📜 Lisensi

Proyek ini dikembangkan untuk kepentingan pemetaan infrastruktur Desa Ngabul, Kecamatan Tahunan, Kabupaten Jepara seabgai tugas/project pelajaran GIS.

---

## 👨‍💻 Kontributor

- **Developer**: Wisnu hidayat

---

<p align="center">
  <sub>Dibuat untuk tugas uas, Jepara</sub>
</p>
