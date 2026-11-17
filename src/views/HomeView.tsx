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
  Binary,
  Compass,
  FileCode,
  Layers,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface HomeViewProps {
  experiments: ExperimentConfig[];
}

export default function HomeView({ experiments }: HomeViewProps) {
  const navigate = useNavigate();
  const exp = experiments[0];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-12 animate-fade-in">
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
          <span>B.Tech / BE Computer Engineering • Machine Learning Lab</span>
        </div>
      </div>

      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-8 md:p-12 border border-border/80">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-indigo/15 border border-accent-indigo/30 text-xs font-semibold text-accent-indigo">
            <Binary className="w-3.5 h-3.5" />
            <span>Virtual Lab Experiment</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-txt-primary leading-tight">
            Support Vector Machine (SVM)
          </h1>

          <p className="text-sm md:text-base text-txt-secondary leading-relaxed">
            An interactive laboratory designed for Computer Engineering students to study, formulate, and simulate Support Vector Machines. Explore convex quadratic optimization, maximum margin hyperplanes (2/||w||), soft-margin slack variables (penalty C), and non-linear kernel transformations (Polynomial and Gaussian RBF) in both 2D coordinate space and 3D feature space.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/experiment/${exp.id}`)}
              className="btn-primary text-xs font-semibold px-6 py-3 flex items-center gap-2 rounded-xl shadow-glow-indigo text-sm"
            >
              <span>Enter Virtual Lab Simulation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/experiment/${exp.id}`)}
              className="btn-outline text-xs font-semibold px-5 py-3 rounded-xl text-sm"
            >
              View Theory & Mathematical Derivations
            </button>
          </div>
        </div>

        {/* Technical Specification Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/60">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-accent-indigo flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>SMO QP Solver</span>
            </div>
            <p className="text-[11px] text-txt-muted">Client-Side Sequential Minimal Optimization (60 FPS)</p>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-accent-emerald flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>Convex Optimization</span>
            </div>
            <p className="text-[11px] text-txt-muted">Karush-Kuhn-Tucker (KKT) Complementarity Verification</p>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-accent-cyan flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>3D Feature Space</span>
            </div>
            <p className="text-[11px] text-txt-muted">Rotatable Paraboloid Kernel Projection Visualizer</p>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-accent-amber flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5" />
              <span>Scikit-Learn Bridge</span>
            </div>
            <p className="text-[11px] text-txt-muted">Live Python Code Generator Synced to Sliders</p>
          </div>
        </div>
      </div>

      {/* ─── Pedagogical Lifecycle ────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-widest text-accent-indigo">
            Standard Pedagogy Structure
          </div>
          <h2 className="text-xl font-bold text-txt-primary">
            Experiment Structure & Workflow
          </h2>
          <p className="text-xs text-txt-secondary">
            Following the official Virtual Labs (VLABS) instructional design model:
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-2.5">
          {[
            { num: '01', title: 'Aim', desc: 'Formal problem statement & objectives' },
            { num: '02', title: 'Theory', desc: 'Primal, Dual & KKT derivations via KaTeX' },
            { num: '03', title: 'Pre-Test', desc: 'Prerequisite diagnostic assessment' },
            { num: '04', title: 'Simulation', desc: '2D & 3D real-time interactive lab' },
            { num: '05', title: 'Code', desc: 'Live Scikit-Learn Python export' },
            { num: '06', title: 'Post-Test', desc: 'Evaluative comprehension quiz' },
            { num: '07', title: 'References', desc: 'Classic textbooks & academic papers' },
          ].map((item, i) => (
            <div key={i} className="glass-card p-3.5 space-y-1 border border-border/80 text-center">
              <div className="text-[10px] font-mono font-bold text-accent-indigo">{item.num}</div>
              <div className="text-xs font-bold text-txt-primary">{item.title}</div>
              <div className="text-[10px] text-txt-muted leading-tight">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Experiment Overview Card ─────────────────────────────────────── */}
      <div className="glass-card p-6 border border-border/80 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-indigo/15 border border-accent-indigo/30 flex items-center justify-center shrink-0">
              <Maximize2 className="w-6 h-6 text-accent-indigo" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-accent-indigo/15 text-accent-indigo">
                Laboratory Experiment
              </span>
              <h2 className="text-lg font-bold text-txt-primary mt-1">
                Support Vector Machine (SVM)
              </h2>
              <p className="text-xs text-txt-secondary leading-relaxed mt-1 max-w-2xl">
                {exp.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/experiment/${exp.id}`)}
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5 rounded-lg shrink-0"
          >
            <span>Start Experiment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Core Topics Covered */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/60">
          <div className="p-3 rounded-lg bg-canvas-primary/50 border border-border text-xs space-y-1">
            <div className="font-semibold text-txt-primary flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-indigo" />
              <span>Hard & Soft Margin SVM</span>
            </div>
            <p className="text-[11px] text-txt-muted">
              Margin derivation 2/||w||, slack variables ξᵢ, and regularization parameter C.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-canvas-primary/50 border border-border text-xs space-y-1">
            <div className="font-semibold text-txt-primary flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
              <span>The Kernel Trick (2D to 3D)</span>
            </div>
            <p className="text-[11px] text-txt-muted">
              Linear, Polynomial, and Gaussian RBF kernels with interactive 3D paraboloid feature space.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-canvas-primary/50 border border-border text-xs space-y-1">
            <div className="font-semibold text-txt-primary flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-accent-emerald" />
              <span>Dual Optimization & Sparsity</span>
            </div>
            <p className="text-[11px] text-txt-muted">
              Wolfe dual formulation, KKT conditions, and active support vector identification.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Institutional Course Alignment ───────────────────────────────── */}
      <div className="glass-card p-6 border border-border/80 space-y-3">
        <div className="flex items-center gap-2.5">
          <GraduationCap className="w-5 h-5 text-accent-indigo" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-txt-primary">
            Curricular Alignment & Degree Course Mapping
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-canvas-primary/60 border border-border/70 space-y-1">
            <strong className="text-txt-primary block">B.Tech in Computer Science & Engineering</strong>
            <p className="text-txt-muted">Fulfills Machine Learning Laboratory (PCC-CS 601) syllabus requirements.</p>
          </div>
          <div className="p-3 rounded-xl bg-canvas-primary/60 border border-border/70 space-y-1">
            <strong className="text-txt-primary block">B.Tech in AI & Data Science</strong>
            <p className="text-txt-muted">Covers Supervised Classification, Loss Formulations, and Convex Optimization modules.</p>
          </div>
          <div className="p-3 rounded-xl bg-canvas-primary/60 border border-border/70 space-y-1">
            <strong className="text-txt-primary block">M.Tech / MS by Research in Computer Engineering</strong>
            <p className="text-txt-muted">Provides laboratory simulations for Advanced Pattern Recognition and Kernel Methods.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
