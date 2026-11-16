import React from 'react';
import type { SVMParams, KernelType, DatasetPreset, ExperimentFeature } from '../types';
import {
  RotateCcw,
  Shuffle,
  Compass,
  Layers,
  Target,
  Grid,
  Moon,
  RotateCw,
  TrendingUp,
  Boxes,
} from 'lucide-react';

interface ParameterPanelProps {
  params: SVMParams;
  onParamsChange: (params: SVMParams) => void;
  presets: DatasetPreset[];
  onLoadPreset: (preset: DatasetPreset) => void;
  onClear: () => void;
  onRetrain: () => void;
  features: ExperimentFeature[];
  showContour: boolean;
  onToggleContour: () => void;
  showMargin: boolean;
  onToggleMargin: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
}

const PRESET_ICONS: Record<string, React.ReactNode> = {
  Compass: <Compass className="w-3.5 h-3.5 text-accent-indigo" />,
  Layers: <Layers className="w-3.5 h-3.5 text-accent-emerald" />,
  Target: <Target className="w-3.5 h-3.5 text-accent-cyan" />,
  Grid: <Grid className="w-3.5 h-3.5 text-accent-amber" />,
  Moon: <Moon className="w-3.5 h-3.5 text-accent-indigo" />,
  RotateCw: <RotateCw className="w-3.5 h-3.5 text-accent-cyan" />,
  TrendingUp: <TrendingUp className="w-3.5 h-3.5 text-accent-emerald" />,
  Boxes: <Boxes className="w-3.5 h-3.5 text-accent-amber" />,
};

