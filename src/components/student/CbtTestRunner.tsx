import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Send,
  X,
  FileText,
  AlertTriangle,
  Menu,
  ChevronDown,
  ChevronUp,
  Check,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Exam, Question, DemoUser, ExamResult } from '../../types';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';
import { evaluateExamSubmission } from '../../utils/scoringEngine';

interface CbtTestRunnerProps {
  exam: Exam;
  currentUser: DemoUser;
  questions: Question[];
  onCompleteExam: (result: ExamResult) => void;
  onExitTest: () => void;
}

// 5 Standard NTA CBT Question States
export type QuestionPaletteState =
  | 'not_visited'
  | 'not_answered'
  | 'answered'
  | 'marked_for_review'
  | 'answered_and_marked';

export const CbtTestRunner: React.FC<CbtTestRunnerProps> = ({
  exam,
  currentUser,
  questions,
  onCompleteExam,
  onExitTest,
}) => {
  const { showToast } = useToast();
  const sessionKey = `schlar_cbt_${currentUser.id}_${exam.id}`;

  // Filter questions that belong to this examination's configured subjects
  const examSubjects = useMemo(() => {
    return exam.subjects.map((s) => s.name);
  }, [exam.subjects]);

  const examQuestions: Question[] = useMemo(() => {
    // Preserve Historical Paper and Result Integrity: Use approved paper snapshot if available
    if (exam.paperSnapshot && exam.paperSnapshot.length > 0) {
      return exam.paperSnapshot;
    }

    // Filter questions matching exam subjects
    const filtered = questions.filter((q) => examSubjects.includes(q.subject));

    // Sort stably: Physics -> Chemistry -> Mathematics, then by code
    const subjectOrder: Record<string, number> = {
      Physics: 1,
      Chemistry: 2,
      Mathematics: 3,
    };

    const sorted = [...filtered].sort((a, b) => {
      const orderA = subjectOrder[a.subject] || 99;
      const orderB = subjectOrder[b.subject] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.code.localeCompare(b.code);
    });

    return sorted.length > 0 ? sorted : questions;
  }, [exam.paperSnapshot, questions, examSubjects]);

  // Active Subject Tab
  const [activeSubject, setActiveSubject] = useState<string>(() => {
    return exam.subjects[0]?.name || examQuestions[0]?.subject || 'Physics';
  });

  // Current Question Index in examQuestions array
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);

  // Student Responses: map of questionId -> answer string
  const [responses, setResponses] = useState<Record<string, string>>({});

  // Question palette statuses: map of questionId -> QuestionPaletteState
  const [statuses, setStatuses] = useState<Record<string, QuestionPaletteState>>(() => {
    const init: Record<string, QuestionPaletteState> = {};
    examQuestions.forEach((q, idx) => {
      init[q.id] = idx === 0 ? 'not_answered' : 'not_visited';
    });
    return init;
  });

  // Timer State (calculated from fixed deadline timestamp to avoid drift & survive refresh)
  const [deadlineTimestamp, setDeadlineTimestamp] = useState<number>(() => {
    return Date.now() + exam.durationMinutes * 60 * 1000;
  });
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    return exam.durationMinutes * 60;
  });

  // UI & Modals State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [isQuestionPaperModalOpen, setIsQuestionPaperModalOpen] = useState(false);
  const [qpSubjectFilter, setQpSubjectFilter] = useState<string>('All');
  const [isPaletteDrawerOpen, setIsPaletteDrawerOpen] = useState(false);

  // Guard to prevent duplicate submissions
  const isSubmittingRef = useRef(false);

  // 1. Session Storage Recovery on Mount (LocalStorage + SessionStorage for refresh resilience)
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(sessionKey) || sessionStorage.getItem(sessionKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.examId === exam.id && parsed.studentId === currentUser.id && !parsed.isSubmitted) {
          if (parsed.responses) setResponses(parsed.responses);
          if (parsed.statuses) setStatuses(parsed.statuses);
          if (parsed.currentQIndex !== undefined) setCurrentQIndex(parsed.currentQIndex);
          if (parsed.activeSubject) setActiveSubject(parsed.activeSubject);
          if (parsed.deadlineTimestamp && parsed.deadlineTimestamp > Date.now()) {
            setDeadlineTimestamp(parsed.deadlineTimestamp);
            setSecondsRemaining(Math.max(0, Math.floor((parsed.deadlineTimestamp - Date.now()) / 1000)));
          }
          showToast('Session Restored', 'Your previous answers, question palette, and timer have been restored', 'info');
          return;
        }
      }
    } catch {
      // Graceful fallback if storage disabled
    }

    // Initialize new session record
    const newDeadline = Date.now() + exam.durationMinutes * 60 * 1000;
    setDeadlineTimestamp(newDeadline);
    setSecondsRemaining(exam.durationMinutes * 60);

    const initialPayload = JSON.stringify({
      examId: exam.id,
      studentId: currentUser.id,
      startTime: Date.now(),
      deadlineTimestamp: newDeadline,
      responses: {},
      statuses: {
        [examQuestions[0]?.id || '']: 'not_answered',
      },
      currentQIndex: 0,
      activeSubject: exam.subjects[0]?.name || 'Physics',
      isSubmitted: false,
    });

    try {
      localStorage.setItem(sessionKey, initialPayload);
      sessionStorage.setItem(sessionKey, initialPayload);
    } catch {
      // Continue without storage
    }
  }, [exam.id, currentUser.id]);

  // 2. Synchronize Session Storage on Updates
  useEffect(() => {
    if (isSubmittingRef.current) return;
    try {
      const payload = JSON.stringify({
        examId: exam.id,
        studentId: currentUser.id,
        deadlineTimestamp,
        responses,
        statuses,
        currentQIndex,
        activeSubject,
        isSubmitted: false,
      });
      localStorage.setItem(sessionKey, payload);
      sessionStorage.setItem(sessionKey, payload);
    } catch {
      // Ignore
    }
  }, [responses, statuses, currentQIndex, activeSubject, deadlineTimestamp]);

  // 3. Countdown Timer Interval
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((deadlineTimestamp - now) / 1000));
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        handleAutoSubmitOnExpiry();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadlineTimestamp]);

  // Auto-submit when time expires
  const handleAutoSubmitOnExpiry = () => {
    if (isSubmittingRef.current) return;
    showToast('Time Expired', 'Submitting your examination automatically...', 'warning');
    performFinalSubmission();
  };

  // Format seconds to HH:MM:SS
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
      seconds
    ).padStart(2, '0')}`;
  };

  const currentQ = examQuestions[currentQIndex] || examQuestions[0];

  // Helper to jump to question
  const jumpToQuestion = (index: number) => {
    if (index < 0 || index >= examQuestions.length) return;
    const targetQ = examQuestions[index];

    // Mark as not_answered if it was not_visited
    if (statuses[targetQ.id] === 'not_visited') {
      setStatuses((prev) => ({ ...prev, [targetQ.id]: 'not_answered' }));
    }

    setCurrentQIndex(index);
    if (targetQ.subject !== activeSubject) {
      setActiveSubject(targetQ.subject);
    }
    setIsPaletteDrawerOpen(false);
  };

  // Helper to switch active subject tab
  const handleSwitchSubject = (subjectName: string) => {
    setActiveSubject(subjectName);
    // Find first question of this subject
    const firstIdx = examQuestions.findIndex((q) => q.subject === subjectName);
    if (firstIdx !== -1) {
      jumpToQuestion(firstIdx);
    }
  };

  // Select option handler for Single Choice MCQ
  const handleSelectOption = (optId: string) => {
    if (!currentQ) return;
    setResponses((prev) => ({ ...prev, [currentQ.id]: optId }));
  };

  // Select option handler for Multiple Correct (JEE Advanced)
  const handleToggleMultiOption = (optId: string) => {
    if (!currentQ) return;
    const currentAnswer = responses[currentQ.id] || '';
    const currentKeys = currentAnswer.split(',').filter(Boolean);

    let nextKeys: string[];
    if (currentKeys.includes(optId)) {
      nextKeys = currentKeys.filter((k) => k !== optId);
    } else {
      nextKeys = [...currentKeys, optId].sort();
    }

    const nextAnswer = nextKeys.join(',');
    setResponses((prev) => {
      const copy = { ...prev };
      if (nextAnswer) {
        copy[currentQ.id] = nextAnswer;
      } else {
        delete copy[currentQ.id];
      }
      return copy;
    });
  };

  // Text response handler for Numerical & Descriptive
  const handleTextResponseChange = (text: string) => {
    if (!currentQ) return;
    setResponses((prev) => ({ ...prev, [currentQ.id]: text }));
  };

  // Virtual keypad input for numerical
  const handleKeypadPress = (val: string) => {
    if (!currentQ) return;
    const currentVal = responses[currentQ.id] || '';
    if (val === 'CLEAR') {
      setResponses((prev) => ({ ...prev, [currentQ.id]: '' }));
    } else if (val === 'BACKSPACE') {
      setResponses((prev) => ({ ...prev, [currentQ.id]: currentVal.slice(0, -1) }));
    } else {
      // Only allow one decimal point and minus at start
      if (val === '.' && currentVal.includes('.')) return;
      if (val === '-' && currentVal.length > 0) return;
      if (currentVal.length < 10) {
        setResponses((prev) => ({ ...prev, [currentQ.id]: currentVal + val }));
      }
    }
  };

  // Action: Clear Response (Affects ONLY current question)
  const handleClearResponse = () => {
    if (!currentQ) return;
    setResponses((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });

    setStatuses((prev) => {
      const currentState = prev[currentQ.id];
      const nextState: QuestionPaletteState =
        currentState === 'answered_and_marked' || currentState === 'marked_for_review'
          ? 'marked_for_review'
          : 'not_answered';
      return { ...prev, [currentQ.id]: nextState };
    });

    showToast('Response Cleared', 'Answer cleared for current question', 'info');
  };

  // Action: Save & Next
  const handleSaveAndNext = () => {
    if (!currentQ) return;
    const rawAnswer = responses[currentQ.id];
    const hasAnswer = rawAnswer !== undefined && rawAnswer.trim().length > 0;

    setStatuses((prev) => {
      const currentSt = prev[currentQ.id];
      let nextSt: QuestionPaletteState = 'not_answered';

      if (currentSt === 'marked_for_review' || currentSt === 'answered_and_marked') {
        nextSt = hasAnswer ? 'answered_and_marked' : 'marked_for_review';
      } else {
        nextSt = hasAnswer ? 'answered' : 'not_answered';
      }

      return { ...prev, [currentQ.id]: nextSt };
    });

    if (currentQIndex < examQuestions.length - 1) {
      jumpToQuestion(currentQIndex + 1);
    } else {
      showToast('End of Question Paper Reached', 'You can review answers or submit the test', 'info');
    }
  };

  // Action: Mark for Review & Next
  const handleMarkForReviewAndNext = () => {
    if (!currentQ) return;
    const rawAnswer = responses[currentQ.id];
    const hasAnswer = rawAnswer !== undefined && rawAnswer.trim().length > 0;

    setStatuses((prev) => ({
      ...prev,
      [currentQ.id]: hasAnswer ? 'answered_and_marked' : 'marked_for_review',
    }));

    if (currentQIndex < examQuestions.length - 1) {
      jumpToQuestion(currentQIndex + 1);
    } else {
      showToast('Marked for Review', 'Question marked for review. You can proceed to submit.', 'info');
    }
  };

  // Action: Unmark Review
  const handleUnmarkReview = () => {
    if (!currentQ) return;
    const rawAnswer = responses[currentQ.id];
    const hasAnswer = rawAnswer !== undefined && rawAnswer.trim().length > 0;

    setStatuses((prev) => ({
      ...prev,
      [currentQ.id]: hasAnswer ? 'answered' : 'not_answered',
    }));
    showToast('Review Marker Removed', undefined, 'info');
  };

  // Palette Counts Summary
  const countAnswered = Object.values(statuses).filter((s) => s === 'answered').length;
  const countNotAnswered = Object.values(statuses).filter((s) => s === 'not_answered').length;
  const countMarked = Object.values(statuses).filter((s) => s === 'marked_for_review').length;
  const countAnsweredAndMarked = Object.values(statuses).filter(
    (s) => s === 'answered_and_marked'
  ).length;
  const countNotVisited = Object.values(statuses).filter((s) => s === 'not_visited').length;

  // Final Submission Function (Guarded and Idempotent)
  const performFinalSubmission = () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      const timeConsumedMinutes = Math.max(
        1,
        Math.round((exam.durationMinutes * 60 - secondsRemaining) / 60)
      );

      // Call pure scoring engine
      const { examResult } = evaluateExamSubmission(
        exam,
        examQuestions,
        responses,
        currentUser,
        timeConsumedMinutes
      );

      // Clean up local session storage
      try {
        localStorage.removeItem(sessionKey);
        sessionStorage.removeItem(sessionKey);
      } catch {
        // Ignore
      }

      showToast('Examination Submitted Successfully', 'Your answers have been verified and processed', 'success');
      onCompleteExam(examResult);
    } catch {
      isSubmittingRef.current = false;
      showToast('Submission Error', 'Please retry submission or contact examination invigilator', 'error');
    }
  };

  // Get status color & badge for question number button
  const getPaletteBadgeClasses = (qId: string, isCurrent: boolean) => {
    const status = statuses[qId] || 'not_visited';
    let base =
      'w-9 h-9 text-xs font-bold font-mono rounded-lg flex items-center justify-center relative transition-all cursor-pointer ';

    if (isCurrent) {
      base += 'ring-2 ring-blue-600 ring-offset-2 scale-105 z-10 ';
    }

    switch (status) {
      case 'answered':
        return base + 'bg-emerald-600 text-white shadow-2xs hover:bg-emerald-700';
      case 'not_answered':
        return base + 'bg-rose-500 text-white shadow-2xs hover:bg-rose-600';
      case 'marked_for_review':
        return base + 'bg-purple-600 text-white shadow-2xs hover:bg-purple-700';
      case 'answered_and_marked':
        return base + 'bg-purple-600 text-white shadow-2xs hover:bg-purple-700';
      case 'not_visited':
      default:
        return base + 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100';
    }
  };

  // Low time warning classes
  const isTimeCritical = secondsRemaining < 300; // < 5 mins
  const isTimeWarning = secondsRemaining < 900 && !isTimeCritical; // < 15 mins

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col select-none text-slate-900 font-sans">
      {/* 1. Examination Top Header */}
      <header className="bg-slate-900 text-white h-16 px-4 sm:px-6 flex items-center justify-between border-b border-slate-800 shrink-0 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm shadow-sm">
            S
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md">
                {exam.title}
              </span>
              <span className="hidden md:inline text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700 font-mono">
                {exam.category}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              Candidate: <span className="text-slate-200 font-semibold">{currentUser.name}</span> · Roll:{' '}
              <span className="text-slate-300">{currentUser.rollNumber}</span>
            </p>
          </div>
        </div>

        {/* Right Section: Countdown Timer, Instructions & Submit CTA */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          {/* Real Server Countdown Timer */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
              isTimeCritical
                ? 'bg-rose-950/80 border-rose-600 text-rose-200 animate-pulse'
                : isTimeWarning
                ? 'bg-amber-950/80 border-amber-600 text-amber-200'
                : 'bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <Clock
              className={`w-4 h-4 ${
                isTimeCritical ? 'text-rose-400' : isTimeWarning ? 'text-amber-400' : 'text-blue-400'
              }`}
            />
            <div className="text-right">
              <span className="text-[9px] uppercase font-mono block leading-none opacity-80">
                Time Remaining
              </span>
              <span className="text-sm font-mono font-bold tabular-nums leading-tight">
                {formatTime(secondsRemaining)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsQuestionPaperModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
            title="Browse full question paper"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Question Paper</span>
          </button>

          <button
            onClick={() => setIsInstructionsModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Instructions</span>
          </button>

          {/* Palette toggle button for smaller screens */}
          <button
            onClick={() => setIsPaletteDrawerOpen(!isPaletteDrawerOpen)}
            className="lg:hidden flex items-center gap-1 text-xs text-slate-200 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700"
          >
            <Menu className="w-3.5 h-3.5" />
            <span>Palette</span>
          </button>

          {/* Submit Test Button */}
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>
      </header>

      {/* 2. Subject Navigation Strip */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Sections:
          </span>
          {examSubjects.map((subName) => {
            const isCurrentSubject = activeSubject === subName;
            const subQuestions = examQuestions.filter((q) => q.subject === subName);
            const subAnswered = subQuestions.filter(
              (q) => statuses[q.id] === 'answered' || statuses[q.id] === 'answered_and_marked'
            ).length;

            return (
              <button
                key={subName}
                onClick={() => handleSwitchSubject(subName)}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-lg font-semibold transition-all whitespace-nowrap ${
                  isCurrentSubject
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{subName}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isCurrentSubject ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {subAnswered}/{subQuestions.length}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 font-mono hidden md:flex items-center gap-3">
          <span>Marking: +{currentQ?.marks || 4} / -{currentQ?.negativeMarks || 1}</span>
          <span>·</span>
          <span>Question {currentQIndex + 1} of {examQuestions.length}</span>
        </div>
      </div>

      {/* 3. Main CBT Workspace (Question View + Palette) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Area: Active Question Area */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
          {currentQ ? (
            <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              {/* Question Metadata Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 bg-slate-200 px-2.5 py-0.5 rounded font-mono">
                    Question {currentQIndex + 1}
                  </span>
                  <span className="font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {currentQ.subject}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-700 font-medium">{currentQ.topic}</span>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-semibold text-[11px]">
                    {currentQ.type}
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    +{currentQ.marks} Marks
                  </span>
                  {currentQ.negativeMarks > 0 && (
                    <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                      -{currentQ.negativeMarks} Negative
                    </span>
                  )}
                </div>
              </div>

              {/* Question Problem Statement */}
              <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="text-sm font-medium text-slate-900 leading-relaxed font-sans">
                  {currentQ.questionText}
                </div>

                {/* Question Type: Single Choice (MCQ) */}
                {currentQ.type === 'Single Choice (MCQ)' && currentQ.options && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Select One Answer Option:
                    </span>
                    <div className="space-y-2.5">
                      {currentQ.options.map((opt) => {
                        const isSelected = responses[currentQ.id] === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => handleSelectOption(opt.id)}
                            className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-blue-50/80 border-blue-600 shadow-2xs ring-1 ring-blue-600/30'
                                : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-slate-600 border border-slate-300'
                              }`}
                            >
                              {opt.id}
                            </span>
                            <span className="leading-relaxed font-medium text-slate-800 pt-0.5">
                              {opt.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question Type: Multiple Correct (JEE Advanced) */}
                {currentQ.type === 'Multiple Correct' && currentQ.options && (
                  <div className="space-y-3 pt-2">
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>
                        <strong>JEE Advanced Multi-Correct Pattern:</strong> Select all options that apply.
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {currentQ.options.map((opt) => {
                        const selectedKeys = (responses[currentQ.id] || '').split(',').filter(Boolean);
                        const isChecked = selectedKeys.includes(opt.id);

                        return (
                          <div
                            key={opt.id}
                            onClick={() => handleToggleMultiOption(opt.id)}
                            className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-purple-50/80 border-purple-600 shadow-2xs ring-1 ring-purple-600/30'
                                : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                                isChecked
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-white text-slate-600 border border-slate-300'
                              }`}
                            >
                              {isChecked ? <Check className="w-3.5 h-3.5" /> : opt.id}
                            </span>
                            <span className="leading-relaxed font-medium text-slate-800 pt-0.5">
                              {opt.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question Type: Numerical Value */}
                {currentQ.type === 'Numerical Value' && (
                  <div className="space-y-4 pt-2">
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                      <strong>Section B: Numerical Response.</strong> Enter non-negative integer or decimal value.
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {/* Input Box */}
                      <div className="w-full sm:w-64 space-y-2">
                        <label className="block text-xs font-semibold text-slate-700">
                          Your Numerical Answer:
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={responses[currentQ.id] || ''}
                          placeholder="0.00"
                          className="w-full text-xl font-mono font-bold px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 shadow-inner focus:outline-none"
                        />
                        {currentQ.unit && (
                          <span className="text-xs text-slate-500 font-mono block">
                            Specified Unit: {currentQ.unit}
                          </span>
                        )}
                      </div>

                      {/* Standard Virtual Number Pad */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Virtual Keypad
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 w-48 font-mono text-xs">
                          {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', '-'].map((key) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleKeypadPress(key)}
                              className="h-9 rounded bg-white hover:bg-slate-200 border border-slate-300 font-bold text-slate-800 active:scale-95 transition-transform"
                            >
                              {key}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleKeypadPress('BACKSPACE')}
                            className="h-8 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-[11px]"
                          >
                            Backspace
                          </button>
                          <button
                            type="button"
                            onClick={() => handleKeypadPress('CLEAR')}
                            className="h-8 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-[11px]"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Question Type: Descriptive */}
                {currentQ.type === 'Descriptive' && (
                  <div className="space-y-3 pt-2">
                    <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 text-xs text-sky-900">
                      <strong>Subjective Derivation Problem:</strong> Provide your complete steps and rationale. This problem will be reviewed and scored by the faculty committee against the institutional rubric.
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Candidate Mathematical / Chemical Derivation:
                      </label>
                      <textarea
                        rows={6}
                        value={responses[currentQ.id] || ''}
                        onChange={(e) => handleTextResponseChange(e.target.value)}
                        placeholder="Write out derivation formulas, boundary equations, and final evaluated conclusions..."
                        className="w-full p-3.5 text-xs rounded-xl border border-slate-300 font-mono bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                      <div className="text-[11px] text-slate-400 text-right">
                        {(responses[currentQ.id] || '').length} characters recorded
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Sticky Action Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Mark for Review & Next */}
                  <button
                    type="button"
                    onClick={handleMarkForReviewAndNext}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Mark for Review & Next</span>
                  </button>

                  {/* Clear Response */}
                  <button
                    type="button"
                    onClick={handleClearResponse}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Clear Response</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    type="button"
                    disabled={currentQIndex === 0}
                    onClick={() => jumpToQuestion(currentQIndex - 1)}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {/* Save & Next */}
                  <button
                    type="button"
                    onClick={handleSaveAndNext}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
                  >
                    <span>Save & Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500">
              No questions found for this examination.
            </div>
          )}
        </main>

        {/* Right Area: Question Palette Panel (Desktop) */}
        <aside
          className={`lg:w-80 w-full bg-white border-l border-slate-200 flex flex-col shrink-0 transition-transform lg:static fixed inset-y-0 right-0 z-40 lg:z-10 shadow-lg lg:shadow-none ${
            isPaletteDrawerOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Palette Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Question Palette</span>
            </h3>
            <button
              onClick={() => setIsPaletteDrawerOpen(false)}
              className="lg:hidden text-slate-500 hover:text-slate-800 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 5-State Color & Accessible Legend */}
          <div className="p-3.5 bg-slate-50/70 border-b border-slate-200 space-y-2 text-[11px]">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {countAnswered}
                </span>
                <span className="text-slate-700 font-medium">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-rose-500 text-white flex items-center justify-center font-bold text-[10px]">
                  {countNotAnswered}
                </span>
                <span className="text-slate-700 font-medium">Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-white text-slate-700 border border-slate-300 flex items-center justify-center font-bold text-[10px]">
                  {countNotVisited}
                </span>
                <span className="text-slate-700 font-medium">Not Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {countMarked}
                </span>
                <span className="text-slate-700 font-medium">Review</span>
              </div>
            </div>

            {/* Answered & Marked for Review Legend */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
              <span className="w-5 h-5 rounded bg-purple-600 text-white relative flex items-center justify-center font-bold text-[10px]">
                {countAnsweredAndMarked}
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-white" />
              </span>
              <span className="text-slate-600 leading-tight">
                Answered & Marked for Review (Evaluated)
              </span>
            </div>
          </div>

          {/* Palette Grid Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {activeSubject} Section Items:
              </div>
              <div className="grid grid-cols-5 gap-2">
                {examQuestions.map((q, idx) => {
                  const isCurrent = idx === currentQIndex;
                  const isAnsweredAndMarked = statuses[q.id] === 'answered_and_marked';

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => jumpToQuestion(idx)}
                      className={getPaletteBadgeClasses(q.id, isCurrent)}
                    >
                      <span>{idx + 1}</span>
                      {isAnsweredAndMarked && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Palette Footer Submit Button */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Entire Examination</span>
            </button>
          </div>
        </aside>
      </div>

      {/* 4. Submission Confirmation Dialog */}
      {isSubmitModalOpen && (
        <Modal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          title="Confirm Examination Submission"
          subtitle={`Are you sure you want to finish ${exam.title}?`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            {/* Warning if unanswered questions remain */}
            {countNotAnswered + countNotVisited > 0 && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Unanswered Questions Remaining:</span>
                  <p className="mt-0.5 text-amber-800">
                    You have {countNotAnswered + countNotVisited} question(s) not answered yet. Once submitted, you cannot resume or alter your responses.
                  </p>
                </div>
              </div>
            )}

            {/* Test Summary Breakdown Table */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-mono">
              <div className="text-slate-500 font-sans font-bold text-[11px] uppercase tracking-wider pb-1 border-b border-slate-200">
                Session Attempt Summary
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 font-sans">Total Questions:</span>
                <span className="font-bold text-slate-900">{examQuestions.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                <span className="font-sans">Answered Questions:</span>
                <span className="font-bold">{countAnswered}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                <span className="font-sans">Not Answered:</span>
                <span className="font-bold">{countNotAnswered}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-purple-700">
                <span className="font-sans">Marked for Review:</span>
                <span className="font-bold">{countMarked}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-purple-900">
                <span className="font-sans">Answered & Marked for Review:</span>
                <span className="font-bold">{countAnsweredAndMarked}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-500">
                <span className="font-sans">Not Visited:</span>
                <span>{countNotVisited}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-mono text-center">
              Time Left on Server: <span className="font-bold text-slate-800">{formatTime(secondsRemaining)}</span>
            </div>

            {/* Confirmation Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium transition-colors"
              >
                Return to Exam
              </button>
              <button
                type="button"
                onClick={performFinalSubmission}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-2xs"
              >
                Confirm & Submit Examination
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 5. In-Exam Instructions Modal */}
      {isInstructionsModalOpen && (
        <Modal
          isOpen={isInstructionsModalOpen}
          onClose={() => setIsInstructionsModalOpen(false)}
          title={`Instructions: ${exam.title}`}
          subtitle="Reference guide for CBT examination interface"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">Marking Scheme</div>
              <p>
                Each correct answer awards +{exam.markingScheme.correct} marks. Each incorrect answer incurs a penalty of {exam.markingScheme.incorrect} marks. Unanswered questions receive 0 marks.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-900">Palette Color Code Reference:</div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-emerald-600" />
                  <span>Answered — saved and evaluated.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-rose-500" />
                  <span>Not Answered — visited but no answer chosen.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-white border border-slate-300" />
                  <span>Not Visited — question not viewed yet.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-purple-600" />
                  <span>Marked for Review — will not be evaluated unless answered.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-purple-600 relative">
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
                  </span>
                  <span>Answered & Marked for Review — WILL be evaluated in JEE Main scoring.</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsInstructionsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs"
              >
                Close & Resume Test
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 5b. In-Exam Full Question Paper Modal (NTA CBT Feature) */}
      {isQuestionPaperModalOpen && (
        <Modal
          isOpen={isQuestionPaperModalOpen}
          onClose={() => setIsQuestionPaperModalOpen(false)}
          title={`Question Paper: ${exam.title}`}
          subtitle={`Total Questions: ${examQuestions.length} · Max Marks: ${exam.totalMarks}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            {/* Subject Filters */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setQpSubjectFilter('All')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    qpSubjectFilter === 'All'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All Sections
                </button>
                {examSubjects.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setQpSubjectFilter(sub)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      qpSubjectFilter === sub
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                Click any question to jump directly
              </span>
            </div>

            {/* Questions List */}
            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
              {examQuestions
                .map((q, idx) => ({ q, idx }))
                .filter(({ q }) => qpSubjectFilter === 'All' || q.subject === qpSubjectFilter)
                .map(({ q, idx }) => {
                  const state = statuses[q.id] || 'not_visited';
                  const isCurrent = idx === currentQIndex;

                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        jumpToQuestion(idx);
                        setIsQuestionPaperModalOpen(false);
                      }}
                      className={`p-4 rounded-xl border text-xs cursor-pointer transition-all hover:border-blue-500 hover:shadow-xs ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-50/40'
                          : 'border-slate-200 bg-slate-50/40 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200/80">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-slate-900 bg-slate-200 px-2 py-0.5 rounded">
                            Q{idx + 1}
                          </span>
                          <span className="font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {q.subject}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600 font-medium">{q.topic}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-slate-500">
                            +{q.marks}/-{q.negativeMarks} Marks
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-medium text-[10px] ${
                              state === 'answered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : state === 'answered_and_marked'
                                ? 'bg-purple-100 text-purple-800'
                                : state === 'marked_for_review'
                                ? 'bg-purple-100 text-purple-800'
                                : state === 'not_answered'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {state.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      <p className="font-medium text-slate-900 leading-relaxed mb-3">
                        {q.questionText}
                      </p>

                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {q.options.map((opt) => (
                            <div
                              key={opt.id}
                              className="p-2 rounded-lg bg-white border border-slate-200 flex items-start gap-2"
                            >
                              <span className="font-bold text-slate-700 shrink-0">{opt.id}.</span>
                              <span className="text-slate-700">{opt.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsQuestionPaperModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Close & Return to Question
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. Exit Safety Confirmation Modal */}
      {isExitModalOpen && (
        <Modal
          isOpen={isExitModalOpen}
          onClose={() => setIsExitModalOpen(false)}
          title="Exit Examination Session"
          subtitle="Are you sure you want to leave the active CBT screen?"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <p>
              Your current responses and timer will remain saved in this browser session. You can return to resume before the timer expires.
            </p>
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsExitModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium"
              >
                Continue Test
              </button>
              <button
                type="button"
                onClick={onExitTest}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold"
              >
                Exit to Selection
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
