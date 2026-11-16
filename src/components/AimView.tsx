import React from 'react';
import type { ExperimentConfig } from '../types';
import {
  Target,
  BookOpenCheck,
  Lightbulb,
  Maximize2,
  Sliders,
  Cpu,
  Boxes,
  TrendingUp,
} from 'lucide-react';

const EXP_ICONS: Record<string, React.ReactNode> = {
  Maximize2: <Maximize2 className="w-6 h-6 text-accent-indigo" />,
  Sliders: <Sliders className="w-6 h-6 text-accent-emerald" />,
  Cpu: <Cpu className="w-6 h-6 text-accent-cyan" />,
  Boxes: <Boxes className="w-6 h-6 text-accent-amber" />,
  TrendingUp: <TrendingUp className="w-6 h-6 text-accent-indigo" />,
};

interface AimViewProps {
  experiment: ExperimentConfig;
}

export default function AimView({ experiment }: AimViewProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="glass-card p-8 border border-border/80">
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-accent-indigo/15 border border-accent-indigo/30 flex items-center justify-center shrink-0">
            {EXP_ICONS[experiment.iconName] || <Target className="w-6 h-6 text-accent-indigo" />}
          </div>
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-widest text-accent-indigo">
              Experiment {experiment.number} of 5
            </div>
            <h1 className="text-xl font-bold text-txt-primary">
              {experiment.title}
            </h1>
            <p className="text-sm text-txt-secondary leading-relaxed">
              {experiment.description}
            </p>
          </div>
        </div>
      </div>

      {/* Aim */}
      <div className="glass-card p-6 border border-border/80">
        <div className="flex items-center gap-2.5 mb-3">
          <Target className="w-4 h-4 text-accent-indigo" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-txt-primary">
            Formal Experiment Aim
          </h2>
        </div>
        <p className="text-sm text-txt-secondary leading-relaxed bg-canvas-primary/50 p-4 rounded-xl border border-border/60">
          {experiment.description}
        </p>
      </div>

      {/* Objectives */}
      <div className="glass-card p-6 border border-border/80">
        <div className="flex items-center gap-2.5 mb-4">
          <BookOpenCheck className="w-4 h-4 text-accent-emerald" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-txt-primary">
            Key Learning Outcomes (Bloom\'s Taxonomy Aligned)
          </h2>
        </div>
        <div className="space-y-2.5">
          {getObjectives(experiment.id).map((obj, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-canvas-primary/40 border border-border/50">
              <div className="w-5 h-5 rounded-md bg-accent-emerald/15 text-accent-emerald font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-xs text-txt-secondary leading-relaxed">{obj}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prerequisites */}
      <div className="glass-card p-6 border border-border/80">
        <div className="flex items-center gap-2.5 mb-3">
          <Lightbulb className="w-4 h-4 text-accent-amber" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-txt-primary">
            Curricular Prerequisites
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {getPrerequisites(experiment.id).map((prereq, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-canvas-primary/60 text-txt-secondary border border-border/70"
            >
              {prereq}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function getObjectives(expId: string): string[] {
  const objectives: Record<string, string[]> = {
    'hard-margin-svm': [
      'Formulate binary classification as a constrained convex quadratic programming problem.',
      'Derive the geometric margin width equation (2/||w||) from first geometric principles.',
      'Apply Karush-Kuhn-Tucker (KKT) conditions to prove dual sparsity and identify Support Vectors.',
      'Verify that non-support vectors carry zero Lagrange multiplier weight (αᵢ = 0) and do not perturb the boundary.',
    ],
    'soft-margin-svm': [
      'Analyze the failure modes of hard-margin SVM on non-linearly separable and noisy datasets.',
      'Formulate slack variables (ξᵢ) and connect the primal optimization problem to Hinge Loss minimization.',
      'Evaluate the bias-variance tradeoff across 6 orders of magnitude of regularization hyperparameter C.',
      'Distinguish between free support vectors (0 < αᵢ < C, ξᵢ = 0) and bounded support vectors (αᵢ = C, ξᵢ > 0).',
    ],
    'kernel-trick': [
      'Evaluate Cover\'s Theorem on the linear separability of patterns cast into higher-dimensional spaces.',
      'Understand the inner product formulation K(x, z) = ⟨ϕ(x), ϕ(z)⟩ without explicit feature computation.',
      'Inspect 2D concentric non-linear distributions projected onto 3D paraboloid manifolds sliced by linear hyperplanes.',
      'Tune Gaussian RBF bandwidth (γ) and Polynomial degree (d) while avoiding island overfitting.',
    ],
    'multiclass-svm': [
      'Formulate One-vs-Rest (OvR) and One-vs-One (OvO) decomposition heuristics for K-class datasets.',
      'Analyze the computational complexity and class imbalance trade-offs between K and K(K-1)/2 classifiers.',
      'Visualize piecewise and non-linear decision regions produced by multi-class SVM ensembles.',
    ],
    'svr': [
      'Adapt maximum-margin principles from discrete classification to continuous function approximation.',
      'Implement Vapnik\'s ε-insensitive loss function and observe how the ε-tube guarantees solution sparsity.',
      'Evaluate the role of dual slack variables (ξᵢ and ξᵢ*) representing positive and negative tube excursions.',
    ],
  };
  return objectives[expId] || ['Complete this experiment to master core SVM concepts.'];
}

function getPrerequisites(expId: string): string[] {
  const prereqs: Record<string, string[]> = {
    'hard-margin-svm': ['Linear Algebra (Dot Products, Hyperplanes)', 'Multivariate Calculus', 'Convex Optimization Basics'],
    'soft-margin-svm': ['Hard-Margin SVM (Exp 1)', 'Lagrange Multipliers & Duality', 'Regularization Principles'],
    'kernel-trick': ['Soft-Margin SVM (Exp 2)', 'Inner Product Spaces & Hilbert Spaces', 'Gaussian Distribution'],
    'multiclass-svm': ['Kernel SVM (Exp 3)', 'Binary Classification Ensembles'],
    'svr': ['SVM Classification Foundations', 'Regression Analysis & Loss Functions'],
  };
  return prereqs[expId] || ['Linear Algebra', 'Calculus', 'Machine Learning Fundamentals'];
}
