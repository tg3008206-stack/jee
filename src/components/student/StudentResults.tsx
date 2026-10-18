import React, { useState } from 'react';
import { Award, CheckCircle, Clock, ChevronDown, ChevronUp, Download, Eye, FileText } from 'lucide-react';
import { ExamResult } from '../../types';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface StudentResultsProps {
  results: ExamResult[];
}

export const StudentResults: React.FC<StudentResultsProps> = ({ results }) => {
  const { showToast } = useToast();
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(results[0] || null);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">My Examination Scorecards & Answer Explanations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified percentiles, subject-wise score distribution, question accuracy, and step solutions
          </p>
        </div>
        <button
          onClick={() => showToast('Scorecard Downloaded', 'Official institutional scorecard downloaded as PDF', 'success')}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Download Official Scorecard</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Test Result List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Evaluated Examinations ({results.length})
          </h3>
          {results.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedResult(r)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedResult?.id === r.id
                  ? 'bg-white border-blue-600 shadow-sm ring-1 ring-blue-600/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 line-clamp-1">{r.examTitle}</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between font-mono">
                <span className="text-base font-bold text-slate-900">
                  {r.totalScore} <span className="text-xs text-slate-400 font-normal">/ {r.maxMarks}</span>
                </span>
                <span className="text-xs font-bold text-blue-700">{r.percentile}%ile</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
                <span>Rank: #{r.rank}</span>
                <span>Accuracy: {r.accuracy}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Detailed Analysis of Selected Result */}
        {selectedResult && (
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                Official Examination Scorecard
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedResult.examTitle}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Submitted on {new Date(selectedResult.submittedAt).toLocaleDateString()} · Time Taken:{' '}
                {selectedResult.timeTakenMinutes} minutes
              </p>
            </div>

            {/* Metric strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-sans block text-[11px]">Score</span>
                <span className="text-xl font-bold text-slate-900">
                  {selectedResult.totalScore}
                  <span className="text-xs font-normal text-slate-400"> / {selectedResult.maxMarks}</span>
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-sans block text-[11px]">Percentile</span>
                <span className="text-xl font-bold text-blue-700">
                  {selectedResult.percentile}%ile
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-sans block text-[11px]">All-India Rank</span>
                <span className="text-xl font-bold text-slate-900">AIR #{selectedResult.rank}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-sans block text-[11px]">Accuracy</span>
                <span className="text-xl font-bold text-emerald-700">{selectedResult.accuracy}%</span>
              </div>
            </div>

            {/* Subject Section Breakdown */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Subject-wise Performance
              </h4>
              <div className="grid grid-cols-3 gap-3 font-mono text-center">
                <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
                  <span className="text-blue-900 font-sans font-semibold text-xs block">Physics</span>
                  <span className="text-lg font-bold text-blue-950 mt-1 block">
                    {selectedResult.physicsScore} / 100
                  </span>
                  <span className="text-[11px] text-blue-700 font-sans">84% Sectional</span>
                </div>
                <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
                  <span className="text-indigo-900 font-sans font-semibold text-xs block">Chemistry</span>
                  <span className="text-lg font-bold text-indigo-950 mt-1 block">
                    {selectedResult.chemistryScore} / 100
                  </span>
                  <span className="text-[11px] text-indigo-700 font-sans">78% Sectional</span>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100">
                  <span className="text-emerald-900 font-sans font-semibold text-xs block">Mathematics</span>
                  <span className="text-lg font-bold text-emerald-950 mt-1 block">
                    {selectedResult.mathScore} / 100
                  </span>
                  <span className="text-[11px] text-emerald-700 font-sans">80% Sectional</span>
                </div>
              </div>
            </div>

            {/* Question Breakdown Strip */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 font-sans">Attempted: </span>
                <span className="font-bold text-slate-900">{selectedResult.attemptedCount}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans">Correct: </span>
                <span className="font-bold text-emerald-700">{selectedResult.correctCount}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans">Incorrect: </span>
                <span className="font-bold text-rose-700">{selectedResult.incorrectCount}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans">Unattempted: </span>
                <span className="font-bold text-slate-700">{selectedResult.unattemptedCount}</span>
              </div>
            </div>

            {/* Sample Verified Answer Explanation */}
            <div className="p-4 rounded-lg bg-blue-50/40 border border-blue-200/70 space-y-2 text-xs">
              <span className="font-bold text-blue-900 block">Sample Solution Review:</span>
              <p className="text-slate-700 leading-relaxed font-sans">
                <strong>Q1 (Rotational Dynamics):</strong> A solid sphere of mass M and radius R rolls without slipping.
                Rotational KE = (1/5) M v², Translational KE = (1/2) M v². The ratio of rotational KE to total KE is exactly 2/7.
                Your response: Option A (Correct, +4 Marks).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
