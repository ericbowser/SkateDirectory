import React, { useState, useCallback, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Marker,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { FetchData } from '../../api/http';
import { apiBaseUrl, apiRoutes, googleMapsApiKey, googleMapsMapId } from '../config/env';
import SkateboardMarker, { buildSkateboardIconUrl, SKATE_MARKER_COLORS } from './SkateboardMarker';
import QuickSearch from './QuickSearch';
import { NIGHT_MAP_STYLES } from '../config/mapLayout';

const DEFAULT_CENTER = { lat: 40.75494942, lng: -111.90282008 };
const DEFAULT_ZOOM = 11;

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
      onClick={() =>
        window.open(
          `https://maps.google.com/dir/?api=1&destination=${park.locationLatitude},${park.locationLongitude}`
        )
      }
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
      setMapCenter({
        lat: Number(park.locationLatitude),
        lng: Number(park.locationLongitude),
      });
      setMapZoom(15);
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

  return (
    <div className="mx-auto flex w-full max-w-[84.5rem] flex-col gap-6">
      {/* Focal search */}
      <section className="pt-2 sm:pt-6">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/80">
          Find a session
        </p>
        <h1 className="mb-2 text-center text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
          Where are you skating?
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-center text-slate-400">
          Search Salt Lake City parks by name or neighborhood, then explore them on the map.
        </p>
        <div className="mx-auto max-w-2xl">
          <QuickSearch parks={skateparks} onResultClick={focusPark} />
        </div>
      </section>

      {/* Map panel */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-3 px-1">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Map
            </h2>
            <p className="text-xs text-slate-500">
              {loading
                ? 'Loading parks…'
                : `${skateparks.length} park${skateparks.length === 1 ? '' : 's'} plotted`}
            </p>
          </div>
          {selectedPark && (
            <p className="truncate text-sm text-amber-400/90">
              Selected: {selectedPark.parkName}
            </p>
          )}
        </div>

        <div className="rounded-2xl border-2 border-slate-600/90 bg-slate-950 p-1.5 shadow-[0_0_0_1px_rgba(251,191,36,0.12),0_25px_50px_-12px_rgba(0,0,0,0.65)] sm:p-2">
          <div className="h-[min(77vh,740px)] min-h-[422px] overflow-hidden rounded-xl ring-1 ring-slate-700/80">
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
                    : { styles: NIGHT_MAP_STYLES })}
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
                  {skateparks.map((park) => {
                    const position = {
                      lat: Number(park.locationLatitude),
                      lng: Number(park.locationLongitude),
                    };
                    const pinColors = SKATE_MARKER_COLORS;
                    const isSelected = selectedPark?.id === park.id;

                    // Cloud Map ID → AdvancedMarker HTML content
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

                    // JS night styles → classic Marker with SVG skateboard icon
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
                      position={{
                        lat: Number(selectedPark.locationLatitude),
                        lng: Number(selectedPark.locationLongitude),
                      }}
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
    </div>
  );
};

export default SkateParksMap;
