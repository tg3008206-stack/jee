import React, { useState } from 'react';
import { Sidebar } from '../common/Sidebar';
import { Header } from '../common/Header';
import { ExaminerDashboard } from './ExaminerDashboard';
import { QuestionBank } from './QuestionBank';
import { PaperBuilder } from './PaperBuilder';
import { ExaminerExams } from './ExaminerExams';
import { ExaminerSubmissions } from './ExaminerSubmissions';
import { ExaminerReports } from './ExaminerReports';
import { Modal } from '../common/Modal';
import {
  Question,
  QuestionPaperDraft,
  Exam,
  ExamResult,
  DemoUser,
  UserRole,
  QuestionType,
} from '../../types';
import { useToast } from '../common/Toast';

interface ExaminerShellProps {
  questions: Question[];
  drafts: QuestionPaperDraft[];
  exams: Exam[];
  results: ExamResult[];
  currentUser: DemoUser;
  onReturnToRoles: () => void;
  onSwitchRole: (role: UserRole) => void;
  onAddQuestion: (q: Question) => void;
  onUpdateQuestion: (q: Question) => void;
  onDeleteQuestion: (qId: string) => void;
  onAddDraft: (d: QuestionPaperDraft) => void;
  onUpdateDraft: (d: QuestionPaperDraft) => void;
  onAddQuestionToDraft: (draftId: string, questionId: string) => void;
  onUpdateResult?: (r: ExamResult) => void;
}

