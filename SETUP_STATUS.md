# Status Setup Database Supabase

## ✅ Yang Sudah Selesai

1. **Organization "maps" ditemukan** ✓
   - Organization ID: `fbcjxqlmznsosgavtvow`
   - Status: Aktif

2. **Project baru dibuat** ✓
   - Project Name: `harminto-qgiss`
   - Project ID: `zqovnbhudpcdpnbqguey`
   - Project Ref: `zqovnbhudpcdpnbqguey`
   - Region: `ap-southeast-1`
   - Status: `ACTIVE_HEALTHY`
   - URL: `https://zqovnbhudpcdpnbqguey.supabase.co`

3. **File konfigurasi dibuat** ✓
   - `.env.local` sudah dibuat dengan URL dan Anon Key
   - ⚠️ **PERLU**: Tambahkan `SUPABASE_SERVICE_ROLE_KEY` dari Dashboard

## ⚠️ Yang Perlu Dilakukan

### Langkah 1: Jalankan SQL Setup Script

Project baru masih dalam mode read-only untuk migrations melalui MCP. Anda perlu menjalankan SQL setup secara manual melalui Supabase Dashboard:

1. **Buka Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/zqovnbhudpcdpnbqguey
   - Atau: https://supabase.com/dashboard → Pilih organization "maps" → Pilih project "harminto-qgiss"

2. **Buka SQL Editor**
   - Di sidebar kiri, klik **SQL Editor**

3. **Jalankan SQL Setup Script**
   - Buka file `supabase_setup.sql` di project ini
   - Copy seluruh isi file
   - Paste ke SQL Editor
   - Klik **Run** atau tekan `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Verifikasi Setup**
   - Setelah SQL berhasil dijalankan, buka **Table Editor**
   - Pastikan tabel berikut sudah dibuat:
     - `categories`
     - `subcategories`
     - `locations`
     - `location_images`
     - `infrastructure_conditions`
     - `location_reports`

### Langkah 2: Dapatkan Service Role Key

1. **Buka Settings > API**
   - Di Supabase Dashboard, klik **Settings** (ikon gear di sidebar)
   - Pilih **API**

2. **Copy Service Role Key**
   - Scroll ke bagian **Project API keys**
   - Copy **service_role** key (yang secret, bukan anon key)
   - ⚠️ **PENTING**: Jangan pernah share key ini atau commit ke repository public!

3. **Update .env.local**
   - Buka file `.env.local` di root project
   - Ganti `your-service-role-key-here` dengan service_role key yang sudah di-copy

## 📋 Informasi Project

```
Project Name: harminto-qgiss
Project ID: zqovnbhudpcdpnbqguey
Organization: maps
Region: ap-southeast-1
Status: ACTIVE_HEALTHY
URL: https://zqovnbhudpcdpnbqguey.supabase.co
```

## 🔗 Link Penting

- **Dashboard**: https://supabase.com/dashboard/project/zqovnbhudpcdpnbqguey
- **SQL Editor**: https://supabase.com/dashboard/project/zqovnbhudpcdpnbqguey/sql
- **Table Editor**: https://supabase.com/dashboard/project/zqovnbhudpcdpnbqguey/editor
- **API Settings**: https://supabase.com/dashboard/project/zqovnbhudpcdpnbqguey/settings/api

## ✅ Setelah Setup Selesai

Setelah SQL setup dan service_role key sudah dikonfigurasi:

1. **Test Koneksi**:
   ```bash
   npm run dev
   ```

2. **Import Data** (jika ada):
   ```bash
   node scripts/import-locations.js data/ujung-pandan-locations.json
   ```

3. **Verifikasi di Dashboard**:
   - Buka Table Editor
   - Cek apakah tabel sudah terbuat dengan benar

## 🐛 Troubleshooting

### Error: Cannot apply migration in read-only mode
- **Solusi**: Project baru perlu beberapa saat untuk benar-benar siap
- **Alternatif**: Gunakan Supabase Dashboard untuk menjalankan SQL setup

### Error: Service Role Key tidak ditemukan
- Pastikan Anda sudah login ke Supabase Dashboard
- Pastikan Anda memiliki akses admin ke project
- Service Role Key hanya terlihat di Settings > API

### Error: NEXT_PUBLIC_SUPABASE_URL tidak ditemukan
- Pastikan file `.env.local` ada di root project
- Pastikan variabel sudah di-set dengan benar
- Restart development server setelah mengubah `.env.local`

