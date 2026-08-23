/** Dark brown night-mode map styles */
export const NIGHT_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#2a1810" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#b8a090" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#160c08" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#3e2820" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4a3228" }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#443028" }, { weight: 1.5 }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#22140c" }] },
  { featureType: "landscape.natural.terrain", elementType: "geometry", stylers: [{ color: "#281810" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#302018" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#9a8878" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#242018" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#382820" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9a8878" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#a85828" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#6e3818" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#3e2c22" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1e140e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#100c0a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#5a5048" }] },
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
