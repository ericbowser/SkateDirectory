import * as THREE from 'three';

/** Matches SkateboardMarker side-view path (viewBox 0 0 40 40). */
export const SKATEBOARD_VIEW_CENTER = { x: 20, y: 21 };

function sampleCubicBezier(p0, p1, p2, p3, steps = 14, skipFirst = false) {
  const points = [];
  const start = skipFirst ? 1 : 0;
  for (let i = start; i <= steps; i += 1) {
    const t = i / steps;
    const u = 1 - t;
    points.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return points;
}

export function buildSkateboardSvgPoints() {
  const deck = [
    ...sampleCubicBezier([4, 16], [6, 16], [7.5, 21.5], [10, 22.5]),
    [30, 22.5],
    ...sampleCubicBezier([30, 22.5], [32.5, 21.5], [34, 16], [36, 16], 14, true),
  ];

  return {
    deck,
    wheels: [
      { x: 13.5, y: 29, r: 3.6 },
      { x: 26.5, y: 29, r: 3.6 },
    ],
  };
}

function toWorld(x, y, scale, center = SKATEBOARD_VIEW_CENTER) {
  return new THREE.Vector3((x - center.x) * scale, -(y - center.y) * scale, 0);
}

export function buildSkateboardWireGeometries(scale) {
  const { deck, wheels } = buildSkateboardSvgPoints();

  const deckPoints = deck.map(([x, y]) => toWorld(x, y, scale));
  const deckCurve = new THREE.CatmullRomCurve3(deckPoints, false, 'catmullrom', 0.4);
  const deckTube = new THREE.TubeGeometry(
    deckCurve,
    Math.max(48, deckPoints.length * 2),
    scale * 1.1,
    8,
    false
  );

  const wheelGeometries = wheels.map(({ x, y, r }) => {
    const segments = 18;
    const points = [];
    for (let i = 0; i < segments; i += 1) {
      const angle = (i / segments) * Math.PI * 2;
      points.push(toWorld(x + Math.cos(angle) * r, y + Math.sin(angle) * r, scale));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  });

  return {
    deckTube,
    wheels: wheelGeometries,
    collisionRadius: 17.5 * scale,
  };
}
