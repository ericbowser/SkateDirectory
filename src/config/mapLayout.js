/**
 * Pastel map — soft mint / lilac / peach surfaces with readable muted labels.
 * Used when GOOGLE_MAPS_MAP_ID is unset (styled JSON maps).
 */
export const PASTEL_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#f6f1fb' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5b4b6e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#fffafc' }, { weight: 2.5 }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },

  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#d8b4fe' }, { weight: 1.1 }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#c4b5fd' }, { weight: 1.3 }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#e9d5ff' }, { weight: 1.1 }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#6d28d9' }] },

  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#faf5ff' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#fdf2f8' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#f0fdf4' }] },
  { featureType: 'landscape.natural.terrain', elementType: 'geometry', stylers: [{ color: '#ecfdf5' }] },

  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#fce7f3' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#7e22ce' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#bbf7d0' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#166534' }] },

  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffe4e6' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#fda4af' }, { weight: 0.5 }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#4c1d95' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#fdba74' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#fb923c' }, { weight: 0.7 }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#fbcfe8' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#fff1f2' }] },

  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#e9d5ff' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#7c3aed' }] },

  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c4b5fd' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#5b21b6' }] },
];

/** @deprecated alias — prefer PASTEL_MAP_STYLES */
export const NIGHT_MAP_STYLES = PASTEL_MAP_STYLES;
/** @deprecated alias — prefer PASTEL_MAP_STYLES */
export const LIGHT_BLUE_MAP_STYLES = PASTEL_MAP_STYLES;

/** Pin colors per difficulty — semantic but tuned to the slate/amber brand palette */
export const DIFFICULTY_PIN_COLORS = {
  Beginner: { background: '#34d399', borderColor: '#059669', glyphColor: '#064e3b' },
  Intermediate: { background: '#fbbf24', borderColor: '#d97706', glyphColor: '#78350f' },
  Advanced: { background: '#fb7185', borderColor: '#e11d48', glyphColor: '#881337' },
  default: { background: '#94a3b8', borderColor: '#475569', glyphColor: '#1e293b' },
};

export function getPinColors(difficulty = '') {
  const key = Object.keys(DIFFICULTY_PIN_COLORS).find((k) =>
    difficulty.toLowerCase().includes(k.toLowerCase())
  );
  return DIFFICULTY_PIN_COLORS[key] || DIFFICULTY_PIN_COLORS.default;
}
