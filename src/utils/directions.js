/**
 * Build a Google Maps directions URL for a park.
 * Prefer lat/lng; fall back to address. Uses the official Maps URLs API form.
 */
export function getDirectionsUrl(park) {
  if (!park) return 'https://www.google.com/maps';

  const lat = Number(park.locationLatitude ?? park.LocationLatitude);
  const lng = Number(park.locationLongitude ?? park.LocationLongitude);
  const address = park.parkAddress || park.ParkAddress || '';
  const name = park.parkName || park.ParkName || '';

  let destination;
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    destination = `${lat},${lng}`;
  } else if (address) {
    destination = address;
  } else if (name) {
    destination = `${name} skatepark Utah`;
  } else {
    return 'https://www.google.com/maps';
  }

  const params = new URLSearchParams({
    api: '1',
    destination,
    travelmode: 'driving',
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function openDirections(park) {
  window.open(getDirectionsUrl(park), '_blank', 'noopener,noreferrer');
}
