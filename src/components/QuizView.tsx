import React, { useState, useCallback } from 'react';
import katex from 'katex';
import type { QuizQuestion } from '../types';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy } from 'lucide-react';

interface QuizViewProps {
  title: string;
  questions: QuizQuestion[];
}

function renderMathInText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\$([^$]+)\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    try {
      const html = katex.renderToString(match[1], { displayMode: false, throwOnError: false });
      parts.push(<span key={match.index} dangerouslySetInnerHTML={{ __html: html }} />);
    } catch {
      parts.push(<code key={match.index}>{match[1]}</code>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts}</>;
}

export default function QuizView({ title, questions }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [isComplete, setIsComplete] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelect = useCallback((optionIdx: number) => {
    if (showResult) return;
    setSelectedAnswer(optionIdx);
  }, [showResult]);

  const handleSubmit = useCallback(() => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedAnswer;
    setAnswers(newAnswers);
    if (selectedAnswer === currentQ.correctIndex) {
      setScore((s) => s + 1);
    }
  }, [selectedAnswer, currentQ, currentIndex, answers]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, questions.length]);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers(new Array(questions.length).fill(null));
    setIsComplete(false);
  }, [questions.length]);

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const isPass = percentage >= 60;
    return (
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8 text-center animate-scale-in">
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
            isPass ? 'bg-accent-emerald/15' : 'bg-accent-amber/15'
          }`}>
            <Trophy className={`w-8 h-8 ${isPass ? 'text-accent-emerald' : 'text-accent-amber'}`} />
          </div>
          <h2 className="text-xl font-bold text-txt-primary mb-2">{title} Complete!</h2>
          <p className="text-3xl font-bold font-mono mb-1">
            <span className={isPass ? 'text-accent-emerald' : 'text-accent-amber'}>
              {score}
            </span>
            <span className="text-txt-muted">/{questions.length}</span>
          </p>
          <p className="text-sm text-txt-secondary mb-6">
            {percentage}% — {isPass ? 'Great work! You passed.' : 'Keep studying, you can do better!'}
          </p>

          {/* Answer summary */}
          <div className="flex justify-center gap-2 mb-6">
            {answers.map((ans, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  ans === questions[i].correctIndex
                    ? 'bg-accent-emerald/15 text-accent-emerald'
                    : 'bg-accent-rose/15 text-accent-rose'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          <button onClick={handleReset} className="btn-primary inline-flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Retry Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-txt-muted font-medium">{title}</span>
          <span className="text-xs text-txt-secondary font-mono">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>
        <div className="h-1 bg-canvas-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-indigo rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="glass-card p-6 animate-fade-in" key={currentIndex}>
        <div className="flex items-start gap-3 mb-6">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-accent-indigo/15 flex items-center justify-center text-sm font-bold text-accent-indigo">
            {currentIndex + 1}
          </div>
          <p className="text-sm font-medium text-txt-primary leading-relaxed pt-1">
            {renderMathInText(currentQ.question)}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2 mb-6">
          {currentQ.options.map((option, oi) => {
            let stateClass = '';
            if (showResult) {
              if (oi === currentQ.correctIndex) stateClass = 'correct';
              else if (oi === selectedAnswer) stateClass = 'incorrect';
            } else if (oi === selectedAnswer) {
              stateClass = 'selected';
            }

            return (
              <button
                key={oi}
                onClick={() => handleSelect(oi)}
                className={`quiz-option w-full text-left ${stateClass}`}
                disabled={showResult}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                  stateClass === 'selected' ? 'border-accent-indigo bg-accent-indigo text-white' :
                  stateClass === 'correct' ? 'border-accent-emerald bg-accent-emerald text-white' :
                  stateClass === 'incorrect' ? 'border-accent-rose bg-accent-rose text-white' :
                  'border-border text-txt-muted'
                }`}>
                  {String.fromCharCode(65 + oi)}
                </div>
                <span className="text-sm text-txt-secondary flex-1">
                  {renderMathInText(option)}
                </span>
                {showResult && oi === currentQ.correctIndex && (
                  <CheckCircle2 className="w-5 h-5 text-accent-emerald shrink-0" />
                )}
                {showResult && oi === selectedAnswer && oi !== currentQ.correctIndex && (
                  <XCircle className="w-5 h-5 text-accent-rose shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showResult && (
          <div className={`p-4 rounded-xl text-sm leading-relaxed animate-fade-in ${
            selectedAnswer === currentQ.correctIndex
              ? 'bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald'
              : 'bg-accent-rose/10 border border-accent-rose/20 text-txt-secondary'
          }`}>
            <p className="font-semibold mb-1">
              {selectedAnswer === currentQ.correctIndex ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            <p>{renderMathInText(currentQ.explanation)}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end mt-6 gap-3">
          {!showResult ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className={`btn-primary ${selectedAnswer === null ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              Submit Answer
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary flex items-center gap-2">
              {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
