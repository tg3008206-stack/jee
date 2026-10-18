import React from 'react';
import {
  BookOpenCheck,
  Calendar,
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  ChevronRight,
  Play,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { Exam, ScheduleItem, ExamResult, DemoUser } from '../../types';

interface StudentDashboardProps {
  currentUser: DemoUser;
  availableExams: Exam[];
  upcomingSchedules: ScheduleItem[];
  results: ExamResult[];
  onNavigate: (navId: string) => void;
  onOpenExamInstructions: (exam: Exam) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  availableExams,
  upcomingSchedules,
  results,
  onNavigate,
  onOpenExamInstructions,
}) => {
  const latestResult = results[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
            <span>Candidate Portal</span>
            <span>·</span>
            <span>Roll: {currentUser.rollNumber || 'SCH-2026-0842'}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Welcome back, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enrolled Batch: <span className="font-semibold text-slate-700">{currentUser.batch || 'Super-30 JEE 2026'}</span> · Target: {currentUser.targetExam || 'JEE Advanced 2026'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {availableExams[0] && (
            <button
              onClick={() => onOpenExamInstructions(availableExams[0])}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start All India Grand Mock #04</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Available Tests</span>
            <BookOpenCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{availableExams.length}</span>
            <span className="text-xs text-blue-600 font-medium">Ready to Attempt</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            1 Grand Mock & 2 Sectionals
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Last Test Score</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
              {latestResult ? latestResult.totalScore : 242}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 300</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium font-mono">
            Percentile: {latestResult ? latestResult.percentile : 99.42}%ile
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">All-India Mock Rank</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              AIR #{latestResult ? latestResult.rank : 18}
            </span>
            <span className="text-xs text-slate-500">of 3,450</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Top 0.5% institutional bracket
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Overall Accuracy</span>
            <CheckCircle2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {latestResult ? latestResult.accuracy : 89.2}%
            </span>
            <span className="text-xs text-slate-500">High Precision</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            61 correct / 68 attempted
          </div>
        </div>
      </div>

      {/* Available Examinations (CBT ready) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Available Competitive Tests</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulated computer-based tests matching exact JEE Main & Advanced patterns
            </p>
          </div>
          <button
            onClick={() => onNavigate('available_exams')}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View all tests</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {availableExams.map((exam) => (
            <div
              key={exam.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {exam.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{exam.code}</span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 mt-2.5 leading-snug line-clamp-2">
                  {exam.title}
                </h4>

                <div className="mt-3 space-y-1 text-[11px] text-slate-600 font-mono">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{exam.durationMinutes} Minutes · {exam.totalMarks} Marks</span>
                  </div>
                  <div>
                    {exam.subjects.map((s) => s.name).join(' · ')}
                  </div>
                  <div className="text-slate-500 font-sans">
                    Penalty: {exam.negativeMarking.split(',')[1] || '-1 incorrect'}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2">
                <button
                  onClick={() => onOpenExamInstructions(exam)}
                  className="flex-1 py-1.5 px-2.5 text-center text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                >
                  Instructions
                </button>
                <button
                  onClick={() => onOpenExamInstructions(exam)}
                  className="flex-1 py-1.5 px-2.5 text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Start Test</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Split: Subject-wise Mastery & Recent Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Subject-wise Mastery */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Subject-wise Preparation Index</h3>
              <p className="text-xs text-slate-500 mt-0.5">Calculated across completed test sessions</p>
            </div>
            <button
              onClick={() => onNavigate('performance')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Full Analytics
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Physics */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-slate-900">
                <span>Physics (Mechanics & Electrodynamics)</span>
                <span className="font-mono text-blue-700">84.0%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '84%' }} />
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Strength: Rotational Dynamics</span>
                <span>Focus: Modern Physics</span>
              </div>
            </div>

            {/* Chemistry */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-slate-900">
                <span>Chemistry (Inorganic & Physical)</span>
                <span className="font-mono text-indigo-700">78.0%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '78%' }} />
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Strength: Coordination Compounds</span>
                <span>Focus: Chemical Kinetics</span>
              </div>
            </div>

            {/* Mathematics */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-slate-900">
                <span>Mathematics (Calculus & Vectors)</span>
                <span className="font-mono text-emerald-700">80.0%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '80%' }} />
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Strength: 3D Vector Geometry</span>
                <span>Focus: Definite Integrals</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Latest Verified Scorecard */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Recent Test Scorecard</h3>
              <span className="text-xs text-slate-500 font-mono">Mock #03</span>
            </div>

            {latestResult && (
              <div className="mt-3 space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between font-mono">
                  <div>
                    <span className="text-slate-500 block text-[11px] font-sans">Final Score</span>
                    <span className="text-lg font-bold text-slate-900">
                      {latestResult.totalScore} / {latestResult.maxMarks}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[11px] font-sans">All-India Percentile</span>
                    <span className="text-lg font-bold text-blue-700">
                      {latestResult.percentile}%ile
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 text-[10px] block font-sans">Physics</span>
                    <span className="font-bold text-slate-900 text-sm">{latestResult.physicsScore}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 text-[10px] block font-sans">Chemistry</span>
                    <span className="font-bold text-slate-900 text-sm">{latestResult.chemistryScore}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 text-[10px] block font-sans">Mathematics</span>
                    <span className="font-bold text-slate-900 text-sm">{latestResult.mathScore}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('my_results')}
              className="w-full py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
            >
              View Detailed Solution Explanations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
