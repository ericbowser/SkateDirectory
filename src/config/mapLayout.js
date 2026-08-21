/** Night-mode map styles — matches rockhoundutah.com (Affiliate/src/config/mapLayout.js) */
export const NIGHT_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a9a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f0f1e" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#2a2a4a" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4a4a6a" }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#3a3a5a" }, { weight: 1.5 }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#16213e" }] },
  { featureType: "landscape.natural.terrain", elementType: "geometry", stylers: [{ color: "#1a2744" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1e2d4a" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6a6a7a" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1a3328" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2a2a4a" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6a6a7a" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#b45309" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#92400e" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#2a3050" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1e1e3a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0c1929" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3a5a7a" }] },
];

/** Pin colors per difficulty — semantic but tuned to the slate/amber brand palette */
export const DIFFICULTY_PIN_COLORS = {
  Beginner: { background: "#34d399", borderColor: "#059669", glyphColor: "#064e3b" },
  Intermediate: { background: "#fbbf24", borderColor: "#d97706", glyphColor: "#78350f" },
  Advanced: { background: "#fb7185", borderColor: "#e11d48", glyphColor: "#881337" },
  default: { background: "#94a3b8", borderColor: "#475569", glyphColor: "#1e293b" },
};

export function getPinColors(difficulty = "") {
  const key = Object.keys(DIFFICULTY_PIN_COLORS).find(
    (k) => difficulty.toLowerCase().includes(k.toLowerCase())
  );
  return DIFFICULTY_PIN_COLORS[key] || DIFFICULTY_PIN_COLORS.default;
}
