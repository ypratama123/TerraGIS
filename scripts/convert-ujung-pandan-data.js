/**
 * Script untuk convert data Ujung Pandan Jepara dari format JSON scraping
 * ke format yang sesuai dengan script import-locations.js
 */

const fs = require('fs');
const path = require('path');

// Mapping kategori
const categoryMapping = {
  'kantor desa': 'Kantor Desa',
  'sekolah': 'Sekolah',
  'masjid': 'Masjid',
  'posyandu': 'Posyandu',
  'puskesmas': 'Puskesmas',
  'pasar': 'Pasar',
};

// Mapping subkategori untuk sekolah
const schoolSubcategoryMapping = {
  'SD': 'SD',
  'SMP': 'SMP',
  'SMA': 'SMA',
  'TK': 'TK',
  'Preschool': 'TK',
  'Elementary school': 'SD',
  'Middle school': 'SMP',
  'High school': 'SMA',
};

// Mapping infrastructure type ke kategori
const infrastructureCategoryMapping = {
  'jalan': { category: 'Infrastruktur', subcategory: 'Jalan' },
  'jembatan': { category: 'Infrastruktur', subcategory: 'Jembatan' },
  'irigasi': { category: 'Infrastruktur', subcategory: 'Irigasi' },
  'listrik': { category: 'Infrastruktur', subcategory: 'Listrik' },
  'air': { category: 'Infrastruktur', subcategory: 'Air' },
};

// Mapping land use type ke kategori
const landUseCategoryMapping = {
  'permukiman': { category: 'Penggunaan Lahan', subcategory: 'Permukiman' },
  'persawahan': { category: 'Penggunaan Lahan', subcategory: 'Persawahan' },
  'perkebunan': { category: 'Penggunaan Lahan', subcategory: 'Perkebunan' },
  'hutan': { category: 'Penggunaan Lahan', subcategory: 'Hutan' },
  'ladang': { category: 'Penggunaan Lahan', subcategory: 'Ladang' },
};

function cleanName(name) {
  // Hapus karakter aneh dan rating/review info
  return name
    .replace(/No reviews/g, '')
    .replace(/\d+\.\d+/g, '') // Hapus rating
    .replace(/·/g, '')
    .replace(/Open.*/g, '')
    .replace(/Closed.*/g, '')
    .replace(/Closes.*/g, '')
    .replace(/Opens.*/g, '')
    .replace(/Directions/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSchoolType(name) {
  const upperName = name.toUpperCase();
  if (upperName.includes('TK') || upperName.includes('PRESCHOOL')) return 'TK';
  if (upperName.includes('SD') || upperName.includes('ELEMENTARY')) return 'SD';
  if (upperName.includes('SMP') || upperName.includes('MIDDLE')) return 'SMP';
  if (upperName.includes('SMA') || upperName.includes('HIGH')) return 'SMA';
  return null;
}

function convertImportantPoint(point) {
  const category = categoryMapping[point.category] || 'Lainnya';
  let subcategory = null;

  // Untuk sekolah, coba extract tipe sekolah
  if (category === 'Sekolah') {
    subcategory = extractSchoolType(point.name);
  }

  return {
    name: cleanName(point.name),
    latitude: point.latitude,
    longitude: point.longitude,
    category_name: category,
    subcategory_name: subcategory,
    address: point.address || null,
    dusun: extractDusun(point.address),
    contact: null,
    condition: 'Baik', // Default condition
    description: null,
    images: point.images || [],
  };
}

function convertInfrastructure(infra) {
  const mapping = infrastructureCategoryMapping[infra.infrastructure_type] || {
    category: 'Infrastruktur',
    subcategory: 'Lainnya',
  };

  return {
    name: cleanName(infra.name || 'Infrastruktur'),
    latitude: infra.latitude,
    longitude: infra.longitude,
    category_name: mapping.category,
    subcategory_name: mapping.subcategory,
    address: infra.address || null,
    dusun: extractDusun(infra.address),
    contact: null,
    condition: 'Baik',
    description: `Jenis: ${infra.infrastructure_type}`,
    images: infra.images || [],
  };
}

function convertLandUse(landUse) {
  const mapping = landUseCategoryMapping[landUse.land_use_type] || {
    category: 'Penggunaan Lahan',
    subcategory: 'Lainnya',
  };

  return {
    name: cleanName(landUse.name || 'Penggunaan Lahan'),
    latitude: landUse.latitude,
    longitude: landUse.longitude,
    category_name: mapping.category,
    subcategory_name: mapping.subcategory,
    address: landUse.address || null,
    dusun: extractDusun(landUse.address),
    contact: null,
    condition: null,
    description: `Jenis penggunaan lahan: ${landUse.land_use_type}`,
    images: landUse.images || [],
  };
}

function extractDusun(address) {
  if (!address) return null;
  const dusunMatch = address.match(/Dusun\s+([IVX\d]+)/i);
  return dusunMatch ? `Dusun ${dusunMatch[1]}` : null;
}

function convertData(inputFile, outputFile) {
  console.log(`Reading ${inputFile}...`);
  const rawData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

  const locations = [];

  // Convert important_points
  if (rawData.important_points) {
    console.log(`Converting ${rawData.important_points.length} important points...`);
    rawData.important_points.forEach((point) => {
      locations.push(convertImportantPoint(point));
    });
  }

  // Convert infrastructure
  if (rawData.infrastructure) {
    console.log(`Converting ${rawData.infrastructure.length} infrastructure items...`);
    rawData.infrastructure.forEach((infra) => {
      locations.push(convertInfrastructure(infra));
    });
  }

  // Convert land_use
  if (rawData.land_use) {
    console.log(`Converting ${rawData.land_use.length} land use items...`);
    rawData.land_use.forEach((landUse) => {
      locations.push(convertLandUse(landUse));
    });
  }

  // Write output
  fs.writeFileSync(outputFile, JSON.stringify(locations, null, 2), 'utf8');
  console.log(`\nConverted ${locations.length} locations to ${outputFile}`);
  console.log('\nCategories found:');
  const categories = [...new Set(locations.map((l) => l.category_name))];
  categories.forEach((cat) => {
    const count = locations.filter((l) => l.category_name === cat).length;
    console.log(`  - ${cat}: ${count}`);
  });
}

// Main execution
const inputFile = process.argv[2] || 'ujung_pandan_jepara_20251210_112114.json';
const outputFile = process.argv[3] || 'data/ujung-pandan-locations.json';

if (!fs.existsSync(inputFile)) {
  console.error(`Error: File not found: ${inputFile}`);
  process.exit(1);
}

// Create data directory if it doesn't exist
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

convertData(inputFile, outputFile);

