"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { Location } from "@/types";
import { parseCoordinate } from "./utils";
import { FOCUS_ZOOM } from "./constants";

interface FlyToLocationProps {
  location: Location | null;
  onComplete?: () => void;
}

export const FlyToLocation = ({ location, onComplete }: FlyToLocationProps) => {
  const map = useMap();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!location) return;

    const lat = parseCoordinate(location.latitude);
    const lng = parseCoordinate(location.longitude);

    if (lat === null || lng === null) return;

    // Check if map is still valid
    try {
      if (!map || !map.getContainer()) return;
    } catch {
      return;
    }

    // Fly to location with animation
    try {
      map.flyTo([lat, lng], FOCUS_ZOOM, {
        duration: 1.5,
      });
    } catch (err) {
      console.error("Failed to fly to location:", err);
      return;
    }

    // Callback after flying completes
    const handleMoveEnd = () => {
      if (mountedRef.current) {
        onComplete?.();
      }
      try {
        map.off("moveend", handleMoveEnd);
      } catch {
        // Ignore
      }
    };

    try {
      map.on("moveend", handleMoveEnd);
    } catch {
      // Ignore
    }

    return () => {
      try {
        map.off("moveend", handleMoveEnd);
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [location, map, onComplete]);

  return null;
};
