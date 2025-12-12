# Setup Database Supabase dengan MCP Server

Panduan ini menjelaskan cara setup database Supabase menggunakan MCP (Model Context Protocol) server yang sudah dikonfigurasi, dengan memilih organization **"maps"**.

## Prerequisites

1. MCP Supabase server sudah dikonfigurasi di Cursor
2. Akses ke organization "maps" di Supabase
3. File `supabase_setup.sql` sudah tersedia di root project

## Langkah-langkah Setup

### Metode 1: Menggunakan MCP Server (Recommended)

#### Langkah 1: Verifikasi MCP Server
Pastikan MCP Supabase server sudah aktif di Cursor. Biasanya dikonfigurasi di:
- Settings > Features > MCP Servers
- Atau melalui file konfigurasi MCP

#### Langkah 2: Pilih Organization "maps"
Gunakan command berikut di Cursor chat untuk memilih organization:

```
List semua organization Supabase dan pilih organization dengan nama "maps"
```

Atau:
```
Show me Supabase organizations and select the one named "maps"
```

#### Langkah 3: Pilih atau Buat Project
Setelah organization "maps" dipilih, pilih atau buat project:

```
List semua project di organization maps
```

Kemudian pilih project yang ada atau buat baru:
```
Pilih project [nama-project]
```

Atau:
```
Buat project baru dengan nama [nama-project] di organization maps
```

#### Langkah 4: Jalankan SQL Setup Script
Jalankan SQL setup script melalui MCP:

```
Jalankan SQL script dari file supabase_setup.sql di Supabase project yang sedang dipilih
```

Atau copy-paste SQL script langsung:

```
Execute SQL berikut di Supabase project yang dipilih:

[paste seluruh isi dari supabase_setup.sql]
```

### Metode 2: Setup Manual melalui Supabase Dashboard

Jika MCP server tidak tersedia atau mengalami masalah:

1. **Buka Supabase Dashboard**
   - Kunjungi https://supabase.com/dashboard
   - Login ke akun Anda

2. **Pilih Organization "maps"**
   - Di sidebar kiri, pilih organization dropdown
   - Pilih organization dengan nama "maps"

3. **Pilih atau Buat Project**
   - Jika project sudah ada, klik project tersebut
   - Jika belum ada, klik "New Project" dan buat project baru

4. **Jalankan SQL Setup Script**
   - Di sidebar kiri, klik **SQL Editor**
   - Buka file `supabase_setup.sql` di project ini
   - Copy seluruh isi file
   - Paste ke SQL Editor
   - Klik **Run** atau tekan `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

5. **Verifikasi Setup**
   - Setelah SQL script berhasil dijalankan, buka **Table Editor**
   - Pastikan tabel berikut sudah dibuat:
     - `categories`
     - `subcategories`
     - `locations`
     - `location_images`
     - `infrastructure_conditions`
     - `location_reports`

6. **Setup Environment Variables**
   - Di Supabase Dashboard, buka **Settings** > **API**
   - Copy **Project URL** dan **anon/public key**
   - Copy **service_role key** (jangan share key ini!)
   - Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

## Verifikasi Setup

Setelah setup selesai, verifikasi dengan menjalankan:

```bash
# Test koneksi ke Supabase
node scripts/test-connection.js
```

Atau melalui MCP:
```
Test koneksi ke Supabase project yang dipilih
```

## Troubleshooting

### Error: MCP Server tidak ditemukan
- Pastikan MCP Supabase server sudah dikonfigurasi di Cursor settings
- Restart Cursor jika perlu
- Cek dokumentasi MCP Supabase untuk konfigurasi yang benar

### Error: Organization "maps" tidak ditemukan
- Pastikan Anda memiliki akses ke organization "maps"
- Cek apakah nama organization tepat "maps" (case-sensitive)
- Jika tidak ada, buat organization baru dengan nama "maps" atau gunakan organization yang ada

### Error: SQL script gagal dijalankan
- Pastikan PostGIS extension tersedia di Supabase project
- Cek apakah ada tabel yang sudah ada sebelumnya (drop dulu jika perlu)
- Pastikan menggunakan service_role key untuk operasi admin

### Error: Permission denied
- Pastikan menggunakan `SUPABASE_SERVICE_ROLE_KEY` untuk operasi admin
- Jangan gunakan `NEXT_PUBLIC_SUPABASE_ANON_KEY` untuk setup database

## Next Steps

Setelah database setup selesai:

1. **Import Data Lokasi** (jika ada):
   ```bash
   node scripts/import-locations.js data/ujung-pandan-locations.json
   ```

2. **Test Aplikasi**:
   ```bash
   npm run dev
   ```

3. **Verifikasi di Dashboard**:
   - Buka Supabase Dashboard
   - Cek Table Editor untuk memastikan data sudah terimport

## Catatan Penting

- **Service Role Key**: Jangan pernah commit `SUPABASE_SERVICE_ROLE_KEY` ke repository public
- **RLS Policies**: Script sudah mengatur Row Level Security (RLS) untuk semua tabel
- **PostGIS**: Script mengaktifkan extension PostGIS untuk spatial queries
- **Triggers**: Script membuat trigger otomatis untuk update `geom` dan `updated_at`

## Support

Jika mengalami masalah:
1. Cek file `SETUP_DATABASE.md` untuk troubleshooting umum
2. Cek dokumentasi Supabase: https://supabase.com/docs
3. Cek dokumentasi MCP: https://modelcontextprotocol.io