export default function ParameterPanel({
  params,
  onParamsChange,
  presets,
  onLoadPreset,
  onClear,
  onRetrain,
  features,
  showContour,
  onToggleContour,
  showMargin,
  onToggleMargin,
  showGrid,
  onToggleGrid,
}: ParameterPanelProps) {
  const update = (key: keyof SVMParams, value: number | string) => {
    onParamsChange({ ...params, [key]: value });
  };

  const kernelOptions: { value: KernelType; label: string }[] = [
    { value: 'linear', label: 'Linear' },
    { value: 'polynomial', label: 'Polynomial' },
    { value: 'rbf', label: 'RBF (Gaussian)' },
  ];

  return (
    <div className="space-y-5">
      {/* Dataset Presets */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-txt-muted block mb-2">
          Dataset Presets
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => onLoadPreset(preset)}
              className="btn-ghost text-xs flex items-center gap-2 justify-start py-2 px-2.5 rounded-lg border border-border/50 bg-canvas-primary/40 hover:bg-canvas-elevated hover:border-accent-indigo/30 transition-all text-txt-secondary hover:text-txt-primary"
            >
              <span className="shrink-0">{PRESET_ICONS[preset.iconName] || <Compass className="w-3.5 h-3.5" />}</span>
              <span className="truncate">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Kernel Type */}
      {features.includes('kernel-switch') && (
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-txt-muted block mb-2">
            Kernel Function
          </label>
          <div className="flex gap-1 bg-canvas-primary/60 p-1 rounded-xl border border-border">
            {kernelOptions.map((k) => (
              <button
                key={k.value}
                onClick={() => update('kernelType', k.value)}
                className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  params.kernelType === k.value
                    ? 'bg-accent-indigo text-white shadow-sm'
                    : 'text-txt-secondary hover:text-txt-primary hover:bg-canvas-elevated'
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* C Parameter */}
      {features.includes('c-slider') && (
        <div className="p-3 rounded-xl bg-canvas-primary/40 border border-border/60">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-txt-muted">
              C (Regularization Penalty)
            </label>
            <span className="text-xs font-mono font-bold text-accent-indigo">
              {params.C.toFixed(params.C < 1 ? 3 : 1)}
            </span>
          </div>
          <input
            type="range"
            min={-3}
            max={3}
            step={0.1}
            value={Math.log10(params.C)}
            onChange={(e) => update('C', Math.pow(10, parseFloat(e.target.value)))}
            className="input-range"
          />
          <div className="flex justify-between mt-1 text-[9px] text-txt-muted font-mono">
            <span>0.001 (Soft/Tolerant)</span>
            <span>1.0</span>
            <span>1000 (Hard/Strict)</span>
          </div>
        </div>
      )}

      {/* Gamma */}
      {features.includes('gamma-slider') && (params.kernelType === 'rbf' || params.kernelType === 'polynomial') && (
        <div className="p-3 rounded-xl bg-canvas-primary/40 border border-border/60">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-txt-muted">
              γ (Kernel Bandwidth Gamma)
            </label>
            <span className="text-xs font-mono font-bold text-accent-cyan">
              {params.gamma.toFixed(params.gamma < 1 ? 3 : 2)}
            </span>
          </div>
          <input
            type="range"
            min={-3}
            max={2}
            step={0.1}
            value={Math.log10(params.gamma)}
            onChange={(e) => update('gamma', Math.pow(10, parseFloat(e.target.value)))}
            className="input-range"
          />
          <div className="flex justify-between mt-1 text-[9px] text-txt-muted font-mono">
            <span>0.001 (Broad)</span>
            <span>1.0</span>
            <span>100 (Tight Island)</span>
          </div>
        </div>
      )}

      {/* Polynomial Degree */}
      {features.includes('degree-slider') && params.kernelType === 'polynomial' && (
        <div className="p-3 rounded-xl bg-canvas-primary/40 border border-border/60">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-txt-muted">
              Polynomial Degree (d)
            </label>
            <span className="text-xs font-mono font-bold text-accent-amber">{params.degree}</span>
          </div>
          <input
            type="range"
            min={2}
            max={6}
            step={1}
            value={params.degree}
            onChange={(e) => update('degree', parseInt(e.target.value))}
            className="input-range"
          />
          <div className="flex justify-between mt-1 text-[9px] text-txt-muted font-mono">
            <span>2 (Quadratic)</span>
            <span>4</span>
            <span>6</span>
          </div>
        </div>
      )}

      {/* Epsilon for SVR */}
      {features.includes('epsilon-slider') && (
        <div className="p-3 rounded-xl bg-canvas-primary/40 border border-border/60">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-txt-muted">
              ε (Insensitive Tube Width)
            </label>
            <span className="text-xs font-mono font-bold text-accent-emerald">
              {params.epsilon.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.01}
            max={2}
            step={0.01}
            value={params.epsilon}
            onChange={(e) => update('epsilon', parseFloat(e.target.value))}
            className="input-range"
          />
          <div className="flex justify-between mt-1 text-[9px] text-txt-muted font-mono">
            <span>0.01 (Dense)</span>
            <span>1.0</span>
            <span>2.00 (Sparse)</span>
          </div>
        </div>
      )}

      {/* Visualization toggles */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-txt-muted block mb-2">
          Display Overlays
        </label>
        <div className="space-y-1 bg-canvas-primary/30 p-2 rounded-xl border border-border/50">
          <ToggleSwitch label="Decision Contour Heatmap" checked={showContour} onChange={onToggleContour} />
          <ToggleSwitch label="Margin Gutter Lines (±1)" checked={showMargin} onChange={onToggleMargin} />
          <ToggleSwitch label="Coordinate Grid" checked={showGrid} onChange={onToggleGrid} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2">
        <button onClick={onRetrain} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5">
          <Shuffle className="w-3.5 h-3.5" />
          Solve QP (Re-Train)
        </button>
        <button onClick={onClear} className="btn-ghost px-3 border border-border/60 hover:border-accent-rose/40 hover:text-accent-rose" title="Clear all points">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={onChange}
      className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg hover:bg-canvas-elevated transition-colors"
    >
      <span className="text-xs text-txt-secondary">{label}</span>
      <div
        className={`w-8 h-4 rounded-full transition-colors duration-200 relative ${
          checked ? 'bg-accent-indigo' : 'bg-canvas-elevated'
        }`}
      >
        <div
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
}
