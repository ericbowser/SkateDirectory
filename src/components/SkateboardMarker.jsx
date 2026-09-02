import React from 'react';

/**
 * High-contrast pins for the light-blue map overlay:
 * white deck + amber wheels on dark navy page background.
 */
export const SKATE_MARKER_COLORS = {
  background: '#ffffff',
  borderColor: '#0f172a',
  glyphColor: '#0f172a',
  wheel: '#fbbf24',
  wheelRim: '#fef3c7',
};

/**
 * Side-view skateboard: kicktail deck + two wheels underneath.
 */
function SkateboardGlyph({ background, borderColor, wheel, wheelRim }) {
  return (
    <>
      {/* Dark understroke — keeps the deck readable on amber highways too */}
      <path
        d="M4 16
           C6 16 7.5 21.5 10 22.5
           L30 22.5
           C32.5 21.5 34 16 36 16"
        fill="none"
        stroke={borderColor}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bright deck */}
      <path
        d="M4 16
           C6 16 7.5 21.5 10 22.5
           L30 22.5
           C32.5 21.5 34 16 36 16"
        fill="none"
        stroke={background}
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Wheels */}
      <circle cx="13.5" cy="29" r="3.6" fill={wheel} stroke={wheelRim} strokeWidth="1.1" />
      <circle cx="26.5" cy="29" r="3.6" fill={wheel} stroke={wheelRim} strokeWidth="1.1" />
      <circle cx="13.5" cy="29" r="1" fill={wheelRim} />
      <circle cx="26.5" cy="29" r="1" fill={wheelRim} />
    </>
  );
}

/**
 * Build an SVG data-URL icon for classic google.maps.Marker.
 */
export function buildSkateboardIconUrl(colors = SKATE_MARKER_COLORS, { size = 32, selected = false } = {}) {
  const background = colors.background || SKATE_MARKER_COLORS.background;
  const borderColor = colors.borderColor || SKATE_MARKER_COLORS.borderColor;
  const wheel = colors.wheel || SKATE_MARKER_COLORS.wheel;
  const wheelRim = colors.wheelRim || SKATE_MARKER_COLORS.wheelRim;
  const scale = selected ? 1.25 : 1;
  const dim = Math.round(size * scale);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${dim}" height="${dim}" viewBox="0 0 40 40">
  <path d="M4 16 C6 16 7.5 21.5 10 22.5 L30 22.5 C32.5 21.5 34 16 36 16"
        fill="none" stroke="${borderColor}" stroke-width="5"
        stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4 16 C6 16 7.5 21.5 10 22.5 L30 22.5 C32.5 21.5 34 16 36 16"
        fill="none" stroke="${background}" stroke-width="3.1"
        stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="13.5" cy="29" r="3.6" fill="${wheel}" stroke="${wheelRim}" stroke-width="1.1"/>
  <circle cx="26.5" cy="29" r="3.6" fill="${wheel}" stroke="${wheelRim}" stroke-width="1.1"/>
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
const SkateboardMarker = ({ colors = SKATE_MARKER_COLORS, size = 28, selected = false }) => {
  const background = colors.background || SKATE_MARKER_COLORS.background;
  const borderColor = colors.borderColor || SKATE_MARKER_COLORS.borderColor;
  const wheel = colors.wheel || SKATE_MARKER_COLORS.wheel;
  const wheelRim = colors.wheelRim || SKATE_MARKER_COLORS.wheelRim;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{
        filter:
          'drop-shadow(0 0 2px rgba(15, 23, 42, 0.95)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.9))',
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
      />
    </svg>
  );
};

export default SkateboardMarker;
