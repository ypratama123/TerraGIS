// Map-specific constants

export const FOCUS_ZOOM = 18;

export const GEOJSON_STYLE = {
  fillColor: "#3b82f6",
  weight: 2,
  opacity: 1,
  color: "#2563eb",
  dashArray: "3",
  fillOpacity: 0.1,
} as const;

export const STYLE_URLS: Record<string, string> = {
  streets: "streets-v2",
  outdoor: "outdoor-v2",
  dark: "dataviz-dark",
  light: "dataviz-light",
  satellite: "satellite",
};
