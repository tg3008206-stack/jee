import React from 'react';
import {
  Users,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  PlusCircle,
  FileText,
  UserCheck,
  AlertCircle,
  XCircle,
  BookOpen,
} from 'lucide-react';
import { Exam, ScheduleItem, ActivityLog, ExamResult, DemoUser } from '../../types';
import { useToast } from '../common/Toast';

interface AdminDashboardProps {
  exams: Exam[];
  users: DemoUser[];
  schedules: ScheduleItem[];
  activities: ActivityLog[];
  results: ExamResult[];
  onNavigate: (navId: string) => void;
  onOpenCreateExam: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  exams,
  users,
  schedules,
  activities,
  results,
  onNavigate,
  onOpenCreateExam,
}) => {
  const { showToast } = useToast();

  // Centralized counts
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalExaminers = users.filter((u) => u.role === 'examiner').length;
  const draftExams = exams.filter((e) => e.status === 'draft').length;
  const publishedExams = exams.filter((e) => e.status === 'published').length;
  const scheduledExams = exams.filter((e) => e.status === 'scheduled').length;
  const completedExams = exams.filter((e) => e.status === 'completed').length;
  const cancelledExams = exams.filter((e) => e.status === 'cancelled').length;

  const totalEnrolled = exams.reduce((acc, curr) => acc + (curr.enrolledCount || 0), 0);
  const totalCompleted = exams.reduce((acc, curr) => acc + (curr.completedCount || 0), 0);

  // Performance calculations
  const avgScore = results.length > 0
    ? Math.round(results.reduce((acc, r) => acc + r.totalScore, 0) / results.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
            <span>SCHLAR JEE Control Center</span>
            <span>·</span>
            <span>Demonstration Environment</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Institutional Administration Overview</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status of computer-based tests, student registrations, and scheduled examination slots.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onOpenCreateExam}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Examination</span>
          </button>
          <button
            onClick={() => onNavigate('examinations')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>Examinations ({exams.length})</span>
          </button>
          <button
            onClick={() => onNavigate('schedule')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Schedule</span>
          </button>
          <button
            onClick={() => onNavigate('users')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Users</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards: Fully Derived from Centralized Data */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Demo Students</span>
            <Users className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">{totalStudents}</div>
          <div className="mt-1 text-[11px] text-slate-400">Enrolled Candidates</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Examiners</span>
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">{totalExaminers}</div>
          <div className="mt-1 text-[11px] text-slate-400">Faculty Members</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Published Tests</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono tabular-nums">{publishedExams}</div>
          <div className="mt-1 text-[11px] text-slate-400">Available to Students</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Upcoming Slots</span>
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 font-mono tabular-nums">{scheduledExams}</div>
          <div className="mt-1 text-[11px] text-slate-400">Scheduled Tests</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Draft Exams</span>
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-700 font-mono tabular-nums">{draftExams}</div>
          <div className="mt-1 text-[11px] text-slate-400">Hidden from Students</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Completed</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">{completedExams}</div>
          <div className="mt-1 text-[11px] text-slate-400">Concluded Sessions</div>
        </div>
      </div>


      {/* Two Column Grid: Upcoming Schedule & Recent Examination Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upcoming Exam Schedule (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Upcoming Examination Schedule</h3>
              <p className="text-xs text-slate-500 mt-0.5">Approved computer-based test slots across institutional batches</p>
            </div>
            <button
              onClick={() => onNavigate('schedule')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View all schedule</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {schedules.map((sch) => (
              <div key={sch.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">{sch.title}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {sch.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {sch.date}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {sch.timeSlot}
                    </span>
                    <span>·</span>
                    <span className="text-slate-600 font-mono tabular-nums">{sch.registrations} registered</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      sch.status === 'Upcoming'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : sch.status === 'Live'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {sch.status}
                  </span>
                  <button
                    onClick={() => {
                      showToast('Slot details opened', sch.title, 'info');
                      onNavigate('schedule');
                    }}
                    className="text-xs px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Activity Log */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Audit & Activity Log</h3>
              <span className="text-xs text-slate-400">Live feed</span>
            </div>

            <div className="space-y-4 mt-4">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-800">{act.action}</div>
                    <div className="text-slate-500 truncate text-[11px] mt-0.5">{act.target}</div>
                    <div className="text-slate-400 text-[10px] mt-1 font-mono">{act.actor} · {act.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={() => showToast('Full institutional audit log exported', 'Report saved as audit_summary.json', 'success')}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Audit Summary</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compact Performance Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Institutional Performance Breakdown (Mock Test #03)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Subject-wise scoring patterns and benchmark percentiles</p>
          </div>
          <button
            onClick={() => onNavigate('results')}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Full Scorecard Registry</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-slate-700">Physics Section</div>
            <div className="mt-2 text-xl font-bold text-slate-900 font-mono tabular-nums">74.2 <span className="text-xs font-normal text-slate-500">/ 100 avg</span></div>
            <div className="mt-2 text-[11px] text-slate-500">Highest score: 88/100 · Mechanics & Electrodynamics</div>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '74%' }} />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-slate-700">Chemistry Section</div>
            <div className="mt-2 text-xl font-bold text-slate-900 font-mono tabular-nums">78.0 <span className="text-xs font-normal text-slate-500">/ 100 avg</span></div>
            <div className="mt-2 text-[11px] text-slate-500">Highest score: 82/100 · Coordination & Thermodynamics</div>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '78%' }} />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-xs font-semibold text-slate-700">Mathematics Section</div>
            <div className="mt-2 text-xl font-bold text-slate-900 font-mono tabular-nums">69.3 <span className="text-xs font-normal text-slate-500">/ 100 avg</span></div>
            <div className="mt-2 text-[11px] text-slate-500">Highest score: 80/100 · Calculus & Vectors</div>
            <div className="mt-3 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '69%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
