import React, { useState } from 'react';
import {
  Award,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Clock,
  FileText,
  Download,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react';
import { ExamResult, Question } from '../../types';
import { useToast } from '../common/Toast';

interface StudentResultScorecardProps {
  result: ExamResult;
  questions?: Question[];
  onBackToExams: () => void;
}

export const StudentResultScorecard: React.FC<StudentResultScorecardProps> = ({
  result,
  questions = [],
  onBackToExams,
}) => {
  const { showToast } = useToast();
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  const percentage = ((result.totalScore / result.maxMarks) * 100).toFixed(1);

  const toggleSolution = (id: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Descriptive evaluations summary
  const hasDescriptiveEvals =
    result.descriptiveEvaluations && Object.keys(result.descriptiveEvaluations).length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 h-16 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToExams}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Exam Selection</span>
          </button>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-slate-900 block leading-tight">{result.studentName}</span>
          <span className="text-[11px] text-slate-500 font-mono leading-tight">Roll: {result.rollNumber}</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Banner */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase tracking-wider">
                Official CBT Evaluation Complete
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Institutional Result
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{result.examTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Submitted on {new Date(result.submittedAt).toLocaleDateString()} · Time Consumed: {result.timeTakenMinutes} minutes
            </p>
          </div>

          <button
            onClick={() => showToast('Scorecard Downloaded', 'Official candidate PDF report generated', 'success')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors shrink-0 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Download Scorecard PDF</span>
          </button>
        </div>

        {/* Core Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 font-sans block text-xs">Total Score</span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{result.totalScore}</span>
              <span className="text-xs text-slate-400 font-normal">/ {result.maxMarks}</span>
            </div>
            <span className="text-[11px] text-slate-500 font-sans mt-1 block">{percentage}% Aggregate</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 font-sans block text-xs">All-India Percentile</span>
            <div className="text-2xl font-bold text-blue-700 mt-1">{result.percentile}%ile</div>
            <span className="text-[11px] text-emerald-600 font-sans mt-1 block">Institutional Benchmark</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 font-sans block text-xs">Estimated Mock AIR</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">AIR #{result.rank}</div>
            <span className="text-[11px] text-slate-400 font-sans mt-1 block">of {result.totalCandidates.toLocaleString()} Candidates</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-slate-500 font-sans block text-xs">Accuracy Ratio</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">{result.accuracy}%</div>
            <span className="text-[11px] text-slate-500 font-sans mt-1 block">Positive Yield Rate</span>
          </div>
        </div>

        {/* Descriptive Evaluation Notice if applicable */}
        {hasDescriptiveEvals && (
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-indigo-950 font-bold">
              <ShieldCheck className="w-4 h-4 text-indigo-700" />
              <span>Faculty Moderation & Subjective Evaluation Applied</span>
            </div>
            <p className="text-indigo-900">
              Descriptive question evaluations have been reviewed by the examiner committee according to the official marking rubric. Awarded marks have been added to your total score.
            </p>
          </div>
        )}

        {/* Subject-wise Section Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Sectional Subject Scores (P / C / M)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-center">
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
              <span className="text-blue-900 font-sans font-semibold text-xs block">Physics Section</span>
              <span className="text-2xl font-bold text-blue-950 mt-1 block">
                {result.physicsScore} Marks
              </span>
              <span className="text-[11px] text-blue-700 font-sans mt-1 block">Mechanics & Optics</span>
            </div>

            <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100">
              <span className="text-indigo-900 font-sans font-semibold text-xs block">Chemistry Section</span>
              <span className="text-2xl font-bold text-indigo-950 mt-1 block">
                {result.chemistryScore} Marks
              </span>
              <span className="text-[11px] text-indigo-700 font-sans mt-1 block">Inorganic & Physical</span>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <span className="text-emerald-900 font-sans font-semibold text-xs block">Mathematics Section</span>
              <span className="text-2xl font-bold text-emerald-950 mt-1 block">
                {result.mathScore} Marks
              </span>
              <span className="text-[11px] text-emerald-700 font-sans mt-1 block">Calculus & Vectors</span>
            </div>
          </div>
        </div>

        {/* Attempts & Precision Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 font-mono text-xs shadow-2xs">
          <h3 className="text-xs font-bold text-slate-900 font-sans uppercase tracking-wider">
            Attempt Statistics & Answer Distribution
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-sans block text-[11px]">Total Attempted</span>
              <span className="text-base font-bold text-slate-900 mt-1 block">{result.attemptedCount}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-emerald-800 font-sans block text-[11px]">Correct Answers</span>
              <span className="text-base font-bold text-emerald-800 mt-1 block">{result.correctCount}</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
              <span className="text-rose-800 font-sans block text-[11px]">Incorrect Answers</span>
              <span className="text-base font-bold text-rose-800 mt-1 block">{result.incorrectCount}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-sans block text-[11px]">Unanswered</span>
              <span className="text-base font-bold text-slate-700 mt-1 block">{result.unattemptedCount}</span>
            </div>
          </div>
        </div>

        {/* Verified Solution Excerpts from Institutional Item Bank */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Question Derivations & Verified Answer Keys
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Official step-by-step academic solutions released for candidate post-exam review
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
              Verified Keys Released
            </span>
          </div>

          <div className="space-y-3">
            {questions.slice(0, 4).map((q, idx) => {
              const isExpanded = !!expandedSolutions[q.id];

              return (
                <div key={q.id} className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">Q{idx + 1}.</span>
                      <span className="font-mono text-slate-600 font-semibold">{q.code}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-700">{q.subject}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 truncate max-w-xs">{q.topic}</span>
                    </div>

                    <button
                      onClick={() => toggleSolution(q.id)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900"
                    >
                      <span>{isExpanded ? 'Hide Derivation' : 'View Derivation'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <p className="text-slate-800 font-medium text-[11px] leading-relaxed">
                    {q.questionText}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] font-mono">
                    <span className="text-slate-500 font-sans">Official Verified Answer:</span>
                    <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {q.correctAnswer} {q.unit || ''}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500 font-sans">Marks: +{q.marks}/-{q.negativeMarks}</span>
                  </div>

                  {isExpanded && (
                    <div className="p-3 bg-white rounded border border-blue-100 text-slate-700 space-y-1 mt-2 text-[11px] animate-in fade-in duration-150">
                      <span className="font-bold text-blue-950 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        Step-by-Step Mathematical Derivation:
                      </span>
                      <p className="leading-relaxed font-sans text-slate-700">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
