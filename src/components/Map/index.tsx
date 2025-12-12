"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Location } from "@/types";
import { MAP_CENTER, DEFAULT_ZOOM, MAP_BOUNDS, MIN_ZOOM, MAX_ZOOM } from "@/constants";
import type { GeoJsonObject } from "geojson";
import type { LatLngBoundsExpression } from "leaflet";

// Sub-components
import { MapEvents } from "./MapEvents";
import { FlyToLocation } from "./FlyToLocation";
import { MapTilerController } from "./MapTilerController";
import { LocationMarker } from "./LocationMarker";
import { GEOJSON_STYLE } from "./constants";

interface MapProps {
  locations?: Location[];
  mapStyle?: string;
  selectedLocation?: Location | null;
  onFlyComplete?: () => void;
  onLocationClick?: (location: Location) => void;
}

const Map = ({
  locations = [],
  mapStyle = "light",
  selectedLocation = null,
  onFlyComplete,
  onLocationClick,
}: MapProps) => {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonObject | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  // Treat placeholder env value as empty so we fall back to OSM tiles when no real key is provided.
  const apiKey = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
    if (!raw) return "";
    if (raw.toUpperCase().startsWith("REPLACE_ME")) return "";
    return raw;
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  // Fetch GeoJSON data
  useEffect(() => {
    const controller = new AbortController();

    fetch("/data/village_boundaries.geojson", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Error loading GeoJSON:", err);
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={DEFAULT_ZOOM}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      maxBounds={MAP_BOUNDS as LatLngBoundsExpression}
      maxBoundsViscosity={0.8}
      scrollWheelZoom={true}
      zoomControl={false}
      dragging={true}
      tap={true}
      touchZoom={true}
      bounceAtZoomLimits={true}
      className="h-full w-full outline-none touch-none"
    >
      <MapEvents onZoomChange={handleZoomChange} />
      <FlyToLocation location={selectedLocation} onComplete={onFlyComplete} />

      {apiKey ? (
        <MapTilerController mapStyle={mapStyle} apiKey={apiKey} />
      ) : (
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      )}

      <ZoomControl position="bottomright" />

      {geoJsonData && <GeoJSON data={geoJsonData} style={GEOJSON_STYLE} />}

      {locations.map((location) => (
        <LocationMarker
          key={location.id}
          location={location}
          zoom={zoom}
          isSelected={selectedLocation?.id === location.id}
          onClick={onLocationClick}
        />
      ))}
    </MapContainer>
  );
};

export default Map;

