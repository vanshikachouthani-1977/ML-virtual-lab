// ─── Dataset Presets ─────────────────────────────────────────────────────────
// Generate various 2D datasets for SVM experimentation.

import type { Point, DatasetPreset } from '../types';

/** Random number in range */
function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** Normal distribution via Box-Muller */
function randn(mean: number = 0, std: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/** Linearly separable two-class dataset */
export function generateLinear(): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < 25; i++) {
    points.push({ x: randn(-2, 0.6), y: randn(1.5, 0.7), label: 1 });
    points.push({ x: randn(2, 0.6), y: randn(-1.5, 0.7), label: -1 });
  }
  return points;
}

/** Overlapping / noisy two-class dataset */
export function generateOverlapping(): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < 30; i++) {
    points.push({ x: randn(-0.8, 1.0), y: randn(0.8, 1.0), label: 1 });
    points.push({ x: randn(0.8, 1.0), y: randn(-0.8, 1.0), label: -1 });
  }
  return points;
}

/** Concentric circles (inner vs outer ring) */
export function generateCircles(): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < 30; i++) {
    const angle1 = rand(0, 2 * Math.PI);
    const r1 = randn(0.8, 0.15);
    points.push({
      x: r1 * Math.cos(angle1),
      y: r1 * Math.sin(angle1),
      label: 1,
    });

    const angle2 = rand(0, 2 * Math.PI);
    const r2 = randn(2.5, 0.25);
    points.push({
      x: r2 * Math.cos(angle2),
      y: r2 * Math.sin(angle2),
      label: -1,
    });
  }
  return points;
}

/** XOR pattern */
export function generateXOR(): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < 20; i++) {
    points.push({ x: randn(-1.8, 0.45), y: randn(-1.8, 0.45), label: 1 });
    points.push({ x: randn(1.8, 0.45), y: randn(1.8, 0.45), label: 1 });
    points.push({ x: randn(-1.8, 0.45), y: randn(1.8, 0.45), label: -1 });
    points.push({ x: randn(1.8, 0.45), y: randn(-1.8, 0.45), label: -1 });
  }
  return points;
}

/** Two moons (half-circle arcs) */
export function generateMoons(): Point[] {
  const points: Point[] = [];
  const n = 40;
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * i) / n;
    points.push({
      x: Math.cos(angle) + randn(0, 0.1),
      y: Math.sin(angle) + randn(0, 0.1),
      label: 1,
    });
    points.push({
      x: 1 - Math.cos(angle) + randn(0, 0.1),
      y: 1 - Math.sin(angle) - 0.5 + randn(0, 0.1),
      label: -1,
    });
  }
  return points;
}

/** Spiral dataset */
export function generateSpiral(): Point[] {
  const points: Point[] = [];
  const n = 50;
  for (let i = 0; i < n; i++) {
    const t = (i / n) * 2 * Math.PI + rand(-0.15, 0.15);
    const r = 0.3 + (i / n) * 2.5;
    points.push({
      x: r * Math.cos(t) + randn(0, 0.12),
      y: r * Math.sin(t) + randn(0, 0.12),
      label: 1,
    });
    points.push({
      x: -r * Math.cos(t) + randn(0, 0.12),
      y: -r * Math.sin(t) + randn(0, 0.12),
      label: -1,
    });
  }
  return points;
}

/** Simple diagonal split */
export function generateDiagonal(): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < 25; i++) {
    const x = rand(-3, 3);
    const y = rand(-3, 3);
    points.push({ x, y, label: x + y > 0.5 ? 1 : -1 });
  }
  return points;
}

/** Clustered dataset (3 clusters per class) */
export function generateClustered(): Point[] {
  const points: Point[] = [];
  const centers1 = [
    [-2, 2],
    [0, -2],
    [2, 1],
  ];
  const centers2 = [
    [-2, -1],
    [1, -2],
    [2, 2.5],
  ];

  for (const [cx, cy] of centers1) {
    for (let i = 0; i < 8; i++) {
      points.push({ x: randn(cx, 0.4), y: randn(cy, 0.4), label: 1 });
    }
  }
  for (const [cx, cy] of centers2) {
    for (let i = 0; i < 8; i++) {
      points.push({ x: randn(cx, 0.4), y: randn(cy, 0.4), label: -1 });
    }
  }
  return points;
}

// ─── Clean Preset Collection ──────────────────────────────────────────────────

export const DATASET_PRESETS: DatasetPreset[] = [
  { name: 'Linearly Separable', iconName: 'Compass', generate: generateLinear },
  { name: 'Overlapping Noise', iconName: 'Layers', generate: generateOverlapping },
  { name: 'Concentric Rings', iconName: 'Target', generate: generateCircles },
  { name: 'XOR Distribution', iconName: 'Grid', generate: generateXOR },
  { name: 'Interlocking Moons', iconName: 'Moon', generate: generateMoons },
  { name: 'Spiral Manifold', iconName: 'RotateCw', generate: generateSpiral },
  { name: 'Diagonal Boundary', iconName: 'TrendingUp', generate: generateDiagonal },
  { name: 'Multi-Cluster', iconName: 'Boxes', generate: generateClustered },
];
