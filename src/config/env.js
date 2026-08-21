// Browser-safe env values loaded by Vite from .env (see envPrefix in vite.config.mjs).
// Google Maps uses an API key — not OAuth client ID/secret.

export const googleMapsApiKey =
  import.meta.env.GOOGLE_MAPS_JS_KEY || import.meta.env.GOOGLE_MAPS_API_KEY || '';

export const googleMapsMapId = import.meta.env.GOOGLE_MAPS_MAP_ID || '';

// VITE_API_BASE_URL — do not use BASE_URL (reserved by Vite as "/")
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

export const apiRoutes = {
  getParks: import.meta.env.VITE_REL_GET_PARK || 'api/getparks',
  addPark: import.meta.env.VITE_REL_ADD_PARK || 'api/addpark',
  getFeatures: import.meta.env.VITE_REL_GET_FEATURE || 'api/getfeatures',
  addFeature: import.meta.env.VITE_REL_ADD_FEATURE || 'api/addfeature',
};
