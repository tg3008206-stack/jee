import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Download,
  ArrowUpRight,
  Filter,
  Layers,
  HelpCircle,
  FileCheck2,
  Clock,
  Sparkles,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { ExamResult, Exam, Question, DemoUser } from '../../types';
import { useToast } from '../common/Toast';

interface ExaminerReportsProps {
  exams: Exam[];
  results: ExamResult[];
  questions: Question[];
  currentUser: DemoUser;
}

export const ExaminerReports: React.FC<ExaminerReportsProps> = ({
  exams,
  results,
  questions,
  currentUser,
}) => {
  const { showToast } = useToast();

  // 1. Filter examinations assigned to this Examiner
  const assignedExams = useMemo(() => {
    return exams.filter((e) => {
      const isAssignedByName = e.assignedExaminer?.toLowerCase().includes(currentUser.name.toLowerCase());
      const isAssignedById = currentUser.assignedExams?.includes(e.id);
      return isAssignedByName || isAssignedById;
    });
  }, [exams, currentUser]);

  const [selectedExamId, setSelectedExamId] = useState<string>('All');

  // 2. Filter results for assigned examinations
  const relevantResults = useMemo(() => {
    if (selectedExamId === 'All') {
      const assignedIds = new Set(assignedExams.map((e) => e.id));
      return results.filter((r) => assignedIds.has(r.examId));
    }
    return results.filter((r) => r.examId === selectedExamId);
  }, [results, assignedExams, selectedExamId]);

  // Aggregate metrics
  const totalSubmissions = relevantResults.length;

  const averageScore = useMemo(() => {
    if (totalSubmissions === 0) return 0;
    const sum = relevantResults.reduce((acc, r) => acc + r.totalScore, 0);
    return Math.round(sum / totalSubmissions);
  }, [relevantResults, totalSubmissions]);

  const highestScore = useMemo(() => {
    if (totalSubmissions === 0) return 0;
    return Math.max(...relevantResults.map((r) => r.totalScore));
  }, [relevantResults, totalSubmissions]);

  const lowestScore = useMemo(() => {
    if (totalSubmissions === 0) return 0;
    return Math.min(...relevantResults.map((r) => r.totalScore));
  }, [relevantResults, totalSubmissions]);

  const avgPhysics = useMemo(() => {
    if (totalSubmissions === 0) return 0;
    const sum = relevantResults.reduce((acc, r) => acc + (r.physicsScore || 0), 0);
    return Math.round(sum / totalSubmissions);
  }, [relevantResults, totalSubmissions]);

  const avgChemistry = useMemo(() => {
    if (totalSubmissions === 0) return 0;
    const sum = relevantResults.reduce((acc, r) => acc + (r.chemistryScore || 0), 0);
    return Math.round(sum / totalSubmissions);
  }, [relevantResults, totalSubmissions]);

  const avgMath = useMemo(() => {
    if (totalSubmissions === 0) return 0;
    const sum = relevantResults.reduce((acc, r) => acc + (r.mathScore || 0), 0);
    return Math.round(sum / totalSubmissions);
  }, [relevantResults, totalSubmissions]);

  const pendingModerationCount = useMemo(() => {
    return relevantResults.filter((r) => r.resultStatus === 'Pending Evaluation').length;
  }, [relevantResults]);

  // Item-level performance analysis
  const itemAnalysis = useMemo(() => {
    return questions.map((q) => {
      let attempts = 0;
      let correct = 0;
      let incorrect = 0;
      let unattempted = 0;

      relevantResults.forEach((r) => {
        const detail = r.questionEvaluations?.find((e) => e.questionId === q.id);
        if (detail) {
          if (detail.isAttempted) {
            attempts++;
            if (detail.isCorrect) correct++;
            else incorrect++;
          } else {
            unattempted++;
          }
        } else {
          // If no specific evaluation detail, simulate sample baseline
          attempts++;
          correct++;
        }
      });

      const effectiveAttempts = Math.max(1, attempts);
      const correctRate = Math.round((correct / effectiveAttempts) * 100);
      const difficultyIndex = Number((1 - correct / effectiveAttempts).toFixed(2));

      return {
        question: q,
        attempts,
        correct,
        incorrect,
        unattempted,
        correctRate,
        difficultyIndex,
      };
    });
  }, [questions, relevantResults]);

  // Frequently missed questions
  const frequentlyMissed = useMemo(() => {
    return [...itemAnalysis]
      .filter((item) => item.attempts > 0)
      .sort((a, b) => a.correctRate - b.correctRate)
      .slice(0, 3);
  }, [itemAnalysis]);

  const handleExportAnalysis = () => {
    showToast(
      'Psychometric Item Analysis Exported',
      'Report saved as schlar_item_difficulty_report.pdf',
      'success'
    );
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider">
              Faculty Psychometrics
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Examiner: {currentUser.name}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Academic Performance & Item Difficulty Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Psychometric calibration, question discrimination indices, and student error trends across your assigned examination papers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportAnalysis}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Item Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Scope / Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Assigned Examination Filter:</span>
        </div>

        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-600 w-full sm:w-auto"
        >
          <option value="All">All Assigned Tests ({assignedExams.length} examinations)</option>
          {assignedExams.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.title} ({ex.category})
            </option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Evaluated Submissions</span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {totalSubmissions}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across assigned candidate batches
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Average Candidate Score</span>
          <div className="text-2xl font-bold text-indigo-700 font-mono tabular-nums mt-1">
            {averageScore} <span className="text-xs text-slate-400 font-normal">/ 300</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            High: {highestScore} · Low: {lowestScore}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Item Discrimination Index</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
            0.46
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">
            High ability vs low ability separation
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Descriptive Moderation</span>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1">
            {pendingModerationCount} Pending
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {pendingModerationCount === 0 ? 'All rubrics evaluated' : 'Awaiting manual scoring'}
          </div>
        </div>
      </div>

      {/* Subject-wise Performance Comparison */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Subject-wise Average Candidate Yield
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Comparison across Physics, Chemistry, and Mathematics
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Target Marks: 100/subject</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
            <span className="text-xs font-sans font-bold text-blue-900 block">Physics Average</span>
            <span className="text-2xl font-bold text-blue-950 mt-1 block">{avgPhysics} / 100</span>
            <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, avgPhysics)}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200">
            <span className="text-xs font-sans font-bold text-indigo-900 block">Chemistry Average</span>
            <span className="text-2xl font-bold text-indigo-950 mt-1 block">{avgChemistry} / 100</span>
            <div className="w-full bg-indigo-200 rounded-full h-1.5 mt-2">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, avgChemistry)}%` }} />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-xs font-sans font-bold text-emerald-900 block">Mathematics Average</span>
            <span className="text-2xl font-bold text-emerald-950 mt-1 block">{avgMath} / 100</span>
            <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-2">
              <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, avgMath)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Missed Questions Callout Banner */}
      {frequentlyMissed.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>High-Error Concept Focus (Most Frequently Missed Questions)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {frequentlyMissed.map((item, idx) => (
              <div key={item.question.id} className="p-3 bg-white rounded-lg border border-amber-200 space-y-1">
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-slate-900">{item.question.code}</span>
                  <span className="text-rose-700 font-bold text-[11px]">
                    {item.correctRate}% Correct
                  </span>
                </div>
                <p className="text-slate-600 font-semibold truncate">{item.question.topic}</p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Diff Index: {item.difficultyIndex} · {item.question.subject}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Item Calibration Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Question-Level Correctness & Item Calibration
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {itemAnalysis.length} Items Calibrated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Item Code & Subject</th>
                <th className="py-3 px-4">Curriculum Topic</th>
                <th className="py-3 px-4">Type & Difficulty</th>
                <th className="py-3 px-4">Accuracy / Correct Rate</th>
                <th className="py-3 px-4">Difficulty Index</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itemAnalysis.map((item) => (
                <tr key={item.question.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {item.question.code}
                    </span>
                    <span className="ml-2 font-semibold text-slate-700">
                      {item.question.subject}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                    {item.question.topic}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        item.question.difficulty === 'Difficult'
                          ? 'text-rose-700 bg-rose-50'
                          : item.question.difficulty === 'Moderate'
                          ? 'text-amber-700 bg-amber-50'
                          : 'text-emerald-700 bg-emerald-50'
                      }`}
                    >
                      {item.question.difficulty}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.correctRate}%</span>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${item.correctRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {item.difficultyIndex}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Calibrated
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
