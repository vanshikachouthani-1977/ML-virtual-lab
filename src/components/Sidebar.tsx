import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Target,
  BookOpen,
  ClipboardCheck,
  Play,
  Code2,
  Award,
  Library,
  Home,
  ChevronRight,
  FlaskConical,
  Maximize2,
} from 'lucide-react';
import type { ExperimentConfig, Tab } from '../types';

const TAB_ICONS: Record<Tab, React.ReactNode> = {
  aim: <Target className="w-4 h-4" />,
  theory: <BookOpen className="w-4 h-4" />,
  pretest: <ClipboardCheck className="w-4 h-4" />,
  simulation: <Play className="w-4 h-4" />,
  code: <Code2 className="w-4 h-4" />,
  posttest: <Award className="w-4 h-4" />,
  references: <Library className="w-4 h-4" />,
};

const TAB_LABELS: Record<Tab, string> = {
  aim: 'Aim & Overview',
  theory: 'Theory & Derivations',
  pretest: 'Pre-Test',
  simulation: 'Interactive Lab',
  code: 'Scikit-Learn Code',
  posttest: 'Post-Test',
  references: 'References',
};

interface SidebarProps {
  experiments: ExperimentConfig[];
  activeExperimentId?: string;
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

export default function Sidebar({
  experiments,
  activeExperimentId,
  activeTab,
  onTabChange,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '';

  const exp = experiments[0];
  const isExpActive = location.pathname.startsWith('/experiment') || !isHome;

  const tabs: Tab[] = ['aim', 'theory', 'pretest', 'simulation', 'code', 'posttest', 'references'];

  return (
    <div className="flex flex-col h-full py-4">
      {/* Home link */}
      <div className="px-3 mb-4">
        <button
          onClick={() => navigate('/')}
          className={`sidebar-item w-full ${isHome ? 'active' : ''}`}
        >
          <Home className="w-4 h-4" />
          <span>Laboratory Home</span>
        </button>
      </div>

      {/* Experiment Section Header */}
      <div className="px-3 mb-2">
        <div className="flex items-center gap-2 px-3 py-1">
          <FlaskConical className="w-3.5 h-3.5 text-txt-muted" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-txt-muted">
            Experiment Module
          </span>
        </div>
      </div>

      {/* Single Experiment Item */}
      <div className="px-3 space-y-1 flex-1 overflow-y-auto">
        <div>
          <button
            onClick={() => navigate(`/experiment/${exp.id}`)}
            className={`sidebar-item w-full group ${isExpActive ? 'active' : ''}`}
          >
            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0">
              <Maximize2 className="w-4 h-4 text-accent-indigo" />
            </div>
            <span className="flex-1 text-left truncate text-xs font-semibold">{exp.shortTitle}</span>
            <ChevronRight className="w-3.5 h-3.5 text-accent-indigo opacity-60" />
          </button>

          {/* Sub-tabs for the single experiment */}
          <div className="ml-5 mt-1 mb-2 space-y-0.5 border-l border-border/80 pl-2 animate-slide-in">
            {tabs.map((tab) => {
              const isTabSelected = isExpActive && activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    if (location.pathname !== `/experiment/${exp.id}`) {
                      navigate(`/experiment/${exp.id}`);
                    }
                    onTabChange?.(tab);
                  }}
                  className={`sidebar-item w-full text-xs py-1.5 ${
                    isTabSelected ? 'active font-bold' : ''
                  }`}
                >
                  {TAB_ICONS[tab]}
                  <span>{TAB_LABELS[tab]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Institutional Footer */}
      <div className="px-4 pt-4 mt-auto border-t border-border">
        <div className="text-[10px] text-txt-muted leading-relaxed">
          <p className="font-bold text-txt-secondary uppercase tracking-wider">Department of Computer Engineering</p>
          <p className="mt-0.5">Machine Learning Virtual Lab</p>
          <p className="mt-1 text-[9px] text-txt-muted/80">Support Vector Machine (SVM)</p>
        </div>
      </div>
    </div>
  );
}
