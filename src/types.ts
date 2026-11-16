// ─── Kernel & SVM Types ──────────────────────────────────────────────────────

export type KernelType = 'linear' | 'polynomial' | 'rbf';

export interface Point {
  x: number;
  y: number;
  label: 1 | -1;
}

export interface SVMParams {
  C: number;
  kernelType: KernelType;
  gamma: number;
  degree: number;
  coef0: number;
  epsilon: number; // for SVR
}

export interface SVMResult {
  alphas: number[];
  bias: number;
  supportVectorIndices: number[];
  weights: number[] | null;
  accuracy: number;
  marginWidth: number;
  trainingTimeMs: number;
  converged: boolean;
  iterations: number;
}

export interface SVMModel {
  result: SVMResult;
  params: SVMParams;
  points: Point[];
  predict: (x: number, y: number) => number;
  decisionFunction: (x: number, y: number) => number;
}

// ─── Experiment & Curriculum Types ───────────────────────────────────────────

export interface TheorySection {
  title: string;
  content: string; // formatted text with KaTeX delimiters
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type DatasetPresetFn = () => Point[];

export interface DatasetPreset {
  name: string;
  iconName: string; // Lucide icon identifier
  generate: DatasetPresetFn;
}

export type ExperimentFeature =
  | 'margin'
  | 'slack'
  | 'kernel-switch'
  | 'contour'
  | '3d-view'
  | 'multi-class'
  | 'regression'
  | 'c-slider'
  | 'gamma-slider'
  | 'degree-slider'
  | 'epsilon-slider';

export interface GuidedTask {
  id: number;
  title: string;
  action: string;
  observation: string;
}

export interface ExperimentConfig {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  iconName: string;
  color: string;
  theory: TheorySection[];
  simulationInstructions: {
    objective: string;
    userActions: string[];
    visualElements: { name: string; visual: string; meaning: string }[];
    guidedTasks: GuidedTask[];
  };
  preTest: QuizQuestion[];
  postTest: QuizQuestion[];
  defaultParams: SVMParams;
  datasetPresets: DatasetPreset[];
  features: ExperimentFeature[];
  codeTemplate: string;
  references: ReferenceItem[];
}

export interface ReferenceItem {
  title: string;
  authors?: string;
  url?: string;
  description: string;
}

export type Tab = 'aim' | 'theory' | 'pretest' | 'simulation' | 'code' | 'posttest' | 'references';

export const TAB_LIST: { id: Tab; label: string; iconName: string }[] = [
  { id: 'aim', label: 'Aim & Overview', iconName: 'Target' },
  { id: 'theory', label: 'Theory & Derivations', iconName: 'BookOpen' },
  { id: 'pretest', label: 'Pre-Test', iconName: 'ClipboardCheck' },
  { id: 'simulation', label: 'Interactive Lab', iconName: 'Play' },
  { id: 'code', label: 'Scikit-Learn Code', iconName: 'Code' },
  { id: 'posttest', label: 'Post-Test', iconName: 'Award' },
  { id: 'references', label: 'References', iconName: 'Library' },
];
