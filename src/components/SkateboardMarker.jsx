import React from 'react';

/** High-contrast defaults for dark map backgrounds */
export const SKATE_MARKER_COLORS = {
  background: '#e11d48',
  borderColor: '#fecdd3',
  glyphColor: '#fff1f2',
};

/**
 * Build an SVG data-URL icon for classic google.maps.Marker.
 * Red deck + white wheels for visibility on night map styles.
 */
export function buildSkateboardIconUrl(colors = SKATE_MARKER_COLORS, { size = 40, selected = false } = {}) {
  const background = colors.background || SKATE_MARKER_COLORS.background;
  const borderColor = colors.borderColor || SKATE_MARKER_COLORS.borderColor;
  const scale = selected ? 1.25 : 1;
  const dim = Math.round(size * scale);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${dim}" height="${dim}" viewBox="0 0 40 40">
  <circle cx="11" cy="9" r="2.8" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
  <circle cx="11" cy="31" r="2.8" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
  <circle cx="29" cy="9" r="2.8" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
  <circle cx="29" cy="31" r="2.8" fill="#ffffff" stroke="#e2e8f0" stroke-width="0.8"/>
  <rect x="8.5" y="8" width="5" height="2" rx="1" fill="#f8fafc"/>
  <rect x="8.5" y="30" width="5" height="2" rx="1" fill="#f8fafc"/>
  <rect x="26.5" y="8" width="5" height="2" rx="1" fill="#f8fafc"/>
  <rect x="26.5" y="30" width="5" height="2" rx="1" fill="#f8fafc"/>
  <rect x="6" y="13" width="28" height="14" rx="7" fill="${background}" stroke="${borderColor}" stroke-width="1.75"/>
  <rect x="9" y="16.5" width="22" height="7" rx="3.5" fill="#000000" opacity="0.18"/>
</svg>`.trim();

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: dim, height: dim },
    anchor: { x: dim / 2, y: dim / 2 },
  };
}

/**
 * SkateboardMarker — top-down skateboard for AdvancedMarker content.
 * Red deck + white wheels for dark map backgrounds.
 */
const SkateboardMarker = ({ colors = SKATE_MARKER_COLORS, size = 34, selected = false }) => {
  const background = colors.background || SKATE_MARKER_COLORS.background;
  const borderColor = colors.borderColor || SKATE_MARKER_COLORS.borderColor;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.75))',
        transform: selected ? 'scale(1.3)' : 'scale(1)',
        transformOrigin: 'center bottom',
        transition: 'transform 0.15s ease-out',
        cursor: 'pointer',
      }}
    >
      {/* white wheels */}
      <circle cx="11" cy="9" r="2.8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
      <circle cx="11" cy="31" r="2.8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
      <circle cx="29" cy="9" r="2.8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
      <circle cx="29" cy="31" r="2.8" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />

      {/* light trucks */}
      <rect x="8.5" y="8" width="5" height="2" rx="1" fill="#f8fafc" />
      <rect x="8.5" y="30" width="5" height="2" rx="1" fill="#f8fafc" />
      <rect x="26.5" y="8" width="5" height="2" rx="1" fill="#f8fafc" />
      <rect x="26.5" y="30" width="5" height="2" rx="1" fill="#f8fafc" />

      {/* red deck */}
      <rect
        x="6" y="13" width="28" height="14" rx="7"
        fill={background}
        stroke={borderColor}
        strokeWidth="1.75"
      />

      <rect x="9" y="16.5" width="22" height="7" rx="3.5" fill="#000000" opacity="0.18" />
    </svg>
  );
};

export default SkateboardMarker;
