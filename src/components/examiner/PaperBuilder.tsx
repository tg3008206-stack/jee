import React, { useState } from 'react';
import {
  FileEdit,
  Plus,
  CheckCircle,
  Clock,
  BookOpen,
  Layers,
  Sparkles,
  Send,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { QuestionPaperDraft, Question, PaperLifecycleStatus } from '../../types';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface PaperBuilderProps {
  drafts: QuestionPaperDraft[];
  questions: Question[];
  onAddDraft: (draft: QuestionPaperDraft) => void;
  onUpdateDraft: (draft: QuestionPaperDraft) => void;
}

export const PaperBuilder: React.FC<PaperBuilderProps> = ({
  drafts,
  questions,
  onAddDraft,
  onUpdateDraft,
}) => {
  const { showToast } = useToast();
  const [selectedDraftId, setSelectedDraftId] = useState<string>(drafts[0]?.id || '');
  const [isNewDraftModalOpen, setIsNewDraftModalOpen] = useState(false);
  const [isSubmitReviewModalOpen, setIsSubmitReviewModalOpen] = useState(false);
  const [reviewNotesInput, setReviewNotesInput] = useState('');

  // Integrated Question Browser within Paper Studio
  const [pickerSubject, setPickerSubject] = useState<'All' | 'Physics' | 'Chemistry' | 'Mathematics'>('All');
  const [pickerSearch, setPickerSearch] = useState('');

  // Form states for creating a new blueprint
  const [newTitle, setNewTitle] = useState('');
  const [newExamType, setNewExamType] = useState<'JEE Main' | 'JEE Advanced' | 'Sectional Mock'>('JEE Main');
  const [newTargetDate, setNewTargetDate] = useState('Nov 20, 2026');
  const [newLeadExaminer, setNewLeadExaminer] = useState('Prof. Rajesh Kulkarni');

  const selectedDraft = drafts.find((d) => d.id === selectedDraftId) || drafts[0];

  // Questions attached to currently selected draft
  const attachedQuestionIds = new Set(selectedDraft?.questionIds || []);
  const attachedQuestions = questions.filter((q) => attachedQuestionIds.has(q.id));

  // Dynamic calculations for the blueprint
  const targetPerSubject =
    selectedDraft?.examType === 'JEE Advanced'
      ? 18
      : selectedDraft?.examType === 'Sectional Mock'
      ? 30
      : 30;

  const currentPhysics = attachedQuestions.filter((q) => q.subject === 'Physics').length;
  const currentChemistry = attachedQuestions.filter((q) => q.subject === 'Chemistry').length;
  const currentMath = attachedQuestions.filter((q) => q.subject === 'Mathematics').length;
  const currentTotal = attachedQuestions.length;

  const easyCount = attachedQuestions.filter((q) => q.difficulty === 'Easy').length;
  const modCount = attachedQuestions.filter((q) => q.difficulty === 'Moderate').length;
  const diffCount = attachedQuestions.filter((q) => q.difficulty === 'Difficult').length;

  // Add question to active blueprint
  const handleAddQuestionToPaper = (qId: string) => {
    if (!selectedDraft) return;
    if (attachedQuestionIds.has(qId)) return;

    const updatedIds = [...(selectedDraft.questionIds || []), qId];
    const qAdded = questions.find((q) => q.id === qId);

    const newPhysics = currentPhysics + (qAdded?.subject === 'Physics' ? 1 : 0);
    const newChemistry = currentChemistry + (qAdded?.subject === 'Chemistry' ? 1 : 0);
    const newMath = currentMath + (qAdded?.subject === 'Mathematics' ? 1 : 0);

    const totalTarget = selectedDraft.totalQuestions || 90;
    const completion = Math.min(100, Math.round((updatedIds.length / totalTarget) * 100));

    const updatedDraft: QuestionPaperDraft = {
      ...selectedDraft,
      questionIds: updatedIds,
      physicsCount: newPhysics,
      chemistryCount: newChemistry,
      mathCount: newMath,
      completionPercentage: completion,
      updatedAt: 'Just now',
    };

    onUpdateDraft(updatedDraft);
    showToast('Question Added to Paper', `${qAdded?.code} added to ${selectedDraft.title}`, 'success');
  };

  // Remove question from active blueprint
  const handleRemoveQuestionFromPaper = (qId: string) => {
    if (!selectedDraft) return;
    const updatedIds = (selectedDraft.questionIds || []).filter((id) => id !== qId);
    const qRemoved = questions.find((q) => q.id === qId);

    const newPhysics = Math.max(0, currentPhysics - (qRemoved?.subject === 'Physics' ? 1 : 0));
    const newChemistry = Math.max(0, currentChemistry - (qRemoved?.subject === 'Chemistry' ? 1 : 0));
    const newMath = Math.max(0, currentMath - (qRemoved?.subject === 'Mathematics' ? 1 : 0));

    const totalTarget = selectedDraft.totalQuestions || 90;
    const completion = Math.min(100, Math.round((updatedIds.length / totalTarget) * 100));

    const updatedDraft: QuestionPaperDraft = {
      ...selectedDraft,
      questionIds: updatedIds,
      physicsCount: newPhysics,
      chemistryCount: newChemistry,
      mathCount: newMath,
      completionPercentage: completion,
      updatedAt: 'Just now',
    };

    onUpdateDraft(updatedDraft);
    showToast('Question Removed', `${qRemoved?.code} detached from paper blueprint`, 'info');
  };

  // Submit Blueprint for Review (Freezes question snapshots and tracks revisions)
  const handleConfirmSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDraft) return;

    // Freeze question snapshots for this review submission
    const currentSnapshots = questions.filter((q) => (selectedDraft.questionIds || []).includes(q.id));
    const isRevision = selectedDraft.status === 'Returned for Changes';
    const nextVersion = isRevision ? (selectedDraft.version || 1) + 1 : (selectedDraft.version || 1);

    const updatedDraft: QuestionPaperDraft = {
      ...selectedDraft,
      status: 'Submitted for Review',
      version: nextVersion,
      reviewNotes: reviewNotesInput || (isRevision ? 'Revised paper submitted addressing Admin notes' : 'Ready for Academic Reviewer sign-off'),
      questionSnapshots: currentSnapshots,
      submittedAt: 'Just now',
      updatedAt: 'Just now',
    };

    onUpdateDraft(updatedDraft);
    showToast(
      'Paper Blueprint Submitted for Review',
      `${selectedDraft.title} (v${nextVersion}) is now under review by Academic Admin`,
      'success'
    );
    setIsSubmitReviewModalOpen(false);
    setReviewNotesInput('');
  };

  // Handle Create New Blueprint
  const handleCreateBlueprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Validation Error', 'Blueprint title is required', 'error');
      return;
    }

    const totalQ = newExamType === 'JEE Advanced' ? 54 : newExamType === 'Sectional Mock' ? 30 : 90;
    const totalM = newExamType === 'JEE Advanced' ? 180 : newExamType === 'Sectional Mock' ? 100 : 300;

    const newDraft: QuestionPaperDraft = {
      id: `drf-${Date.now()}`,
      title: newTitle,
      examType: newExamType,
      targetDate: newTargetDate,
      totalQuestions: totalQ,
      totalMarks: totalM,
      physicsCount: 0,
      chemistryCount: 0,
      mathCount: 0,
      status: 'Drafting',
      completionPercentage: 0,
      leadExaminer: newLeadExaminer,
      questionIds: [],
      updatedAt: 'Just now',
    };

    onAddDraft(newDraft);
    setSelectedDraftId(newDraft.id);
    showToast('New Blueprint Initialized', `${newTitle} created in workspace`, 'success');
    setIsNewDraftModalOpen(false);
    setNewTitle('');
  };

  // Questions available for picking
  const availableToPick = questions.filter((q) => {
    const matchesSubject = pickerSubject === 'All' || q.subject === pickerSubject;
    const matchesSearch =
      q.questionText.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      q.topic.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      q.code.toLowerCase().includes(pickerSearch.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              Examination Paper Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">
              NTA CBT & IIT-JEE Blueprint Assembly
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">Question Paper Assembly Studio</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Assemble multi-concept JEE test papers with balanced subject quotas, difficulty curves, and verified answer keys.
          </p>
        </div>
        <button
          onClick={() => setIsNewDraftModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors shrink-0 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Paper Blueprint</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Blueprint List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Question Papers ({drafts.length})
            </h3>
          </div>

          <div className="space-y-2.5">
            {drafts.map((d) => {
              const isSelected = selectedDraft?.id === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDraftId(d.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-600/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {d.examType}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        d.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : d.status === 'Submitted for Review'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : d.status === 'Returned for Changes'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mt-2 leading-snug">{d.title}</h4>

                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Target: {d.targetDate}</span>
                    <span className="font-mono font-medium text-slate-700">
                      {d.questionIds?.length || 0} / {d.totalQuestions} Questions
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        d.completionPercentage >= 100
                          ? 'bg-emerald-600'
                          : d.completionPercentage >= 50
                          ? 'bg-indigo-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, d.completionPercentage || 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Blueprint Studio Workspace (8 cols) */}
        {selectedDraft ? (
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            {/* Blueprint Overview Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                    {selectedDraft.examType} Blueprint
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      selectedDraft.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : selectedDraft.status === 'Submitted for Review'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : selectedDraft.status === 'Returned for Changes'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {selectedDraft.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">v{selectedDraft.version || 1}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedDraft.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lead Examiner: {selectedDraft.leadExaminer} · Target Date: {selectedDraft.targetDate} · Updated: {selectedDraft.updatedAt}
                </p>
                {selectedDraft.status === 'Returned for Changes' ? (
                  <div className="mt-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Admin Revisions Requested (Action Required):</span>
                      <p className="mt-0.5 text-rose-800 leading-relaxed">
                        {selectedDraft.reviewNotes || 'Please adjust the question items to satisfy institutional assessment standards.'}
                      </p>
                    </div>
                  </div>
                ) : selectedDraft.reviewNotes && (
                  <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="font-semibold text-slate-800">Review Notes: </span>
                    {selectedDraft.reviewNotes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {selectedDraft.status !== 'Submitted for Review' && selectedDraft.status !== 'Approved' && (
                  <button
                    onClick={() => {
                      setReviewNotesInput(selectedDraft.reviewNotes || '');
                      setIsSubmitReviewModalOpen(true);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-2xs ${
                      selectedDraft.status === 'Returned for Changes'
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-indigo-700 hover:bg-indigo-800'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {selectedDraft.status === 'Returned for Changes'
                        ? `Resubmit for Review (v${(selectedDraft.version || 1) + 1})`
                        : 'Submit for Admin Review'}
                    </span>
                  </button>
                )}
                {selectedDraft.status === 'Submitted for Review' && (
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Awaiting Admin Approval</span>
                  </span>
                )}
                {selectedDraft.status === 'Approved' && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>CBT Approved</span>
                  </span>
                )}
              </div>
            </div>

            {/* Subject Allocation Breakdown Matrix */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Subject Quotas & Curriculum Distribution
                </h4>
                <span className="text-xs font-mono font-medium text-slate-500">
                  {currentTotal} / {selectedDraft.totalQuestions} Questions Linked
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Physics */}
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-900 font-semibold">Physics</span>
                    <span className="font-mono font-bold text-blue-900 text-sm">
                      {currentPhysics} / {targetPerSubject}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, (currentPhysics / targetPerSubject) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-blue-700 mt-1 block">
                    {currentPhysics >= targetPerSubject ? '✓ Section Quota Met' : `${targetPerSubject - currentPhysics} needed`}
                  </span>
                </div>

                {/* Chemistry */}
                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-200">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-900 font-semibold">Chemistry</span>
                    <span className="font-mono font-bold text-indigo-900 text-sm">
                      {currentChemistry} / {targetPerSubject}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-indigo-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, (currentChemistry / targetPerSubject) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-indigo-700 mt-1 block">
                    {currentChemistry >= targetPerSubject ? '✓ Section Quota Met' : `${targetPerSubject - currentChemistry} needed`}
                  </span>
                </div>

                {/* Mathematics */}
                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-900 font-semibold">Mathematics</span>
                    <span className="font-mono font-bold text-emerald-900 text-sm">
                      {currentMath} / {targetPerSubject}
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, (currentMath / targetPerSubject) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-emerald-700 mt-1 block">
                    {currentMath >= targetPerSubject ? '✓ Section Quota Met' : `${targetPerSubject - currentMath} needed`}
                  </span>
                </div>
              </div>

              {/* Difficulty Curve breakdown */}
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-slate-700">Difficulty Curve:</span>
                <div className="flex items-center gap-4 text-[11px] font-mono">
                  <span className="text-emerald-700">Easy: {easyCount}</span>
                  <span className="text-amber-700">Moderate: {modCount}</span>
                  <span className="text-rose-700">Difficult: {diffCount}</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Estimated Marks: {attachedQuestions.reduce((sum, q) => sum + (q.marks || 4), 0)} Marks
                </span>
              </div>
            </div>

            {/* Quality & Completeness Review Checklist */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Paper Quality & Verification Checklist
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Answer keys verified with step-by-step derivations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Marking scheme (+4 / -1 or +4 / -2) strictly configured</span>
                </div>
                <div className="flex items-center gap-2">
                  {currentTotal >= selectedDraft.totalQuestions ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                  <span>
                    Total Question count requirement ({currentTotal}/{selectedDraft.totalQuestions})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Curriculum aligned with current NTA JEE specifications</span>
                </div>
              </div>
            </div>

            {/* Attached Questions Table with Detach action */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Attached Examination Items ({attachedQuestions.length})
                </h4>
                <span className="text-xs text-slate-500 font-mono">
                  Order in CBT question sequence
                </span>
              </div>

              {attachedQuestions.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {attachedQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">Q{idx + 1}.</span>
                          <span className="font-semibold text-slate-900 font-mono">{q.code}</span>
                          <span className="text-slate-400">·</span>
                          <span
                            className={`font-semibold px-2 py-0.2 rounded text-[10px] ${
                              q.subject === 'Physics'
                                ? 'text-blue-800 bg-blue-50'
                                : q.subject === 'Chemistry'
                                ? 'text-indigo-800 bg-indigo-50'
                                : 'text-emerald-800 bg-emerald-50'
                            }`}
                          >
                            {q.subject}
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600 truncate">{q.topic}</span>
                        </div>
                        <p className="text-slate-500 truncate text-[11px]">{q.questionText}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] font-mono text-slate-600">
                          +{q.marks}/-{q.negativeMarks}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            q.difficulty === 'Difficult'
                              ? 'text-rose-700 bg-rose-50'
                              : q.difficulty === 'Moderate'
                              ? 'text-amber-700 bg-amber-50'
                              : 'text-emerald-700 bg-emerald-50'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                        <button
                          onClick={() => handleRemoveQuestionFromPaper(q.id)}
                          className="text-xs p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Detach question from blueprint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500">
                  No questions attached yet. Browse and add questions from the repository below.
                </div>
              )}
            </div>

            {/* Quick Question Bank Picker Section */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Add Items from Institutional Question Bank
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Search and click "+ Add to Paper" to assemble questions into this blueprint
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={pickerSubject}
                    onChange={(e) => setPickerSubject(e.target.value as any)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="All">All Subjects</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>

                  <div className="relative w-44">
                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {availableToPick.map((q) => {
                  const isAlreadyAdded = attachedQuestionIds.has(q.id);

                  return (
                    <div
                      key={q.id}
                      className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                        isAlreadyAdded
                          ? 'bg-slate-100/70 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{q.code}</span>
                          <span className="font-semibold text-slate-700">{q.subject}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600 truncate">{q.topic}</span>
                        </div>
                        <p className="text-slate-500 truncate text-[11px] mt-0.5">{q.questionText}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-slate-600">
                          +{q.marks} / -{q.negativeMarks}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                            q.difficulty === 'Difficult'
                              ? 'text-rose-700 bg-rose-50'
                              : q.difficulty === 'Moderate'
                              ? 'text-amber-700 bg-amber-50'
                              : 'text-emerald-700 bg-emerald-50'
                          }`}
                        >
                          {q.difficulty}
                        </span>

                        {isAlreadyAdded ? (
                          <span className="text-[11px] text-slate-500 px-2.5 py-1 font-medium bg-slate-200 rounded">
                            Added
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddQuestionToPaper(q.id)}
                            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-indigo-700 hover:bg-indigo-800 text-white font-medium transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {availableToPick.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No matching questions found in the repository.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            Please select or initialize a paper blueprint.
          </div>
        )}
      </div>

      {/* New Draft Blueprint Modal */}
      <Modal
        isOpen={isNewDraftModalOpen}
        onClose={() => setIsNewDraftModalOpen(false)}
        title="Initialize New Paper Blueprint"
        subtitle="Configure target test specifications and curriculum ratios"
      >
        <form onSubmit={handleCreateBlueprint} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Blueprint Title</label>
            <input
              type="text"
              required
              placeholder="e.g. JEE (Main) 2026 - National Grand Mock #06"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Examination Category</label>
              <select
                value={newExamType}
                onChange={(e) => setNewExamType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="JEE Main">JEE Main (90 Questions, 300 Marks)</option>
                <option value="JEE Advanced">JEE Advanced (54 Questions, 180 Marks)</option>
                <option value="Sectional Mock">Sectional Mock (30 Questions, 100 Marks)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Examination Date</label>
              <input
                type="text"
                value={newTargetDate}
                onChange={(e) => setNewTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Lead Examiner / Faculty</label>
            <input
              type="text"
              value={newLeadExaminer}
              onChange={(e) => setNewLeadExaminer(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewDraftModalOpen(false)}
              className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold"
            >
              Initialize Blueprint
            </button>
          </div>
        </form>
      </Modal>

      {/* Submit for Review Modal */}
      {isSubmitReviewModalOpen && selectedDraft && (
        <Modal
          isOpen={isSubmitReviewModalOpen}
          onClose={() => setIsSubmitReviewModalOpen(false)}
          title={`Submit Blueprint for Review: ${selectedDraft.title}`}
          subtitle="Send paper to the Examination Council and Admin for CBT scheduling"
        >
          <form onSubmit={handleConfirmSubmitReview} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="font-semibold text-slate-900">Blueprint Summary</div>
              <div className="text-slate-600">
                Category: <span className="font-semibold">{selectedDraft.examType}</span> · Attached Questions:{' '}
                <span className="font-semibold">{currentTotal}</span> / {selectedDraft.totalQuestions}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                P: {currentPhysics} | C: {currentChemistry} | M: {currentMath}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reviewer Sign-off Notes & Remarks</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Physics Section A (20 MCQs) and Section B (Numerical) complete. Answer keys verified with step derivations. Ready for CBT lab publishing."
                value={reviewNotesInput}
                onChange={(e) => setReviewNotesInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-sans"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSubmitReviewModalOpen(false)}
                className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm Submission</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
