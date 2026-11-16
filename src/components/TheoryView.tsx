import React, { useMemo } from 'react';
import katex from 'katex';
import type { TheorySection } from '../types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TheoryViewProps {
  sections: TheorySection[];
}

/**
 * Render markdown-like text with KaTeX math delimiters.
 * Supports:
 *   - Display math: $$ ... $$
 *   - Inline math: $ ... $
 *   - Headers: ## and ###
 *   - Bold: **text**
 *   - Bullet lists: - item
 *   - Code: `code`
 */
function renderContent(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let inDisplayMath = false;
  let mathBuffer = '';

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-1.5 my-3 pl-4">
          {listItems.map((li, i) => (
            <li key={i} className="text-sm text-txt-secondary leading-relaxed flex items-start gap-2">
              <span className="text-accent-indigo mt-1.5 text-[6px]">●</span>
              <span>{li}</span>
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Display math block
    if (trimmed === '$$') {
      if (inDisplayMath) {
        // End of display math
        try {
          const html = katex.renderToString(mathBuffer.trim(), {
            displayMode: true,
            throwOnError: false,
            trust: true,
          });
          flushList();
          elements.push(
            <div
              key={`math-${i}`}
              className="my-4 overflow-x-auto py-3 px-4 rounded-lg bg-canvas-primary/50 border border-border"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          elements.push(
            <pre key={`math-err-${i}`} className="text-xs text-accent-rose">
              {mathBuffer}
            </pre>
          );
        }
        mathBuffer = '';
        inDisplayMath = false;
      } else {
        flushList();
        inDisplayMath = true;
      }
      continue;
    }

    if (inDisplayMath) {
      mathBuffer += line + '\n';
      continue;
    }

    // Empty line
    if (trimmed === '') {
      flushList();
      continue;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h4-${i}`} className="text-sm font-semibold text-txt-primary mt-5 mb-2">
          {renderInline(trimmed.slice(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-bold text-txt-primary mt-6 mb-3 flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-accent-indigo" />
          {renderInline(trimmed.slice(3))}
        </h3>
      );
      continue;
    }

    // List items
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      listItems.push(renderInline(trimmed.slice(2)));
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s/, '');
      listItems.push(renderInline(content));
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="text-sm text-txt-secondary leading-relaxed my-2">
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList();
  return elements;
}

/** Render inline elements: bold, code, inline math */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // Regex to match inline math $...$, bold **...**, and code `...`
  const regex = /(\$[^$]+\$)|(\*\*[^*]+\*\*)|(`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Push text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // Inline math
      const mathStr = match[1].slice(1, -1);
      try {
        const html = katex.renderToString(mathStr, {
          displayMode: false,
          throwOnError: false,
        });
        parts.push(
          <span key={match.index} dangerouslySetInnerHTML={{ __html: html }} />
        );
      } catch {
        parts.push(<code key={match.index} className="text-accent-rose">{mathStr}</code>);
      }
    } else if (match[2]) {
      // Bold
      parts.push(
        <strong key={match.index} className="font-semibold text-txt-primary">
          {match[2].slice(2, -2)}
        </strong>
      );
    } else if (match[3]) {
      // Code
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-canvas-elevated text-accent-cyan text-xs font-mono"
        >
          {match[3].slice(1, -1)}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export default function TheoryView({ sections }: TheoryViewProps) {
  const [expandedSections, setExpandedSections] = React.useState<Set<number>>(
    () => new Set(sections.map((_, i) => i))
  );

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {sections.map((section, i) => {
        const isExpanded = expandedSections.has(i);
        return (
          <div
            key={i}
            className="glass-card overflow-hidden animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <button
              onClick={() => toggleSection(i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-canvas-elevated/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md bg-accent-indigo/15 flex items-center justify-center text-[10px] font-bold text-accent-indigo">
                  {i + 1}
                </div>
                <h3 className="text-sm font-semibold text-txt-primary">{section.title}</h3>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-txt-muted" />
              ) : (
                <ChevronRight className="w-4 h-4 text-txt-muted" />
              )}
            </button>
            {isExpanded && (
              <div className="px-5 pb-5 border-t border-border/50">
                <div className="pt-3">{renderContent(section.content)}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
