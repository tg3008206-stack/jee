import React from 'react';
import {
  HelpCircle,
  FileEdit,
  BookOpenCheck,
  PlusCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import { Question, QuestionPaperDraft, Exam } from '../../types';
import { useToast } from '../common/Toast';

interface ExaminerDashboardProps {
  questions: Question[];
  drafts: QuestionPaperDraft[];
  exams: Exam[];
  onNavigate: (navId: string) => void;
  onOpenAddQuestion: () => void;
}

export const ExaminerDashboard: React.FC<ExaminerDashboardProps> = ({
  questions,
  drafts,
  exams,
  onNavigate,
  onOpenAddQuestion,
}) => {
  const { showToast } = useToast();

  const physicsCount = questions.filter((q) => q.subject === 'Physics').length;
  const chemistryCount = questions.filter((q) => q.subject === 'Chemistry').length;
  const mathCount = questions.filter((q) => q.subject === 'Mathematics').length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-700">
            <span>Faculty & Examination Committee</span>
            <span>·</span>
            <span>JEE Academic Repository</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Examiner Studio Overview</h2>
          <p className="text-xs text-slate-500 mt-1">
            Author high-yield questions, assemble multi-concept test papers, and maintain peer-reviewed answer keys.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenAddQuestion}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Author Question</span>
          </button>
          <button
            onClick={() => onNavigate('paper_builder')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <FileEdit className="w-3.5 h-3.5 text-slate-500" />
            <span>Assemble Paper</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Question Repository</span>
            <HelpCircle className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{questions.length}</span>
            <span className="text-xs text-emerald-600 font-medium">Verified Items</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Across Physics, Chemistry & Math
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Draft Question Papers</span>
            <FileEdit className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{drafts.length}</span>
            <span className="text-xs text-amber-700 font-medium">In Assembly</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Targeting upcoming JEE cycles
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Published Tests</span>
            <BookOpenCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {exams.filter((e) => e.status === 'published').length}
            </span>
            <span className="text-xs text-slate-500">Active Live</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Grand mocks & sectional tests
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Quality Peer-Review</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">100%</span>
            <span className="text-xs text-emerald-600 font-medium">Verified</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            All answer keys include step derivations
          </div>
        </div>
      </div>

      {/* Subject Distribution Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Subject-wise Question Inventory</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Balanced JEE Main & Advanced curriculum coverage across foundational disciplines
            </p>
          </div>
          <button
            onClick={() => onNavigate('question_bank')}
            className="text-xs font-medium text-indigo-700 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Open Question Bank</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Physics */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">Physics Bank</span>
                <span className="text-xs font-mono font-bold text-blue-800 bg-blue-100/60 px-2 py-0.5 rounded">
                  {physicsCount} Items
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Mechanics, Electrodynamics, Modern Physics, Wave Optics & Thermodynamics.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>HOD: Prof. Rajesh Kulkarni</span>
              <button
                onClick={() => onNavigate('question_bank')}
                className="text-blue-700 font-semibold hover:underline"
              >
                Inspect
              </button>
            </div>
          </div>

          {/* Chemistry */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900">Chemistry Bank</span>
                <span className="text-xs font-mono font-bold text-indigo-800 bg-indigo-100/60 px-2 py-0.5 rounded">
                  {chemistryCount} Items
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Coordination Chemistry, Thermodynamics, Kinetics & Organic Reaction Mechanisms.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Lead: Dr. Meenakshi Raman</span>
              <button
                onClick={() => onNavigate('question_bank')}
                className="text-indigo-700 font-semibold hover:underline"
              >
                Inspect
              </button>
            </div>
          </div>

          {/* Mathematics */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">Mathematics Bank</span>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded">
                  {mathCount} Items
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Integral Calculus, Vector Algebra, 3D Coordinate Geometry & Probability.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Lead: Prof. K. Venkatesh</span>
              <button
                onClick={() => onNavigate('question_bank')}
                className="text-emerald-700 font-semibold hover:underline"
              >
                Inspect
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Draft Papers & Recent Question Authoring Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Draft Question Papers */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Draft Question Papers</h3>
              <p className="text-xs text-slate-500 mt-0.5">Papers currently in assembly or review</p>
            </div>
            <button
              onClick={() => onNavigate('paper_builder')}
              className="text-xs font-medium text-indigo-700 hover:text-indigo-800"
            >
              Open Builder
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {drafts.map((d) => (
              <div key={d.id} className="py-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-900">{d.title}</span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      d.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : d.status === 'Submitted for Review'
                        ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        : d.status === 'Returned for Changes'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{d.examType} · Target {d.targetDate}</span>
                  <span className="font-mono tabular-nums">{d.completionPercentage}% assembled</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full"
                    style={{ width: `${d.completionPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Question Editing Feed */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Recent Authoring & Curations</h3>
              <span className="text-xs text-slate-400">Live faculty edits</span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {questions.slice(0, 3).map((q) => (
                <div key={q.id} className="py-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{q.code}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{q.lastEdited}</span>
                  </div>
                  <p className="text-slate-600 mt-1 line-clamp-1">{q.topic}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                    <span className="text-indigo-700 font-medium">{q.subject}</span>
                    <span>·</span>
                    <span className="text-slate-500">{q.difficulty}</span>
                    <span>·</span>
                    <span className="text-slate-500">{q.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={onOpenAddQuestion}
              className="w-full py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
            >
              Author New Question Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
