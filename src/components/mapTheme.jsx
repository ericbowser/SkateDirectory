import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { googleMapsMapId } from '../config/env';
import { NIGHT_MAP_STYLES } from '../config/mapLayout';

/** Shared page / map chrome background */
export const PAGE_BG = '#0b1120';

/** Tile opacity — keeps the light-blue theme readable over the navy page */
export const MAP_TILE_OPACITY = 0.78;

/** Props shared by the overview map and park mini-map */
export function getSharedMapStyleProps() {
  return googleMapsMapId
    ? { mapId: googleMapsMapId }
    : { styles: NIGHT_MAP_STYLES, colorScheme: 'LIGHT' };
}

/**
 * Softens Google tile layers to match the app's navy + light-blue look.
 * Markers stay full-opacity (not inside the faded tile wrappers).
 */
export function MapTileFade({ opacity = MAP_TILE_OPACITY }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return undefined;

    map.setOptions({ backgroundColor: PAGE_BG });

    const fadeTiles = () => {
      const container = map.getDiv();
      if (!container) return;

      container.style.backgroundColor = PAGE_BG;

      const tileNodes = container.querySelectorAll(
        'img[src*="google"], img[src*="gstatic"], canvas'
      );

      tileNodes.forEach((node) => {
        let el = node.parentElement;
        let depth = 0;
        while (el && el !== container && depth < 4) {
          el.style.opacity = String(opacity);
          el = el.parentElement;
          depth += 1;
        }
      });
    };

    fadeTiles();
    const listeners = ['tilesloaded', 'idle', 'zoom_changed', 'bounds_changed'].map(
      (event) => map.addListener(event, fadeTiles)
    );

    return () => listeners.forEach((listener) => listener.remove());
  }, [map, opacity]);

  return null;
}