export const ExaminerShell: React.FC<ExaminerShellProps> = ({
  questions,
  drafts,
  exams,
  results,
  currentUser,
  onReturnToRoles,
  onSwitchRole,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddDraft,
  onUpdateDraft,
  onAddQuestionToDraft,
  onUpdateResult,
}) => {
  const { showToast } = useToast();
  const [currentNav, setCurrentNav] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);

  // New Question Form State
  const [subject, setSubject] = useState<'Physics' | 'Chemistry' | 'Mathematics'>('Physics');
  const [topic, setTopic] = useState('');
  const [subtopic, setSubtopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Moderate' | 'Difficult'>('Moderate');
  const [type, setType] = useState<QuestionType>('Single Choice (MCQ)');
  const [questionText, setQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [multiCorrectKeys, setMultiCorrectKeys] = useState<string[]>(['A']);
  const [tolerance, setTolerance] = useState<number>(0);
  const [unit, setUnit] = useState('');
  const [marks, setMarks] = useState<number>(4);
  const [negativeMarks, setNegativeMarks] = useState<number>(1);
  const [explanation, setExplanation] = useState('');
  const [rubric, setRubric] = useState('');

  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !topic.trim()) {
      showToast('Validation Error', 'Question problem statement and curriculum topic are required', 'error');
      return;
    }

    let finalCorrectAnswer = correctAnswer;
    if (type === 'Multiple Correct') {
      finalCorrectAnswer = multiCorrectKeys.sort().join(',');
      if (!finalCorrectAnswer) {
        showToast('Validation Error', 'Please select at least one correct key for Multiple Correct', 'error');
        return;
      }
    } else if (type === 'Numerical Value' || type === 'Descriptive') {
      finalCorrectAnswer = optA || '0';
    }

    const newQ: Question = {
      id: `q-${Date.now()}`,
      code: `${subject.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 899 + 100)}`,
      subject,
      topic,
      subtopic: subtopic || undefined,
      type,
      difficulty,
      questionText,
      options:
        type === 'Single Choice (MCQ)' || type === 'Multiple Correct'
          ? [
              { id: 'A', text: optA || 'Option A' },
              { id: 'B', text: optB || 'Option B' },
              { id: 'C', text: optC || 'Option C' },
              { id: 'D', text: optD || 'Option D' },
            ]
          : undefined,
      correctAnswer: finalCorrectAnswer,
      tolerance: type === 'Numerical Value' ? tolerance : undefined,
      unit: type === 'Numerical Value' ? unit : undefined,
      marks: Number(marks),
      negativeMarks: Number(negativeMarks),
      explanation: explanation || 'Step-by-step solution derivation verified by faculty reviewer.',
      evaluationRubric: type === 'Descriptive' ? rubric : undefined,
      lastEdited: 'Just now',
      author: currentUser.name,
      status: 'Approved',
    };

    onAddQuestion(newQ);
    showToast('Question Curated & Approved', `${newQ.code} added to ${subject} repository`, 'success');
    setIsAddQuestionOpen(false);
    setQuestionText('');
    setTopic('');
    setSubtopic('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setExplanation('');
    setRubric('');
  };

  const getPageTitle = () => {
    switch (currentNav) {
      case 'dashboard':
        return 'Examiner Dashboard';
      case 'question_bank':
        return 'Academic Question Bank (P / C / M)';
      case 'paper_builder':
        return 'Question Paper Assembly Studio';
      case 'examinations':
        return 'Curated Examinations';
      case 'submissions':
        return 'Candidate Submission Evaluation';
      case 'reports':
        return 'Performance & Item Analytics';
      default:
        return 'Examiner Workspace';
    }
  };

  const getPageSubtitle = () => {
    switch (currentNav) {
      case 'dashboard':
        return 'Curate items, review blueprints, and audit test answer keys';
      case 'question_bank':
        return 'Search, verify, author, and organize JEE examination questions';
      case 'paper_builder':
        return 'Assemble multi-concept papers, verify quotas, and submit for review';
      case 'examinations':
        return 'Active and completed assessments under faculty oversight';
      case 'submissions':
        return 'Audit candidate scripts and evaluate descriptive answers with rubrics';
      case 'reports':
        return 'Discriminator indices and topic-wise difficulty curve analytics';
      default:
        return undefined;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <Sidebar
        role="examiner"
        currentNav={currentNav}
        onNavigate={(id) => setCurrentNav(id)}
        onReturnToRoles={onReturnToRoles}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          pageTitle={getPageTitle()}
          pageSubtitle={getPageSubtitle()}
          role="examiner"
          currentUser={currentUser}
          onReturnToRoles={onReturnToRoles}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onSwitchRole={onSwitchRole}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {currentNav === 'dashboard' && (
            <ExaminerDashboard
              questions={questions}
              drafts={drafts}
              exams={exams}
              onNavigate={(nav) => setCurrentNav(nav)}
              onOpenAddQuestion={() => setIsAddQuestionOpen(true)}
            />
          )}

          {currentNav === 'question_bank' && (
            <QuestionBank
              questions={questions}
              drafts={drafts}
              onAddQuestion={onAddQuestion}
              onUpdateQuestion={onUpdateQuestion}
              onDeleteQuestion={onDeleteQuestion}
              onAddQuestionToDraft={onAddQuestionToDraft}
              onOpenAddModal={() => setIsAddQuestionOpen(true)}
            />
          )}

          {currentNav === 'paper_builder' && (
            <PaperBuilder
              drafts={drafts}
              questions={questions}
              onAddDraft={onAddDraft}
              onUpdateDraft={onUpdateDraft}
            />
          )}

          {currentNav === 'examinations' && <ExaminerExams exams={exams} />}

          {currentNav === 'submissions' && (
            <ExaminerSubmissions
              results={results}
              questions={questions}
              onUpdateResult={onUpdateResult}
            />
          )}

          {currentNav === 'reports' && (
            <ExaminerReports
              exams={exams}
              results={results}
              questions={questions}
              currentUser={currentUser}
            />
          )}
        </main>
      </div>

      {/* Author Question Modal */}
      <Modal
        isOpen={isAddQuestionOpen}
        onClose={() => setIsAddQuestionOpen(false)}
        title="Author Question Item (P / C / M)"
        subtitle="Submit a peer-reviewed problem into the institutional repository"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleAddQuestionSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as any)}
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
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as QuestionType;
                  setType(newType);
                  if (newType === 'Multiple Correct') {
                    setMarks(4);
                    setNegativeMarks(2);
                  } else if (newType === 'Numerical Value') {
                    setMarks(4);
                    setNegativeMarks(0);
                  } else if (newType === 'Descriptive') {
                    setMarks(5);
                    setNegativeMarks(0);
                  } else {
                    setMarks(4);
                    setNegativeMarks(1);
                  }
                }}
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
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
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
                placeholder="e.g. Rotational Dynamics & Center of Mass"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Subtopic / Key Concept (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Moment of Inertia of Composite Bodies"
                value={subtopic}
                onChange={(e) => setSubtopic(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Question Problem Statement</label>
            <textarea
              required
              rows={3}
              placeholder="Enter the problem statement with formulas, parameters, and given boundary conditions..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-sans focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          {/* Single Choice MCQ */}
          {type === 'Single Choice (MCQ)' && (
            <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <label className="block text-slate-700 font-semibold">Options & Correct Key</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center font-bold text-slate-500">A</span>
                  <input
                    type="text"
                    required
                    placeholder="Option A text..."
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center font-bold text-slate-500">B</span>
                  <input
                    type="text"
                    required
                    placeholder="Option B text..."
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center font-bold text-slate-500">C</span>
                  <input
                    type="text"
                    required
                    placeholder="Option C text..."
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center font-bold text-slate-500">D</span>
                  <input
                    type="text"
                    required
                    placeholder="Option D text..."
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <span className="text-slate-700 font-medium">Designated Correct Option:</span>
                {(['A', 'B', 'C', 'D'] as const).map((key) => (
                  <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="correct"
                      checked={correctAnswer === key}
                      onChange={() => setCorrectAnswer(key)}
                      className="text-indigo-600 focus:ring-indigo-600"
                    />
                    <span className="font-bold">{key}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Multiple Correct */}
          {type === 'Multiple Correct' && (
            <div className="space-y-2 p-3 bg-purple-50/50 rounded-lg border border-purple-200">
              <label className="block text-purple-900 font-semibold">Options & Multiple Correct Keys</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center font-bold text-purple-700">A</span>
                  <input
                    type="text"
                    required
                    placeholder="Option A statement..."
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-purple-200 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center font-bold text-purple-700">B</span>
                  <input
                    type="text"
                    required
                    placeholder="Option B statement..."
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-purple-200 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center font-bold text-purple-700">C</span>
                  <input
                    type="text"
                    required
                    placeholder="Option C statement..."
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-purple-200 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center font-bold text-purple-700">D</span>
                  <input
                    type="text"
                    required
                    placeholder="Option D statement..."
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-purple-200 bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <span className="text-purple-900 font-medium">Select all correct keys:</span>
                {(['A', 'B', 'C', 'D'] as const).map((key) => (
                  <label key={key} className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={multiCorrectKeys.includes(key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setMultiCorrectKeys([...multiCorrectKeys, key]);
                        } else {
                          setMultiCorrectKeys(multiCorrectKeys.filter((k) => k !== key));
                        }
                      }}
                      className="rounded text-purple-600"
                    />
                    <span className="font-bold">{key}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Numerical Value */}
          {type === 'Numerical Value' && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-amber-900 font-semibold mb-1">
                  Numerical Key
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 24 or 3.14"
                  value={optA}
                  onChange={(e) => setOptA(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-amber-900 font-semibold mb-1">
                  Accepted Tolerance (±)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-amber-900 font-semibold mb-1">
                  Unit (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. V, m/s, J"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white"
                />
              </div>
            </div>
          )}

          {/* Descriptive / Derivation */}
          {type === 'Descriptive' && (
            <div className="p-3 bg-sky-50 rounded-lg border border-sky-200 space-y-3">
              <div>
                <label className="block text-sky-900 font-semibold mb-1">Model Answer / Derivation Key</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Official model answer statement..."
                  value={optA}
                  onChange={(e) => setOptA(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-sky-300 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-sky-900 font-semibold mb-1">Scoring Rubric Breakdown</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 2 marks for balanced equation; 2 marks for logarithmic formula; 1 mark for inference"
                  value={rubric}
                  onChange={(e) => setRubric(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-sky-300 bg-white"
                />
              </div>
            </div>
          )}

          {/* Marks and Negatives */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Award Marks (+)</label>
              <input
                type="number"
                required
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Negative Marks Penalty (-)</label>
              <input
                type="number"
                required
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Step-by-Step Derivation & Solution Explanation
            </label>
            <textarea
              rows={2}
              placeholder="Provide mathematical or chemical explanation for candidate post-exam review..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddQuestionOpen(false)}
              className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold shadow-2xs"
            >
              Curate & Approve Question
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
