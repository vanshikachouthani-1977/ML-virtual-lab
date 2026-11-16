import React, { useState } from 'react';
import type { ExperimentConfig } from '../types';
import {
  HelpCircle,
  MousePointer,
  Eye,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface SimulationGuideProps {
  instructions: ExperimentConfig['simulationInstructions'];
}

export default function SimulationGuide({ instructions }: SimulationGuideProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'actions' | 'visuals' | 'tasks'>('actions');
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());

  const toggleTask = (taskId: number) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  return (
    <div className="glass-card border border-border/80 overflow-hidden mb-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between px-4 py-3 bg-canvas-secondary/60 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-accent-indigo/20 flex items-center justify-center text-accent-indigo">
            <Info className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-txt-primary tracking-wide">
              Laboratory Protocol & Visual Interpretation Guide
            </span>
            <span className="text-[11px] text-txt-muted ml-2 hidden sm:inline">
              Follow these instructions to operate the simulator and analyze outputs
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="btn-ghost py-1 px-2 text-xs flex items-center gap-1 text-txt-secondary"
        >
          <span>{isOpen ? 'Minimize Guide' : 'Expand Guide'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Body */}
      {isOpen && (
        <div className="p-4 space-y-4 animate-fade-in">
          {/* Objective Statement */}
          <div className="p-3 rounded-lg bg-canvas-primary/70 border border-border text-xs text-txt-secondary leading-relaxed">
            <strong className="text-accent-indigo">Core Objective: </strong>
            {instructions.objective}
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex gap-2 border-b border-border/50 pb-2">
            <button
              onClick={() => setActiveTab('actions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'actions'
                  ? 'bg-accent-indigo text-white'
                  : 'text-txt-secondary hover:text-txt-primary hover:bg-canvas-elevated'
              }`}
            >
              <MousePointer className="w-3.5 h-3.5" />
              1. What You Have To Do (Actions)
            </button>
            <button
              onClick={() => setActiveTab('visuals')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'visuals'
                  ? 'bg-accent-indigo text-white'
                  : 'text-txt-secondary hover:text-txt-primary hover:bg-canvas-elevated'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              2. How to Read Output (Visual Elements)
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-accent-indigo text-white'
                  : 'text-txt-secondary hover:text-txt-primary hover:bg-canvas-elevated'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              3. Guided Experiment Tasks ({completedTasks.size}/{instructions.guidedTasks.length})
            </button>
          </div>

          {/* Tab 1: User Actions */}
          {activeTab === 'actions' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
              {instructions.userActions.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-canvas-primary/40 border border-border/60 text-xs leading-relaxed text-txt-secondary"
                >
                  <div className="w-5 h-5 rounded-md bg-accent-indigo/15 text-accent-indigo font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                    {i + 1}
                  </div>
                  <div>{action}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Visual Elements Decoder */}
          {activeTab === 'visuals' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
              {instructions.visualElements.map((elem, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-canvas-primary/50 border border-border/70 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-txt-primary">{elem.name}</span>
                    <span className="font-mono text-[11px] text-accent-cyan px-2 py-0.5 rounded bg-canvas-elevated">
                      {elem.visual}
                    </span>
                  </div>
                  <p className="text-txt-secondary text-[11px] leading-relaxed">
                    {elem.meaning}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Guided Tasks */}
          {activeTab === 'tasks' && (
            <div className="space-y-2.5 animate-fade-in">
              {instructions.guidedTasks.map((t) => {
                const isDone = completedTasks.has(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleTask(t.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isDone
                        ? 'bg-accent-emerald/10 border-accent-emerald/30'
                        : 'bg-canvas-primary/40 border-border hover:border-accent-indigo/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                          isDone
                            ? 'bg-accent-emerald text-white'
                            : 'border border-border text-txt-muted'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : t.id}
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="font-semibold text-txt-primary flex items-center gap-2">
                          <span>{t.title}</span>
                          {isDone && (
                            <span className="text-[10px] text-accent-emerald font-semibold">
                              (Completed)
                            </span>
                          )}
                        </div>
                        <p className="text-txt-secondary">
                          <strong className="text-txt-primary">Step:</strong> {t.action}
                        </p>
                        <p className="text-txt-muted text-[11px]">
                          <strong className="text-accent-indigo">Expected Output:</strong>{' '}
                          {t.observation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
