import React, { useState } from 'react';
import {
  BookOpenCheck,
  Clock,
  Play,
  FileText,
  Calendar,
  LogOut,
  Award,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Exam, DemoUser, ExamResult } from '../../types';

interface StudentExamSelectionProps {
  currentUser: DemoUser;
  exams: Exam[];
  results: ExamResult[];
  onStartExam: (exam: Exam) => void;
  onViewResult: (result: ExamResult) => void;
  onLogout: () => void;
}

export const StudentExamSelection: React.FC<StudentExamSelectionProps> = ({
  currentUser,
  exams,
  results,
  onStartExam,
  onViewResult,
  onLogout,
}) => {
  // STRICT CBT RULE: Only published, scheduled, or completed examinations with approved question papers
  // Draft, cancelled, hidden, or unapproved examinations are strictly filtered out
  const studentExams = exams.filter(
    (e) =>
      (e.status === 'published' || e.status === 'scheduled' || e.status === 'completed') &&
      e.visibility !== 'Hidden / Restricted' &&
      e.questionPaperReady === true
  );

  // Check which exams this student has already submitted
  const completedExamIds = new Set(
    results
      .filter((r) => r.studentId === currentUser.id || r.rollNumber === currentUser.rollNumber)
      .map((r) => r.examId)
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Minimal Top Header */}
      <header className="bg-white border-b border-slate-200 h-16 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
            S
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">SCHLAR JEE</h1>
            <p className="text-[11px] text-slate-500 leading-none mt-1">Computer-Based Examination System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <span className="text-xs font-semibold text-slate-900 block leading-tight">{currentUser.name}</span>
            <span className="text-[11px] text-slate-500 font-mono leading-tight">
              Roll: {currentUser.rollNumber} · {currentUser.batch}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Assigned Examinations</h2>
          <p className="text-xs text-slate-500 mt-1">
            Official computer-based test packages assigned to your batch. Choose an available assessment to begin.
          </p>
        </div>

        {/* Examination List */}
        <div className="space-y-4">
          {studentExams.map((exam) => {
            const isCompletedByStudent = completedExamIds.has(exam.id) || exam.status === 'completed';
            const studentResult = results.find(
              (r) => r.examId === exam.id && (r.studentId === currentUser.id || r.rollNumber === currentUser.rollNumber)
            );

            // Time gating logic: scheduled exams are upcoming
            const isUpcomingOnly = exam.status === 'scheduled';

            return (
              <div
                key={exam.id}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{exam.title}</span>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {exam.code}
                    </span>
                    <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {exam.category}
                    </span>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.examDate || 'Oct 24, 2026'}</span>
                      <span className="text-slate-300">·</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.startTime || '09:00'} - {exam.endTime || '12:00'}</span>
                    </div>
                    <span>·</span>
                    <div>Duration: {exam.durationMinutes} Minutes</div>
                    <span>·</span>
                    <div>{exam.totalQuestions} Questions ({exam.totalMarks} Marks)</div>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Subjects: {exam.subjects.map((s) => s.name).join(' · ')} | Marking:{' '}
                    {exam.negativeMarking}
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="shrink-0 flex items-center gap-2">
                  {isCompletedByStudent ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Submitted</span>
                      </span>
                      {studentResult && (
                        <button
                          onClick={() => onViewResult(studentResult)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                        >
                          View Scorecard
                        </button>
                      )}
                    </div>
                  ) : isUpcomingOnly ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Opens on {exam.examDate || 'Oct 28'}</span>
                      </span>
                      <button
                        onClick={() => onStartExam(exam)}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
                      >
                        Preview Instructions
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onStartExam(exam)}
                      className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Examination</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {studentExams.length === 0 && (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
              No examinations are currently active or scheduled for your batch.
            </div>
          )}
        </div>
      </main>

      <footer className="mt-auto py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        SCHLAR Computer-Based Testing Environment &copy; 2026. Designed for institutional assessment.
      </footer>
    </div>
  );
};
