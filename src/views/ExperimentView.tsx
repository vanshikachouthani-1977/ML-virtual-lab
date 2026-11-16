import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { ExperimentConfig, Tab, Point, SVMModel, DatasetPreset } from '../types';
import { TAB_LIST } from '../types';
import { trainSVM } from '../engine/svm';
import Canvas2D from '../components/Canvas2D';
import Kernel3DView from '../components/Kernel3DView';
import ParameterPanel from '../components/ParameterPanel';
import TelemetryPanel from '../components/TelemetryPanel';
import TheoryView from '../components/TheoryView';
import QuizView from '../components/QuizView';
import CodeGenerator from '../components/CodeGenerator';
import AimView from '../components/AimView';
import ReferencesView from '../components/ReferencesView';
import SimulationGuide from '../components/SimulationGuide';
import {
  Target,
  BookOpen,
  ClipboardCheck,
  Play,
  Code2,
  Award,
  Library,
  ChevronLeft,
  ChevronRight,
  Rotate3d,
  Layers,
  Sparkles,
  Maximize2,
  Sliders,
  Cpu,
  Boxes,
  TrendingUp,
} from 'lucide-react';

interface ExperimentViewProps {
  experiments: ExperimentConfig[];
  onScoreUpdate?: (score: number) => void;
}

const TAB_ICON_MAP: Record<Tab, React.ReactNode> = {
  aim: <Target className="w-4 h-4" />,
  theory: <BookOpen className="w-4 h-4" />,
  pretest: <ClipboardCheck className="w-4 h-4" />,
  simulation: <Play className="w-4 h-4" />,
  code: <Code2 className="w-4 h-4" />,
  posttest: <Award className="w-4 h-4" />,
  references: <Library className="w-4 h-4" />,
};

const EXP_HEADER_ICONS: Record<string, React.ReactNode> = {
  Maximize2: <Maximize2 className="w-5 h-5 text-accent-indigo" />,
  Sliders: <Sliders className="w-5 h-5 text-accent-emerald" />,
  Cpu: <Cpu className="w-5 h-5 text-accent-cyan" />,
  Boxes: <Boxes className="w-5 h-5 text-accent-amber" />,
  TrendingUp: <TrendingUp className="w-5 h-5 text-accent-indigo" />,
};

