import React, { useState } from 'react';
import { BookOpenCheck, Clock, Play, FileText, Search } from 'lucide-react';
import { Exam } from '../../types';

interface AvailableExamsProps {
  exams: Exam[];
  onOpenInstructions: (exam: Exam) => void;
}

export const AvailableExams: React.FC<AvailableExamsProps> = ({ exams, onOpenInstructions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'JEE Main' | 'JEE Advanced' | 'Sectional Mock'>('All');

  const filtered = exams.filter((e) => {
    const isLive = e.status === 'published' && e.questionPaperReady === true && e.visibility !== 'Hidden / Restricted';
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    return isLive && matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Available Examinations (Active Windows)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a computer-based examination package to review instructions and start the testing session
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search active tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
          {(['All', 'JEE Main', 'JEE Advanced', 'Sectional Mock'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                categoryFilter === cat
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((exam) => (
          <div
            key={exam.id}
            className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                  {exam.category}
                </span>
                <span className="text-[11px] font-mono text-slate-500">{exam.code}</span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug">{exam.title}</h3>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600 font-mono">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Duration: {exam.durationMinutes} Minutes</span>
                  <span className="text-slate-300">·</span>
                  <span>{exam.totalMarks} Marks</span>
                </div>
                <div>
                  Subjects: {exam.subjects.map((s) => `${s.name} (${s.questionsCount}Q)`).join(' · ')}
                </div>
                <div className="text-slate-500 font-sans">
                  Batch: {exam.batch}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => onOpenInstructions(exam)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              >
                Read Guidelines
              </button>
              <button
                onClick={() => onOpenInstructions(exam)}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Begin CBT Test</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
