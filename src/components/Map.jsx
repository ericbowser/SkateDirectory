import React, { useState, useCallback, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Marker,
  useMap,
} from '@vis.gl/react-google-maps';
import { FetchData } from '../services/http';
import { apiUrl, apiRoutes, googleMapsApiKey, googleMapsMapId } from '../config/env';
import SkateboardMarker, { buildSkateboardIconUrl, SKATE_MARKER_COLORS } from './SkateboardMarker';
import QuickSearch from './QuickSearch';
import SelectedParkPanel from './SelectedParkPanel';
import { NIGHT_MAP_STYLES } from '../config/mapLayout';
import { downloadParksCsv } from '../utils/exportParksCsv';

const FOCUS_ZOOM = 15;
const OVERVIEW_MIN_ZOOM = 7;
const OVERVIEW_MAX_ZOOM = 10;
const FIT_PADDING = { top: 40, right: 40, bottom: 64, left: 40 };

function parkLatLng(park) {
  return {
    lat: Number(park.locationLatitude ?? park.LocationLatitude),
    lng: Number(park.locationLongitude ?? park.LocationLongitude),
  };
}

function parksWithCoords(parks) {
  return (parks ?? []).filter((park) => {
    const { lat, lng } = parkLatLng(park);
    return Number.isFinite(lat) && Number.isFinite(lng);
  });
}

function boundsForParks(parks) {
  const bounds = new window.google.maps.LatLngBounds();
  for (const park of parks) {
    bounds.extend(parkLatLng(park));
  }
  return bounds;
}

function clampOverviewZoom(map, parkCount) {
  const zoom = map.getZoom();
  if (zoom == null) return;

  if (parkCount === 1) {
    map.setZoom(Math.min(zoom, 14));
    return;
  }

  const clamped = Math.max(OVERVIEW_MIN_ZOOM, Math.min(zoom, OVERVIEW_MAX_ZOOM));
  if (clamped !== zoom) {
    map.setZoom(clamped);
  }
}

function fitMapToParks(map, parks, padding = FIT_PADDING) {
  const valid = parksWithCoords(parks);
  if (!valid.length) return;

  const mapEl = map.getDiv?.();
  if (mapEl && mapEl.offsetHeight < 80) return;

  const bounds = boundsForParks(valid);
  map.fitBounds(bounds, padding);

  window.google.maps.event.addListenerOnce(map, 'idle', () => {
    clampOverviewZoom(map, valid.length);
  });
}

function MapCameraController({ parks, focusedPark, resetKey }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !window.google?.maps) return;

    const valid = parksWithCoords(parks);
    if (!valid.length) return;

    if (focusedPark) {
      const { lat, lng } = parkLatLng(focusedPark);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      map.panTo({ lat, lng });
      map.setZoom(FOCUS_ZOOM);
      return;
    }

    const runOverviewFit = () => fitMapToParks(map, valid);

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(runOverviewFit);
    });

    const mapEl = map.getDiv?.();
    let resizeObserver;
    let resizeTimer;
    if (mapEl && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (focusedPark) return;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(runOverviewFit, 120);
      });
      resizeObserver.observe(mapEl);
    }

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(resizeTimer);
      resizeObserver?.disconnect();
    };
  }, [map, parks, focusedPark, resetKey]);

  return null;
}

const MapLoadingState = () => (
  <div className="flex h-full items-center justify-center bg-slate-950 text-slate-400">
    <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-amber-400" />
    <p className="ml-3 text-sm">Loading parks…</p>
  </div>
);

