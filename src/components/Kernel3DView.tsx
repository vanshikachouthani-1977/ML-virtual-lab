import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Point } from '../types';
import { Rotate3d, Play, Pause, RefreshCw, ZoomIn, ZoomOut, Layers } from 'lucide-react';

interface Kernel3DViewProps {
  points: Point[];
  kernelType: 'rbf' | 'polynomial' | 'linear';
}

type MappingType = 'paraboloid' | 'gaussian' | 'saddle';

export default function Kernel3DView({ points: initialPoints }: Kernel3DViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D camera state
  const [rotation, setRotation] = useState({ pitch: 0.55, yaw: -0.65 });
  const [zoom, setZoom] = useState(1.1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [isAutoRotating, setIsAutoRotating] = useState(false);

  // Surface and hyperplane state
  const [mapping, setMapping] = useState<MappingType>('paraboloid');
  const [sliceZ, setSliceZ] = useState(1.2);
  const [showSurface, setShowSurface] = useState(true);
  const [showPlane, setShowPlane] = useState(true);

  // If points are empty or too few, generate default concentric circle demo points
  const points = React.useMemo(() => {
    if (initialPoints && initialPoints.length >= 4) {
      return initialPoints;
    }
    // Default concentric circle demo points
    const demo: Point[] = [];
    // Inner ring (Class +1)
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * 2 * Math.PI;
      const r = 0.8 + (Math.sin(i * 3) * 0.15);
      demo.push({ x: r * Math.cos(a), y: r * Math.sin(a), label: 1 });
    }
    // Outer ring (Class -1)
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * 2 * Math.PI;
      const r = 2.4 + (Math.cos(i * 2) * 0.2);
      demo.push({ x: r * Math.cos(a), y: r * Math.sin(a), label: -1 });
    }
    return demo;
  }, [initialPoints]);

  // Compute 3D coordinate (x, y, z) based on chosen kernel mapping
  const computeZ = useCallback((x: number, y: number, map: MappingType): number => {
    const r2 = x * x + y * y;
    if (map === 'paraboloid') {
      // Paraboloid bowl: z = (x^2 + y^2) * 0.35
      return r2 * 0.35;
    }
    if (map === 'gaussian') {
      // Gaussian RBF inverted cone: z = 3.5 * exp(-0.35 * r2)
      return 3.2 * Math.exp(-0.35 * r2);
    }
    // XOR Saddle (hyperbolic paraboloid): z = 0.4 * x * y + 1.5
    return 0.45 * (x * y) + 1.5;
  }, []);

  // Project 3D coordinate to 2D screen coordinate
  const project = useCallback(
    (x: number, y: number, z: number, width: number, height: number): [number, number, number] => {
      // Center the vertical bounding box around origin for natural rotation
      const zCenter = 1.5;
      const zRel = z - zCenter;

      // 1. Yaw rotation around Y axis
      const cosY = Math.cos(rotation.yaw);
      const sinY = Math.sin(rotation.yaw);
      const x1 = x * cosY + zRel * sinY;
      const y1 = y;
      const z1 = -x * sinY + zRel * cosY;

      // 2. Pitch rotation around X axis
      const cosP = Math.cos(rotation.pitch);
      const sinP = Math.sin(rotation.pitch);
      const x2 = x1;
      const y2 = y1 * cosP - z1 * sinP;
      const z2 = y1 * sinP + z1 * cosP;

      // 3. Perspective Camera Projection
      const cameraDist = 13;
      const persp = cameraDist / (cameraDist + z2);

      // Base scaling factor to comfortably fit into 480px height
      const baseScale = 36 * zoom;
      const screenX = width / 2 + x2 * persp * baseScale;
      const screenY = height / 2 - y2 * persp * baseScale;

      return [screenX, screenY, z2];
    },
    [rotation, zoom]
  );

  // Main Render Loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, width, height);

    // ─── 1. Base Grid Plane (z = 0) ──────────────────────────────────────────
    const bound = 3.2;
    const step = 0.8;
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
    ctx.lineWidth = 1;

    for (let g = -bound; g <= bound + 0.01; g += step) {
      // Lines parallel to X
      const [x1, y1] = project(-bound, g, 0, width, height);
      const [x2, y2] = project(bound, g, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Lines parallel to Y
      const [x3, y3] = project(g, -bound, 0, width, height);
      const [x4, y4] = project(g, bound, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.stroke();
    }

    // ─── 2. 3D Coordinate Axes ───────────────────────────────────────────────
    const [origX, origY] = project(0, 0, 0, width, height);
    const [axisXx, axisXy] = project(3.8, 0, 0, width, height);
    const [axisYx, axisYy] = project(0, 3.8, 0, width, height);
    const [axisZx, axisZy] = project(0, 0, 3.8, width, height);

    // X1 Axis (Cyan)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(origX, origY);
    ctx.lineTo(axisXx, axisXy);
    ctx.stroke();
    ctx.fillStyle = '#06b6d4';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('x₁', axisXx + 6, axisXy);

    // X2 Axis (Indigo)
    ctx.strokeStyle = '#818cf8';
    ctx.beginPath();
    ctx.moveTo(origX, origY);
    ctx.lineTo(axisYx, axisYy);
    ctx.stroke();
    ctx.fillStyle = '#818cf8';
    ctx.fillText('x₂', axisYx + 6, axisYy);

    // Z / Feature Axis (Emerald)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(origX, origY);
    ctx.lineTo(axisZx, axisZy);
    ctx.stroke();
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    const zLabel =
      mapping === 'paraboloid'
        ? 'Φ(x) = x₁² + x₂²'
        : mapping === 'gaussian'
        ? 'Φ(x) = exp(-γ||x||²)'
        : 'Φ(x) = x₁ · x₂';
    ctx.fillText(zLabel, axisZx + 8, axisZy - 6);

    // ─── 3. 3D Paraboloid / Kernel Surface Wireframe ─────────────────────────
    if (showSurface) {
      const surfaceRes = 14;
      const sStep = (bound * 2) / surfaceRes;

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.16)';
      ctx.lineWidth = 1;

      // Latitude lines (curves along x)
      for (let iy = 0; iy <= surfaceRes; iy++) {
        const sy = -bound + iy * sStep;
        ctx.beginPath();
        for (let ix = 0; ix <= surfaceRes; ix++) {
          const sx = -bound + ix * sStep;
          const sz = computeZ(sx, sy, mapping);
          const [px, py] = project(sx, sy, sz, width, height);
          if (ix === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Longitude lines (curves along y)
      for (let ix = 0; ix <= surfaceRes; ix++) {
        const sx = -bound + ix * sStep;
        ctx.beginPath();
        for (let iy = 0; iy <= surfaceRes; iy++) {
          const sy = -bound + iy * sStep;
          const sz = computeZ(sx, sy, mapping);
          const [px, py] = project(sx, sy, sz, width, height);
          if (iy === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }

    // ─── 4. Slicing Separating Hyperplane in 3D (z = sliceZ) ─────────────────
    if (showPlane) {
      const pSize = 3.4;
      const [p1x, p1y] = project(-pSize, -pSize, sliceZ, width, height);
      const [p2x, p2y] = project(pSize, -pSize, sliceZ, width, height);
      const [p3x, p3y] = project(pSize, pSize, sliceZ, width, height);
      const [p4x, p4y] = project(-pSize, pSize, sliceZ, width, height);

      // Translucent cutting plane
      ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.lineTo(p3x, p3y);
      ctx.lineTo(p4x, p4y);
      ctx.closePath();
      ctx.fill();

      // Border of cutting plane
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label on the plane
      ctx.fillStyle = '#10b981';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`Separating Hyperplane (z = ${sliceZ.toFixed(1)})`, p2x - 130, p2y - 6);
    }

    // ─── 5. Project and Draw Data Points in 3D ───────────────────────────────
    const projected = points.map((p, idx) => {
      const zVal = computeZ(p.x, p.y, mapping);
      const [sx, sy, depth] = project(p.x, p.y, zVal, width, height);
      const [baseSx, baseSy] = project(p.x, p.y, 0, width, height);
      return { p, zVal, sx, sy, depth, baseSx, baseSy, idx };
    });

    // Painter's algorithm: draw points furthest from camera first
    projected.sort((a, b) => b.depth - a.depth);

    for (const pt of projected) {
      // Vertical dropline to base grid
      ctx.strokeStyle = pt.p.label === 1 ? 'rgba(99, 102, 241, 0.28)' : 'rgba(244, 63, 94, 0.28)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(pt.baseSx, pt.baseSy);
      ctx.lineTo(pt.sx, pt.sy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Base footprint shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(pt.baseSx, pt.baseSy, 3, 0, Math.PI * 2);
      ctx.fill();

      // Determine if point is above or below cutting plane
      const isAbove = pt.zVal >= sliceZ;
      const radius = 5.5;

      // Glow halo
      const grad = ctx.createRadialGradient(pt.sx, pt.sy, 0, pt.sx, pt.sy, 15);
      grad.addColorStop(0, pt.p.label === 1 ? 'rgba(99, 102, 241, 0.7)' : 'rgba(244, 63, 94, 0.7)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pt.sx, pt.sy, 15, 0, Math.PI * 2);
      ctx.fill();

      // Main point
      ctx.fillStyle = pt.p.label === 1 ? '#6366f1' : '#f43f5e';
      ctx.beginPath();
      ctx.arc(pt.sx, pt.sy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Border: Green highlight if correctly on its side of the plane
      ctx.strokeStyle = isAbove ? '#10b981' : '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [points, computeZ, project, mapping, sliceZ, showSurface, showPlane]);

  // Keep canvas sized and render
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0) {
        canvas.width = Math.floor(rect.width);
        canvas.height = 480;
        render();
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [render]);

  // Auto-rotation animation loop
  useEffect(() => {
    if (!isAutoRotating) return;
    let animId: number;
    const animate = () => {
      setRotation((r) => ({
        ...r,
        yaw: r.yaw + 0.008,
      }));
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isAutoRotating]);

  // Interactive mouse dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    setRotation((r) => ({
      yaw: r.yaw + dx * 0.008,
      pitch: Math.max(-1.4, Math.min(1.4, r.pitch + dy * 0.008)),
    }));
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.6, Math.min(2.5, z - e.deltaY * 0.0015)));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ─── 3D Control Bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-canvas-card border border-border">
        {/* Mapping Selector */}
        <div className="flex items-center gap-2">
          <Rotate3d className="w-4 h-4 text-accent-indigo shrink-0" />
          <span className="text-xs font-bold text-txt-primary">Feature Mapping:</span>
          <div className="flex rounded-lg overflow-hidden border border-border text-xs">
            <button
              onClick={() => {
                setMapping('paraboloid');
                setSliceZ(1.2);
              }}
              className={`px-3 py-1 font-semibold transition-colors ${
                mapping === 'paraboloid' ? 'bg-accent-indigo text-white' : 'bg-canvas-primary text-txt-secondary'
              }`}
            >
              Φ = x₁² + x₂²
            </button>
            <button
              onClick={() => {
                setMapping('gaussian');
                setSliceZ(1.8);
              }}
              className={`px-3 py-1 font-semibold transition-colors ${
                mapping === 'gaussian' ? 'bg-accent-indigo text-white' : 'bg-canvas-primary text-txt-secondary'
              }`}
            >
              Φ = Gaussian RBF
            </button>
            <button
              onClick={() => {
                setMapping('saddle');
                setSliceZ(1.5);
              }}
              className={`px-3 py-1 font-semibold transition-colors ${
                mapping === 'saddle' ? 'bg-accent-indigo text-white' : 'bg-canvas-primary text-txt-secondary'
              }`}
            >
              Φ = x₁ · x₂
            </button>
          </div>
        </div>

        {/* Hyperplane Slice Slider & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-txt-muted font-mono font-semibold">Slice Z:</span>
            <input
              type="range"
              min={0.2}
              max={3.0}
              step={0.05}
              value={sliceZ}
              onChange={(e) => setSliceZ(parseFloat(e.target.value))}
              className="w-28 input-range"
            />
            <span className="text-[11px] font-mono text-accent-emerald font-bold w-8">
              {sliceZ.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-1 border-l border-border pl-2">
            <button
              onClick={() => setIsAutoRotating((r) => !r)}
              className={`btn-ghost py-1 px-2 text-xs flex items-center gap-1 ${
                isAutoRotating ? 'text-accent-indigo bg-accent-indigo/15' : ''
              }`}
              title="Toggle Auto-Rotate"
            >
              {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Spin</span>
            </button>
            <button
              onClick={() => {
                setRotation({ pitch: 0.55, yaw: -0.65 });
                setZoom(1.1);
              }}
              className="btn-ghost py-1 px-2 text-xs"
              title="Reset View"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
              className="btn-ghost py-1 px-2 text-xs"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
              className="btn-ghost py-1 px-2 text-xs"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 3D Canvas Container ────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="sim-canvas relative overflow-hidden select-none"
        style={{ height: '480px', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />

        {/* Intuition Callout Card */}
        <div className="absolute top-3 left-3 bg-canvas-primary/85 backdrop-blur-md border border-border rounded-xl p-3 max-w-xs text-xs text-txt-secondary leading-relaxed shadow-card pointer-events-none">
          <p className="font-bold text-txt-primary mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-accent-indigo" />
            The Kernel Trick Visualized in 3D:
          </p>
          Data that cannot be separated in 2D (like concentric rings) is elevated into a 3rd dimension Φ(x).
          In this 3D space, a simple <strong className="text-accent-emerald">flat green plane</strong> cleanly separates the two classes!
          <p className="text-[10px] text-txt-muted mt-1.5 italic">
            Drag mouse to rotate • Scroll to zoom • Use &quot;Slice Z&quot; to adjust the cutting plane.
          </p>
        </div>

        {/* Surface and Plane Toggle Overlays */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-canvas-primary/80 backdrop-blur-sm p-1.5 rounded-lg border border-border text-[11px]">
          <button
            onClick={() => setShowSurface((s) => !s)}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              showSurface ? 'bg-accent-cyan/20 text-accent-cyan' : 'text-txt-muted'
            }`}
          >
            Surface Mesh
          </button>
          <button
            onClick={() => setShowPlane((p) => !p)}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              showPlane ? 'bg-accent-emerald/20 text-accent-emerald' : 'text-txt-muted'
            }`}
          >
            Cutting Plane
          </button>
        </div>
      </div>
    </div>
  );
}
