# Script Import Data Lokasi

Script ini digunakan untuk mengimport data lokasi dari file JSON ke database Supabase.

## Prasyarat

1. Pastikan file `.env.local` sudah dikonfigurasi dengan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (disarankan) atau `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Install dependencies jika belum:
   ```bash
   npm install dotenv
   ```

## Format Data JSON

File JSON harus berupa array of objects dengan format berikut:

```json
[
  {
    "name": "Nama Lokasi",
    "latitude": -6.535,
    "longitude": 110.74,
    "category_name": "Kategori",  // atau "category_id": "uuid"
    "subcategory_name": "Subkategori",  // opsional, atau "subcategory_id": "uuid"
    "address": "Alamat lengkap",
    "dusun": "Nama Dusun",
    "contact": "Kontak",
    "condition": "Baik" | "Rusak Ringan" | "Rusak Berat",
    "description": "Deskripsi lokasi",
    "images": ["url1", "url2"]  // opsional, array of image URLs
  }
]
```

Atau bisa juga menggunakan format object dengan property `locations` atau `data`:

```json
{
  "locations": [
    { ... }
  ]
}
```

## Cara Penggunaan

1. Siapkan file JSON dengan data lokasi (lihat `example-locations.json` sebagai contoh)

2. Jalankan script:
   ```bash
   node scripts/import-locations.js <path-to-json-file>
   ```

   Contoh:
   ```bash
   node scripts/import-locations.js data/locations.json
   ```

3. Script akan:
   - Membaca file JSON
   - Membuat kategori dan subkategori jika belum ada
   - Mengimport setiap lokasi ke database
   - Mengimport gambar jika ada

## Catatan

- Script akan otomatis membuat kategori dan subkategori jika belum ada di database
- Jika kategori/subkategori sudah ada (berdasarkan nama), akan menggunakan yang sudah ada
- Setiap lokasi akan memiliki UUID yang di-generate otomatis
- Koordinat geom akan di-generate otomatis dari latitude dan longitude
- Jika terjadi error pada satu lokasi, script akan melanjutkan ke lokasi berikutnya

## Troubleshooting

- **Error: NEXT_PUBLIC_SUPABASE_URL tidak ditemukan**: Pastikan file `.env.local` ada di root project
- **Error: File not found**: Pastikan path ke file JSON benar
- **Error: No locations found**: Pastikan format JSON sesuai dengan yang diharapkan

