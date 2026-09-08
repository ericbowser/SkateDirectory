import React, { useMemo } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Marker,
} from '@vis.gl/react-google-maps';
import { googleMapsApiKey, googleMapsMapId } from '../config/env';
import SkateboardMarker, {
  buildSkateboardIconUrl,
  SKATE_MARKER_COLORS,
} from './SkateboardMarker';
import {
  PAGE_BG,
  MAP_TILE_OPACITY,
  MapTileFade,
  getSharedMapStyleProps,
} from './mapTheme';

const MINI_ZOOM = 15;

function parkLatLng(park) {
  return {
    lat: Number(park.locationLatitude ?? park.LocationLatitude),
    lng: Number(park.locationLongitude ?? park.LocationLongitude),
  };
}

/**
 * Zoomed neighborhood map for a single selected park pin.
 * Uses the same light-blue theme + tile fade as the overview map.
 */
export default function ParkMiniMap({ park }) {
  const position = useMemo(() => parkLatLng(park || {}), [park]);
  const hasCoords =
    Number.isFinite(position.lat) && Number.isFinite(position.lng);
  const parkName = park?.parkName || park?.ParkName || 'Skatepark';

  if (!park || !hasCoords) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/50 text-sm text-slate-500">
        Map location unavailable
      </div>
    );
  }

  if (!googleMapsApiKey) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/50 px-4 text-center text-sm text-slate-500">
        Set GOOGLE_MAPS_JS_KEY to show the mini-map.
      </div>
    );
  }

  const mapProps = getSharedMapStyleProps();

  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-slate-700/70">
      <div className="h-48 w-full sm:h-56 lg:h-64">
        <APIProvider apiKey={googleMapsApiKey}>
          <Map
            key={`mini-map-${park.id}`}
            {...mapProps}
            defaultCenter={position}
            defaultZoom={MINI_ZOOM}
            backgroundColor={PAGE_BG}
            gestureHandling="cooperative"
            disableDefaultUI
            zoomControl
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={false}
            clickableIcons={false}
            className="h-full w-full"
            aria-label={`Map of ${parkName} and surrounding area`}
          >
            <MapTileFade opacity={MAP_TILE_OPACITY} />
            {googleMapsMapId ? (
              <AdvancedMarker position={position} title={parkName}>
                <SkateboardMarker
                  colors={SKATE_MARKER_COLORS}
                  selected
                  size={32}
                />
              </AdvancedMarker>
            ) : (
              <Marker
                position={position}
                title={parkName}
                icon={buildSkateboardIconUrl(SKATE_MARKER_COLORS, {
                  size: 36,
                  selected: true,
                })}
              />
            )}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}
