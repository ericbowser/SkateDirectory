/** Cool charcoal map base — keeps white/cyan skate markers readable */
export const NIGHT_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#0a0b0e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0b0e" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#252830" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#343842" }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#2c3038" }, { weight: 1.1 }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#0c0d10" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#0a0b0e" }] },
  { featureType: "landscape.natural.terrain", elementType: "geometry", stylers: [{ color: "#101116" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#121318" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#4b5563" }] },
  { featureType: "poi", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0e1110" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#181a20" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#121318" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#525866" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#242830" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#181a20" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#1c1f26" }] },
  { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#14161b" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#040508" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#374151" }] },
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
