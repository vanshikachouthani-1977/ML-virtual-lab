import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Point, SVMModel } from '../types';

interface Canvas2DProps {
  points: Point[];
  model: SVMModel | null;
  onAddPoint: (point: Point) => void;
  onRemovePoint: (index: number) => void;
  onClearPoints: () => void;
  showContour: boolean;
  showMargin: boolean;
  showGrid: boolean;
}

// Coordinate system: data space [-4, 4] mapped to canvas pixels
const DATA_MIN = -4;
const DATA_MAX = 4;
const DATA_RANGE = DATA_MAX - DATA_MIN;

const COLORS = {
  positive: '#6366f1',     // indigo
  negative: '#f43f5e',     // rose
  positiveFill: 'rgba(99,102,241,0.3)',
  negativeFill: 'rgba(244,63,94,0.3)',
  supportVector: '#f59e0b',// amber
  svGlow: 'rgba(245,158,11,0.4)',
  boundary: '#10b981',     // emerald
  marginLine: 'rgba(16,185,129,0.4)',
  grid: 'rgba(99,102,241,0.06)',
  gridMajor: 'rgba(99,102,241,0.12)',
  axis: 'rgba(99,102,241,0.25)',
  text: 'rgba(139,148,158,0.6)',
  bg: '#0a0e1a',
  contourPos: [99, 102, 241],   // indigo RGB
  contourNeg: [244, 63, 94],    // rose RGB
};

