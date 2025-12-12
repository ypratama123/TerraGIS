"use client";

import { useEffect, useRef } from "react";
import { useMapEvents } from "react-leaflet";

interface MapEventsProps {
  onZoomChange: (zoom: number) => void;
}

export const MapEvents = ({ onZoomChange }: MapEventsProps) => {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const map = useMapEvents({
    zoomend: () => {
      if (mountedRef.current) {
        try {
          onZoomChange(map.getZoom());
        } catch {
          // Ignore errors
        }
      }
    },
  });

  return null;
};
