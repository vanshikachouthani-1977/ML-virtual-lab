import React from 'react';
import type { SVMModel, Point } from '../types';
import {
  Activity,
  Target,
  Timer,
  TrendingUp,
  Layers,
  Crosshair,
  Download,
} from 'lucide-react';

interface TelemetryPanelProps {
  model: SVMModel | null;
  points: Point[];
}

export default function TelemetryPanel({ model, points }: TelemetryPanelProps) {
  const positiveCount = points.filter((p) => p.label === 1).length;
  const negativeCount = points.filter((p) => p.label === -1).length;

  if (!model) {
    return (
      <div className="space-y-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-txt-muted flex items-center gap-2">
          <Activity className="w-3.5 h-3.5" />
          Telemetry
        </h3>

        <div className="stat-card text-center py-6">
          <p className="text-xs text-txt-muted">
            Add data points and train to<br />see model telemetry
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <StatMini label="Class +1" value={positiveCount.toString()} color="indigo" />
          <StatMini label="Class −1" value={negativeCount.toString()} color="rose" />
        </div>
      </div>
    );
  }

  const r = model.result;

  // Format hyperplane equation for linear kernel
  let equationStr = '';
  if (r.weights && r.weights.length === 2) {
    const w1 = r.weights[0].toFixed(3);
    const w2sign = r.weights[1] >= 0 ? '+' : '−';
    const w2 = Math.abs(r.weights[1]).toFixed(3);
    const bsign = r.bias >= 0 ? '+' : '−';
    const bval = Math.abs(r.bias).toFixed(3);
    equationStr = `${w1}·x₁ ${w2sign} ${w2}·x₂ ${bsign} ${bval} = 0`;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-txt-muted flex items-center gap-2">
        <Activity className="w-3.5 h-3.5" />
        Model Telemetry
      </h3>

      {/* Hyperplane equation */}
      {equationStr && (
        <div className="stat-card">
          <div className="text-[10px] text-txt-muted mb-1 flex items-center gap-1.5">
            <Crosshair className="w-3 h-3" />
            Hyperplane Equation
          </div>
          <p className="text-xs font-mono text-accent-emerald leading-relaxed">
            {equationStr}
          </p>
        </div>
      )}

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          label="Accuracy"
          value={`${(r.accuracy * 100).toFixed(1)}%`}
          color={r.accuracy >= 0.9 ? 'emerald' : r.accuracy >= 0.7 ? 'amber' : 'rose'}
        />
        <StatCard
          icon={<Target className="w-3.5 h-3.5" />}
          label="Support Vectors"
          value={r.supportVectorIndices.length.toString()}
          color="amber"
        />
        <StatCard
          icon={<Layers className="w-3.5 h-3.5" />}
          label="Margin Width"
          value={r.marginWidth > 0 ? r.marginWidth.toFixed(3) : '—'}
          color="indigo"
        />
        <StatCard
          icon={<Timer className="w-3.5 h-3.5" />}
          label="Train Time"
          value={`${r.trainingTimeMs.toFixed(1)}ms`}
          color="cyan"
        />
      </div>

      {/* Point breakdown */}
      <div className="grid grid-cols-2 gap-2">
        <StatMini label="Class +1" value={positiveCount.toString()} color="indigo" />
        <StatMini label="Class −1" value={negativeCount.toString()} color="rose" />
      </div>

      {/* Support vector details */}
      {r.supportVectorIndices.length > 0 && (
        <div className="stat-card">
          <div className="text-[10px] text-txt-muted mb-2">Support Vectors Detail</div>
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {r.supportVectorIndices.slice(0, 10).map((idx) => {
              const p = model.points[idx];
              if (!p) return null;
              const alpha = r.alphas[idx];
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between text-[10px] font-mono"
                >
                  <span className="text-txt-secondary">
                    SV[{idx}]: ({p.x.toFixed(2)}, {p.y.toFixed(2)})
                  </span>
                  <span className={p.label === 1 ? 'text-accent-indigo' : 'text-accent-rose'}>
                    α={alpha.toFixed(3)}
                  </span>
                </div>
              );
            })}
            {r.supportVectorIndices.length > 10 && (
              <div className="text-[10px] text-txt-muted">
                +{r.supportVectorIndices.length - 10} more...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Iterations */}
      <div className="text-[10px] text-txt-muted flex items-center justify-between">
        <span>SMO Iterations: {r.iterations}</span>
        <span>{r.converged ? '✓ Converged' : '⚠ Max iterations'}</span>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    indigo: 'text-accent-indigo',
    emerald: 'text-accent-emerald',
    amber: 'text-accent-amber',
    rose: 'text-accent-rose',
    cyan: 'text-accent-cyan',
  };

  return (
    <div className="stat-card">
      <div className="flex items-center gap-1.5 text-txt-muted mb-1">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <span className={`text-sm font-bold font-mono ${colorMap[color] || 'text-txt-primary'}`}>
        {value}
      </span>
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: 'text-accent-indigo',
    rose: 'text-accent-rose',
  };
  const bgMap: Record<string, string> = {
    indigo: 'bg-accent-indigo/10',
    rose: 'bg-accent-rose/10',
  };

  return (
    <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${bgMap[color] || ''}`}>
      <span className="text-[10px] text-txt-secondary">{label}</span>
      <span className={`text-xs font-bold font-mono ${colorMap[color] || ''}`}>{value}</span>
    </div>
  );
}
