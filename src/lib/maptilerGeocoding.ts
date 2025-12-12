"use client";

// MapTiler Geocoding API Service
// Documentation: https://docs.maptiler.com/cloud/api/geocoding/

const MAPTILER_API_KEY = "rlxe8EEd1Ffb7aH9G6Zd";

export interface GeocodingResult {
  id: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  relevance: number;
  properties: {
    osm_id?: number;
    osm_type?: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

export interface GeocodingResponse {
  type: string;
  features: GeocodingResult[];
  attribution?: string;
}

/**
 * Forward geocoding - Convert address to coordinates
 * @param query - Address or place name to search
 * @param options - Additional options
 */
export async function forwardGeocode(
  query: string,
  options?: {
    limit?: number;
    bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
    proximity?: [number, number]; // [longitude, latitude]
    country?: string[];
    language?: string;
  }
): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({
    key: MAPTILER_API_KEY,
    limit: (options?.limit || 5).toString(),
  });

  if (options?.bbox) {
    params.append("bbox", options.bbox.join(","));
  }

  if (options?.proximity) {
    params.append("proximity", options.proximity.join(","));
  }

  if (options?.country) {
    params.append("country", options.country.join(","));
  }

  if (options?.language) {
    params.append("language", options.language);
  }

  const encodedQuery = encodeURIComponent(query);
  const url = `https://api.maptiler.com/geocoding/${encodedQuery}.json?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Geocoding request failed: ${response.statusText}`);
  }

  const data: GeocodingResponse = await response.json();
  return data.features;
}

/**
 * Reverse geocoding - Convert coordinates to address
 * @param longitude - Longitude coordinate
 * @param latitude - Latitude coordinate
 */
export async function reverseGeocode(
  longitude: number,
  latitude: number,
  options?: {
    language?: string;
  }
): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({
    key: MAPTILER_API_KEY,
  });

  if (options?.language) {
    params.append("language", options.language);
  }

  const url = `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Reverse geocoding request failed: ${response.statusText}`);
  }

  const data: GeocodingResponse = await response.json();
  return data.features;
}

/**
 * Search for places in Ngabul, Tahunan, Jepara area
 * Uses proximity and bbox to focus on the region
 */
export async function searchNgabulTahunanJepara(query: string): Promise<GeocodingResult[]> {
  // Bounding box for Ngabul, Tahunan, Jepara area (approximate)
  // Format: [minLon, minLat, maxLon, maxLat]
  const NGABUL_TAHUNAN_BBOX: [number, number, number, number] = [
    110.60, -6.82, // Southwest corner
    110.75, -6.68  // Northeast corner
  ];

  // Center of Ngabul, Tahunan, Jepara for proximity
  const NGABUL_CENTER: [number, number] = [110.67552, -6.75446];

  return forwardGeocode(query, {
    bbox: NGABUL_TAHUNAN_BBOX,
    proximity: NGABUL_CENTER,
    country: ["ID"],
    language: "id",
    limit: 10,
  });
}

/**
 * Get coordinates for a specific address in Ngabul, Jepara
 */
export async function getCoordinatesForAddress(
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const results = await searchNgabulTahunanJepara(address);

    if (results.length > 0) {
      const [longitude, latitude] = results[0].center;
      return { latitude, longitude };
    }

    return null;
  } catch (error) {
    console.error("Error getting coordinates:", error);
    return null;
  }
}

/**
 * Batch geocode multiple addresses
 */
export async function batchGeocode(
  addresses: string[]
): Promise<Map<string, { latitude: number; longitude: number } | null>> {
  const results = new Map<string, { latitude: number; longitude: number } | null>();

  for (const address of addresses) {
    const coords = await getCoordinatesForAddress(address);
    results.set(address, coords);
    // Add small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return results;
}
