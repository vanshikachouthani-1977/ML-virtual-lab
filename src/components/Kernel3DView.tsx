import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Point } from '../types';
import { Rotate3d, Eye } from 'lucide-react';

interface Kernel3DViewProps {
  points: Point[];
  kernelType: 'rbf' | 'polynomial' | 'linear';
}

export default function Kernel3DView({ points, kernelType }: Kernel3DViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ pitch: 0.5, yaw: -0.6 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [featureMapping, setFeatureMapping] = useState<'paraboloid' | 'gaussian'>('paraboloid');
  const [sliceHeight, setSliceHeight] = useState(2.0);

  // Compute 3D coordinate for a 2D point based on mapping
  const mapTo3D = useCallback((p: Point): [number, number, number] => {
    const x = p.x;
    const y = p.y;
    let z = 0;
    if (featureMapping === 'paraboloid') {
      // z = (x^2 + y^2) * 0.25 (scaled for viewing)
      z = (x * x + y * y) * 0.25;
    } else {
      // Gaussian RBF bump: z = 3 * exp(-0.3 * (x^2 + y^2))
      z = 3.5 * Math.exp(-0.25 * (x * x + y * y));
    }
    return [x, y, z];
  }, [featureMapping]);

  // Project 3D to 2D screen coordinates
  const project = useCallback((x: number, y: number, z: number, width: number, height: number): [number, number, number] => {
    // Center z around origin for rotation
    const cz = z - 2;

    // Rotate around Y axis (yaw)
    const cosY = Math.cos(rotation.yaw);
    const sinY = Math.sin(rotation.yaw);
    const x1 = x * cosY + cz * sinY;
    const y1 = y;
    const z1 = -x * sinY + cz * cosY;

    // Rotate around X axis (pitch)
    const cosP = Math.cos(rotation.pitch);
    const sinP = Math.sin(rotation.pitch);
    const x2 = x1;
    const y2 = y1 * cosP - z1 * sinP;
    const z2 = y1 * sinP + z1 * cosP;

    // Perspective projection
    const fov = 450;
    const cameraDist = 10;
    const scale = fov / (cameraDist + z2);

    const screenX = width / 2 + x2 * scale * 25;
    const screenY = height / 2 - y2 * scale * 25;

    return [screenX, screenY, z2];
  }, [rotation]);

  // Render loop
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

    // ─── Draw 3D coordinate grid (base plane z = 0) ──────────────────────────
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
    ctx.lineWidth = 1;
    const gridSize = 3.5;
    const gridStep = 0.7;

    for (let g = -gridSize; g <= gridSize; g += gridStep) {
      // Lines parallel to X
      const [x1, y1] = project(-gridSize, g, 0, width, height);
      const [x2, y2] = project(gridSize, g, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Lines parallel to Y
      const [x3, y3] = project(g, -gridSize, 0, width, height);
      const [x4, y4] = project(g, gridSize, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.stroke();
    }

    // ─── Draw 3D Axes ────────────────────────────────────────────────────────
    const [origX, origY] = project(0, 0, 0, width, height);
    const [xAxisX, xAxisY] = project(4, 0, 0, width, height);
    const [yAxisX, yAxisY] = project(0, 4, 0, width, height);
    const [zAxisX, zAxisY] = project(0, 0, 4.5, width, height);

    // X axis (Cyan)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(origX, origY);
    ctx.lineTo(xAxisX, xAxisY);
    ctx.stroke();
    ctx.fillStyle = '#06b6d4';
    ctx.font = '10px "JetBrains Mono"';
    ctx.fillText('X₁', xAxisX + 5, xAxisY);

    // Y axis (Indigo)
    ctx.strokeStyle = '#818cf8';
    ctx.beginPath();
    ctx.moveTo(origX, origY);
    ctx.lineTo(yAxisX, yAxisY);
    ctx.stroke();
    ctx.fillStyle = '#818cf8';
    ctx.fillText('X₂', yAxisX + 5, yAxisY);

    // Z axis (Emerald - transformed feature)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(origX, origY);
    ctx.lineTo(zAxisX, zAxisY);
    ctx.stroke();
    ctx.fillStyle = '#10b981';
    ctx.fillText(featureMapping === 'paraboloid' ? 'Φ(x) = x₁²+x₂²' : 'Φ(x) = RBF(x)', zAxisX + 5, zAxisY - 5);

    // ─── Draw Slicing Hyperplane in 3D ──────────────────────────────────────
    const s = 3.2;
    const [p1x, p1y] = project(-s, -s, sliceHeight, width, height);
    const [p2x, p2y] = project(s, -s, sliceHeight, width, height);
    const [p3x, p3y] = project(s, s, sliceHeight, width, height);
    const [p4x, p4y] = project(-s, s, sliceHeight, width, height);

    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.lineTo(p3x, p3y);
    ctx.lineTo(p4x, p4y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // ─── Sort and Draw Data Points in 3D ────────────────────────────────────
    const projectedPoints = points.map((p, idx) => {
      const [x3, y3, z3] = mapTo3D(p);
      const [sx, sy, depth] = project(x3, y3, z3, width, height);
      const [baseSx, baseSy] = project(x3, y3, 0, width, height);
      return { p, sx, sy, baseSx, baseSy, depth, z3, idx };
    });

    // Draw furthest first (painters algorithm)
    projectedPoints.sort((a, b) => b.depth - a.depth);

    for (const pt of projectedPoints) {
      // Drop-line from point to base plane
      ctx.strokeStyle = pt.p.label === 1 ? 'rgba(99, 102, 241, 0.25)' : 'rgba(244, 63, 94, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(pt.baseSx, pt.baseSy);
      ctx.lineTo(pt.sx, pt.sy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Shadow on base plane
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(pt.baseSx, pt.baseSy, 3, 0, Math.PI * 2);
      ctx.fill();

      // 3D elevated point
      const isAbove = pt.z3 >= sliceHeight;
      const radius = 5.5;

      // Glow
      const grad = ctx.createRadialGradient(pt.sx, pt.sy, 0, pt.sx, pt.sy, 14);
      grad.addColorStop(0, pt.p.label === 1 ? 'rgba(99, 102, 241, 0.6)' : 'rgba(244, 63, 94, 0.6)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pt.sx, pt.sy, 14, 0, Math.PI * 2);
      ctx.fill();

      // Main dot
      ctx.fillStyle = pt.p.label === 1 ? '#6366f1' : '#f43f5e';
      ctx.beginPath();
      ctx.arc(pt.sx, pt.sy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Border highlight
      ctx.strokeStyle = isAbove ? '#10b981' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [points, mapTo3D, project, featureMapping, sliceHeight]);

  // Handle canvas sizing and redraw
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = 460;
      render();
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [render]);

  // Mouse drag for rotation
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

  return (
    <div className="flex flex-col gap-3">
      {/* 3D View Controls */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-canvas-card border border-border">
        <div className="flex items-center gap-2">
          <Rotate3d className="w-4 h-4 text-accent-indigo" />
          <span className="text-xs font-semibold text-txt-primary">
            Higher-Dimensional Feature Space (3D Kernel Space)
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Mapping selector */}
          <div className="flex rounded-lg overflow-hidden border border-border text-xs">
            <button
              onClick={() => setFeatureMapping('paraboloid')}
              className={`px-2.5 py-1 font-medium transition-colors ${
                featureMapping === 'paraboloid' ? 'bg-accent-indigo text-white' : 'bg-canvas-primary text-txt-secondary'
              }`}
            >
              Φ = x₁² + x₂²
            </button>
            <button
              onClick={() => setFeatureMapping('gaussian')}
              className={`px-2.5 py-1 font-medium transition-colors ${
                featureMapping === 'gaussian' ? 'bg-accent-indigo text-white' : 'bg-canvas-primary text-txt-secondary'
              }`}
            >
              Φ = Gaussian RBF
            </button>
          </div>

          {/* Hyperplane slice slider */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-txt-muted font-mono">Slice Z:</span>
            <input
              type="range"
              min={0.2}
              max={3.8}
              step={0.1}
              value={sliceHeight}
              onChange={(e) => setSliceHeight(parseFloat(e.target.value))}
              className="w-24 input-range"
            />
            <span className="text-[11px] font-mono text-accent-emerald w-8">
              {sliceHeight.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div
        ref={containerRef}
        className="sim-canvas relative overflow-hidden"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} />

        {/* Intuition badge */}
        <div className="absolute top-3 left-3 bg-canvas-primary/80 backdrop-blur-sm border border-border rounded-lg p-2.5 max-w-xs text-[11px] text-txt-secondary leading-relaxed">
          <p className="font-semibold text-txt-primary mb-1 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-accent-cyan" />
            The Kernel Trick Intuition:
          </p>
          Data non-separable in 2D (like concentric circles) is projected into 3D where a simple <strong className="text-accent-emerald">flat plane</strong> easily slices and separates both classes.
          <p className="text-[10px] text-txt-muted mt-1 italic">Click & drag to rotate view.</p>
        </div>
      </div>
    </div>
  );
}
