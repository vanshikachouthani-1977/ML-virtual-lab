import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ExperimentConfig } from '../types';
import {
  ArrowRight,
  ShieldCheck,
  Cpu,
  Boxes,
  GraduationCap,
  BookOpen,
  Maximize2,
  Sliders,
  TrendingUp,
  CheckCircle2,
  Binary,
  Compass,
  FileCode,
  Layers,
  Activity,
} from 'lucide-react';

interface HomeViewProps {
  experiments: ExperimentConfig[];
}

const EXP_CARD_ICONS: Record<string, React.ReactNode> = {
  Maximize2: <Maximize2 className="w-5 h-5 text-accent-indigo" />,
  Sliders: <Sliders className="w-5 h-5 text-accent-emerald" />,
  Cpu: <Cpu className="w-5 h-5 text-accent-cyan" />,
  Boxes: <Boxes className="w-5 h-5 text-accent-amber" />,
  TrendingUp: <TrendingUp className="w-5 h-5 text-accent-indigo" />,
};

export default function HomeView({ experiments }: HomeViewProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12 animate-fade-in">
      {/* ─── Institutional Header Banner ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-accent-indigo mb-1">
            Department of Computer Engineering • Virtual Laboratories
          </div>
          <div className="text-xs text-txt-muted">
            National Mission on Education through Information & Communication Technology (NMEICT)
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-canvas-card border border-border text-xs text-txt-secondary">
          <GraduationCap className="w-4 h-4 text-accent-indigo" />
          <span>Curriculum Aligned: B.Tech / BE Computer Engineering</span>
        </div>
      </div>

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-8 md:p-12 border border-border/80">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-indigo/15 border border-accent-indigo/30 text-xs font-semibold text-accent-indigo">
            <Binary className="w-3.5 h-3.5" />
            <span>Course Module: Statistical Machine Learning & Convex Optimization</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-txt-primary leading-tight">
            Support Vector Machine (SVM) Virtual Laboratory
          </h1>

          <p className="text-sm md:text-base text-txt-secondary leading-relaxed">
            An interactive engineering workspace designed to master the mathematical foundations, geometric margin formulations, dual optimization, and kernel methods of Support Vector Machines. Compute real-time hyperplanes, evaluate slack penalties, and project non-linear manifolds into 3D Hilbert spaces directly in your browser.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/experiment/${experiments[0].id}`)}
              className="btn-primary text-xs font-semibold px-5 py-2.5 flex items-center gap-2 rounded-lg"
            >
              <span>Begin Experiment 1: Hard-Margin Linear SVM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#experiments-syllabus"
              className="btn-outline text-xs font-semibold px-4 py-2.5 rounded-lg"
            >
              Review Syllabus Catalog
            </a>
          </div>
        </div>

        {/* Technical Specification Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/60">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-accent-indigo flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>SMO Engine</span>
            </div>
            <p className="text-[11px] text-txt-muted">Pure TypeScript Quadratic Programming</p>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-accent-emerald flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Convex Optimization</span>
            </div>
            <p className="text-[11px] text-txt-muted">Karush-Kuhn-Tucker (KKT) Verification</p>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-accent-cyan flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>3D Feature Space</span>
            </div>
            <p className="text-[11px] text-txt-muted">Kernel Trick Projection Visualizer</p>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-accent-amber flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" />
              <span>Scikit-Learn Bridge</span>
            </div>
            <p className="text-[11px] text-txt-muted">Dynamic Python Code Generation</p>
          </div>
        </div>
      </div>

      {/* ─── Pedagogical Framework Matrix ─────────────────────────────────── */}
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-widest text-accent-indigo">
            Standard Operating Procedure
          </div>
          <h2 className="text-xl font-bold text-txt-primary">
            Virtual Laboratory Pedagogical Lifecycle
          </h2>
          <p className="text-xs text-txt-secondary">
            Each laboratory experiment follows the standardized structural lifecycle:
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { num: '01', title: 'Aim & Overview', desc: 'Formal problem statement & objectives' },
            { num: '02', title: 'Mathematical Theory', desc: 'Primal, Dual & KKT derivations via KaTeX' },
            { num: '03', title: 'Diagnostic Pre-Test', desc: 'Evaluates prerequisite comprehension' },
            { num: '04', title: 'Interactive Lab', desc: 'Real-time coordinate simulation & parameter tuning' },
            { num: '05', title: 'Code Synchronizer', desc: 'Auto-generated Scikit-Learn Python script' },
            { num: '06', title: 'Evaluative Post-Test', desc: 'Scored assessment with detailed feedback' },
          ].map((item, i) => (
            <div key={i} className="glass-card p-4 space-y-1.5 border border-border/80">
              <div className="text-[10px] font-mono font-bold text-accent-indigo">{item.num}</div>
              <div className="text-xs font-bold text-txt-primary">{item.title}</div>
              <div className="text-[11px] text-txt-muted leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Scientific Core Principles ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-6 space-y-2.5 border border-border/80">
          <div className="w-9 h-9 rounded-lg bg-accent-indigo/15 border border-accent-indigo/30 flex items-center justify-center text-accent-indigo">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-txt-primary">Margin Maximization & Duality</h3>
          <p className="text-xs text-txt-secondary leading-relaxed">
            Learn why maximizing the geometric distance 2/||w|| provides formal generalization bounds (Vapnik-Chervonenkis dimension). Formulate the Wolfe Dual and examine support vector sparsity.
          </p>
        </div>

        <div className="glass-card p-6 space-y-2.5 border border-border/80">
          <div className="w-9 h-9 rounded-lg bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-txt-primary">The Kernel Trick & Hilbert Spaces</h3>
          <p className="text-xs text-txt-secondary leading-relaxed">
            Discover Cover\'s Theorem on separability. Map 2D non-linear points implicitly into higher-dimensional Hilbert spaces using Linear, Polynomial, and Radial Basis Function (RBF) Mercer kernels.
          </p>
        </div>

        <div className="glass-card p-6 space-y-2.5 border border-border/80">
          <div className="w-9 h-9 rounded-lg bg-accent-emerald/15 border border-accent-emerald/30 flex items-center justify-center text-accent-emerald">
            <Boxes className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-txt-primary">Slack Variables & Regularization</h3>
          <p className="text-xs text-txt-secondary leading-relaxed">
            Evaluate the bias-variance trade-off on noisy or overlapping datasets. Analyze Hinge Loss minimization and the role of the box constraint 0 ≤ αᵢ ≤ C on support vector classification.
          </p>
        </div>
      </div>

      {/* ─── Experiments Syllabus ─────────────────────────────────────────── */}
      <div id="experiments-syllabus" className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold uppercase tracking-widest text-accent-indigo">
              Laboratory Syllabus
            </div>
            <h2 className="text-xl font-bold text-txt-primary">
              List of Experiments
            </h2>
          </div>
          <span className="text-xs text-txt-muted font-mono">5 Core Experiments</span>
        </div>

        <div className="space-y-3">
          {experiments.map((exp) => (
            <div
              key={exp.id}
              onClick={() => navigate(`/experiment/${exp.id}`)}
              className="glass-card p-5 glass-card-hover cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-border/80"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-canvas-primary border border-border/80 flex items-center justify-center shrink-0 mt-0.5">
                  {EXP_CARD_ICONS[exp.iconName] || <Maximize2 className="w-5 h-5 text-accent-indigo" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent-indigo/15 text-accent-indigo">
                      Experiment {exp.number}
                    </span>
                    <h3 className="text-sm font-bold text-txt-primary group-hover:text-accent-indigo transition-colors">
                      {exp.title}
                    </h3>
                  </div>
                  <p className="text-xs text-txt-secondary leading-relaxed max-w-2xl">
                    {exp.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {exp.features.map((f, fi) => (
                      <span
                        key={fi}
                        className="text-[10px] px-2 py-0.5 rounded bg-canvas-elevated text-txt-muted font-mono"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <span className="text-xs text-txt-muted hidden md:flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-accent-indigo" />
                  Theory + Simulation + Quizzes
                </span>
                <button className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 rounded-lg">
                  <span>Enter Lab</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Institutional Course Alignment ───────────────────────────────── */}
      <div className="glass-card p-6 border border-border/80 space-y-4">
        <div className="flex items-center gap-2.5">
          <GraduationCap className="w-5 h-5 text-accent-indigo" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-txt-primary">
            Curricular Alignment & Degree Course Mapping
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-canvas-primary/60 border border-border/70 space-y-1">
            <strong className="text-txt-primary block">B.Tech in Computer Science & Engineering</strong>
            <p className="text-txt-muted">Covers PCC-CS 601: Machine Learning Laboratory curriculum requirements.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-canvas-primary/60 border border-border/70 space-y-1">
            <strong className="text-txt-primary block">B.Tech in Artificial Intelligence & Data Science</strong>
            <p className="text-txt-muted">Supports Statistical Learning, Supervised Classifiers, and Optimization Units.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-canvas-primary/60 border border-border/70 space-y-1">
            <strong className="text-txt-primary block">M.Tech / MS by Research in Computer Engineering</strong>
            <p className="text-txt-muted">Provides laboratory simulations for Advanced Pattern Recognition and Kernel Methods.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
