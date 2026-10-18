import React, { useState } from 'react';
import { Award, Download, Search, TrendingUp, CheckCircle, Eye, ArrowUpRight, Filter, Info, FileSpreadsheet } from 'lucide-react';
import { ExamResult, Exam } from '../../types';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface AdminResultsProps {
  results: ExamResult[];
  exams: Exam[];
}

export const AdminResults: React.FC<AdminResultsProps> = ({ results, exams }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('All');
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  const filtered = results.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.examTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = selectedExamFilter === 'All' || r.examId === selectedExamFilter || r.examTitle.includes(selectedExamFilter);
    return matchesSearch && matchesExam;
  });

  const handleExportCSV = () => {
    const headers = 'Roll No,Student Name,Exam,Score,Max Marks,Percentage,Percentile,AIR,Correct,Incorrect,Unanswered\n';
    const rows = filtered
      .map(
        (r) =>
          `"${r.rollNumber}","${r.studentName}","${r.examTitle}",${r.totalScore},${r.maxMarks},${(
            (r.totalScore / r.maxMarks) *
            100
          ).toFixed(1)}%,${r.percentile},${r.rank},${r.correctCount},${r.incorrectCount},${r.unattemptedCount}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schlar_results_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Scorecards Exported', 'Downloaded CSV summary to your device', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Institutional Result Registry & Scorecards</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified candidate scores, subject sectional breakdowns, and all-India percentile evaluations
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Export Score Report (.CSV)</span>
        </button>
      </div>

      {/* Demo Notice Disclaimer */}
      <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Demonstration Result Data:</strong> The scorecards shown below represent simulated test submissions and verified evaluations across candidate batches. In this frontend demonstration, newly submitted tests from the Student interface automatically sync into this table.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidate name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 shrink-0">Filter Examination:</span>
          <select
            value={selectedExamFilter}
            onChange={(e) => setSelectedExamFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="All">All Tests ({results.length} submissions)</option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Rank & Candidate</th>
                <th className="py-3 px-4">Examination</th>
                <th className="py-3 px-4">Submission Status</th>
                <th className="py-3 px-4">Score & Percentage</th>
                <th className="py-3 px-4">Percentile</th>
                <th className="py-3 px-4">Attempts (C / I / U)</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((res) => {
                const percentage = ((res.totalScore / res.maxMarks) * 100).toFixed(1);

                return (
                  <tr key={res.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono font-bold flex items-center justify-center text-[11px] shrink-0">
                          #{res.rank}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900">{res.studentName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{res.rollNumber}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                      {res.examTitle}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Evaluated
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono tabular-nums">
                      <div className="font-bold text-slate-900">
                        {res.totalScore} / {res.maxMarks}
                      </div>
                      <div className="text-[11px] text-slate-500 font-sans">{percentage}% Aggregate</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 tabular-nums">
                      {res.percentile.toFixed(2)} %ile
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-700 tabular-nums">
                      <span className="text-emerald-700 font-semibold">{res.correctCount}C</span> /{' '}
                      <span className="text-rose-700 font-semibold">{res.incorrectCount}I</span> /{' '}
                      <span className="text-slate-400">{res.unattemptedCount}U</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(res.submittedAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedResult(res)}
                        className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 text-xs font-medium"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs text-slate-500">
                    No results match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drilldown Modal */}
      {selectedResult && (
        <Modal
          isOpen={!!selectedResult}
          onClose={() => setSelectedResult(null)}
          title={`Detailed Demo Scorecard: ${selectedResult.studentName}`}
          subtitle={`Roll: ${selectedResult.rollNumber} · ${selectedResult.examTitle}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono">
              <div>
                <span className="text-slate-500 font-sans block text-[11px]">Total Score</span>
                <span className="font-bold text-slate-900 text-base">
                  {selectedResult.totalScore} / {selectedResult.maxMarks}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[11px]">All-India Percentile</span>
                <span className="font-bold text-blue-700 text-base">
                  {selectedResult.percentile}%ile
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[11px]">Mock Rank</span>
                <span className="font-bold text-slate-900 text-base">AIR #{selectedResult.rank}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[11px]">Accuracy</span>
                <span className="font-bold text-emerald-700 text-base">{selectedResult.accuracy}%</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
              <h4 className="font-semibold text-slate-900">Subject Breakdown (P / C / M)</h4>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[11px] font-sans">Physics</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedResult.physicsScore} / 100
                  </div>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[11px] font-sans">Chemistry</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedResult.chemistryScore} / 100
                  </div>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-200">
                  <div className="text-slate-500 text-[11px] font-sans">Mathematics</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedResult.mathScore} / 100
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between text-slate-600 font-mono">
              <span>Attempted: {selectedResult.attemptedCount}</span>
              <span className="text-emerald-700 font-semibold">Correct: {selectedResult.correctCount}</span>
              <span className="text-rose-700 font-semibold">Incorrect: {selectedResult.incorrectCount}</span>
              <span>Unattempted: {selectedResult.unattemptedCount}</span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
