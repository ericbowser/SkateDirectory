import React, { useState, useCallback, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Marker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { FetchData } from '../../api/http';
import { apiBaseUrl, apiRoutes, googleMapsApiKey, googleMapsMapId } from '../config/env';
import SkateboardMarker, { buildSkateboardIconUrl, SKATE_MARKER_COLORS } from './SkateboardMarker';
import QuickSearch from './QuickSearch';
import SelectedParkPanel from './SelectedParkPanel';
import { NIGHT_MAP_STYLES } from '../config/mapLayout';
import { openDirections } from '../utils/directions';

/** Salt Lake metro default — Wasatch Front corridor */
const DEFAULT_CENTER = { lat: 40.72, lng: -111.89 };
const DEFAULT_ZOOM = 10;

/**
 * Initial map focus: Salt Lake / Wasatch Front metro only.
 * Far parks (Wendover, Tooele, Heber, Park City, …) stay searchable.
 */
function isSlcMetroPark(park) {
  const lat = Number(park.locationLatitude ?? park.LocationLatitude);
  const lng = Number(park.locationLongitude ?? park.LocationLongitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  // West of Tooele / east of Heber–Park City out of initial view
  return lng >= -112.12 && lng <= -111.55 && lat >= 40.10 && lat <= 41.35;
}

function parkLatLng(park) {
  return {
    lat: Number(park.locationLatitude ?? park.LocationLatitude),
    lng: Number(park.locationLongitude ?? park.LocationLongitude),
  };
}

/**
 * Fit + restrict to SLC metro on load. When a park is focused (search/click),
 * clear the restriction and fly to that park.
 */
function MapCameraController({ parks, focusedPark }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !parks?.length || !window.google?.maps) return;

    // Search / selection — jump to that park (even if outside SLC)
    if (focusedPark) {
      const { lat, lng } = parkLatLng(focusedPark);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      map.setOptions({ restriction: null });
      map.panTo({ lat, lng });
      map.setZoom(14);
      return;
    }

    // Default / cleared — SLC metro overview
    const bounds = new window.google.maps.LatLngBounds();
    let count = 0;
    for (const park of parks) {
      if (!isSlcMetroPark(park)) continue;
      const { lat, lng } = parkLatLng(park);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      bounds.extend({ lat, lng });
      count += 1;
    }
    if (count === 0) return;

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const latPad = Math.max(ne.lat() - sw.lat(), 0.05) * 0.04;
    const lngPad = Math.max(ne.lng() - sw.lng(), 0.05) * 0.04;

    map.setOptions({
      restriction: {
        latLngBounds: {
          north: ne.lat() + latPad,
          south: sw.lat() - latPad,
          east: ne.lng() + lngPad,
          west: sw.lng() - lngPad,
        },
        strictBounds: true,
      },
    });
    map.fitBounds(bounds, { top: 8, right: 8, bottom: 8, left: 8 });
  }, [map, parks, focusedPark]);

  return null;
}

const MapLoadingState = () => (
  <div className="flex h-full items-center justify-center bg-slate-800 text-slate-300">
    <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-amber-400" />
    <p className="ml-4">Loading skate parks...</p>
  </div>
);

const ParkInfoContent = ({ park }) => (
  <div className="max-w-xs rounded-2xl border border-slate-700 bg-slate-800 p-3.5 font-sans text-slate-100 shadow-xl">
    <h3 className="m-0 mb-1.5 font-semibold text-slate-100">{park.parkName}</h3>
    <p className="m-0 mb-1.5 text-sm text-slate-400">
      <span className="font-medium text-slate-300">Address:</span> {park.parkAddress}
    </p>
    {park.parkDescription && (
      <p className="m-0 mb-2.5 text-sm text-slate-400">{park.parkDescription}</p>
    )}
    <button
      type="button"
      className="cursor-pointer rounded-xl border-none bg-amber-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500"
      onClick={() => openDirections(park)}
    >
      Get Directions
    </button>
  </div>
);

