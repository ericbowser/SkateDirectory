import React from 'react';

/**
 * SkateboardMarker — top-down skateboard icon used as AdvancedMarker content.
 * Deck color follows difficulty (same palette as getPinColors in config/mapLayout.js);
 * wheels/trucks stay neutral dark, same as real skateboard hardware reads against any deck graphic.
 */
const SkateboardMarker = ({ colors, size = 34, selected = false }) => {
  const { background = '#94a3b8', borderColor = '#475569' } = colors || {};

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.55))',
        transform: selected ? 'scale(1.3)' : 'scale(1)',
        transformOrigin: 'center bottom',
        transition: 'transform 0.15s ease-out',
        cursor: 'pointer',
      }}
    >
      {/* wheels */}
      <circle cx="11" cy="9" r="2.6" fill="#1e293b" stroke="#0f172a" strokeWidth="0.75" />
      <circle cx="11" cy="31" r="2.6" fill="#1e293b" stroke="#0f172a" strokeWidth="0.75" />
      <circle cx="29" cy="9" r="2.6" fill="#1e293b" stroke="#0f172a" strokeWidth="0.75" />
      <circle cx="29" cy="31" r="2.6" fill="#1e293b" stroke="#0f172a" strokeWidth="0.75" />

      {/* trucks */}
      <rect x="8.5" y="8" width="5" height="2" rx="1" fill="#334155" />
      <rect x="8.5" y="30" width="5" height="2" rx="1" fill="#334155" />
      <rect x="26.5" y="8" width="5" height="2" rx="1" fill="#334155" />
      <rect x="26.5" y="30" width="5" height="2" rx="1" fill="#334155" />

      {/* deck, colored by difficulty */}
      <rect
        x="6" y="13" width="28" height="14" rx="7"
        fill={background}
        stroke={borderColor}
        strokeWidth="1.5"
      />

      {/* griptape texture */}
      <rect x="9" y="16.5" width="22" height="7" rx="3.5" fill="#000000" opacity="0.12" />
      <line x1="12" y1="16.5" x2="12" y2="23.5" stroke="#000000" strokeOpacity="0.15" strokeWidth="0.6" />
      <line x1="16" y1="16.5" x2="16" y2="23.5" stroke="#000000" strokeOpacity="0.15" strokeWidth="0.6" />
      <line x1="24" y1="16.5" x2="24" y2="23.5" stroke="#000000" strokeOpacity="0.15" strokeWidth="0.6" />
      <line x1="28" y1="16.5" x2="28" y2="23.5" stroke="#000000" strokeOpacity="0.15" strokeWidth="0.6" />
    </svg>
  );
};

export default SkateboardMarker;
