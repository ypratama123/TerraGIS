// Layout dimensions
export const SIDEBAR_WIDTH = 64;
export const PANEL_WIDTH = 256;
export const TOGGLE_BUTTON_SIZE = 36;

// Map configuration
// Koordinat pusat peta untuk Ngabul, Tahunan, Jepara (locked)
export const MAP_CENTER: [number, number] = [-6.648, 110.703];
export const DEFAULT_ZOOM = 14;

// Batas peta untuk wilayah Ngabul, Tahunan, Jepara (diperluas untuk navigasi bebas)
// Format: [[south, west], [north, east]]
export const MAP_BOUNDS: [[number, number], [number, number]] = [
  [-6.70, 110.65], // Southwest corner (diperluas)
  [-6.60, 110.75], // Northeast corner (diperluas)
];

// Zoom constraints
export const MIN_ZOOM = 13;
export const MAX_ZOOM = 19;

// Category colors for markers
export const CATEGORY_COLORS = [
  "#a5b4fc",
  "#f9a8d4",
  "#bbf7d0",
  "#fde68a",
  "#c4b5fd",
  "#fbcfe8",
  "#fed7aa",
  "#bae6fd",
] as const;

// Condition filter options
export const CONDITION_FILTERS = [
  "Baik",
  "Rusak Ringan",
  "Rusak Berat",
] as const;

// Map style options
export const MAP_STYLES = [
  { id: "streets", name: "Streets" },
  { id: "outdoor", name: "Outdoor" },
  { id: "dark", name: "Dark" },
  { id: "light", name: "Light" },
  { id: "satellite", name: "Satellite" },
] as const;

// View types
export type ViewType = "layers" | "list" | "profile" | "settings" | "statistics";
