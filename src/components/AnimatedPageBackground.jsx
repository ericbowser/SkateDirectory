import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/** Cool teal / indigo / mint wireframe palette */
const LINE_COLORS = ['#5eead4', '#67e8f9', '#818cf8', '#a5b4fc', '#6ee7b7', '#7dd3fc'];

const MIN_SPEED = 0.48;
const MAX_SPEED = 1.05;

const SHAPE_DEFS = [
  { kind: 'triangle', size: 0.11, sides: 3 },
  { kind: 'square', size: 0.1, sides: 4 },
  { kind: 'pentagon', size: 0.095, sides: 5 },
  { kind: 'hexagon', size: 0.09, sides: 6 },
  { kind: 'triangle', size: 0.075, sides: 3 },
  { kind: 'square', size: 0.085, sides: 4 },
  { kind: 'hexagon', size: 0.08, sides: 6 },
  { kind: 'pentagon', size: 0.07, sides: 5 },
  { kind: 'triangle', size: 0.065, sides: 3 },
  { kind: 'square', size: 0.06, sides: 4 },
];

function buildLoopGeometry(sides, radius) {
  const points = [];
  const start = sides === 4 ? Math.PI / 4 : -Math.PI / 2;
  for (let i = 0; i < sides; i += 1) {
    const angle = start + (i / sides) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
  }
  return new THREE.BufferGeometry().setFromPoints(points);
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
  return SHAPE_DEFS.map((def, index) => {
    const vel = randomVelocity();
    return {
      ...def,
      color: LINE_COLORS[index % LINE_COLORS.length],
      x: (Math.random() - 0.5) * 1.4,
      y: (Math.random() - 0.5) * 1.0,
      vx: vel.vx,
      vy: vel.vy,
      radius: def.size * 1.15,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.08,
    };
  });
}

function WireShape({ geometry, color, meshRef }) {
  return (
    <lineLoop ref={meshRef} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.62} />
    </lineLoop>
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

  const geometries = useMemo(
    () => SHAPE_DEFS.map((def) => buildLoopGeometry(def.sides, def.size)),
    []
  );

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
      const mesh = meshRefs.current[index];
      if (!mesh) return;
      mesh.position.set(body.x, body.y, 0);
      mesh.rotation.z = body.rotation;
    });
  });

  return (
    <>
      {bodies.current.map((body, index) => (
        <WireShape
          key={`${body.kind}-${index}`}
          color={body.color}
          geometry={geometries[index]}
          meshRef={(node) => {
            meshRefs.current[index] = node;
          }}
        />
      ))}
    </>
  );
}

/**
 * Full-page ambient animation — wireframe shapes bounce and carry on.
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