const SkateParksMap = ({ onParkSelect }) => {
  const [skateparks, setSkateparks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPark, setSelectedPark] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    const fetchParks = async () => {
      setLoading(true);
      try {
        const response = await FetchData(`${apiBaseUrl}${apiRoutes.getParks}`);
        if (!Array.isArray(response)) {
          throw new Error(`Expected park list array, got ${typeof response}`);
        }
        setSkateparks(response);
      } catch (err) {
        setError('Failed to load skatepark data. Please try again later.');
        console.error('Error fetching skateparks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchParks();
  }, []);

  const focusPark = useCallback(
    (park) => {
      setSelectedPark(park);
      setMapCenter(parkLatLng(park));
      setMapZoom(14);
      onParkSelect?.(park);
    },
    [onParkSelect]
  );

  const handleMarkerClick = useCallback(
    (park) => {
      focusPark(park);
    },
    [focusPark]
  );

  const handleInfoWindowClose = useCallback(() => {
    setSelectedPark(null);
  }, []);

  const slcCount = skateparks.filter(isSlcMetroPark).length;

  return (
    <div
      className={`flex min-h-0 w-full flex-1 flex-col gap-2 ${
        selectedPark ? 'overflow-y-auto' : 'overflow-hidden'
      }`}
    >
      <section className="shrink-0">
        <h1 className="mb-1 text-center text-xl font-bold tracking-tight text-slate-100 sm:text-2xl">
          Where are you skating?
        </h1>
        <p className="mx-auto mb-2 max-w-xl text-center text-xs text-slate-500">
          SLC metro on the map — search any Utah park to jump there.
        </p>
        <div className="mx-auto max-w-2xl">
          <QuickSearch parks={skateparks} onResultClick={focusPark} />
        </div>
      </section>

      <section
        className={`flex min-h-0 flex-col ${
          selectedPark ? 'h-[min(52dvh,420px)] shrink-0' : 'flex-1'
        }`}
      >
        <div className="mb-1 flex shrink-0 items-end justify-between gap-3 px-1">
          <p className="text-xs text-slate-500">
            {loading
              ? 'Loading parks…'
              : selectedPark
                ? `Focused: ${selectedPark.parkName}`
                : `${slcCount} SLC-area parks in view`}
          </p>
          {selectedPark && (
            <button
              type="button"
              onClick={handleInfoWindowClose}
              className="text-xs text-slate-400 underline-offset-2 hover:text-amber-400 hover:underline"
            >
              Back to SLC map
            </button>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-2xl border-2 border-slate-600/90 bg-slate-950 p-1 shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_25px_50px_-12px_rgba(0,0,0,0.65)] sm:p-1.5">
          <div className="min-h-0 flex-1 overflow-hidden rounded-xl ring-1 ring-slate-700/80">
            {loading && <MapLoadingState />}

            {!loading && error && (
              <div
                className="flex h-full items-center justify-center bg-slate-800 px-4 py-3 text-rose-400"
                role="alert"
              >
                <div>
                  <strong className="font-bold">Error:</strong>
                  <span className="sm:inline"> {error}</span>
                </div>
              </div>
            )}

            {!loading && !error && !googleMapsApiKey && (
              <div
                className="flex h-full items-center justify-center bg-slate-800 px-4 py-3 text-rose-400"
                role="alert"
              >
                <div>
                  <strong className="font-bold">Google Maps key missing.</strong>
                  <span className="sm:inline">
                    {' '}
                    Set GOOGLE_MAPS_JS_KEY in SkateDirectory/.env and restart Vite.
                  </span>
                </div>
              </div>
            )}

            {!loading && !error && googleMapsApiKey && (
              <APIProvider apiKey={googleMapsApiKey}>
                <Map
                  {...(googleMapsMapId
                    ? { mapId: googleMapsMapId }
                    : { styles: NIGHT_MAP_STYLES, colorScheme: 'DARK' })}
                  center={mapCenter}
                  zoom={mapZoom}
                  onCameraChanged={(ev) => {
                    setMapCenter(ev.detail.center);
                    setMapZoom(ev.detail.zoom);
                  }}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  className="h-full w-full"
                >
                  <MapCameraController parks={skateparks} focusedPark={selectedPark} />

                  {skateparks.map((park) => {
                    const position = parkLatLng(park);
                    const pinColors = SKATE_MARKER_COLORS;
                    const isSelected = selectedPark?.id === park.id;
                    // Keep the busy SLC map clean — only show metro pins until a far park is focused
                    if (!isSlcMetroPark(park) && selectedPark?.id !== park.id) {
                      return null;
                    }

                    if (googleMapsMapId) {
                      return (
                        <AdvancedMarker
                          key={park.id}
                          position={position}
                          onClick={() => handleMarkerClick(park)}
                          title={park.parkName}
                        >
                          <SkateboardMarker colors={pinColors} selected={isSelected} />
                        </AdvancedMarker>
                      );
                    }

                    return (
                      <Marker
                        key={park.id}
                        position={position}
                        onClick={() => handleMarkerClick(park)}
                        title={park.parkName}
                        icon={buildSkateboardIconUrl(pinColors, { selected: isSelected })}
                      />
                    );
                  })}

                  {selectedPark && (
                    <InfoWindow
                      position={parkLatLng(selectedPark)}
                      onCloseClick={handleInfoWindowClose}
                      pixelOffset={[0, -40]}
                    >
                      <ParkInfoContent park={selectedPark} />
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            )}
          </div>
        </div>
      </section>

      {selectedPark && (
        <div className="shrink-0 pb-2">
          <SelectedParkPanel park={selectedPark} onClose={handleInfoWindowClose} />
        </div>
      )}
    </div>
  );
};

export default SkateParksMap;
