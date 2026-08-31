// Browser-safe env values loaded by Vite from .env (see envPrefix in vite.config.mjs).

export const googleMapsApiKey =
  import.meta.env.GOOGLE_MAPS_JS_KEY || import.meta.env.GOOGLE_MAPS_API_KEY || '';

export const googleMapsMapId = import.meta.env.GOOGLE_MAPS_MAP_ID || '';

/** Build absolute API path — always root-relative so /parks route doesn't break fetches */
export function apiUrl(route) {
  const path = route.startsWith('/') ? route : `/${route}`;
  const base = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
  return base ? `${base}${path}` : path;
}

export const apiRoutes = {
  getParks: import.meta.env.VITE_REL_GET_PARK || '/api/getparks',
  getPark: import.meta.env.VITE_REL_GET_PARK_DETAIL || '/api/getpark/',
  addPark: import.meta.env.VITE_REL_ADD_PARK || '/api/addpark',
  getFeatures: import.meta.env.VITE_REL_GET_FEATURE || '/api/getfeatures',
  addFeature: import.meta.env.VITE_REL_ADD_FEATURE || '/api/addfeature',
  suggestPark: import.meta.env.VITE_REL_SUGGEST_PARK || '/api/suggest-park',
};

/** When true, show the legacy direct-add park form (local/admin only). */
export const parkAdminEnabled = import.meta.env.VITE_ENABLE_PARK_ADMIN === 'true';

// Deprecated — use apiUrl(apiRoutes.getParks) instead
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
