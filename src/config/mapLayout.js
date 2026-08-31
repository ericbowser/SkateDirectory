/** Dark grey map base — pairs with black page background + amber markers */

export const NIGHT_MAP_STYLES = [

  { elementType: "geometry", stylers: [{ color: "#1c1c1c" }] },

  { elementType: "labels.text.fill", stylers: [{ color: "#9ca3af" }] },

  { elementType: "labels.text.stroke", stylers: [{ color: "#1c1c1c" }] },

  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },

  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#525252" }] },

  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#6b7280" }] },

  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#4b5563" }, { weight: 1.1 }] },

  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#242424" }] },

  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#1c1c1c" }] },

  { featureType: "landscape.natural.terrain", elementType: "geometry", stylers: [{ color: "#2a2a2a" }] },

  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#262626" }] },

  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },

  { featureType: "poi", elementType: "labels.icon", stylers: [{ visibility: "off" }] },

  { featureType: "poi.business", stylers: [{ visibility: "off" }] },

  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#222822" }] },

  { featureType: "road", elementType: "geometry", stylers: [{ color: "#3d3d3d" }] },

  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#2e2e2e" }] },

  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#a1a1aa" }] },

  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#4a4a4a" }] },

  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#3d3d3d" }] },

  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#454545" }] },

  { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#353535" }] },

  { featureType: "transit", stylers: [{ visibility: "off" }] },

  { featureType: "water", elementType: "geometry", stylers: [{ color: "#141820" }] },

  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },

];



/** Alias for the current map theme */

export const GREY_MAP_STYLES = NIGHT_MAP_STYLES;

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

