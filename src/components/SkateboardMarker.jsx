import React from 'react';

/**
 * High-contrast pins: solid black deck + white halo (no badge circles).
 */
export const SKATE_MARKER_COLORS = {
  background: '#0a0a0a',
  borderColor: '#ffffff',
  glyphColor: '#0a0a0a',
  wheel: '#0a0a0a',
  wheelRim: '#ffffff',
  halo: '#ffffff',
};

const DECK_PATH =
  'M4 16 C6 16 7.5 21.5 10 22.5 L30 22.5 C32.5 21.5 34 16 36 16';

/**
 * Side-view skateboard: filled black kicktail deck + two wheels.
 */
function SkateboardGlyph({
  background,
  borderColor,
  wheel,
  wheelRim,
  halo = '#ffffff',
}) {
  return (
    <>
      {/* White halo so the black deck pops on pastel tiles */}
      <path
        d={DECK_PATH}
        fill="none"
        stroke={halo}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Solid black deck */}
      <path
        d={DECK_PATH}
        fill="none"
        stroke={background}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Wheels */}
      <circle cx="13.5" cy="29" r="4" fill={halo} />
      <circle cx="26.5" cy="29" r="4" fill={halo} />
      <circle cx="13.5" cy="29" r="3.2" fill={wheel} stroke={wheelRim} strokeWidth="1.2" />
      <circle cx="26.5" cy="29" r="3.2" fill={wheel} stroke={wheelRim} strokeWidth="1.2" />
      <circle cx="13.5" cy="29" r="1" fill={wheelRim} />
      <circle cx="26.5" cy="29" r="1" fill={wheelRim} />
    </>
  );
}

/**
 * Build an SVG data-URL icon for classic google.maps.Marker.
 */
export function buildSkateboardIconUrl(
  colors = SKATE_MARKER_COLORS,
  { size = 40, selected = false } = {}
) {
  const background = colors.background || SKATE_MARKER_COLORS.background;
  const wheel = colors.wheel || SKATE_MARKER_COLORS.wheel;
  const wheelRim = colors.wheelRim || SKATE_MARKER_COLORS.wheelRim;
  const halo = colors.halo || SKATE_MARKER_COLORS.halo;
  const scale = selected ? 1.25 : 1;
  const dim = Math.round(size * scale);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${dim}" height="${dim}" viewBox="0 0 40 40">
  <path d="${DECK_PATH}" fill="none" stroke="${halo}" stroke-width="8"
        stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${DECK_PATH}" fill="none" stroke="${background}" stroke-width="5"
        stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="13.5" cy="29" r="4" fill="${halo}"/>
  <circle cx="26.5" cy="29" r="4" fill="${halo}"/>
  <circle cx="13.5" cy="29" r="3.2" fill="${wheel}" stroke="${wheelRim}" stroke-width="1.2"/>
  <circle cx="26.5" cy="29" r="3.2" fill="${wheel}" stroke="${wheelRim}" stroke-width="1.2"/>
  <circle cx="13.5" cy="29" r="1" fill="${wheelRim}"/>
  <circle cx="26.5" cy="29" r="1" fill="${wheelRim}"/>
</svg>`.trim();

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: dim, height: dim },
    anchor: { x: dim / 2, y: dim / 2 },
  };
}

/**
 * SkateboardMarker — for AdvancedMarker content.
 */
const SkateboardMarker = ({ colors = SKATE_MARKER_COLORS, size = 36, selected = false }) => {
  const background = colors.background || SKATE_MARKER_COLORS.background;
  const borderColor = colors.borderColor || SKATE_MARKER_COLORS.borderColor;
  const wheel = colors.wheel || SKATE_MARKER_COLORS.wheel;
  const wheelRim = colors.wheelRim || SKATE_MARKER_COLORS.wheelRim;
  const halo = colors.halo || SKATE_MARKER_COLORS.halo;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{
        filter:
          'drop-shadow(0 0 2px rgba(255,255,255,1)) drop-shadow(0 2px 5px rgba(0,0,0,0.55))',
        transform: selected ? 'scale(1.3)' : 'scale(1)',
        transformOrigin: 'center bottom',
        transition: 'transform 0.15s ease-out',
        cursor: 'pointer',
      }}
    >
      <SkateboardGlyph
        background={background}
        borderColor={borderColor}
        wheel={wheel}
        wheelRim={wheelRim}
        halo={halo}
      />
    </svg>
  );
};

export default SkateboardMarker;
