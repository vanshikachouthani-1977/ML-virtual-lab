import React, { type ReactNode } from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Zap } from 'lucide-react';

interface LayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  title?: string;
  score?: number | null;
}

export default function Layout({ sidebar, children, title, score }: LayoutProps) {
  const { isDark, toggle } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-canvas-primary bg-noise">
      {/* ─── Top Bar ──────────────────────────────────────────────────────── */}
      <header className="h-14 flex items-center justify-between px-5 border-b border-border bg-canvas-secondary/80 backdrop-blur-xl z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-indigo/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent-indigo" />
            </div>
            <span className="text-base font-bold tracking-tight text-txt-primary">
              HyperPlane<span className="text-accent-indigo">Studio</span>
            </span>
          </div>
          {title && (
            <>
              <span className="text-txt-muted mx-1">/</span>
              <span className="text-sm font-medium text-txt-secondary truncate max-w-[300px]">
                {title}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {score !== null && score !== undefined && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent-emerald/10 border border-accent-emerald/20">
              <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse-slow" />
              <span className="text-xs font-semibold text-accent-emerald">
                Score: {score}%
              </span>
            </div>
          )}
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-txt-secondary hover:text-txt-primary hover:bg-canvas-elevated transition-all duration-200"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ─── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 border-r border-border bg-canvas-secondary/50 backdrop-blur-sm overflow-y-auto">
          {sidebar}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
