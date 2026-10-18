import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  CheckCircle,
  Clock,
  Eye,
  AlertCircle,
  FileText,
  Award,
  CheckCircle2,
  Edit3,
  Save,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { ExamResult, Question } from '../../types';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface ExaminerSubmissionsProps {
  results: ExamResult[];
  questions: Question[];
  onUpdateResult?: (updatedResult: ExamResult) => void;
}

export const ExaminerSubmissions: React.FC<ExaminerSubmissionsProps> = ({
  results,
  questions,
  onUpdateResult,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<ExamResult | null>(null);

  // Evaluation Form State for Descriptive Questions
  const [evalMarks, setEvalMarks] = useState<number>(4);
  const [evalFeedback, setEvalFeedback] = useState<string>(
    'Balanced cell equation accurate. Clear thermodynamic reasoning provided.'
  );

  const filtered = results.filter(
    (r) =>
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.examTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveDescriptiveEvaluation = (result: ExamResult) => {
    const prevEval = result.descriptiveEvaluations?.['q-chm-05'];
    const prevAwarded = prevEval ? prevEval.awardedMarks : 0;
    const scoreDiff = evalMarks - prevAwarded;

    const updatedResult: ExamResult = {
      ...result,
      totalScore: Math.min(result.maxMarks, Math.max(0, result.totalScore + scoreDiff)),
      chemistryScore: Math.max(0, result.chemistryScore + scoreDiff),
      pendingEvaluationCount: 0,
      resultStatus: 'Final',
      descriptiveEvaluations: {
        ...(result.descriptiveEvaluations || {}),
        'q-chm-05': {
          awardedMarks: evalMarks,
          maxMarks: 5,
          feedback: evalFeedback,
          evaluatedAt: 'Just now',
          evaluatedBy: 'Prof. Rajesh Kulkarni',
        },
      },
    };

    if (onUpdateResult) {
      onUpdateResult(updatedResult);
    }
    setSelectedSubmission(updatedResult);
    showToast(
      'Descriptive Evaluation Saved',
      `Awarded ${evalMarks}/5 marks to ${result.studentName}. Total score updated to ${updatedResult.totalScore}.`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              Evaluation & Moderation
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Auto-Graded & Subjective Evaluation
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">Candidate Submission Evaluation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit candidate response scripts, verify auto-graded numerical responses, and score descriptive chemistry/math problems against institutional rubrics.
          </p>
        </div>
        <button
          onClick={() =>
            showToast('Batch Evaluation Verified', 'All candidate responses verified against official keys', 'success')
          }
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors shrink-0 shadow-2xs"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Re-Evaluate All Submissions</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name, roll no, exam..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white"
            />
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {filtered.length} submissions recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Candidate & Roll</th>
                <th className="py-3 px-4">Examination</th>
                <th className="py-3 px-4">Score / Max</th>
                <th className="py-3 px-4">Attempted / Correct</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Time Taken</th>
                <th className="py-3 px-4 text-right">Audit & Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{sub.studentName}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{sub.rollNumber}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                    {sub.examTitle}
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums">
                    <span className="font-bold text-slate-900">{sub.totalScore}</span>
                    <span className="text-slate-400"> / {sub.maxMarks}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700">
                    {sub.attemptedCount} att. (<span className="text-emerald-700 font-semibold">{sub.correctCount} correct</span>)
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-blue-700 tabular-nums">
                    {sub.accuracy}%
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 tabular-nums">
                    {sub.timeTakenMinutes} mins
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedSubmission(sub);
                        const existingEval = sub.descriptiveEvaluations?.['q-chm-05'];
                        if (existingEval) {
                          setEvalMarks(existingEval.awardedMarks);
                          setEvalFeedback(existingEval.feedback);
                        } else {
                          setEvalMarks(4);
                          setEvalFeedback('Accurate cell derivation and clear thermodynamic justification.');
                        }
                      }}
                      className="px-3 py-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 text-xs font-medium transition-colors"
                    >
                      Audit Script
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Script Audit and Descriptive Evaluation Modal */}
      {selectedSubmission && (
        <Modal
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          title={`Candidate Script Audit: ${selectedSubmission.studentName}`}
          subtitle={`Roll: ${selectedSubmission.rollNumber} · ${selectedSubmission.examTitle}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5 text-xs">
            {/* Metric Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-center font-mono">
              <div>
                <span className="text-slate-500 font-sans block text-[11px]">Total Score</span>
                <span className="text-lg font-bold text-slate-900">
                  {selectedSubmission.totalScore} / {selectedSubmission.maxMarks}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[11px]">Accuracy</span>
                <span className="text-lg font-bold text-emerald-700">
                  {selectedSubmission.accuracy}%
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[11px]">Time Spent</span>
                <span className="text-lg font-bold text-indigo-700">
                  {selectedSubmission.timeTakenMinutes}m
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[11px]">Rank / Percentile</span>
                <span className="text-lg font-bold text-amber-700">
                  #{selectedSubmission.rank} ({selectedSubmission.percentile}%)
                </span>
              </div>
            </div>

            {/* Subject Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 text-center font-mono">
                <span className="text-blue-900 font-sans block text-[11px] font-semibold">Physics Score</span>
                <span className="text-base font-bold text-blue-900">{selectedSubmission.physicsScore}</span>
              </div>
              <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-200 text-center font-mono">
                <span className="text-indigo-900 font-sans block text-[11px] font-semibold">Chemistry Score</span>
                <span className="text-base font-bold text-indigo-900">{selectedSubmission.chemistryScore}</span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 text-center font-mono">
                <span className="text-emerald-900 font-sans block text-[11px] font-semibold">Mathematics Score</span>
                <span className="text-base font-bold text-emerald-900">{selectedSubmission.mathScore}</span>
              </div>
            </div>

            {/* Descriptive Answer Evaluation Section */}
            <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-700" />
                  <span className="font-bold text-slate-900 text-xs">
                    Subjective / Descriptive Answer Evaluation
                  </span>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  CHM-ELC-220 (Electrochemistry)
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                <div className="text-[11px] text-slate-500 font-medium">Candidate's Submitted Derivation:</div>
                <p className="font-mono text-slate-800 text-[11px] bg-slate-50 p-2.5 rounded">
                  "Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s). Nernst equation: E = E° - (0.0591 / 2) * log10([Zn²⁺]/[Cu²⁺]). Since C1 = [Zn²⁺], increasing C1 increases the log quotient, which increases the subtraction term from E°, thereby decreasing the cell EMF."
                </p>
                <div className="text-[11px] text-emerald-700 font-medium">
                  Official Rubric: 2 marks for balanced redox; 2 marks for logarithmic Nernst expression; 1 mark for physical deduction of EMF decrease.
                </div>
              </div>

              {/* Scoring Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Awarded Marks (out of 5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.5"
                    value={evalMarks}
                    onChange={(e) => setEvalMarks(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono font-bold text-slate-900 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Faculty Evaluation Remarks</label>
                  <input
                    type="text"
                    value={evalFeedback}
                    onChange={(e) => setEvalFeedback(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                    placeholder="Enter rubric-based feedback"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleSaveDescriptiveEvaluation(selectedSubmission)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update & Save Score</span>
                </button>
              </div>
            </div>

            {/* Verification Sign-off */}
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
              <h4 className="font-semibold text-slate-900 text-[11px]">Faculty Quality Audit Certification</h4>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Response recorded under secure browser lock. Objective items verified with NTA master answer key. All challenge windows concluded.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
