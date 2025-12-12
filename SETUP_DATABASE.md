# Setup Database Supabase untuk Ujung Pandan Jepara

## Langkah-langkah Setup

### 1. Setup Database Schema

Jalankan script SQL di Supabase Dashboard:

1. Buka Supabase Dashboard
2. Pilih project Anda
3. Masuk ke **SQL Editor**
4. Copy seluruh isi file `supabase_setup.sql`
5. Paste dan jalankan di SQL Editor

Script ini akan:
- Mengaktifkan ekstensi PostGIS
- Membuat semua tabel yang diperlukan
- Mengatur Row Level Security (RLS) policies
- Membuat trigger untuk update geom dan updated_at

### 2. Import Data Lokasi

Setelah database schema sudah dibuat, import data lokasi:

```bash
# Pastikan file .env.local sudah dikonfigurasi dengan:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Import data lokasi
node scripts/import-locations.js data/ujung-pandan-locations.json
```

### 3. Verifikasi Data

Setelah import selesai, verifikasi data di Supabase Dashboard:

1. Buka **Table Editor**
2. Cek tabel `categories` - seharusnya ada kategori seperti:
   - Kantor Desa
   - Sekolah
   - Masjid
   - Posyandu
   - Puskesmas
   - Pasar
   - Infrastruktur
   - Penggunaan Lahan

3. Cek tabel `locations` - seharusnya ada 64 lokasi
4. Cek tabel `location_images` - seharusnya ada gambar untuk lokasi yang memiliki images

## Troubleshooting

### Error: NEXT_PUBLIC_SUPABASE_URL tidak ditemukan
- Pastikan file `.env.local` ada di root project
- Pastikan variabel environment sudah di-set dengan benar

### Error: Permission denied
- Pastikan menggunakan `SUPABASE_SERVICE_ROLE_KEY` bukan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Service Role Key memiliki akses penuh untuk insert data

### Error: Foreign key constraint
- Pastikan script `supabase_setup.sql` sudah dijalankan terlebih dahulu
- Pastikan semua tabel sudah dibuat dengan benar

## Catatan

- Data yang diimport: 64 lokasi dari Ujung Pandan Jepara
- Kategori akan dibuat otomatis jika belum ada
- Subkategori akan dibuat otomatis jika belum ada
- Setiap lokasi akan memiliki UUID yang di-generate otomatis
- Koordinat geom akan di-generate otomatis dari latitude dan longitude

