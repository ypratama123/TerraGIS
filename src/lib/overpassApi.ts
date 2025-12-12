"use client";

// Overpass API Service for searching POI (Points of Interest)
// Using OpenStreetMap data which has detailed local POI

export interface OverpassElement {
    type: string;
    id: number;
    lat: number;
    lon: number;
    tags: {
        name?: string;
        amenity?: string;
        building?: string;
        highway?: string;
        landuse?: string;
        leisure?: string;
        shop?: string;
        tourism?: string;
        religion?: string;
        [key: string]: string | undefined;
    };
}

export interface OverpassResponse {
    version: number;
    elements: OverpassElement[];
}

// Bounding box untuk Ngabul, Tahunan, Jepara
// Format: south, west, north, east
const NGABUL_BBOX = {
    south: -6.78,
    west: 110.64,
    north: -6.72,
    east: 110.70,
};

/**
 * Query POI dari Overpass API berdasarkan kategori
 */
async function queryOverpass(query: string): Promise<OverpassElement[]> {
    const url = "https://overpass-api.de/api/interpreter";

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
        throw new Error(`Overpass API error: ${response.statusText}`);
    }

    const data: OverpassResponse = await response.json();
    return data.elements.filter((el) => el.lat && el.lon);
}

/**
 * Cari sekolah di wilayah Ngabul, Tahunan, Jepara
 */
export async function searchSekolah(): Promise<OverpassElement[]> {
    const bbox = `${NGABUL_BBOX.south},${NGABUL_BBOX.west},${NGABUL_BBOX.north},${NGABUL_BBOX.east}`;
    const query = `
    [out:json][timeout:30];
    (
      node["amenity"="school"](${bbox});
      way["amenity"="school"](${bbox});
      node["amenity"="kindergarten"](${bbox});
      way["amenity"="kindergarten"](${bbox});
      node["amenity"="college"](${bbox});
      way["amenity"="college"](${bbox});
      node["building"="school"](${bbox});
      way["building"="school"](${bbox});
    );
    out center;
  `;
    return queryOverpass(query);
}

/**
 * Cari fasilitas kesehatan
 */
export async function searchKesehatan(): Promise<OverpassElement[]> {
    const bbox = `${NGABUL_BBOX.south},${NGABUL_BBOX.west},${NGABUL_BBOX.north},${NGABUL_BBOX.east}`;
    const query = `
    [out:json][timeout:30];
    (
      node["amenity"="hospital"](${bbox});
      way["amenity"="hospital"](${bbox});
      node["amenity"="clinic"](${bbox});
      way["amenity"="clinic"](${bbox});
      node["amenity"="doctors"](${bbox});
      node["amenity"="pharmacy"](${bbox});
      node["healthcare"](${bbox});
    );
    out center;
  `;
    return queryOverpass(query);
}

/**
 * Cari tempat ibadah
 */
export async function searchTempatIbadah(): Promise<OverpassElement[]> {
    const bbox = `${NGABUL_BBOX.south},${NGABUL_BBOX.west},${NGABUL_BBOX.north},${NGABUL_BBOX.east}`;
    const query = `
    [out:json][timeout:30];
    (
      node["amenity"="place_of_worship"](${bbox});
      way["amenity"="place_of_worship"](${bbox});
      node["building"="mosque"](${bbox});
      way["building"="mosque"](${bbox});
      node["building"="church"](${bbox});
      way["building"="church"](${bbox});
    );
    out center;
  `;
    return queryOverpass(query);
}

/**
 * Cari kantor pemerintahan / infrastruktur
 */
export async function searchInfrastruktur(): Promise<OverpassElement[]> {
    const bbox = `${NGABUL_BBOX.south},${NGABUL_BBOX.west},${NGABUL_BBOX.north},${NGABUL_BBOX.east}`;
    const query = `
    [out:json][timeout:30];
    (
      node["amenity"="townhall"](${bbox});
      way["amenity"="townhall"](${bbox});
      node["office"="government"](${bbox});
      way["office"="government"](${bbox});
      node["building"="government"](${bbox});
      way["building"="government"](${bbox});
      node["amenity"="community_centre"](${bbox});
      way["amenity"="community_centre"](${bbox});
      node["amenity"="public_building"](${bbox});
      way["amenity"="public_building"](${bbox});
    );
    out center;
  `;
    return queryOverpass(query);
}

/**
 * Cari toko dan ekonomi
 */
export async function searchEkonomi(): Promise<OverpassElement[]> {
    const bbox = `${NGABUL_BBOX.south},${NGABUL_BBOX.west},${NGABUL_BBOX.north},${NGABUL_BBOX.east}`;
    const query = `
    [out:json][timeout:30];
    (
      node["amenity"="marketplace"](${bbox});
      way["amenity"="marketplace"](${bbox});
      node["shop"](${bbox});
      node["amenity"="bank"](${bbox});
      node["amenity"="atm"](${bbox});
    );
    out center;
  `;
    return queryOverpass(query);
}

/**
 * Cari tempat wisata dan taman
 */