export default function ExperimentView({ experiments }: ExperimentViewProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const expIndex = experiments.findIndex((e) => e.id === id);
  const experiment = experiments[expIndex] || experiments[0];

  const [activeTab, setActiveTab] = useState<Tab>('aim');
  const [params, setParams] = useState(experiment.defaultParams);
  const [points, setPoints] = useState<Point[]>([]);
  const [model, setModel] = useState<SVMModel | null>(null);

  // Visualization toggles
  const [showContour, setShowContour] = useState(true);
  const [showMargin, setShowMargin] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  // Load experiment default dataset on mount or experiment change
  useEffect(() => {
    setParams(experiment.defaultParams);
    if (experiment.datasetPresets.length > 0) {
      const initialPoints = experiment.datasetPresets[0].generate();
      setPoints(initialPoints);
    } else {
      setPoints([]);
    }
    setActiveTab('aim');
    setViewMode('2d');
  }, [experiment]);

  // Retrain SVM whenever points or parameters change
  const retrain = useCallback(() => {
    if (points.length < 2) {
      setModel(null);
      return;
    }
    const m = trainSVM(points, params);
    setModel(m);
  }, [points, params]);

  useEffect(() => {
    retrain();
  }, [retrain]);

  // Point management
  const handleAddPoint = (pt: Point) => {
    setPoints((prev) => [...prev, pt]);
  };

  const handleRemovePoint = (index: number) => {
    setPoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearPoints = () => {
    setPoints([]);
    setModel(null);
  };

  const handleLoadPreset = (preset: DatasetPreset) => {
    const pts = preset.generate();
    setPoints(pts);
  };

  // Next / Previous experiment navigation
  const prevExp = expIndex > 0 ? experiments[expIndex - 1] : null;
  const nextExp = expIndex < experiments.length - 1 ? experiments[expIndex + 1] : null;

  return (
    <div className="flex flex-col min-h-full">
      {/* ─── Top Sub-Header & Tab Navigation ───────────────────────────────── */}
      <div className="border-b border-border bg-canvas-secondary/40 backdrop-blur-md px-6 py-3 shrink-0">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-indigo/15 border border-accent-indigo/30 flex items-center justify-center shrink-0">
              {EXP_HEADER_ICONS[experiment.iconName] || <Maximize2 className="w-5 h-5 text-accent-indigo" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-indigo/15 text-accent-indigo">
                  Experiment {experiment.number}
                </span>
                <span className="text-xs text-txt-muted">Syllabus Module {experiment.number} of 5</span>
              </div>
              <h1 className="text-base font-bold text-txt-primary truncate">
                {experiment.title}
              </h1>
            </div>
          </div>

          {/* Module Prev/Next Switcher */}
          <div className="flex items-center gap-1.5 shrink-0">
            {prevExp && (
              <button
                onClick={() => navigate(`/experiment/${prevExp.id}`)}
                className="btn-ghost text-xs flex items-center gap-1 py-1.5 px-3 rounded-lg border border-border"
                title={`Previous: ${prevExp.shortTitle}`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev Exp</span>
              </button>
            )}
            {nextExp && (
              <button
                onClick={() => navigate(`/experiment/${nextExp.id}`)}
                className="btn-primary text-xs flex items-center gap-1 py-1.5 px-3 rounded-lg"
                title={`Next: ${nextExp.shortTitle}`}
              >
                <span className="hidden sm:inline">Next Exp</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1">
          {TAB_LIST.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`tab-btn flex items-center gap-2 whitespace-nowrap text-xs font-semibold ${
                activeTab === t.id ? 'active' : ''
              }`}
            >
              {TAB_ICON_MAP[t.id]}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Main Tab Content ──────────────────────────────────────────────── */}
      <div className="flex-1 p-6">
        {activeTab === 'aim' && <AimView experiment={experiment} />}

        {activeTab === 'theory' && <TheoryView sections={experiment.theory} />}

        {activeTab === 'pretest' && (
          <QuizView
            title={`Pre-Test: ${experiment.shortTitle}`}
            questions={experiment.preTest}
          />
        )}

        {activeTab === 'simulation' && (
          <div className="space-y-4">
            {/* Simulation Guide & Protocol Header */}
            <SimulationGuide instructions={experiment.simulationInstructions} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Center Canvas Area (7 Cols) */}
              <div className="xl:col-span-7 space-y-3">
                {/* Simulation Header with 2D / 3D Mode switch */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-txt-muted flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent-indigo" />
                      Simulation Workspace
                    </span>
                  </div>

                  {experiment.features.includes('3d-view') && (
                    <div className="flex rounded-lg overflow-hidden border border-border text-xs">
                      <button
                        onClick={() => setViewMode('2d')}
                        className={`px-3 py-1 font-semibold flex items-center gap-1.5 transition-colors ${
                          viewMode === '2d' ? 'bg-accent-indigo text-white' : 'bg-canvas-card text-txt-secondary'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        2D Decision Plane
                      </button>
                      <button
                        onClick={() => setViewMode('3d')}
                        className={`px-3 py-1 font-semibold flex items-center gap-1.5 transition-colors ${
                          viewMode === '3d' ? 'bg-accent-indigo text-white' : 'bg-canvas-card text-txt-secondary'
                        }`}
                      >
                        <Rotate3d className="w-3.5 h-3.5" />
                        3D Kernel Feature Space
                      </button>
                    </div>
                  )}
                </div>

                {/* Canvas 2D or 3D */}
                {viewMode === '2d' ? (
                  <Canvas2D
                    points={points}
                    model={model}
                    onAddPoint={handleAddPoint}
                    onRemovePoint={handleRemovePoint}
                    onClearPoints={handleClearPoints}
                    showContour={showContour}
                    showMargin={showMargin}
                    showGrid={showGrid}
                  />
                ) : (
                  <Kernel3DView
                    points={points}
                    kernelType={params.kernelType}
                  />
                )}

                {/* Quick Interactive Legend */}
                <div className="p-3 rounded-xl bg-canvas-card border border-border text-xs text-txt-secondary flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent-indigo inline-block" />
                      <strong>Click:</strong> Class +1
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-accent-rose inline-block" />
                      <strong>Shift-Click / Right-Click:</strong> Class −1
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full border border-accent-amber inline-block" />
                      <strong>Glowing Rings:</strong> Support Vectors
                    </span>
                  </div>
                  <div className="text-[11px] text-accent-indigo font-mono font-semibold">
                    Sequential Minimal Optimization (SMO)
                  </div>
                </div>
              </div>

              {/* Parameter Tuning Panel (3 Cols) */}
              <div className="xl:col-span-3 glass-card p-5 border border-border/80">
                <ParameterPanel
                  params={params}
                  onParamsChange={setParams}
                  presets={experiment.datasetPresets}
                  onLoadPreset={handleLoadPreset}
                  onClear={handleClearPoints}
                  onRetrain={retrain}
                  features={experiment.features}
                  showContour={showContour}
                  onToggleContour={() => setShowContour((c) => !c)}
                  showMargin={showMargin}
                  onToggleMargin={() => setShowMargin((m) => !m)}
                  showGrid={showGrid}
                  onToggleGrid={() => setShowGrid((g) => !g)}
                />
              </div>

              {/* Telemetry & Metrics (2 Cols) */}
              <div className="xl:col-span-2 glass-card p-5 border border-border/80">
                <TelemetryPanel model={model} points={points} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <CodeGenerator params={params} template={experiment.codeTemplate} />
        )}

        {activeTab === 'posttest' && (
          <QuizView
            title={`Post-Test Evaluation: ${experiment.shortTitle}`}
            questions={experiment.postTest}
          />
        )}

        {activeTab === 'references' && (
          <ReferencesView references={experiment.references} />
        )}
      </div>
    </div>
  );
}
