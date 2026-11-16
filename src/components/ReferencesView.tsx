import React from 'react';
import type { ReferenceItem } from '../types';
import { ExternalLink, BookOpen, FileText } from 'lucide-react';

interface ReferencesViewProps {
  references: ReferenceItem[];
}

export default function ReferencesView({ references }: ReferencesViewProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-accent-indigo" />
        <h2 className="text-lg font-bold text-txt-primary">References & Further Reading</h2>
      </div>

      {references.map((ref, i) => (
        <div key={i} className="glass-card p-5 glass-card-hover">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-indigo/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-accent-indigo" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-txt-primary mb-1">
                {ref.title}
              </h3>
              {ref.authors && (
                <p className="text-xs text-txt-muted mb-1 italic">{ref.authors}</p>
              )}
              <p className="text-xs text-txt-secondary leading-relaxed">{ref.description}</p>
              {ref.url && (
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-xs text-accent-indigo hover:text-accent-indigo-light transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Resource
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Attribution */}
      <div className="mt-8 p-5 rounded-xl bg-canvas-surface/50 border border-border">
        <p className="text-xs text-txt-muted leading-relaxed">
          <strong className="text-txt-secondary">Virtual Labs Project</strong> — An initiative of the
          Ministry of Education (MoE), Government of India, under the National Mission on Education
          through Information and Communication Technology (NMEICT). The Virtual Labs project aims
          to provide remote-access to labs in various disciplines of Science and Engineering.
        </p>
      </div>
    </div>
  );
}
