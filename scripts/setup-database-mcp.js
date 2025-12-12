/**
 * Script untuk setup database Supabase menggunakan MCP Server
 * Script ini menggunakan MCP Supabase untuk:
 * 1. Memilih organization "maps"
 * 2. Membuat atau memilih project
 * 3. Menjalankan SQL setup script
 * 
 * Usage:
 * node scripts/setup-database-mcp.js
 * 
 * Pastikan MCP Supabase server sudah dikonfigurasi di Cursor settings
 */

const fs = require('fs');
const path = require('path');

// Baca SQL setup script
const sqlSetupPath = path.join(__dirname, '..', 'supabase_setup.sql');
const sqlSetup = fs.readFileSync(sqlSetupPath, 'utf8');

console.log('🚀 Setup Database Supabase dengan MCP Server\n');
console.log('📋 Langkah-langkah setup:');
console.log('1. Pastikan MCP Supabase server sudah dikonfigurasi');
console.log('2. Pilih organization "maps"');
console.log('3. Pilih atau buat project');
console.log('4. Jalankan SQL setup script\n');

// Instruksi untuk menggunakan MCP
const instructions = `
═══════════════════════════════════════════════════════════════
  SETUP DATABASE SUPABASE MENGGUNAKAN MCP SERVER
═══════════════════════════════════════════════════════════════

Langkah 1: Pastikan MCP Supabase Server Terkonfigurasi
─────────────────────────────────────────────────────────
Pastikan MCP Supabase server sudah dikonfigurasi di Cursor settings.
Biasanya ada di: Settings > Features > MCP Servers

Langkah 2: Gunakan MCP untuk Memilih Organization "maps"
─────────────────────────────────────────────────────────
Gunakan MCP command berikut di Cursor chat:
- "List semua organization Supabase"
- "Pilih organization dengan nama maps"
- Atau: "Show me Supabase organizations and select 'maps'"

Langkah 3: Pilih atau Buat Project
─────────────────────────────────────────────────────────
Setelah organization "maps" dipilih:
- "List semua project di organization maps"
- "Pilih project [nama-project]" atau "Buat project baru dengan nama [nama-project]"

Langkah 4: Jalankan SQL Setup Script
─────────────────────────────────────────────────────────
Copy SQL script berikut dan jalankan melalui MCP:
"Jalankan SQL script berikut di Supabase project yang dipilih:"

${sqlSetup}

ATAU gunakan command MCP:
"Execute SQL di Supabase: [paste SQL script di atas]"

═══════════════════════════════════════════════════════════════
  ALTERNATIF: Setup Manual melalui Supabase Dashboard
═══════════════════════════════════════════════════════════════

Jika MCP tidak tersedia, Anda bisa setup manual:

1. Buka https://supabase.com/dashboard
2. Login dan pilih organization "maps"
3. Pilih project atau buat project baru
4. Buka SQL Editor di sidebar
5. Copy seluruh isi file: supabase_setup.sql
6. Paste dan jalankan di SQL Editor
7. Setelah selesai, copy URL dan API keys ke .env.local:

   NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

═══════════════════════════════════════════════════════════════
`;

console.log(instructions);

// Simpan SQL script ke file terpisah untuk mudah di-copy
const sqlOutputPath = path.join(__dirname, '..', 'SQL_TO_RUN.sql');
fs.writeFileSync(sqlOutputPath, sqlSetup);
console.log(`\n✅ SQL script telah disimpan ke: ${sqlOutputPath}`);
console.log('   Anda bisa copy file ini untuk dijalankan melalui MCP atau Supabase Dashboard\n');

