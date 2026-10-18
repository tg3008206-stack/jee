import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle,
  Eye,
  AlertCircle,
  Calendar,
  Clock,
  User,
  Edit2,
  XCircle,
  AlertTriangle,
  Send,
  BookOpen,
  ArrowUpDown,
  Check,
} from 'lucide-react';
import { Exam, ExamStatus, DemoUser, SubjectStats, QuestionPaperDraft, Question } from '../../types';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface AdminExaminationsProps {
  exams: Exam[];
  examiners: DemoUser[];
  drafts?: QuestionPaperDraft[];
  questions?: Question[];
  onAddExam: (exam: Exam) => void;
  onUpdateExam: (exam: Exam) => void;
  onCancelExam: (examId: string) => void;
  onToggleStatus: (examId: string) => void;
  onApproveDraft?: (draftId: string, notes?: string) => void;
  onReturnDraft?: (draftId: string, feedback: string) => void;
}

export const AdminExaminations: React.FC<AdminExaminationsProps> = ({
  exams,
  examiners,
  drafts = [],
  questions = [],
  onAddExam,
  onUpdateExam,
  onCancelExam,
  onToggleStatus,
  onApproveDraft,
  onReturnDraft,
}) => {
  const { showToast } = useToast();

  // Navigation subtab
  const [activeSubTab, setActiveSubTab] = useState<'exams' | 'blueprints'>('exams');

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'JEE Main' | 'JEE Advanced' | 'Sectional Mock'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | ExamStatus>('All');
  const [subjectFilter, setSubjectFilter] = useState<'All' | 'Physics' | 'Chemistry' | 'Mathematics'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'marks'>('date');

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [detailsModalExam, setDetailsModalExam] = useState<Exam | null>(null);
  const [previewStudentExam, setPreviewStudentExam] = useState<Exam | null>(null);
  const [confirmCancelExam, setConfirmCancelExam] = useState<Exam | null>(null);
  const [blockedPublishExam, setBlockedPublishExam] = useState<Exam | null>(null);

  // Blueprint Review Modal
  const [selectedReviewDraft, setSelectedReviewDraft] = useState<QuestionPaperDraft | null>(null);
  const [isReturnMode, setIsReturnMode] = useState(false);
  const [returnFeedbackInput, setReturnFeedbackInput] = useState('');

  // Form Fields State
  const [formTitle, setFormTitle] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState<'JEE Main' | 'JEE Advanced' | 'Sectional Mock'>('JEE Main');
  const [formDate, setFormDate] = useState('2026-10-24');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formDuration, setFormDuration] = useState(180);
  const [formQuestions, setFormQuestions] = useState(90);
  const [formMarks, setFormMarks] = useState(300);
  const [formExaminer, setFormExaminer] = useState('');
  const [formBatch, setFormBatch] = useState('Super-30 JEE 2026');
  const [formDifficulty, setFormDifficulty] = useState<'Standard' | 'Moderate' | 'Challenging'>('Moderate');
  const [formVisibility, setFormVisibility] = useState<'Public to Enrolled Batches' | 'Hidden / Restricted'>('Public to Enrolled Batches');
  const [formSubjects, setFormSubjects] = useState<string[]>(['Physics', 'Chemistry', 'Mathematics']);
  const [formInstructions, setFormInstructions] = useState('');
  const [formPaperReady, setFormPaperReady] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingExamId(null);
    setFormTitle('');
    setFormCode(`JEE-${Math.floor(Math.random() * 899 + 100)}`);
    setFormCategory('JEE Main');
    setFormDate('2026-10-24');
    setFormStartTime('09:00');
    setFormDuration(180);
    setFormQuestions(90);
    setFormMarks(300);
    setFormExaminer(examiners[0]?.name || 'Prof. Rajesh Kulkarni (Physics HOD)');
    setFormBatch('Super-30 JEE 2026');
    setFormDifficulty('Moderate');
    setFormVisibility('Public to Enrolled Batches');
    setFormSubjects(['Physics', 'Chemistry', 'Mathematics']);
    setFormInstructions(
      'Duration is 180 minutes. Full syllabus test. Navigating between sections is permitted at any time.'
    );
    setFormPaperReady(true);
    setFormErrors({});
    setIsEditorOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (exam: Exam) => {
    setEditingExamId(exam.id);
    setFormTitle(exam.title);
    setFormCode(exam.code);
    setFormCategory(exam.category);
    setFormDate(exam.examDate || '2026-10-24');
    setFormStartTime(exam.startTime || '09:00');
    setFormDuration(exam.durationMinutes);
    setFormQuestions(exam.totalQuestions);
    setFormMarks(exam.totalMarks);
    setFormExaminer(exam.assignedExaminer || examiners[0]?.name || '');
    setFormBatch(exam.batch);
    setFormDifficulty(exam.difficulty);
    setFormVisibility(exam.visibility);
    setFormSubjects(exam.subjects.map((s) => s.name));
    setFormInstructions(exam.instructions.join('\n'));
    setFormPaperReady(exam.questionPaperReady);
    setFormErrors({});
    setIsEditorOpen(true);
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formTitle.trim()) errors.title = 'Examination title is required';
    if (!formCode.trim()) errors.code = 'Examination code is required';
    if (!formExaminer.trim()) errors.examiner = 'Assigned examiner is required';
    if (!formDate.trim()) errors.date = 'Examination date is required';
    if (!formStartTime.trim()) errors.startTime = 'Start time is required';
    if (formDuration <= 0) errors.duration = 'Duration must be greater than 0';
    if (formQuestions <= 0) errors.questions = 'Question count must be greater than 0';
    if (formMarks <= 0) errors.marks = 'Maximum marks must be greater than 0';
    if (formSubjects.length === 0) errors.subjects = 'Select at least one subject';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save Examination Handler (Draft or Published)
  const handleSaveExam = (desiredStatus: 'draft' | 'published' | 'scheduled') => {
    if (!validateForm()) {
      showToast('Validation Error', 'Please correct the highlighted fields before saving', 'error');
      return;
    }

    const calculatedEndTime = `${String(
      Math.min(23, Number(formStartTime.split(':')[0] || 9) + Math.floor(formDuration / 60))
    ).padStart(2, '0')}:${formStartTime.split(':')[1] || '00'}`;

    const subjectsArray: SubjectStats[] = formSubjects.map((subName) => ({
      name: subName as any,
      questionsCount: Math.round(formQuestions / formSubjects.length),
      maxMarks: Math.round(formMarks / formSubjects.length),
    }));

    const instructionsArray = formInstructions
      ? formInstructions.split('\n').filter((l) => l.trim().length > 0)
      : ['Follow standard CBT examination rules.'];

    const newExamData: Exam = {
      id: editingExamId || `exam-${Date.now()}`,
      code: formCode,
      title: formTitle,
      category: formCategory,
      status: desiredStatus,
      durationMinutes: Number(formDuration),
      totalMarks: Number(formMarks),
      totalQuestions: Number(formQuestions),
      startDate: `${formDate}T${formStartTime}:00Z`,
      endDate: `${formDate}T${calculatedEndTime}:00Z`,
      examDate: formDate,
      startTime: formStartTime,
      endTime: calculatedEndTime,
      scheduledDateTime: `${formDate} · ${formStartTime} - ${calculatedEndTime}`,
      venue: 'CBT Online Lab 1 & 2',
      assignedExaminer: formExaminer,
      questionPaperReady: formPaperReady,
      paperReadinessStatus: formPaperReady ? 'Ready for CBT' : 'Drafting in Progress',
      visibility: formVisibility,
      subjects: subjectsArray,
      enrolledCount: editingExamId ? exams.find((e) => e.id === editingExamId)?.enrolledCount || 120 : 120,
      completedCount: editingExamId ? exams.find((e) => e.id === editingExamId)?.completedCount || 0 : 0,
      negativeMarking: '+4 for correct, -1 for incorrect',
      markingScheme: { correct: 4, incorrect: -1, unattempted: 0 },
      difficulty: formDifficulty,
      batch: formBatch,
      instructions: instructionsArray,
    };

    if (editingExamId) {
      onUpdateExam(newExamData);
      showToast('Examination Updated', `${newExamData.title} updated as ${desiredStatus}`, 'success');
    } else {
      onAddExam(newExamData);
      showToast('Examination Created', `${newExamData.title} saved as ${desiredStatus}`, 'success');
    }

    setIsEditorOpen(false);
  };

  // Publish with Question Paper Readiness Guard (Test C - strict validation)
  const handlePublishClick = (exam: Exam) => {
    if (exam.status === 'published') {
      // Toggle back to draft
      onToggleStatus(exam.id);
      showToast('Unpublished', `${exam.title} is now saved as Draft (hidden from candidates)`, 'info');
      return;
    }

    // Check if question paper is ready and approved
    if (!exam.questionPaperReady || exam.paperReadinessStatus !== 'Ready for CBT') {
      setBlockedPublishExam(exam);
      return;
    }

    // Question paper is verified ready & approved -> publish
    onToggleStatus(exam.id);
    showToast('Examination Published', `${exam.title} is now active and available for enrolled candidates`, 'success');
  };

  const handleApproveBlueprint = (draft: QuestionPaperDraft) => {
    if (onApproveDraft) {
      onApproveDraft(draft.id, 'Approved by Institutional Administrator for CBT deployment');
    }
    showToast('Paper Blueprint Approved', `${draft.title} is now approved and locked for CBT deployment.`, 'success');
    setSelectedReviewDraft(null);
    setIsReturnMode(false);
  };

  const handleReturnBlueprint = (draft: QuestionPaperDraft) => {
    if (!returnFeedbackInput.trim()) {
      showToast('Feedback Required', 'Please enter specific revision instructions for the Lead Examiner.', 'error');
      return;
    }
    if (onReturnDraft) {
      onReturnDraft(draft.id, returnFeedbackInput);
    }
    showToast('Blueprint Returned for Revision', `Revision notes sent to ${draft.leadExaminer}`, 'warning');
    setSelectedReviewDraft(null);
    setIsReturnMode(false);
    setReturnFeedbackInput('');
  };

  // Filtered examinations
  const filteredExams = exams
    .filter((exam) => {
      const matchesSearch =
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exam.assignedExaminer && exam.assignedExaminer.toLowerCase().includes(searchTerm.toLowerCase())) ||
        exam.batch.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || exam.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || exam.status === statusFilter;
      const matchesSubject =
        subjectFilter === 'All' || exam.subjects.some((s) => s.name === subjectFilter);
      return matchesSearch && matchesCategory && matchesStatus && matchesSubject;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'marks') return b.totalMarks - a.totalMarks;
      return (b.examDate || '').localeCompare(a.examDate || '');
    });

  return (
    <div className="space-y-6">
      {/* Top Header & New Exam Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">Examination Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure, schedule, review paper readiness, and publish JEE competitive assessments
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shrink-0 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Examination</span>
        </button>
      </div>

      {/* Subtabs Navigation */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('exams')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
            activeSubTab === 'exams'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Examinations Registry ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('blueprints')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
            activeSubTab === 'blueprints'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Paper Blueprints & Review</span>
          {drafts.filter((d) => d.status === 'Submitted for Review').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white animate-pulse">
              {drafts.filter((d) => d.status === 'Submitted for Review').length} Review Required
            </span>
          )}
        </button>
      </div>

      {activeSubTab === 'exams' && (
        <>
          {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, code, examiner, or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="All">All Statuses ({exams.length})</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="All">All Types</option>
              <option value="JEE Main">JEE Main</option>
              <option value="JEE Advanced">JEE Advanced</option>
              <option value="Sectional Mock">Sectional Mock</option>
            </select>

            {/* Subject Filter */}
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="All">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="date">Sort: Date</option>
              <option value="title">Sort: Title</option>
              <option value="marks">Sort: Max Marks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Examinations Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Examination & Code</th>
                <th className="py-3 px-4">Type & Subjects</th>
                <th className="py-3 px-4">Duration & Marks</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Assigned Examiner</th>
                <th className="py-3 px-4">Status & Readiness</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{exam.title}</div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                      <span>{exam.code}</span>
                      <span>·</span>
                      <span className="text-slate-600">{exam.batch}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-800">{exam.category}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {exam.subjects.map((s) => s.name).join(' · ')}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono tabular-nums">
                    <div>{exam.durationMinutes} min · {exam.totalMarks} Marks</div>
                    <div className="text-[11px] text-slate-500 font-sans">{exam.totalQuestions} Questions</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    <div className="font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.examDate || 'Oct 24, 2026'}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.startTime || '09:00'} - {exam.endTime || '12:00'}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 text-[11px]">
                    <div className="font-medium text-slate-900">{exam.assignedExaminer || 'Unassigned'}</div>
                    <div className="text-slate-400 text-[10px]">Curator & Evaluator</div>
                  </td>

                  <td className="py-3.5 px-4 space-y-1">
                    <div>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${
                          exam.status === 'published'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : exam.status === 'scheduled'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : exam.status === 'completed'
                            ? 'bg-slate-100 text-slate-800 border border-slate-300'
                            : exam.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {exam.status}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          exam.questionPaperReady ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      <span>{exam.paperReadinessStatus || (exam.questionPaperReady ? 'Ready for CBT' : 'Drafting')}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Specs */}
                      <button
                        onClick={() => setDetailsModalExam(exam)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100"
                        title="View Specifications"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEdit(exam)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                        title="Edit Examination"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Publish / Unpublish */}
                      {exam.status !== 'completed' && exam.status !== 'cancelled' && (
                        <button
                          onClick={() => handlePublishClick(exam)}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                            exam.status === 'published'
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {exam.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                      )}

                      {/* Cancel / Close */}
                      {exam.status !== 'cancelled' && exam.status !== 'completed' && (
                        <button
                          onClick={() => setConfirmCancelExam(exam)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 rounded hover:bg-rose-50"
                          title="Cancel or Close Examination"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredExams.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-xs text-slate-500">
                    No examinations match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}

  {activeSubTab === 'blueprints' && (
    <div className="space-y-6">
      {/* Blueprint Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-sans block">Total Blueprints</span>
          <span className="text-xl font-bold text-slate-900">{drafts.length}</span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-sans block">Awaiting Review</span>
          <span className="text-xl font-bold text-blue-700">
            {drafts.filter((d) => d.status === 'Submitted for Review').length}
          </span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-sans block">Approved for CBT</span>
          <span className="text-xl font-bold text-emerald-700">
            {drafts.filter((d) => d.status === 'Approved').length}
          </span>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-500 font-sans block">Revisions Requested</span>
          <span className="text-xl font-bold text-rose-700">
            {drafts.filter((d) => d.status === 'Returned for Changes').length}
          </span>
        </div>
      </div>

      {/* Blueprints List */}
      <div className="space-y-4">
        {drafts.map((draft) => {
          const associatedExam = exams.find(
            (e) => e.id === draft.examId || e.title === draft.title || (draft.title && e.title.includes(draft.title))
          );

          return (
            <div
              key={draft.id}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {draft.examType}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        draft.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : draft.status === 'Submitted for Review'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : draft.status === 'Returned for Changes'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {draft.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">v{draft.version || 1}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{draft.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lead Examiner: <strong>{draft.leadExaminer}</strong> · Target Session: {draft.targetDate}
                    {associatedExam && ` · Bound to: ${associatedExam.code}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedReviewDraft(draft);
                      setIsReturnMode(false);
                      setReturnFeedbackInput(draft.reviewNotes || '');
                    }}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs ${
                      draft.status === 'Submitted for Review'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{draft.status === 'Submitted for Review' ? 'Review & Decide' : 'Inspect Blueprint'}</span>
                  </button>
                </div>
              </div>

              {/* Subject Breakdown & Progress */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Physics Section</span>
                  <span className="font-mono font-bold text-slate-900">{draft.physicsCount} Questions</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Chemistry Section</span>
                  <span className="font-mono font-bold text-slate-900">{draft.chemistryCount} Questions</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Mathematics Section</span>
                  <span className="font-mono font-bold text-slate-900">{draft.mathCount} Questions</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Total Yield</span>
                  <span className="font-mono font-bold text-slate-900">
                    {draft.questionIds?.length || 0} Qs / {draft.totalMarks} Marks
                  </span>
                </div>
              </div>

              {/* Review notes banner if returned */}
              {draft.reviewNotes && (
                <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
                  draft.status === 'Returned for Changes'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <span className="font-semibold">Review Feedback: </span>
                  {draft.reviewNotes}
                </div>
              )}
            </div>
          );
        })}

        {drafts.length === 0 && (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
            No paper blueprints have been initiated yet.
          </div>
        )}
      </div>
    </div>
  )}

      {/* Create / Edit Examination Modal */}
      <Modal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={editingExamId ? 'Edit Examination Specifications' : 'Create New Examination'}
        subtitle="Configure schedule, subjects, examiners, and CBT scoring parameters"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4 text-xs">
          {/* Title & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Examination Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. JEE (Main) 2026 - All India Grand Mock Test #05"
                className={`w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-1 ${
                  formErrors.title ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-600'
                }`}
              />
              {formErrors.title && <p className="text-[11px] text-rose-600 mt-1">{formErrors.title}</p>}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Exam Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="e.g. JEE-M-2026-M05"
                className={`w-full px-3 py-2 rounded-lg border font-mono bg-white focus:outline-none focus:ring-1 ${
                  formErrors.code ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-600'
                }`}
              />
              {formErrors.code && <p className="text-[11px] text-rose-600 mt-1">{formErrors.code}</p>}
            </div>
          </div>

          {/* Category & Assigned Examiner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Examination Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="JEE Main">JEE Main Mock Test (300 Marks, 90 Questions)</option>
                <option value="JEE Advanced">JEE Advanced Challenger (180 Marks, 54 Questions)</option>
                <option value="Sectional Mock">Sectional Mock Test (100 Marks, 25 Questions)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Assigned Examiner (Paper Lead) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formExaminer}
                onChange={(e) => setFormExaminer(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                {examiners.map((ex) => (
                  <option key={ex.id} value={`${ex.name} (${ex.department || 'Faculty'})`}>
                    {ex.name} ({ex.department || 'Examiner'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Time, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Examination Date</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Start Time (24h)</label>
              <input
                type="time"
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Duration (Minutes)</label>
              <input
                type="number"
                value={formDuration}
                onChange={(e) => setFormDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          {/* Questions, Marks, Batch */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Total Questions</label>
              <input
                type="number"
                value={formQuestions}
                onChange={(e) => setFormQuestions(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Maximum Marks</label>
              <input
                type="number"
                value={formMarks}
                onChange={(e) => setFormMarks(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Assigned Batch</label>
              <input
                type="text"
                value={formBatch}
                onChange={(e) => setFormBatch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          {/* Applicable Subjects */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Applicable Subjects</label>
            <div className="flex items-center gap-4 pt-1">
              {['Physics', 'Chemistry', 'Mathematics'].map((s) => {
                const checked = formSubjects.includes(s);
                return (
                  <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          setFormSubjects(formSubjects.filter((item) => item !== s));
                        } else {
                          setFormSubjects([...formSubjects, s]);
                        }
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-slate-800 font-medium">{s}</span>
                  </label>
                );
              })}
            </div>
            {formErrors.subjects && <p className="text-[11px] text-rose-600 mt-1">{formErrors.subjects}</p>}
          </div>

          {/* Question Paper Readiness Toggle */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-900 block">Question Paper Assembly Status</span>
              <span className="text-[11px] text-slate-500">
                Mark whether all questions, numerical keys, and answer diagrams are ready for CBT delivery.
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formPaperReady}
                onChange={(e) => setFormPaperReady(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 h-4 w-4"
              />
              <span className="font-semibold text-xs text-slate-800">
                {formPaperReady ? 'Paper Ready for CBT' : 'Drafting / Incomplete'}
              </span>
            </label>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Candidate Instructions (one per line)</label>
            <textarea
              rows={3}
              value={formInstructions}
              onChange={(e) => setFormInstructions(e.target.value)}
              placeholder="e.g. Duration is 180 minutes. Navigating between sections is permitted at any time."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-sans"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsEditorOpen(false)}
              className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveExam('draft')}
                className="px-3.5 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium border border-slate-200"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSaveExam('scheduled')}
                className="px-3.5 py-2 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 font-medium border border-blue-200"
              >
                Schedule Exam
              </button>

              <button
                type="button"
                onClick={() => handleSaveExam('published')}
                className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-semibold"
              >
                Publish Exam
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Specifications & Preview Modal */}
      {detailsModalExam && (
        <Modal
          isOpen={!!detailsModalExam}
          onClose={() => setDetailsModalExam(null)}
          title={`Specifications: ${detailsModalExam.title}`}
          subtitle={`Test Code: ${detailsModalExam.code} · ${detailsModalExam.category}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono">
              <div>
                <span className="text-slate-500 font-sans block text-[11px]">Maximum Marks</span>
                <span className="font-bold text-slate-900 text-sm">{detailsModalExam.totalMarks}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[11px]">Duration</span>
                <span className="font-bold text-slate-900 text-sm">{detailsModalExam.durationMinutes} min</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[11px]">Total Questions</span>
                <span className="font-bold text-slate-900 text-sm">{detailsModalExam.totalQuestions}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[11px]">Paper Readiness</span>
                <span className={`font-bold text-xs ${detailsModalExam.questionPaperReady ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {detailsModalExam.paperReadinessStatus}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
              <span className="font-semibold text-slate-900 block">Lead Examiner & Administration:</span>
              <p className="text-slate-700">{detailsModalExam.assignedExaminer || 'Faculty Committee'}</p>
              <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-1">
                <span>Date: {detailsModalExam.examDate}</span>
                <span>·</span>
                <span>Time: {detailsModalExam.startTime} - {detailsModalExam.endTime}</span>
                <span>·</span>
                <span>Venue: {detailsModalExam.venue || 'CBT Online Lab'}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Subject Section Distribution</h4>
              <div className="space-y-1.5">
                {detailsModalExam.subjects.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="font-medium text-slate-800">{s.name} Section</span>
                    <span className="font-mono text-slate-600">
                      {s.questionsCount} Questions ({s.maxMarks} Marks)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Student Instructions Briefing</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
                {detailsModalExam.instructions.map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setDetailsModalExam(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close Specifications
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog: Cancel Exam */}
      {confirmCancelExam && (
        <Modal
          isOpen={!!confirmCancelExam}
          onClose={() => setConfirmCancelExam(null)}
          title="Confirm Examination Cancellation"
          subtitle="Are you sure you want to cancel this examination session?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900">This action will cancel the test session.</p>
                <p className="text-rose-700 mt-1">
                  Candidates in <strong>{confirmCancelExam.batch}</strong> will no longer be able to start{' '}
                  <strong>{confirmCancelExam.title}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmCancelExam(null)}
                className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
              >
                Keep Active
              </button>
              <button
                onClick={() => {
                  onCancelExam(confirmCancelExam.id);
                  showToast('Examination Cancelled', `${confirmCancelExam.title} has been cancelled`, 'warning');
                  setConfirmCancelExam(null);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Strict Publication Blocked Modal (Test C) */}
      {blockedPublishExam && (
        <Modal
          isOpen={!!blockedPublishExam}
          onClose={() => setBlockedPublishExam(null)}
          title="Publication Blocked: Approved Paper Required"
          subtitle="Examination compliance and quality safeguard"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900">Cannot Publish Unapproved Examination</p>
                <p className="text-rose-700 mt-1 leading-relaxed">
                  <strong>{blockedPublishExam.title}</strong> cannot be published because its question paper has not been approved yet.
                </p>
                <div className="mt-2 text-[11px] bg-white/80 p-2 rounded border border-rose-200 space-y-1">
                  <div><span className="font-semibold text-slate-700">Current Status:</span> <span className="font-mono text-rose-800">{blockedPublishExam.paperReadinessStatus}</span></div>
                  <div><span className="font-semibold text-slate-700">Assigned Examiner:</span> <span className="text-slate-800">{blockedPublishExam.assignedExaminer || 'Unassigned'}</span></div>
                </div>
                <p className="text-slate-600 mt-2 text-[11px] leading-relaxed">
                  <strong>What must be fixed:</strong> The assigned Lead Examiner must assemble and submit the paper blueprint. An Administrator must then review and approve the blueprint before this examination can be made available to candidates.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setBlockedPublishExam(null)}
                className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setBlockedPublishExam(null);
                  setActiveSubTab('blueprints');
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-2xs"
              >
                Go to Paper Blueprints
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Blueprint Review & Approval Modal */}
      {selectedReviewDraft && (
        <Modal
          isOpen={!!selectedReviewDraft}
          onClose={() => {
            setSelectedReviewDraft(null);
            setIsReturnMode(false);
            setReturnFeedbackInput('');
          }}
          title="Review Question Paper Blueprint"
          subtitle={`${selectedReviewDraft.title} · Lead: ${selectedReviewDraft.leadExaminer}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4 text-xs text-slate-700">
            {/* Summary metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans block">Exam Type</span>
                <span className="font-bold text-slate-900">{selectedReviewDraft.examType}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans block">Total Questions</span>
                <span className="font-bold text-slate-900">{selectedReviewDraft.questionIds?.length || 0} / {selectedReviewDraft.totalQuestions}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans block">Total Marks</span>
                <span className="font-bold text-slate-900">{selectedReviewDraft.totalMarks} Marks</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-sans block">Current Status</span>
                <span className={`font-bold capitalize ${
                  selectedReviewDraft.status === 'Approved' ? 'text-emerald-700' :
                  selectedReviewDraft.status === 'Submitted for Review' ? 'text-blue-700' :
                  selectedReviewDraft.status === 'Returned for Changes' ? 'text-rose-700' : 'text-amber-700'
                }`}>
                  {selectedReviewDraft.status}
                </span>
              </div>
            </div>

            {/* Subject Distribution */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div><span className="text-slate-500">Physics:</span> <strong className="font-mono text-slate-900">{selectedReviewDraft.physicsCount} Qs</strong></div>
                <div><span className="text-slate-500">Chemistry:</span> <strong className="font-mono text-slate-900">{selectedReviewDraft.chemistryCount} Qs</strong></div>
                <div><span className="text-slate-500">Mathematics:</span> <strong className="font-mono text-slate-900">{selectedReviewDraft.mathCount} Qs</strong></div>
              </div>
              <span className="text-[11px] text-slate-500">Updated: {selectedReviewDraft.updatedAt}</span>
            </div>

            {/* Questions preview */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Attached Question Items ({selectedReviewDraft.questionIds?.length || 0})</h4>
              <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-lg p-2 bg-slate-50/50">
                {(selectedReviewDraft.questionIds || []).map((qId, idx) => {
                  const q = questions.find((item) => item.id === qId);
                  if (!q) {
                    return (
                      <div key={qId} className="p-2 bg-white rounded border border-slate-200 text-[11px] text-slate-500">
                        Item ID: {qId} (Referenced in blueprint)
                      </div>
                    );
                  }
                  return (
                    <div key={q.id} className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">#{idx + 1} {q.code}</span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {q.subject}
                          </span>
                          <span className="text-[10px] text-slate-500">{q.topic}</span>
                        </div>
                        <p className="text-slate-700 mt-1 line-clamp-2">{q.questionText}</p>
                      </div>
                      <div className="text-right shrink-0 font-mono text-[11px]">
                        <span className="text-emerald-700 font-bold block">+{q.marks} / -{q.negativeMarks}</span>
                        <span className="text-slate-400 text-[10px] block">Key: {q.correctAnswer}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Return / Revision feedback input */}
            {isReturnMode ? (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
                <label className="block font-semibold text-rose-900">
                  Revision Feedback for Lead Examiner ({selectedReviewDraft.leadExaminer})
                </label>
                <textarea
                  rows={3}
                  value={returnFeedbackInput}
                  onChange={(e) => setReturnFeedbackInput(e.target.value)}
                  placeholder="e.g. Please replace 2 Physics mechanics questions with Electrodynamics items and verify option C in chemistry Q4."
                  className="w-full p-2.5 rounded-lg border border-rose-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      setIsReturnMode(false);
                      setReturnFeedbackInput('');
                    }}
                    className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReturnBlueprint(selectedReviewDraft)}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-2xs"
                  >
                    Confirm & Return for Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  onClick={() => setIsReturnMode(true)}
                  className="px-3.5 py-2 text-rose-700 hover:bg-rose-50 border border-rose-200 font-semibold rounded-lg transition-colors"
                >
                  Return for Changes
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedReviewDraft(null)}
                    className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                  >
                    Close Preview
                  </button>
                  <button
                    onClick={() => handleApproveBlueprint(selectedReviewDraft)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-2xs flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve Paper for CBT</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
