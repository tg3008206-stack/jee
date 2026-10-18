import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Exam } from '../../types';
import { AlertCircle, Clock, CheckCircle2, ChevronRight, Bookmark, ArrowRight } from 'lucide-react';
import { useToast } from '../common/Toast';

interface ExamInstructionsModalProps {
  exam: Exam | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedToExam?: (exam: Exam) => void;
}

export const ExamInstructionsModal: React.FC<ExamInstructionsModalProps> = ({
  exam,
  isOpen,
  onClose,
  onProceedToExam,
}) => {
  const { showToast } = useToast();
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  if (!exam) return null;

  const handleStartExam = () => {
    if (!hasAcknowledged) {
      showToast('Declaration Required', 'Please confirm that you have read and understood all instructions', 'warning');
      return;
    }

    showToast(
      'CBT Examination Started',
      `Server clock countdown active for ${exam.title}`,
      'success'
    );
    if (onProceedToExam) {
      onProceedToExam(exam);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exam.title}
      subtitle={`Computer-Based Test Candidate Briefing · Test Code: ${exam.code}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5 text-xs text-slate-700">
        {/* Specification pill banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono">
          <div>
            <span className="text-slate-500 font-sans block text-[11px]">Total Duration</span>
            <span className="font-bold text-slate-900 text-sm">{exam.durationMinutes} Minutes</span>
          </div>
          <div>
            <span className="text-slate-500 font-sans block text-[11px]">Maximum Marks</span>
            <span className="font-bold text-slate-900 text-sm">{exam.totalMarks} Marks</span>
          </div>
          <div>
            <span className="text-slate-500 font-sans block text-[11px]">Total Questions</span>
            <span className="font-bold text-slate-900 text-sm">{exam.totalQuestions} Questions</span>
          </div>
          <div>
            <span className="text-slate-500 font-sans block text-[11px]">Marking Scheme</span>
            <span className="font-bold text-blue-700 text-sm">
              +{exam.markingScheme.correct} / {exam.markingScheme.incorrect}
            </span>
          </div>
        </div>

        {/* Section Structure */}
        <div>
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
            Subject Structure & Marks Distribution
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {exam.subjects.map((s, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 block">{s.name}</span>
                <span className="text-slate-500 font-mono mt-1 block">
                  {s.questionsCount} Questions ({s.maxMarks} Marks)
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Sec A (MCQ) & Sec B (Numerical)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Question Palette Symbols */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            National Testing Agency (NTA) Standard Palette Indicators
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-white text-slate-700 border border-slate-300 flex items-center justify-center font-bold text-[10px]">
                01
              </span>
              <span>Not Visited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-rose-500 text-white flex items-center justify-center font-bold text-[10px]">
                02
              </span>
              <span>Not Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                03
              </span>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                04
              </span>
              <span>Review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded bg-purple-600 text-white relative flex items-center justify-center font-bold text-[10px]">
                05
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
              </span>
              <span>Answered & Marked</span>
            </div>
          </div>
        </div>

        {/* Official Guidelines */}
        <div>
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
            General Candidate Guidelines
          </h4>
          <ul className="space-y-1.5 list-disc list-inside text-slate-600 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200">
            {exam.instructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ul>
        </div>

        {/* Candidate Declaration Checkbox */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-start gap-3">
          <input
            type="checkbox"
            id="candidate_decl"
            checked={hasAcknowledged}
            onChange={(e) => setHasAcknowledged(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 h-4 w-4"
          />
          <label htmlFor="candidate_decl" className="text-xs text-slate-800 leading-snug cursor-pointer select-none">
            <span className="font-semibold block text-slate-900">Candidate Declaration:</span>
            I have read, understood and undertake to abide by all the examination instructions. I declare that I am taking this test under simulated computer-based examination conditions without external materials.
          </label>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStartExam}
            disabled={!hasAcknowledged}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-xs shadow-xs transition-all ${
              hasAcknowledged
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Proceed to Examination</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
