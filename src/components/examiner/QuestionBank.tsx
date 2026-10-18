import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Filter,
  Check,
  FileCheck,
  Edit2,
  Copy,
  Archive,
  Layers,
  Sparkles,
  AlertCircle,
  Trash2,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import { Question, QuestionType, QuestionPaperDraft } from '../../types';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface QuestionBankProps {
  questions: Question[];
  drafts: QuestionPaperDraft[];
  onAddQuestion: (q: Question) => void;
  onUpdateQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onAddQuestionToDraft: (draftId: string, questionId: string) => void;
  onOpenAddModal: () => void;
}

export const QuestionBank: React.FC<QuestionBankProps> = ({
  questions,
  drafts,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddQuestionToDraft,
  onOpenAddModal,
}) => {
  const { showToast } = useToast();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<'All' | 'Physics' | 'Chemistry' | 'Mathematics'>('All');
  const [topicFilter, setTopicFilter] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Moderate' | 'Difficult'>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Expanded explanations
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});

  // Modals state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [addToDraftTargetQ, setAddToDraftTargetQ] = useState<Question | null>(null);
  const [selectedDraftId, setSelectedDraftId] = useState<string>(drafts[0]?.id || '');

  // Edit question form state
  const [editSubject, setEditSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics');
  const [editTopic, setEditTopic] = useState('');
  const [editSubtopic, setEditSubtopic] = useState('');
  const [editType, setEditType] = useState<QuestionType>('Single Choice (MCQ)');
  const [editDifficulty, setEditDifficulty] = useState<'Easy' | 'Moderate' | 'Difficult'>('Moderate');
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editOptA, setEditOptA] = useState('');
  const [editOptB, setEditOptB] = useState('');
  const [editOptC, setEditOptC] = useState('');
  const [editOptD, setEditOptD] = useState('');
  const [editCorrectAnswer, setEditCorrectAnswer] = useState('');
  const [editMultiCorrectAnswers, setEditMultiCorrectAnswers] = useState<string[]>([]);
  const [editTolerance, setEditTolerance] = useState<number>(0);
  const [editUnit, setEditUnit] = useState('');
  const [editMarks, setEditMarks] = useState(4);
  const [editNegativeMarks, setEditNegativeMarks] = useState(1);
  const [editExplanation, setEditExplanation] = useState('');
  const [editRubric, setEditRubric] = useState('');
  const [editStatus, setEditStatus] = useState<'Approved' | 'Review Required' | 'Draft'>('Approved');

  // Toggle explanation expand
  const toggleExplanation = (id: string) => {
    setExpandedExplanations((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Open Edit Modal
  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setEditSubject(q.subject);
    setEditTopic(q.topic);
    setEditSubtopic(q.subtopic || '');
    setEditType(q.type);
    setEditDifficulty(q.difficulty);
    setEditQuestionText(q.questionText);
    setEditOptA(q.options?.find((o) => o.id === 'A')?.text || '');
    setEditOptB(q.options?.find((o) => o.id === 'B')?.text || '');
    setEditOptC(q.options?.find((o) => o.id === 'C')?.text || '');
    setEditOptD(q.options?.find((o) => o.id === 'D')?.text || '');
    setEditCorrectAnswer(q.correctAnswer);
    setEditMultiCorrectAnswers(q.type === 'Multiple Correct' ? q.correctAnswer.split(',') : []);
    setEditTolerance(q.tolerance || 0);
    setEditUnit(q.unit || '');
    setEditMarks(q.marks);
    setEditNegativeMarks(q.negativeMarks);
    setEditExplanation(q.explanation);
    setEditRubric(q.evaluationRubric || '');
    setEditStatus(q.status);
  };

  // Handle Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    let finalAnswer = editCorrectAnswer;
    if (editType === 'Multiple Correct') {
      finalAnswer = editMultiCorrectAnswers.sort().join(',');
      if (!finalAnswer) {
        showToast('Validation Error', 'Please select at least one correct option for Multiple Correct', 'error');
        return;
      }
    }

    const updated: Question = {
      ...editingQuestion,
      subject: editSubject,
      topic: editTopic,
      subtopic: editSubtopic || undefined,
      type: editType,
      difficulty: editDifficulty,
      questionText: editQuestionText,
      options:
        editType === 'Single Choice (MCQ)' || editType === 'Multiple Correct'
          ? [
              { id: 'A', text: editOptA || 'Option A' },
              { id: 'B', text: editOptB || 'Option B' },
              { id: 'C', text: editOptC || 'Option C' },
              { id: 'D', text: editOptD || 'Option D' },
            ]
          : undefined,
      correctAnswer: finalAnswer,
      tolerance: editType === 'Numerical Value' ? editTolerance : undefined,
      unit: editType === 'Numerical Value' ? editUnit : undefined,
      marks: Number(editMarks),
      negativeMarks: Number(editNegativeMarks),
      explanation: editExplanation,
      evaluationRubric: editType === 'Descriptive' ? editRubric : undefined,
      status: editStatus,
      lastEdited: 'Just now',
    };

    onUpdateQuestion(updated);
    showToast('Question Updated', `${updated.code} modifications saved successfully`, 'success');
    setEditingQuestion(null);
  };

  // Handle Duplicate Question
  const handleDuplicate = (q: Question) => {
    const cloneCode = `${q.code}-V${Math.floor(Math.random() * 89 + 10)}`;
    const cloned: Question = {
      ...q,
      id: `q-${Date.now()}`,
      code: cloneCode,
      questionText: `[Clone] ${q.questionText}`,
      lastEdited: 'Just now',
      status: 'Draft',
    };
    onAddQuestion(cloned);
    showToast('Question Cloned', `Created variant ${cloneCode} as a new Draft`, 'info');
  };

  // Handle Add to Blueprint
  const handleConfirmAddToDraft = () => {
    if (!addToDraftTargetQ || !selectedDraftId) return;
    onAddQuestionToDraft(selectedDraftId, addToDraftTargetQ.id);
    const draft = drafts.find((d) => d.id === selectedDraftId);
    showToast(
      'Question Attached to Blueprint',
      `${addToDraftTargetQ.code} added to ${draft?.title || 'selected paper blueprint'}`,
      'success'
    );
    setAddToDraftTargetQ(null);
  };

  // Unique topics list for the selected subject
  const availableTopics = Array.from(
    new Set(
      questions
        .filter((q) => subjectFilter === 'All' || q.subject === subjectFilter)
        .map((q) => q.topic)
    )
  ).sort();

  // Filtered questions
  const filtered = questions.filter((q) => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.subtopic && q.subtopic.toLowerCase().includes(searchTerm.toLowerCase())) ||
      q.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.explanation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = subjectFilter === 'All' || q.subject === subjectFilter;
    const matchesTopic = topicFilter === 'All' || q.topic === topicFilter;
    const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    const matchesType = typeFilter === 'All' || q.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesSubject && matchesTopic && matchesDifficulty && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              Academic Item Bank
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {questions.length} Total Curated Items
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">Institutional Question Repository</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Physics, Chemistry, and Mathematics items with step-by-step derivations, marking schemes, and difficulty indexing.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors shrink-0 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Author New Question</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by formula, concept, code, topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white"
            />
          </div>

          {/* Subject Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
            {(['All', 'Physics', 'Chemistry', 'Mathematics'] as const).map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  setSubjectFilter(sub);
                  setTopicFilter('All');
                }}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  subjectFilter === sub
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Topic Dropdown */}
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-600 max-w-[200px] truncate"
          >
            <option value="All">All Topics ({availableTopics.length})</option>
            {availableTopics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Difficulty Dropdown */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy (Foundation)</option>
            <option value="Moderate">Moderate (JEE Main)</option>
            <option value="Difficult">Difficult (JEE Advanced)</option>
          </select>

          {/* Question Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          >
            <option value="All">All Question Types</option>
            <option value="Single Choice (MCQ)">Single Choice (MCQ)</option>
            <option value="Multiple Correct">Multiple Correct</option>
            <option value="Numerical Value">Numerical Value</option>
            <option value="Descriptive">Descriptive / Derivation</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-600"
          >
            <option value="All">All Review Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Review Required">Review Required</option>
            <option value="Draft">Draft</option>
          </select>

          {(searchTerm || subjectFilter !== 'All' || topicFilter !== 'All' || difficultyFilter !== 'All' || typeFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSubjectFilter('All');
                setTopicFilter('All');
                setDifficultyFilter('All');
                setTypeFilter('All');
                setStatusFilter('All');
              }}
              className="ml-auto text-xs text-indigo-700 hover:text-indigo-900 font-semibold underline underline-offset-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Result Metrics Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-mono">
        <span>Showing {filtered.length} of {questions.length} items</span>
        <span className="text-[11px] font-sans">
          Items conforming to NTA JEE Main & IIT JEE Advanced specification
        </span>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filtered.map((q, idx) => {
          const isExpOpen = !!expandedExplanations[q.id];

          return (
            <div
              key={q.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-all space-y-4 shadow-2xs"
            >
              {/* Question metadata header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded text-[11px] border border-slate-200">
                    {q.code}
                  </span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                      q.subject === 'Physics'
                        ? 'text-blue-800 bg-blue-50 border border-blue-200'
                        : q.subject === 'Chemistry'
                        ? 'text-indigo-800 bg-indigo-50 border border-indigo-200'
                        : 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                    }`}
                  >
                    {q.subject}
                  </span>
                  <span className="text-slate-400 font-medium">·</span>
                  <span className="text-slate-800 font-semibold">{q.topic}</span>
                  {q.subtopic && (
                    <>
                      <span className="text-slate-300 font-medium">/</span>
                      <span className="text-slate-500 font-medium">{q.subtopic}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span
                    className={`px-2 py-0.5 rounded font-medium ${
                      q.type === 'Multiple Correct'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : q.type === 'Numerical Value'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : q.type === 'Descriptive'
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {q.type}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded font-medium ${
                      q.difficulty === 'Difficult'
                        ? 'text-rose-700 bg-rose-50 border border-rose-200'
                        : q.difficulty === 'Moderate'
                        ? 'text-amber-700 bg-amber-50 border border-amber-200'
                        : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    }`}
                  >
                    {q.difficulty}
                  </span>

                  <span className="font-mono tabular-nums text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                    +{q.marks} / -{q.negativeMarks} marks
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded font-medium text-[10px] uppercase tracking-wider ${
                      q.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : q.status === 'Review Required'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {q.status}
                  </span>
                </div>
              </div>

              {/* Question Body */}
              <div>
                <p className="text-slate-900 text-sm font-medium leading-relaxed font-sans">
                  {q.questionText}
                </p>
              </div>

              {/* Single Choice Options */}
              {q.type === 'Single Choice (MCQ)' && q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {q.options.map((opt) => {
                    const isCorrect = opt.id === q.correctAnswer;
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs transition-colors ${
                          isCorrect
                            ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 font-medium'
                            : 'bg-slate-50/70 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] shrink-0 ${
                            isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-slate-700 border border-slate-200'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className="leading-snug">{opt.text}</span>
                        {isCorrect && (
                          <span className="ml-auto text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                            Verified Key
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Multiple Correct Options */}
              {q.type === 'Multiple Correct' && q.options && q.options.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] text-purple-700 font-semibold flex items-center gap-1.5">
                    <span>JEE Advanced Multi-Correct Choice (One or more options correct):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt) => {
                      const correctKeys = q.correctAnswer.split(',');
                      const isCorrect = correctKeys.includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs transition-colors ${
                            isCorrect
                              ? 'bg-purple-50/70 border-purple-300 text-slate-900 font-medium'
                              : 'bg-slate-50/70 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] shrink-0 ${
                              isCorrect
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-slate-700 border border-slate-200'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span className="leading-snug">{opt.text}</span>
                          {isCorrect && (
                            <span className="ml-auto text-[10px] uppercase font-bold text-purple-700 tracking-wider">
                              Key
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Numerical Response Answer Key */}
              {q.type === 'Numerical Value' && (
                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-900 font-semibold">Numerical Key:</span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-3 py-1 rounded border border-amber-300 text-sm shadow-2xs">
                      {q.correctAnswer} {q.unit || ''}
                    </span>
                    {q.tolerance !== undefined && q.tolerance > 0 && (
                      <span className="text-[11px] text-amber-800">
                        (Accepted tolerance: ±{q.tolerance})
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Non-negative integer / two decimal places
                  </span>
                </div>
              )}

              {/* Descriptive Answer Key & Rubric */}
              {q.type === 'Descriptive' && (
                <div className="p-3.5 bg-sky-50/50 rounded-lg border border-sky-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sky-900">Model Solution / Derivation:</span>
                    <span className="text-[10px] uppercase font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                      Descriptive Evaluation
                    </span>
                  </div>
                  <p className="font-mono text-slate-800 bg-white p-2.5 rounded border border-sky-100">
                    {q.correctAnswer}
                  </p>
                  {q.evaluationRubric && (
                    <div className="text-[11px] text-slate-600 pt-1 border-t border-sky-100">
                      <span className="font-semibold text-slate-700">Examiner Rubric: </span>
                      {q.evaluationRubric}
                    </div>
                  )}
                </div>
              )}

              {/* Footer Actions & Explanations */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => toggleExplanation(q.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 transition-colors"
                >
                  <span>{isExpOpen ? 'Hide Solution Derivation' : 'View Verified Solution & Derivation'}</span>
                  {isExpOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <div className="flex items-center gap-2">
                  {/* Add to Draft Paper Blueprint */}
                  <button
                    onClick={() => {
                      setAddToDraftTargetQ(q);
                      setSelectedDraftId(drafts[0]?.id || '');
                    }}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 font-medium transition-colors"
                    title="Attach this question to an active paper blueprint"
                  >
                    <Layers className="w-3 h-3 text-slate-500" />
                    <span>Add to Paper</span>
                  </button>

                  {/* Duplicate / Clone */}
                  <button
                    onClick={() => handleDuplicate(q)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 font-medium transition-colors"
                    title="Clone this question into a draft"
                  >
                    <Copy className="w-3 h-3 text-slate-500" />
                    <span className="hidden sm:inline">Clone</span>
                  </button>

                  {/* Edit Question */}
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 font-medium transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>

                  {/* Delete Question */}
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${q.code} from the question bank?`)) {
                        onDeleteQuestion(q.id);
                        showToast('Question Archived', `${q.code} removed from active repository`, 'info');
                      }
                    }}
                    className="text-xs p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Archive / Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Expanded Solution Box */}
              {isExpOpen && (
                <div className="p-4 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-slate-700 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Detailed Academic Solution & Derivation:
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Author: {q.author}
                    </span>
                  </div>
                  <p className="leading-relaxed font-sans text-slate-800 bg-white p-3 rounded border border-indigo-100">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500 space-y-2">
            <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-700 text-sm">No questions matched your search criteria.</p>
            <p>Try resetting filters or adjusting search keywords.</p>
          </div>
        )}
      </div>

      {/* Edit Question Modal */}
      {editingQuestion && (
        <Modal
          isOpen={!!editingQuestion}
          onClose={() => setEditingQuestion(null)}
          title={`Edit Question: ${editingQuestion.code}`}
          subtitle="Modify item text, curriculum classification, keys, and derivations"
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subject</label>
                <select
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Question Type</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Single Choice (MCQ)">Single Choice (MCQ)</option>
                  <option value="Multiple Correct">Multiple Correct (JEE Adv)</option>
                  <option value="Numerical Value">Numerical Value</option>
                  <option value="Descriptive">Descriptive / Derivation</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Difficulty</label>
                <select
                  value={editDifficulty}
                  onChange={(e) => setEditDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Easy">Easy (Foundation)</option>
                  <option value="Moderate">Moderate (JEE Main)</option>
                  <option value="Difficult">Difficult (JEE Advanced)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Curriculum Topic</label>
                <input
                  type="text"
                  required
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subtopic / Concept Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Angular Momentum Conservation"
                  value={editSubtopic}
                  onChange={(e) => setEditSubtopic(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Question Text (Problem Statement)</label>
              <textarea
                required
                rows={3}
                value={editQuestionText}
                onChange={(e) => setEditQuestionText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-sans"
              />
            </div>

            {/* MCQ Options */}
            {(editType === 'Single Choice (MCQ)' || editType === 'Multiple Correct') && (
              <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="block text-slate-700 font-semibold">Answer Options & Correct Key</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 font-bold text-center">A.</span>
                    <input
                      type="text"
                      required
                      value={editOptA}
                      onChange={(e) => setEditOptA(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                      placeholder="Option A text"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 font-bold text-center">B.</span>
                    <input
                      type="text"
                      required
                      value={editOptB}
                      onChange={(e) => setEditOptB(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                      placeholder="Option B text"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 font-bold text-center">C.</span>
                    <input
                      type="text"
                      required
                      value={editOptC}
                      onChange={(e) => setEditOptC(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                      placeholder="Option C text"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 font-bold text-center">D.</span>
                    <input
                      type="text"
                      required
                      value={editOptD}
                      onChange={(e) => setEditOptD(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                      placeholder="Option D text"
                    />
                  </div>
                </div>

                {/* Key selection */}
                {editType === 'Single Choice (MCQ)' ? (
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-slate-600 font-medium">Designate Correct Key:</span>
                    {(['A', 'B', 'C', 'D'] as const).map((key) => (
                      <label key={key} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="correctKey"
                          checked={editCorrectAnswer === key}
                          onChange={() => setEditCorrectAnswer(key)}
                          className="text-indigo-600"
                        />
                        <span className="font-bold">{key}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-4">
                    <span className="text-purple-700 font-semibold">Select all correct options:</span>
                    {(['A', 'B', 'C', 'D'] as const).map((key) => (
                      <label key={key} className="flex items-center gap-1.5 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={editMultiCorrectAnswers.includes(key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditMultiCorrectAnswers([...editMultiCorrectAnswers, key]);
                            } else {
                              setEditMultiCorrectAnswers(editMultiCorrectAnswers.filter((k) => k !== key));
                            }
                          }}
                          className="rounded text-purple-600"
                        />
                        <span className="font-bold">{key}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Numerical inputs */}
            {editType === 'Numerical Value' && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-amber-900 font-semibold mb-1">Correct Number</label>
                  <input
                    type="text"
                    required
                    value={editCorrectAnswer}
                    onChange={(e) => setEditCorrectAnswer(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-amber-300 bg-white font-mono"
                    placeholder="e.g. 24 or 3.14"
                  />
                </div>
                <div>
                  <label className="block text-amber-900 font-semibold mb-1">Tolerance (±)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editTolerance}
                    onChange={(e) => setEditTolerance(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded border border-amber-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-amber-900 font-semibold mb-1">Physical Unit (Optional)</label>
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-amber-300 bg-white"
                    placeholder="e.g. V, m/s, rad/s"
                  />
                </div>
              </div>
            )}

            {/* Descriptive inputs */}
            {editType === 'Descriptive' && (
              <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 space-y-3">
                <div>
                  <label className="block text-sky-900 font-semibold mb-1">Model Solution</label>
                  <textarea
                    rows={2}
                    value={editCorrectAnswer}
                    onChange={(e) => setEditCorrectAnswer(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-sky-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sky-900 font-semibold mb-1">Scoring Rubric</label>
                  <textarea
                    rows={2}
                    value={editRubric}
                    onChange={(e) => setEditRubric(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded border border-sky-300 bg-white"
                    placeholder="e.g. 2 marks for equation; 2 marks for derivation; 1 mark for conclusion"
                  />
                </div>
              </div>
            )}

            {/* Marks & Negatives & Status */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Award Marks (+)</label>
                <input
                  type="number"
                  required
                  value={editMarks}
                  onChange={(e) => setEditMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Negative Penalty (-)</label>
                <input
                  type="number"
                  required
                  value={editNegativeMarks}
                  onChange={(e) => setEditNegativeMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Review Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Approved">Approved</option>
                  <option value="Review Required">Review Required</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Step-by-Step Explanation & Derivation</label>
              <textarea
                required
                rows={3}
                value={editExplanation}
                onChange={(e) => setEditExplanation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-sans"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add to Draft Paper Modal */}
      {addToDraftTargetQ && (
        <Modal
          isOpen={!!addToDraftTargetQ}
          onClose={() => setAddToDraftTargetQ(null)}
          title={`Attach Question to Paper Blueprint`}
          subtitle={`Select draft paper to link ${addToDraftTargetQ.code}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-900">{addToDraftTargetQ.code}: {addToDraftTargetQ.topic}</div>
              <div className="text-slate-500 mt-0.5 line-clamp-2">{addToDraftTargetQ.questionText}</div>
              <div className="mt-2 text-[11px] font-mono text-indigo-700 font-medium">
                Subject: {addToDraftTargetQ.subject} · {addToDraftTargetQ.difficulty} · +{addToDraftTargetQ.marks} marks
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Select Active Blueprint</label>
              <select
                value={selectedDraftId}
                onChange={(e) => setSelectedDraftId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs"
              >
                {drafts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.examType}) - {d.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddToDraftTargetQ(null)}
                className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAddToDraft}
                className="px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Confirm Attachment</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