const SkateParksMap = ({ onParkSelect }) => {
  const [skateparks, setSkateparks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPark, setSelectedPark] = useState(null);
  const [mapResetKey, setMapResetKey] = useState(0);
  const [initialCenter] = useState({ lat: 40.65, lng: -112.35 });
  const [initialZoom] = useState(8);

  useEffect(() => {
    const fetchParks = async () => {
      setLoading(true);
      try {
        const response = await FetchData(apiUrl(apiRoutes.getParks));
        if (!Array.isArray(response)) {
          throw new Error(`Expected park list array, got ${typeof response}`);
        }
        setSkateparks(response);
      } catch (err) {
        setError(err.message || 'Failed to load skatepark data. Please try again later.');
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

  const handleBackToMap = useCallback(() => {
    setSelectedPark(null);
    setMapResetKey((k) => k + 1);
  }, []);

  const handleDownloadCsv = useCallback(() => {
    if (!skateparks.length) return;
    downloadParksCsv(skateparks);
  }, [skateparks]);

  const parkCount = parksWithCoords(skateparks).length;
  const showingDetails = Boolean(selectedPark);

  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-3 overflow-x-hidden">
      {/* Search — dropdown must sit above the map */}
      <section
        aria-label="Search skateparks"
        className="relative z-50 min-w-0 shrink-0 space-y-2 overflow-visible"
      >
        <QuickSearch
          parks={skateparks}
          onResultClick={focusPark}
          onDownloadCsv={handleDownloadCsv}
        />
        {!loading && skateparks.length > 0 && (
          <div className="flex justify-end px-0.5">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-amber-400/90 transition-colors hover:border-amber-500/30 hover:bg-slate-800 hover:text-amber-300"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download {skateparks.length} parks (CSV)
            </button>
          </div>
        )}
      </section>

      {/* Map — fills page; hidden (not unmounted) while viewing park details */}
      <section
        aria-label="Map of skateparks"
        aria-hidden={showingDetails}
        className={`relative z-0 min-h-0 min-w-0 flex-1 ${showingDetails ? 'hidden' : ''}`}
      >
          <div className="pointer-events-none absolute left-3 top-3 z-10">
            <span className="rounded-md bg-slate-950/85 px-2 py-0.5 text-[11px] text-slate-400 backdrop-blur-sm">
              {loading ? 'Loading…' : `${parkCount} parks`}
            </span>
          </div>

          <div className="h-full overflow-hidden rounded-xl opacity-50 ring-1 ring-slate-700/60">
            {loading && <MapLoadingState />}

            {!loading && error && (
              <div
                className="flex h-full items-center justify-center bg-slate-950 px-4 text-sm text-rose-400"
                role="alert"
              >
                {error}
              </div>
            )}

            {!loading && !error && !googleMapsApiKey && (
              <div
                className="flex h-full items-center justify-center bg-slate-950 px-4 text-sm text-rose-400"
                role="alert"
              >
                Set GOOGLE_MAPS_JS_KEY in .env and restart Vite.
              </div>
            )}

            {!loading && !error && googleMapsApiKey && (
              <APIProvider apiKey={googleMapsApiKey}>
                <Map
                  {...(googleMapsMapId
                    ? { mapId: googleMapsMapId }
                    : { styles: NIGHT_MAP_STYLES, colorScheme: 'DARK' })}
                  defaultCenter={initialCenter}
                  defaultZoom={initialZoom}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  zoomControl
                  mapTypeControl={false}
                  streetViewControl={false}
                  fullscreenControl
                  className="h-full w-full"
                >
                  <MapCameraController
                    parks={skateparks}
                    focusedPark={null}
                    resetKey={mapResetKey}
                  />

                  {parksWithCoords(skateparks).map((park) => {
                    const position = parkLatLng(park);

                    if (googleMapsMapId) {
                      return (
                        <AdvancedMarker
                          key={park.id}
                          position={position}
                          onClick={() => handleMarkerClick(park)}
                          title={park.parkName}
                        >
                          <SkateboardMarker colors={SKATE_MARKER_COLORS} selected={false} />
                        </AdvancedMarker>
                      );
                    }

                    return (
                      <Marker
                        key={park.id}
                        position={position}
                        onClick={() => handleMarkerClick(park)}
                        title={park.parkName}
                        icon={buildSkateboardIconUrl(SKATE_MARKER_COLORS, { selected: false })}
                      />
                    );
                  })}
                </Map>
              </APIProvider>
            )}
          </div>
      </section>

      {/* Details — replaces visible map when a park is selected */}
      {showingDetails && (
        <section
          id="park-details"
          aria-label="Park details"
          className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-hidden"
        >
          <button
            type="button"
            onClick={handleBackToMap}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-slate-600 bg-slate-800/90 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:border-amber-500/40 hover:bg-slate-800 hover:text-amber-300"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to map
          </button>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-1">
            <SelectedParkPanel
              park={selectedPark}
              onClose={handleBackToMap}
              showCloseButton={false}
            />
          </div>
        </section>
      )}
    </div>
  );
};

export default SkateParksMap;
