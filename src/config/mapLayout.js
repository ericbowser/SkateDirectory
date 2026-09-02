/** Light blue map — labels and roads tuned for readability over the page animation */
export const NIGHT_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#dbeafe" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#0c4a6e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#e0f2fe" }, { weight: 2.5 }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#38bdf8" }, { weight: 1.2 }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#0284c7" }, { weight: 1.4 }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#0ea5e9" }, { weight: 1.2 }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#075985" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#e0f2fe" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#dbeafe" }] },
  { featureType: "landscape.natural.terrain", elementType: "geometry", stylers: [{ color: "#eff6ff" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#dbeafe" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#0369a1" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#7dd3fc" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#0c4a6e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#bfdbfe" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#60a5fa" }, { weight: 0.6 }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#1e3a5f" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#38bdf8" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#0284c7" }, { weight: 0.8 }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#7dd3fc" }] },
  { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#dbeafe" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#bae6fd" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#0369a1" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0ea5e9" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#164e63" }] },
];

/** Alias for the current map theme */
export const LIGHT_BLUE_MAP_STYLES = NIGHT_MAP_STYLES;

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
