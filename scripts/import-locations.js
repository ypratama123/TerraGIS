/**
 * Script untuk import data lokasi dari JSON ke Supabase
 * 
 * Usage:
 * node scripts/import-locations.js <path-to-json-file>
 * 
 * Atau dengan environment variables:
 * NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... node scripts/import-locations.js <path-to-json-file>
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY atau NEXT_PUBLIC_SUPABASE_ANON_KEY harus di-set di .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Format data lokasi yang diharapkan:
 * [
 *   {
 *     name: "Nama Lokasi",
 *     latitude: -6.535,
 *     longitude: 110.74,
 *     category_name: "Kategori", // atau category_id: "uuid"
 *     subcategory_name: "Subkategori", // atau subcategory_id: "uuid" (opsional)
 *     address: "Alamat",
 *     dusun: "Dusun",
 *     contact: "Kontak",
 *     condition: "Baik" | "Rusak Ringan" | "Rusak Berat",
 *     description: "Deskripsi",
 *     images: ["url1", "url2"] // array of image URLs (opsional)
 *   }
 * ]
 */

async function getOrCreateCategory(categoryName) {
  // Cari kategori berdasarkan nama
  const { data: existing, error: searchError } = await supabase
    .from('categories')
    .select('id')
    .eq('name', categoryName)
    .single();

  if (existing) {
    return existing.id;
  }

  // Jika tidak ada, buat kategori baru
  const { data: newCategory, error: createError } = await supabase
    .from('categories')
    .insert([{ name: categoryName }])
    .select('id')
    .single();

  if (createError) {
    throw new Error(`Error creating category: ${createError.message}`);
  }

  return newCategory.id;
}

async function getOrCreateSubcategory(categoryId, subcategoryName) {
  if (!subcategoryName) return null;

  // Cari subkategori berdasarkan nama dan category_id
  const { data: existing, error: searchError } = await supabase
    .from('subcategories')
    .select('id')
    .eq('name', subcategoryName)
    .eq('category_id', categoryId)
    .single();

  if (existing) {
    return existing.id;
  }

  // Jika tidak ada, buat subkategori baru
  const { data: newSubcategory, error: createError } = await supabase
    .from('subcategories')
    .insert([{ name: subcategoryName, category_id: categoryId }])
    .select('id')
    .single();

  if (createError) {
    throw new Error(`Error creating subcategory: ${createError.message}`);
  }

  return newSubcategory.id;
}

async function importLocation(locationData) {
  try {
    // Handle kategori
    let categoryId = locationData.category_id;
    if (!categoryId && locationData.category_name) {
      categoryId = await getOrCreateCategory(locationData.category_name);
    }

    if (!categoryId) {
      throw new Error('Category ID or category name is required');
    }

    // Handle subkategori
    let subcategoryId = locationData.subcategory_id || null;
    if (!subcategoryId && locationData.subcategory_name && categoryId) {
      subcategoryId = await getOrCreateSubcategory(categoryId, locationData.subcategory_name);
    }

    // Prepare location data
    const locationInsert = {
      name: locationData.name,
      latitude: parseFloat(locationData.latitude),
      longitude: parseFloat(locationData.longitude),
      category_id: categoryId,
      subcategory_id: subcategoryId,
      address: locationData.address || null,
      dusun: locationData.dusun || null,
      contact: locationData.contact || null,
      condition: locationData.condition || null,
      description: locationData.description || null,
    };

    // Insert location
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .insert([locationInsert])
      .select('id')
      .single();

    if (locationError) {
      throw new Error(`Error inserting location: ${locationError.message}`);
    }

    // Insert images if any
    if (locationData.images && Array.isArray(locationData.images) && locationData.images.length > 0) {
      const imageInserts = locationData.images.map(imageUrl => ({
        location_id: location.id,
        image_url: imageUrl,
      }));

      const { error: imageError } = await supabase
        .from('location_images')
        .insert(imageInserts);

      if (imageError) {
        console.warn(`Warning: Error inserting images for location ${locationData.name}: ${imageError.message}`);
      }
    }

    return location;
  } catch (error) {
    console.error(`Error importing location "${locationData.name}":`, error.message);
    throw error;
  }
}

async function importLocations(jsonFilePath) {
  try {
    // Read JSON file
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    
    // Handle both array and object with locations array
    const locations = Array.isArray(jsonData) ? jsonData : (jsonData.locations || jsonData.data || []);

    if (!Array.isArray(locations) || locations.length === 0) {
      throw new Error('No locations found in JSON file. Expected an array or object with "locations" or "data" property.');
    }

    console.log(`Found ${locations.length} locations to import...\n`);

    let successCount = 0;
    let errorCount = 0;

    // Import each location
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      try {
        console.log(`[${i + 1}/${locations.length}] Importing: ${location.name || 'Unnamed'}`);
        await importLocation(location);
        successCount++;
        console.log(`  ✓ Success\n`);
      } catch (error) {
        errorCount++;
        console.error(`  ✗ Failed: ${error.message}\n`);
      }
    }

    console.log('\n=== Import Summary ===');
    console.log(`Total: ${locations.length}`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
  } catch (error) {
    console.error('Error importing locations:', error.message);
    process.exit(1);
  }
}

// Main execution
const jsonFilePath = process.argv[2];

if (!jsonFilePath) {
  console.error('Usage: node scripts/import-locations.js <path-to-json-file>');
  console.error('\nExample:');
  console.error('  node scripts/import-locations.js data/locations.json');
  process.exit(1);
}

if (!fs.existsSync(jsonFilePath)) {
  console.error(`Error: File not found: ${jsonFilePath}`);
  process.exit(1);
}

importLocations(jsonFilePath);

