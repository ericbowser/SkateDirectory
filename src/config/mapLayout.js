/** Near-black map base so white/cyan skate markers read clearly */
export const NIGHT_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#12100e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8078" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0a0806" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#2a2420" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#3a322c" }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#322a24" }, { weight: 1.25 }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#0e0c0a" }] },
  { featureType: "landscape.natural.terrain", elementType: "geometry", stylers: [{ color: "#141210" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#181612" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6a625a" }] },
  { featureType: "poi", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#121610" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e1a16" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#6a625a" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#5c3a22" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#3a2414" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#242018" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#100e0c" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#06080a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3a4048" }] },
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
