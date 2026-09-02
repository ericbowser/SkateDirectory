import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { buildSkateboardWireGeometries } from '../utils/skateboardShape';

/** Amber + slate palette — visible on navy bg, complements light-blue map */
const LINE_COLORS = [
  '#fbbf24', // amber-400
  '#94a3b8', // slate-400
  '#fcd34d', // amber-300
  '#cbd5e1', // slate-300
  '#f59e0b', // amber-500
  '#64748b', // slate-500
  '#fde68a', // amber-200
  '#7dd3fc', // sky-300
  '#d97706', // amber-600
  '#e2e8f0', // slate-200
];

const MIN_SPEED = 0.48;
const MAX_SPEED = 1.05;

const SKATEBOARD_DEFS = [
  { scale: 0.005 },
  { scale: 0.0047 },
  { scale: 0.0044 },
  { scale: 0.0041 },
  { scale: 0.0039 },
  { scale: 0.0037 },
  { scale: 0.0035 },
  { scale: 0.0033 },
  { scale: 0.0031 },
  { scale: 0.0029 },
];

function randomWheelColor() {
  const hue = 180 + Math.floor(Math.random() * 80);
  return `hsl(${hue}, 72%, 62%)`;
}

function randomVelocity() {
  const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
  const angle = Math.random() * Math.PI * 2;
  return {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };
}

function clampSpeed(body) {
  const speed = Math.hypot(body.vx, body.vy);
  if (speed < 1e-5) {
    const next = randomVelocity();
    body.vx = next.vx;
    body.vy = next.vy;
    return;
  }
  if (speed < MIN_SPEED) {
    const scale = MIN_SPEED / speed;
    body.vx *= scale;
    body.vy *= scale;
  } else if (speed > MAX_SPEED) {
    const scale = MAX_SPEED / speed;
    body.vx *= scale;
    body.vy *= scale;
  }
}

function resolveCircleCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const minDist = a.radius + b.radius;
  if (dist >= minDist || dist < 1e-6) return;

  const nx = dx / dist;
  const ny = dy / dist;
  const overlap = minDist - dist;
  a.x -= nx * overlap * 0.5;
  a.y -= ny * overlap * 0.5;
  b.x += nx * overlap * 0.5;
  b.y += ny * overlap * 0.5;

  const relVelNormal = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
  if (relVelNormal > 0) return;

  a.vx -= relVelNormal * nx;
  a.vy -= relVelNormal * ny;
  b.vx += relVelNormal * nx;
  b.vy += relVelNormal * ny;

  clampSpeed(a);
  clampSpeed(b);
}

function createBodies() {
  return SKATEBOARD_DEFS.map((def, index) => {
    const vel = randomVelocity();
    const { collisionRadius } = buildSkateboardWireGeometries(def.scale);
    return {
      scale: def.scale,
      color: LINE_COLORS[index % LINE_COLORS.length],
      wheelColor: randomWheelColor(),
      x: (Math.random() - 0.5) * 1.4,
      y: (Math.random() - 0.5) * 1.0,
      vx: vel.vx,
      vy: vel.vy,
      radius: collisionRadius * 1.05,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.08,
    };
  });
}

function SkateboardWire({ geometries, color, wheelColor, groupRef }) {
  return (
    <group ref={groupRef}>
      <mesh geometry={geometries.deckTube}>
        <meshBasicMaterial color={color} transparent opacity={0.32} />
      </mesh>
      {geometries.wheels.map((wheelGeometry, index) => (
        <lineLoop key={`wheel-${index}`} geometry={wheelGeometry}>
          <lineBasicMaterial color={wheelColor} transparent opacity={0.62} />
        </lineLoop>
      ))}
    </group>
  );
}

function BouncingWireframeScene() {
  const bodies = useRef(createBodies());
  const meshRefs = useRef([]);
  const bounds = useRef({ x: 1.6, y: 1 });
  const { camera, size } = useThree();

  useEffect(() => {
    if (!camera.isOrthographicCamera) return;
    const aspect = size.width / Math.max(size.height, 1);
    const margin = 0.08;
    camera.left = -aspect + margin;
    camera.right = aspect - margin;
    camera.top = 1 - margin;
    camera.bottom = -1 + margin;
    camera.updateProjectionMatrix();
    bounds.current = { x: aspect - margin - 0.02, y: 1 - margin - 0.02 };
  }, [camera, size]);

  const geometryByScale = useMemo(() => {
    const scales = [...new Set(SKATEBOARD_DEFS.map((def) => def.scale))];
    return Object.fromEntries(
      scales.map((scale) => [scale, buildSkateboardWireGeometries(scale)])
    );
  }, []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.032);
    const { x: bx, y: by } = bounds.current;
    const list = bodies.current;

    for (const body of list) {
      body.x += body.vx * dt;
      body.y += body.vy * dt;
      body.rotation += body.spin * dt;

      if (body.x + body.radius > bx) {
        body.x = bx - body.radius;
        body.vx = -Math.abs(body.vx);
      } else if (body.x - body.radius < -bx) {
        body.x = -bx + body.radius;
        body.vx = Math.abs(body.vx);
      }

      if (body.y + body.radius > by) {
        body.y = by - body.radius;
        body.vy = -Math.abs(body.vy);
      } else if (body.y - body.radius < -by) {
        body.y = -by + body.radius;
        body.vy = Math.abs(body.vy);
      }

      clampSpeed(body);
    }

    for (let i = 0; i < list.length; i += 1) {
      for (let j = i + 1; j < list.length; j += 1) {
        resolveCircleCollision(list[i], list[j]);
      }
    }

    list.forEach((body, index) => {
      const group = meshRefs.current[index];
      if (!group) return;
      group.position.set(body.x, body.y, 0);
      group.rotation.z = body.rotation;
    });
  });

  return (
    <>
      {bodies.current.map((body, index) => (
        <SkateboardWire
          key={`skate-${index}`}
          color={body.color}
          wheelColor={body.wheelColor}
          geometries={geometryByScale[body.scale]}
          groupRef={(node) => {
            meshRefs.current[index] = node;
          }}
        />
      ))}
    </>
  );
}

/**
 * Full-page ambient animation — wireframe skateboards bounce around.
 */
export default function AnimatedPageBackground() {
  return (
    <div className="page-ambient-root" aria-hidden="true">
      <div className="page-ambient-fallback" />
      <Canvas
        className="page-ambient-canvas"
        style={{ background: 'transparent' }}
        orthographic
        camera={{ position: [0, 0, 10], zoom: 1, near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <BouncingWireframeScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
