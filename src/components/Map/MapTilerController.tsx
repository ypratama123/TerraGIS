"use client";

import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import { MaptilerLayer } from "@maptiler/leaflet-maptilersdk";
import { getStyleUrl } from "./utils";

interface MapTilerControllerProps {
  mapStyle: string;
  apiKey: string | undefined;
}

export const MapTilerController = ({
  mapStyle,
  apiKey,
}: MapTilerControllerProps) => {
  const map = useMap();
  const layerRef = useRef<InstanceType<typeof MaptilerLayer> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const mountedRef = useRef(true);

  // Wait for map to be ready
  useEffect(() => {
    mountedRef.current = true;

    // Check if map container exists
    const checkMapReady = () => {
      try {
        if (map && map.getContainer() && mountedRef.current) {
          setIsReady(true);
        }
      } catch {
        // Map not ready yet
      }
    };

    // Initial check
    checkMapReady();

    // Also listen for map ready event
    map.whenReady(() => {
      if (mountedRef.current) {
        setIsReady(true);
      }
    });

    return () => {
      mountedRef.current = false;
    };
  }, [map]);

  // Initialize layer when ready
  useEffect(() => {
    if (!apiKey || !isReady || !mountedRef.current) return;

    // Check if layer already exists
    if (layerRef.current) return;

    const initLayer = () => {
      if (!mountedRef.current) return;

      try {
        // Verify map is still valid
        if (!map || !map.getContainer()) return;

        const styleUrl = getStyleUrl(mapStyle, apiKey);
        layerRef.current = new MaptilerLayer({
          apiKey,
          style: styleUrl,
        }).addTo(map);
      } catch (err) {
        // Suppress common errors
        const message = err instanceof Error ? err.message : "";
        if (!message.includes("abort") && !message.includes("null")) {
          console.error("Failed to initialize MapTiler layer:", err);
        }
      }
    };

    // Small delay to ensure map is fully ready
    const timeoutId = setTimeout(initLayer, 150);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [map, apiKey, isReady, mapStyle]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (layerRef.current) {
        try {
          if (map && map.getContainer()) {
            map.removeLayer(layerRef.current);
          }
        } catch {
          // Ignore cleanup errors
        }
        layerRef.current = null;
      }
    };
  }, [map]);

  // Update style when changed
  useEffect(() => {
    if (!layerRef.current || !apiKey || !isReady) return;

    try {
      const styleUrl = getStyleUrl(mapStyle, apiKey);
      layerRef.current.setStyle(styleUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (!message.includes("abort") && !message.includes("null")) {
        console.error("Failed to set MapTiler style:", err);
      }
    }
  }, [mapStyle, apiKey, isReady]);

  return null;
};