export default function Canvas2D({
  points,
  model,
  onAddPoint,
  onRemovePoint,
  onClearPoints,
  showContour,
  showMargin,
  showGrid,
}: Canvas2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 500 });
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const animFrameRef = useRef<number>(0);

  // Coordinate transforms
  const dataToCanvasX = useCallback(
    (x: number) => ((x - DATA_MIN) / DATA_RANGE) * canvasSize.width,
    [canvasSize.width]
  );
  const dataToCanvasY = useCallback(
    (y: number) => (1 - (y - DATA_MIN) / DATA_RANGE) * canvasSize.height,
    [canvasSize.height]
  );
  const canvasToDataX = useCallback(
    (cx: number) => (cx / canvasSize.width) * DATA_RANGE + DATA_MIN,
    [canvasSize.width]
  );
  const canvasToDataY = useCallback(
    (cy: number) => (1 - cy / canvasSize.height) * DATA_RANGE + DATA_MIN,
    [canvasSize.height]
  );

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // ─── Drawing ────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvasSize;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, width, height);

    // Grid
    if (showGrid) {
      for (let v = Math.ceil(DATA_MIN); v <= Math.floor(DATA_MAX); v++) {
        const isMajor = v === 0;
        ctx.strokeStyle = isMajor ? COLORS.axis : v % 2 === 0 ? COLORS.gridMajor : COLORS.grid;
        ctx.lineWidth = isMajor ? 1.5 : 0.5;

        // Vertical line
        const cx = dataToCanvasX(v);
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx, height);
        ctx.stroke();

        // Horizontal line
        const cy = dataToCanvasY(v);
        ctx.beginPath();
        ctx.moveTo(0, cy);
        ctx.lineTo(width, cy);
        ctx.stroke();

        // Labels
        if (v !== 0) {
          ctx.fillStyle = COLORS.text;
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(v.toString(), cx, dataToCanvasY(0) + 14);
          ctx.textAlign = 'right';
          ctx.fillText(v.toString(), dataToCanvasX(0) - 6, cy + 3);
        }
      }
    }

    // ─── Decision function contour ──────────────────────────────────────
    if (model && showContour) {
      const resolution = 80;
      const imgWidth = resolution;
      const imgHeight = resolution;
      const imageData = ctx.createImageData(imgWidth, imgHeight);
      const data = imageData.data;

      for (let iy = 0; iy < imgHeight; iy++) {
        for (let ix = 0; ix < imgWidth; ix++) {
          const px = DATA_MIN + (ix / (imgWidth - 1)) * DATA_RANGE;
          const py = DATA_MAX - (iy / (imgHeight - 1)) * DATA_RANGE;
          const val = model.decisionFunction(px, py);

          const intensity = Math.min(Math.abs(val) * 0.4, 0.55);
          const idx = (iy * imgWidth + ix) * 4;

          if (val >= 0) {
            data[idx] = COLORS.contourPos[0];
            data[idx + 1] = COLORS.contourPos[1];
            data[idx + 2] = COLORS.contourPos[2];
          } else {
            data[idx] = COLORS.contourNeg[0];
            data[idx + 1] = COLORS.contourNeg[1];
            data[idx + 2] = COLORS.contourNeg[2];
          }
          data[idx + 3] = Math.floor(intensity * 255);
        }
      }

      // Scale up the small image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imgWidth;
      tempCanvas.height = imgHeight;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.putImageData(imageData, 0, 0);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(tempCanvas, 0, 0, width, height);
    }

    // ─── Decision boundary & margin lines ───────────────────────────────
    if (model) {
      const resolution = 200;
      const step = DATA_RANGE / resolution;

      // Draw boundary contour at f(x)=0, and margin at f(x)=±1
      const contours = showMargin
        ? [
            { value: 0, color: COLORS.boundary, width: 2.5, dash: [] as number[] },
            { value: 1, color: COLORS.marginLine, width: 1.5, dash: [6, 4] },
            { value: -1, color: COLORS.marginLine, width: 1.5, dash: [6, 4] },
          ]
        : [{ value: 0, color: COLORS.boundary, width: 2.5, dash: [] as number[] }];

      for (const contour of contours) {
        ctx.strokeStyle = contour.color;
        ctx.lineWidth = contour.width;
        ctx.setLineDash(contour.dash);

        // Marching squares approximation
        for (let iy = 0; iy < resolution; iy++) {
          for (let ix = 0; ix < resolution; ix++) {
            const x0 = DATA_MIN + ix * step;
            const y0 = DATA_MIN + iy * step;
            const x1 = x0 + step;
            const y1 = y0 + step;

            const v00 = model.decisionFunction(x0, y0) - contour.value;
            const v10 = model.decisionFunction(x1, y0) - contour.value;
            const v01 = model.decisionFunction(x0, y1) - contour.value;
            const v11 = model.decisionFunction(x1, y1) - contour.value;

            // Check if contour crosses this cell
            const edges: [number, number, number, number][] = [];

            // Bottom edge
            if (v00 * v10 < 0) {
              const t = v00 / (v00 - v10);
              edges.push([x0 + t * step, y0, 0, 0]);
            }
            // Top edge
            if (v01 * v11 < 0) {
              const t = v01 / (v01 - v11);
              edges.push([x0 + t * step, y1, 0, 0]);
            }
            // Left edge
            if (v00 * v01 < 0) {
              const t = v00 / (v00 - v01);
              edges.push([x0, y0 + t * step, 0, 0]);
            }
            // Right edge
            if (v10 * v11 < 0) {
              const t = v10 / (v10 - v11);
              edges.push([x1, y0 + t * step, 0, 0]);
            }

            if (edges.length >= 2) {
              ctx.beginPath();
              ctx.moveTo(dataToCanvasX(edges[0][0]), dataToCanvasY(edges[0][1]));
              ctx.lineTo(dataToCanvasX(edges[1][0]), dataToCanvasY(edges[1][1]));
              ctx.stroke();
            }
          }
        }
        ctx.setLineDash([]);
      }
    }

    // ─── Data points ────────────────────────────────────────────────────
    const svIndices = model ? new Set(model.result.supportVectorIndices) : new Set<number>();

    points.forEach((p, i) => {
      const cx = dataToCanvasX(p.x);
      const cy = dataToCanvasY(p.y);
      const isSV = svIndices.has(i);
      const isHovered = hoveredPoint === i;
      const radius = isSV ? 7 : 5;

      // Support vector glow
      if (isSV) {
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
        gradient.addColorStop(0, COLORS.svGlow);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.fill();
      }

      // Outer ring for SV
      if (isSV) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = COLORS.supportVector;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Point fill
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 1 ? COLORS.positive : COLORS.negative;
      ctx.fill();

      // Inner highlight
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();

      // Hover effect
      if (isHovered) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // ─── Axis labels ────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(139,148,158,0.5)';
    ctx.font = '11px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('x₁', width - 16, dataToCanvasY(0) - 8);
    ctx.save();
    ctx.translate(dataToCanvasX(0) + 12, 16);
    ctx.fillText('x₂', 0, 0);
    ctx.restore();
  }, [canvasSize, points, model, showContour, showMargin, showGrid, hoveredPoint, dataToCanvasX, dataToCanvasY]);

  // Animate
  useEffect(() => {
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  // ─── Mouse Interactions ───────────────────────────────────────────────
  const findPointAt = useCallback(
    (cx: number, cy: number): number => {
      const threshold = 12;
      for (let i = points.length - 1; i >= 0; i--) {
        const px = dataToCanvasX(points[i].x);
        const py = dataToCanvasY(points[i].y);
        const dist = Math.sqrt((cx - px) ** 2 + (cy - py) ** 2);
        if (dist < threshold) return i;
      }
      return -1;
    },
    [points, dataToCanvasX, dataToCanvasY]
  );

  const getCanvasCoords = (e: React.MouseEvent): [number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const [cx, cy] = getCanvasCoords(e);

    // Check if clicking on existing point
    const idx = findPointAt(cx, cy);
    if (idx >= 0) return;

    const dataX = canvasToDataX(cx);
    const dataY = canvasToDataY(cy);

    // Left click = +1, shift+click = -1
    const label: 1 | -1 = e.shiftKey ? -1 : 1;
    onAddPoint({ x: dataX, y: dataY, label });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const [cx, cy] = getCanvasCoords(e);
    const idx = findPointAt(cx, cy);
    if (idx >= 0) {
      onRemovePoint(idx);
    } else {
      // Right click = add -1 class point
      const dataX = canvasToDataX(cx);
      const dataY = canvasToDataY(cy);
      onAddPoint({ x: dataX, y: dataY, label: -1 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const [cx, cy] = getCanvasCoords(e);
    const idx = findPointAt(cx, cy);
    setHoveredPoint(idx >= 0 ? idx : null);
  };

  const handleMouseLeave = () => setHoveredPoint(null);

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        className="sim-canvas relative"
        style={{ height: '480px' }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />

        {/* Legend overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 bg-canvas-primary/80 backdrop-blur-sm rounded-lg p-2.5 text-[10px] border border-border">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-indigo" />
            <span className="text-txt-secondary">Class +1 (click)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-rose" />
            <span className="text-txt-secondary">Class −1 (shift+click / right-click)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-accent-amber bg-transparent" />
            <span className="text-txt-secondary">Support Vector</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-accent-emerald rounded" />
            <span className="text-txt-secondary">Decision Boundary</span>
          </div>
        </div>

        {/* Point count */}
        <div className="absolute bottom-3 left-3 text-[10px] text-txt-muted font-mono bg-canvas-primary/70 px-2 py-1 rounded">
          {points.length} points
        </div>
      </div>
    </div>
  );
}