export async function searchWisata(): Promise<OverpassElement[]> {
    const bbox = `${NGABUL_BBOX.south},${NGABUL_BBOX.west},${NGABUL_BBOX.north},${NGABUL_BBOX.east}`;
    const query = `
    [out:json][timeout:30];
    (
      node["tourism"](${bbox});
      way["tourism"](${bbox});
      node["leisure"="park"](${bbox});
      way["leisure"="park"](${bbox});
      node["leisure"="playground"](${bbox});
      way["leisure"="playground"](${bbox});
      node["leisure"="sports_centre"](${bbox});
      way["leisure"="sports_centre"](${bbox});
    );
    out center;
  `;
    return queryOverpass(query);
}

/**
 * Cari jalan utama
 */
export async function searchJalan(): Promise<OverpassElement[]> {
    const bbox = `${NGABUL_BBOX.south},${NGABUL_BBOX.west},${NGABUL_BBOX.north},${NGABUL_BBOX.east}`;
    const query = `
    [out:json][timeout:30];
    (
      way["highway"="primary"](${bbox});
      way["highway"="secondary"](${bbox});
      way["highway"="tertiary"](${bbox});
    );
    out center;
  `;
    return queryOverpass(query);
}

/**
 * Cari semua POI di wilayah Ngabul, Tahunan, Jepara
 */
export async function searchAllPOI(): Promise<OverpassElement[]> {
    const bbox = `${NGABUL_BBOX.south},${NGABUL_BBOX.west},${NGABUL_BBOX.north},${NGABUL_BBOX.east}`;
    const query = `
    [out:json][timeout:60];
    (
      // Sekolah
      node["amenity"="school"](${bbox});
      way["amenity"="school"](${bbox});
      node["amenity"="kindergarten"](${bbox});
      way["amenity"="kindergarten"](${bbox});
      node["building"="school"](${bbox});
      way["building"="school"](${bbox});
      
      // Kesehatan
      node["amenity"="hospital"](${bbox});
      way["amenity"="hospital"](${bbox});
      node["amenity"="clinic"](${bbox});
      way["amenity"="clinic"](${bbox});
      node["amenity"="pharmacy"](${bbox});
      node["healthcare"](${bbox});
      
      // Tempat Ibadah
      node["amenity"="place_of_worship"](${bbox});
      way["amenity"="place_of_worship"](${bbox});
      node["building"="mosque"](${bbox});
      way["building"="mosque"](${bbox});
      
      // Infrastruktur Pemerintah
      node["amenity"="townhall"](${bbox});
      way["amenity"="townhall"](${bbox});
      node["office"="government"](${bbox});
      way["office"="government"](${bbox});
      node["amenity"="community_centre"](${bbox});
      way["amenity"="community_centre"](${bbox});
      
      // Ekonomi
      node["amenity"="marketplace"](${bbox});
      way["amenity"="marketplace"](${bbox});
      node["amenity"="bank"](${bbox});
      
      // Wisata
      node["tourism"](${bbox});
      way["tourism"](${bbox});
      node["leisure"="park"](${bbox});
      way["leisure"="park"](${bbox});
    );
    out center;
  `;
    return queryOverpass(query);
}

/**
 * Helper untuk mendapatkan nama dari element
 */
export function getElementName(element: OverpassElement): string {
    if (element.tags.name) return element.tags.name;

    // Fallback berdasarkan tipe
    if (element.tags.amenity === "school") return "Sekolah";
    if (element.tags.amenity === "kindergarten") return "TK/PAUD";
    if (element.tags.amenity === "hospital") return "Rumah Sakit";
    if (element.tags.amenity === "clinic") return "Klinik";
    if (element.tags.amenity === "pharmacy") return "Apotek";
    if (element.tags.amenity === "place_of_worship") {
        if (element.tags.religion === "muslim") return "Masjid";
        if (element.tags.religion === "christian") return "Gereja";
        return "Tempat Ibadah";
    }
    if (element.tags.building === "mosque") return "Masjid";
    if (element.tags.amenity === "townhall") return "Kantor Desa";
    if (element.tags.amenity === "marketplace") return "Pasar";
    if (element.tags.leisure === "park") return "Taman";

    return `POI #${element.id}`;
}

/**
 * Helper untuk mendapatkan kategori dari element
 */
export function getElementCategory(element: OverpassElement): string {
    if (element.tags.amenity === "school" || element.tags.amenity === "kindergarten" || element.tags.building === "school") {
        return "Pendidikan";
    }
    if (element.tags.amenity === "hospital" || element.tags.amenity === "clinic" || element.tags.amenity === "pharmacy" || element.tags.healthcare) {
        return "Kesehatan";
    }
    if (element.tags.amenity === "place_of_worship" || element.tags.building === "mosque" || element.tags.building === "church") {
        return "Tempat Ibadah";
    }
    if (element.tags.amenity === "townhall" || element.tags.office === "government" || element.tags.amenity === "community_centre") {
        return "Infrastruktur";
    }
    if (element.tags.amenity === "marketplace" || element.tags.shop || element.tags.amenity === "bank") {
        return "Ekonomi";
    }
    if (element.tags.tourism || element.tags.leisure) {
        return "Wisata";
    }
    if (element.tags.highway) {
        return "Jalan";
    }

    return "Lainnya";
}
