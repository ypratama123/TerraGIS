"use client";

// Nominatim Geocoding API Service (OpenStreetMap - Free, no API key required)
// Documentation: https://nominatim.org/release-docs/latest/api/Search/

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

// Bounding box for Ngabul, Tahunan, Jepara area
const NGABUL_BBOX = {
    minLon: 110.65,
    minLat: -6.70,
    maxLon: 110.75,
    maxLat: -6.60,
};

export interface NominatimResult {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    lat: string;
    lon: string;
    display_name: string;
    class: string;
    type: string;
    importance: number;
}

/**
 * Search for a place using Nominatim API
 */
export async function searchPlace(
    query: string,
    options?: {
        limit?: number;
        bounded?: boolean;
    }
): Promise<NominatimResult[]> {
    const params = new URLSearchParams({
        q: `${query}, Ngabul, Tahunan, Jepara, Indonesia`,
        format: "json",
        limit: (options?.limit || 5).toString(),
        viewbox: `${NGABUL_BBOX.minLon},${NGABUL_BBOX.maxLat},${NGABUL_BBOX.maxLon},${NGABUL_BBOX.minLat}`,
        bounded: options?.bounded ? "1" : "0",
        countrycodes: "id",
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params.toString()}`, {
        headers: {
            "User-Agent": "SIG-Ngabul-App/1.0",
        },
    });

    if (!response.ok) {
        throw new Error(`Nominatim request failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get coordinates for a location name
 */
export async function getCoordinates(
    name: string
): Promise<{ latitude: number; longitude: number } | null> {
    try {
        const results = await searchPlace(name, { limit: 1 });

        if (results.length > 0) {
            return {
                latitude: parseFloat(results[0].lat),
                longitude: parseFloat(results[0].lon),
            };
        }

        return null;
    } catch (error) {
        console.error("Error getting coordinates:", error);
        return null;
    }
}

export interface SyncResult {
    locationId: string;
    locationName: string;
    oldLat: number;
    oldLng: number;
    newLat: number | null;
    newLng: number | null;
    found: boolean;
    status: "pending" | "found" | "not_found" | "error";
}

/**
 * Batch sync coordinates for multiple locations
 * Processes in batches with delay to respect rate limits
 */
export async function batchSyncCoordinates(
    locations: Array<{ id: string; name: string; latitude: number; longitude: number }>,
    onProgress?: (current: number, total: number, result: SyncResult) => void
): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    const DELAY_MS = 1100; // Nominatim requires 1 request per second

    for (let i = 0; i < locations.length; i++) {
        const loc = locations[i];

        try {
            const coords = await getCoordinates(loc.name);

            const result: SyncResult = {
                locationId: loc.id,
                locationName: loc.name,
                oldLat: loc.latitude,
                oldLng: loc.longitude,
                newLat: coords?.latitude || null,
                newLng: coords?.longitude || null,
                found: coords !== null,
                status: coords ? "found" : "not_found",
            };

            results.push(result);
            onProgress?.(i + 1, locations.length, result);
        } catch (error) {
            const result: SyncResult = {
                locationId: loc.id,
                locationName: loc.name,
                oldLat: loc.latitude,
                oldLng: loc.longitude,
                newLat: null,
                newLng: null,
                found: false,
                status: "error",
            };

            results.push(result);
            onProgress?.(i + 1, locations.length, result);
        }

        // Delay between requests (except for last item)
        if (i < locations.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
        }
    }

    return results;
}
