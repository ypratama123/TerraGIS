"use client";

import { useMemo } from "react";
import { Marker, Tooltip } from "react-leaflet";
import { Location } from "@/types";
import { createMarkerIcon, getMarkerSize, parseCoordinate } from "./utils";

interface LocationMarkerProps {
  location: Location;
  zoom: number;
  isSelected?: boolean;
}

export const LocationMarker = ({
  location,
  zoom,
  isSelected = false,
  onClick,
}: LocationMarkerProps & { onClick?: (location: Location) => void }) => {
  const lat = parseCoordinate(location.latitude);
  const lng = parseCoordinate(location.longitude);

  const size = getMarkerSize(zoom);
  const icon = useMemo(
    () => createMarkerIcon(location.color || "#3b82f6", size, isSelected),
    [location.color, size, isSelected]
  );

  const eventHandlers = useMemo(
    () => ({
      click: () => {
        onClick?.(location);
      },
    }),
    [onClick, location]
  );

  if (lat === null || lng === null) return null;

  return (
    <Marker position={[lat, lng]} icon={icon} eventHandlers={eventHandlers}>
      <Tooltip
        direction="top"
        offset={[0, -size / 2 - 10]}
        opacity={1}
        className="transparent-tooltip"
      >
        <div
          className="custom-tooltip-content"
          style={
            {
              "--tooltip-bg": location.color || "#3b82f6",
            } as React.CSSProperties
          }
        >
          <span className="text-white">{location.name}</span>
        </div>
      </Tooltip>
    </Marker>
  );
};
