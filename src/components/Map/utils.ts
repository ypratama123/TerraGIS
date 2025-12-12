import L from "leaflet";
import { STYLE_URLS } from "./constants";

export const getStyleUrl = (style: string, apiKey: string): string => {
  const styleId = STYLE_URLS[style] || STYLE_URLS.streets;
  return `https://api.maptiler.com/maps/${styleId}/style.json?key=${apiKey}`;
};

export const createMarkerIcon = (
  color: string,
  size: number,
  isSelected: boolean = false
): L.DivIcon => {
  const anchor = size / 2;

  // We use a div structure to enable the CSS-based fill animation
  // The 'marker-wrapper' will handle the border and shape
  // The 'marker-fill' will handle the rising background
  // The 'marker-icon' (inner circle) will sit on top
  const html = `
    <div class="marker-wrapper ${isSelected ? "selected" : ""}" style="--marker-color: ${color}; width: ${size}px; height: ${size}px;">
      <div class="marker-fill"></div>
      <div class="marker-icon"></div>
    </div>
  `;

  return L.divIcon({
    className: "custom-map-marker-container", // Changed class name to avoid conflicts with old styles if any
    html: html,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
    popupAnchor: [0, -anchor],
  });
};

export const getMarkerSize = (zoom: number): number => {
  if (zoom < 12) return 6;
  if (zoom < 14) return 12;
  if (zoom < 16) return 18;
  return 24;
};

export const parseCoordinate = (value: number | string): number | null => {
  const parsed = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(parsed) ? null : parsed;
};
