import React, { useState } from 'react';
import { Calendar, Clock, Plus, Building, Users, AlertCircle, AlertTriangle, CheckCircle2, Edit3, ArrowRight } from 'lucide-react';
import { Exam, DemoUser } from '../../types';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface AdminScheduleProps {
  exams: Exam[];
  examiners: DemoUser[];
  onUpdateExamSchedule: (examId: string, newDate: string, startTime: string, duration: number, venue: string) => void;
}

export const AdminSchedule: React.FC<AdminScheduleProps> = ({
  exams,
  examiners,
  onUpdateExamSchedule,
}) => {
  const { showToast } = useToast();

  const [statusFilter, setStatusFilter] = useState<'All' | 'scheduled' | 'published' | 'completed'>('All');
  const [selectedExamToReschedule, setSelectedExamToReschedule] = useState<Exam | null>(null);

  // Reschedule Form State
  const [reschedDate, setReschedDate] = useState('2026-10-24');
  const [reschedStartTime, setReschedStartTime] = useState('09:00');
  const [reschedDuration, setReschedDuration] = useState(180);
  const [reschedVenue, setReschedVenue] = useState('CBT Lab 1');

  // Conflict Detection Engine
  const detectConflicts = (testExams: Exam[]) => {
    const conflicts: { examA: Exam; examB: Exam; reason: string }[] = [];

    for (let i = 0; i < testExams.length; i++) {
      for (let j = i + 1; j < testExams.length; j++) {
        const a = testExams[i];
        const b = testExams[j];

        // Only check active/scheduled/published exams
        if (a.status === 'cancelled' || b.status === 'cancelled') continue;

        // Check if on same date
        if (a.examDate && b.examDate && a.examDate === b.examDate) {
          // Check venue overlap
          const aVenue = a.venue || 'CBT Online Lab 1';
          const bVenue = b.venue || 'CBT Online Lab 1';

          if (aVenue === bVenue) {
            // Check time overlap
            const [aH, aM] = (a.startTime || '09:00').split(':').map(Number);
            const aStartMin = aH * 60 + aM;
            const aEndMin = aStartMin + a.durationMinutes;

            const [bH, bM] = (b.startTime || '09:00').split(':').map(Number);
            const bStartMin = bH * 60 + bM;
            const bEndMin = bStartMin + b.durationMinutes;

            if (Math.max(aStartMin, bStartMin) < Math.min(aEndMin, bEndMin)) {
              conflicts.push({
                examA: a,
                examB: b,
                reason: `Venue clash at ${aVenue} on ${a.examDate} (${a.startTime} vs ${b.startTime})`,
              });
            }
          }

          // Check examiner overlap
          if (a.assignedExaminer && b.assignedExaminer && a.assignedExaminer === b.assignedExaminer) {
            const [aH, aM] = (a.startTime || '09:00').split(':').map(Number);
            const aStartMin = aH * 60 + aM;
            const aEndMin = aStartMin + a.durationMinutes;

            const [bH, bM] = (b.startTime || '09:00').split(':').map(Number);
            const bStartMin = bH * 60 + bM;
            const bEndMin = bStartMin + b.durationMinutes;

            if (Math.max(aStartMin, bStartMin) < Math.min(aEndMin, bEndMin)) {
              conflicts.push({
                examA: a,
                examB: b,
                reason: `Examiner ${a.assignedExaminer} is assigned to concurrent exams on ${a.examDate}`,
              });
            }
          }
        }
      }
    }
    return conflicts;
  };

  const detectedConflicts = detectConflicts(exams);

  const handleOpenReschedule = (exam: Exam) => {
    setSelectedExamToReschedule(exam);
    setReschedDate(exam.examDate || '2026-10-24');
    setReschedStartTime(exam.startTime || '09:00');
    setReschedDuration(exam.durationMinutes);
    setReschedVenue(exam.venue || 'CBT Lab 1');
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamToReschedule) return;

    if (!reschedDate || !reschedStartTime) {
      showToast('Validation Error', 'Date and start time are required', 'error');
      return;
    }

    onUpdateExamSchedule(
      selectedExamToReschedule.id,
      reschedDate,
      reschedStartTime,
      Number(reschedDuration),
      reschedVenue
    );

    showToast(
      'Schedule Updated',
      `${selectedExamToReschedule.title} scheduled for ${reschedDate} at ${reschedStartTime}`,
      'success'
    );
    setSelectedExamToReschedule(null);
  };

  const filteredExams = exams.filter((e) => {
    if (statusFilter === 'All') return true;
    return e.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Examination Schedule & Slot Manager</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate testing slots, room/lab bookings, proctoring schedules, and conflict verification
          </p>
        </div>
      </div>

      {/* Conflict Alert Banner if detected */}
      {detectedConflicts.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Scheduling Conflicts Detected in Active Roster ({detectedConflicts.length})</span>
          </div>
          <div className="space-y-1 pl-6">
            {detectedConflicts.map((c, idx) => (
              <p key={idx} className="leading-snug">
                • <strong>{c.examA.title}</strong> and <strong>{c.examB.title}</strong>: {c.reason}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Status Filter */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200 w-fit">
        {(['All', 'scheduled', 'published', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
              statusFilter === tab
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab} Tests
          </button>
        ))}
      </div>

      {/* Examination Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {exam.category}
                </span>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${
                    exam.status === 'published'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : exam.status === 'scheduled'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : exam.status === 'completed'
                      ? 'bg-slate-100 text-slate-800'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  {exam.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug">{exam.title}</h3>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">{exam.examDate || 'Oct 24, 2026'}</span>
                  <span className="text-slate-300">·</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{exam.startTime || '09:00'} - {exam.endTime || '12:00'} ({exam.durationMinutes} min)</span>
                </div>

                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Venue: {exam.venue || 'CBT Online Lab 1 & 2'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assigned Examiner: {exam.assignedExaminer}</span>
                </div>

                <div className="text-[11px] text-slate-500">
                  Target Batch: <span className="font-medium text-slate-700">{exam.batch}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                {exam.enrolledCount} Candidates Enrolled
              </span>
              <button
                onClick={() => handleOpenReschedule(exam)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Reschedule Slot</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reschedule Modal */}
      {selectedExamToReschedule && (
        <Modal
          isOpen={!!selectedExamToReschedule}
          onClose={() => setSelectedExamToReschedule(null)}
          title={`Reschedule Examination: ${selectedExamToReschedule.title}`}
          subtitle="Modify test date, time slot, duration, and CBT venue"
        >
          <form onSubmit={handleSaveReschedule} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Examination Date</label>
                <input
                  type="date"
                  required
                  value={reschedDate}
                  onChange={(e) => setReschedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Start Time (24h)</label>
                <input
                  type="time"
                  required
                  value={reschedStartTime}
                  onChange={(e) => setReschedStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  value={reschedDuration}
                  onChange={(e) => setReschedDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Testing Venue / Lab</label>
                <select
                  value={reschedVenue}
                  onChange={(e) => setReschedVenue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="CBT Lab 1">CBT Lab 1 (Main Campus)</option>
                  <option value="CBT Lab 2">CBT Lab 2 (North Block)</option>
                  <option value="CBT Online Lab 1 & 2">CBT Online Lab 1 & 2 (Combined)</option>
                  <option value="Online Proctored Remote">Online Proctored Remote</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedExamToReschedule(null)}
                className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Confirm Rescheduling
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
