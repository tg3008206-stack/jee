/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserRole,
  Exam,
  Question,
  DemoUser,
  ScheduleItem,
  ActivityLog,
  QuestionPaperDraft,
  ExamResult,
  PlatformSettings,
} from './types';
import {
  loadPlatformState,
  savePlatformState,
  resetPlatformState,
} from './utils/storage';
import { ToastProvider } from './components/common/Toast';
import { RoleSelectionScreen } from './components/role-selection/RoleSelectionScreen';
import { AdminShell } from './components/admin/AdminShell';
import { ExaminerShell } from './components/examiner/ExaminerShell';
import { StudentShell } from './components/student/StudentShell';

export default function App() {
  const [initialData] = useState(() => loadPlatformState());

  const [activeRole, setActiveRole] = useState<UserRole | null>(initialData.activeRole);

  // Centralized Platform State (Synchronized across demonstration workflows)
  const [exams, setExams] = useState<Exam[]>(initialData.exams);
  const [questions, setQuestions] = useState<Question[]>(initialData.questions);
  const [users, setUsers] = useState<DemoUser[]>(initialData.users);
  const [results, setResults] = useState<ExamResult[]>(initialData.results);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialData.schedules);
  const [activities, setActivities] = useState<ActivityLog[]>(initialData.activities);
  const [drafts, setDrafts] = useState<QuestionPaperDraft[]>(initialData.drafts);
  const [settings, setSettings] = useState<PlatformSettings>(initialData.settings);

  // Synchronize changes to localStorage
  useEffect(() => {
    savePlatformState({
      exams,
      questions,
      users,
      results,
      schedules,
      activities,
      drafts,
      settings,
      activeRole,
    });
  }, [exams, questions, users, results, schedules, activities, drafts, settings, activeRole]);

  // Active current user for the selected role
  const getCurrentUser = (role: UserRole): DemoUser => {
    const userForRole = users.find((u) => u.role === role);
    if (userForRole) return userForRole;
    return users[0];
  };

  // --- ADMIN HANDLERS ---
  const handleAddExam = (newExam: Exam) => {
    setExams((prev) => [newExam, ...prev]);
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        actor: 'Dr. Arvind Sharma',
        role: 'admin',
        action: `Created Exam (${newExam.status})`,
        target: newExam.title,
        timestamp: 'Just now',
        badgeType: 'blue',
      },
      ...prev,
    ]);
  };

  const handleUpdateExam = (updatedExam: Exam) => {
    setExams((prev) => prev.map((e) => (e.id === updatedExam.id ? updatedExam : e)));
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        actor: 'Dr. Arvind Sharma',
        role: 'admin',
        action: `Updated Exam (${updatedExam.status})`,
        target: updatedExam.title,
        timestamp: 'Just now',
        badgeType: 'neutral',
      },
      ...prev,
    ]);
  };

  const handleCancelExam = (examId: string) => {
    setExams((prev) =>
      prev.map((e) =>
        e.id === examId ? { ...e, status: 'cancelled', visibility: 'Hidden / Restricted' } : e
      )
    );
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        actor: 'Dr. Arvind Sharma',
        role: 'admin',
        action: 'Cancelled Examination Session',
        target: exams.find((e) => e.id === examId)?.title || examId,
        timestamp: 'Just now',
        badgeType: 'amber',
      },
      ...prev,
    ]);
  };

  const handleToggleExamStatus = (examId: string) => {
    setExams((prev) =>
      prev.map((e) => {
        if (e.id === examId) {
          const nextStatus = e.status === 'published' ? 'draft' : 'published';
          return {
            ...e,
            status: nextStatus,
            visibility: nextStatus === 'published' ? 'Public to Enrolled Batches' : 'Hidden / Restricted',
          };
        }
        return e;
      })
    );
  };

  const handleUpdateExamSchedule = (
    examId: string,
    newDate: string,
    startTime: string,
    duration: number,
    venue: string
  ) => {
    const [h, m] = startTime.split(':').map(Number);
    const endH = Math.min(23, h + Math.floor(duration / 60));
    const endTime = `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    setExams((prev) =>
      prev.map((e) =>
        e.id === examId
          ? {
              ...e,
              examDate: newDate,
              startTime,
              endTime,
              durationMinutes: duration,
              venue,
              scheduledDateTime: `${newDate} · ${startTime} - ${endTime}`,
            }
          : e
      )
    );

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        actor: 'Dr. Arvind Sharma',
        role: 'admin',
        action: 'Rescheduled Examination Slot',
        target: `${exams.find((e) => e.id === examId)?.title || examId} (${newDate})`,
        timestamp: 'Just now',
        badgeType: 'amber',
      },
      ...prev,
    ]);
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' }
          : u
      )
    );
  };

  const handleAddUser = (newUser: DemoUser) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const handleUpdateUser = (updatedUser: DemoUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const handleUpdateSettings = (newSettings: PlatformSettings) => {
    setSettings(newSettings);
  };

  const handleResetDemoData = () => {
    const resetData = resetPlatformState();
    setExams(resetData.exams);
    setQuestions(resetData.questions);
    setUsers(resetData.users);
    setResults(resetData.results);
    setSchedules(resetData.schedules);
    setActivities(resetData.activities);
    setDrafts(resetData.drafts);
    setSettings(resetData.settings);
    setActiveRole(null);
  };

  // --- PAPER BLUEPRINT APPROVAL / RETURN HANDLERS (ADMIN) ---
  const handleApproveDraft = (draftId: string, notes?: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return;

    // Snapshot questions attached to this paper
    const snapshotQuestions = questions.filter((q) => (draft.questionIds || []).includes(q.id));

    const updatedDraft: QuestionPaperDraft = {
      ...draft,
      status: 'Approved',
      version: (draft.version || 1),
      reviewedBy: 'Dr. Arvind Sharma (Admin)',
      reviewedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      reviewNotes: notes || 'Paper blueprint approved for CBT deployment.',
      questionSnapshots: snapshotQuestions,
      updatedAt: 'Just now',
    };

    setDrafts((prev) => prev.map((d) => (d.id === draftId ? updatedDraft : d)));

    // Bind and approve matching exam
    setExams((prev) =>
      prev.map((e) => {
        const isTargetExam =
          e.id === draft.examId ||
          e.title === draft.title ||
          (draft.title && e.title.includes(draft.title));

        if (isTargetExam) {
          return {
            ...e,
            paperDraftId: draft.id,
            questionPaperReady: true,
            paperReadinessStatus: 'Ready for CBT',
            paperSnapshot: snapshotQuestions,
            paperVersion: updatedDraft.version,
            paperApprovedAt: updatedDraft.reviewedAt,
            paperApprovedBy: 'Dr. Arvind Sharma (Admin)',
            paperReviewNotes: updatedDraft.reviewNotes,
          };
        }
        return e;
      })
    );

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        actor: 'Dr. Arvind Sharma',
        role: 'admin',
        action: 'Approved Paper Blueprint',
        target: `${draft.title} (${snapshotQuestions.length} Questions / ${draft.totalMarks} Marks)`,
        timestamp: 'Just now',
        badgeType: 'green',
      },
      ...prev,
    ]);
  };

  const handleReturnDraft = (draftId: string, feedback: string) => {
    const draft = drafts.find((d) => d.id === draftId);
    if (!draft) return;

    const updatedDraft: QuestionPaperDraft = {
      ...draft,
      status: 'Returned for Changes',
      reviewNotes: feedback,
      reviewedBy: 'Dr. Arvind Sharma (Admin)',
      reviewedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      updatedAt: 'Just now',
    };

    setDrafts((prev) => prev.map((d) => (d.id === draftId ? updatedDraft : d)));

    // Update matching exam to peer review required
    setExams((prev) =>
      prev.map((e) => {
        const isTargetExam =
          e.id === draft.examId ||
          e.title === draft.title ||
          (draft.title && e.title.includes(draft.title));

        if (isTargetExam) {
          return {
            ...e,
            paperDraftId: draft.id,
            questionPaperReady: false,
            paperReadinessStatus: 'Peer Review Required',
            paperReviewNotes: feedback,
          };
        }
        return e;
      })
    );

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        actor: 'Dr. Arvind Sharma',
        role: 'admin',
        action: 'Returned Paper with Revision Request',
        target: `${draft.title} ("${feedback.slice(0, 35)}...")`,
        timestamp: 'Just now',
        badgeType: 'amber',
      },
      ...prev,
    ]);
  };

  // --- EXAMINER HANDLERS ---
  const handleAddQuestion = (newQuestion: Question) => {
    setQuestions((prev) => [newQuestion, ...prev]);
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        actor: newQuestion.author,
        role: 'examiner',
        action: `Curated ${newQuestion.subject} Question`,
        target: `${newQuestion.code} (${newQuestion.topic})`,
        timestamp: 'Just now',
        badgeType: 'green',
      },
      ...prev,
    ]);
  };

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    setQuestions((prev) => prev.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q)));
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        actor: updatedQuestion.author,
        role: 'examiner',
        action: `Updated ${updatedQuestion.subject} Item`,
        target: `${updatedQuestion.code} (${updatedQuestion.topic})`,
        timestamp: 'Just now',
        badgeType: 'amber',
      },
      ...prev,
    ]);
  };

  const handleDeleteQuestion = (questionId: string) => {
    const targetQ = questions.find((q) => q.id === questionId);
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    // Detach from unapproved draft blueprints only
    setDrafts((prev) =>
      prev.map((d) =>
        d.status === 'Approved'
          ? d
          : {
              ...d,
              questionIds: (d.questionIds || []).filter((id) => id !== questionId),
            }
      )
    );
    if (targetQ) {
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          actor: 'Examiner Committee',
          role: 'examiner',
          action: 'Archived Question Item',
          target: `${targetQ.code} (${targetQ.subject})`,
          timestamp: 'Just now',
          badgeType: 'neutral',
        },
        ...prev,
      ]);
    }
  };

  const handleAddDraft = (newDraft: QuestionPaperDraft) => {
    setDrafts((prev) => [newDraft, ...prev]);
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        actor: newDraft.leadExaminer,
        role: 'examiner',
        action: 'Initialized Paper Blueprint',
        target: `${newDraft.title} (${newDraft.examType})`,
        timestamp: 'Just now',
        badgeType: 'blue',
      },
      ...prev,
    ]);
  };

  const handleUpdateDraft = (updatedDraft: QuestionPaperDraft) => {
    setDrafts((prev) => prev.map((d) => (d.id === updatedDraft.id ? updatedDraft : d)));
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        actor: updatedDraft.leadExaminer,
        role: 'examiner',
        action: `Updated Paper Blueprint (${updatedDraft.status})`,
        target: updatedDraft.title,
        timestamp: 'Just now',
        badgeType: updatedDraft.status === 'Submitted for Review' ? 'blue' : 'green',
      },
      ...prev,
    ]);
  };

  const handleAddQuestionToDraft = (draftId: string, questionId: string) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id === draftId) {
          const currentIds = d.questionIds || [];
          if (currentIds.includes(questionId)) return d;
          const updatedIds = [...currentIds, questionId];
          const q = questions.find((item) => item.id === questionId);
          const pCount = (d.physicsCount || 0) + (q?.subject === 'Physics' ? 1 : 0);
          const cCount = (d.chemistryCount || 0) + (q?.subject === 'Chemistry' ? 1 : 0);
          const mCount = (d.mathCount || 0) + (q?.subject === 'Mathematics' ? 1 : 0);
          const completion = Math.min(100, Math.round((updatedIds.length / (d.totalQuestions || 90)) * 100));
          return {
            ...d,
            questionIds: updatedIds,
            physicsCount: pCount,
            chemistryCount: cCount,
            mathCount: mCount,
            completionPercentage: completion,
            updatedAt: 'Just now',
          };
        }
        return d;
      })
    );
  };

  const handleUpdateResult = (updatedResult: ExamResult) => {
    setResults((prev) => prev.map((r) => (r.id === updatedResult.id ? updatedResult : r)));
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        actor: 'Faculty Examiner',
        role: 'examiner',
        action: 'Evaluated Candidate Script',
        target: `${updatedResult.studentName} (${updatedResult.examTitle})`,
        timestamp: 'Just now',
        badgeType: 'green',
      },
      ...prev,
    ]);
  };

  // --- STUDENT SUBMISSION HANDLER ---
  const handleSubmitExamResult = (newResult: ExamResult) => {
    // Check if result with identical submissionId already exists (idempotency guard)
    setResults((prev) => {
      const exists = prev.some((r) => r.id === newResult.id || (r.submissionId && r.submissionId === newResult.submissionId));
      if (exists) return prev;
      return [newResult, ...prev];
    });

    // Update completed count on exam
    setExams((prev) =>
      prev.map((e) =>
        e.id === newResult.examId
          ? { ...e, completedCount: (e.completedCount || 0) + 1 }
          : e
      )
    );

    // Record activity
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        actor: newResult.studentName,
        role: 'student',
        action: 'Completed Examination',
        target: `${newResult.examTitle} (Score: ${newResult.totalScore}/${newResult.maxMarks})`,
        timestamp: 'Just now',
        badgeType: 'green',
      },
      ...prev,
    ]);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
        {!activeRole && (
          <RoleSelectionScreen onSelectRole={(role) => setActiveRole(role)} />
        )}

        {activeRole === 'admin' && (
          <AdminShell
            exams={exams}
            schedules={schedules}
            activities={activities}
            results={results}
            users={users}
            settings={settings}
            drafts={drafts}
            questions={questions}
            currentUser={getCurrentUser('admin')}
            onReturnToRoles={() => setActiveRole(null)}
            onSwitchRole={(newRole) => setActiveRole(newRole)}
            onAddExam={handleAddExam}
            onUpdateExam={handleUpdateExam}
            onCancelExam={handleCancelExam}
            onToggleExamStatus={handleToggleExamStatus}
            onUpdateExamSchedule={handleUpdateExamSchedule}
            onToggleUserStatus={handleToggleUserStatus}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onUpdateSettings={handleUpdateSettings}
            onResetDemoData={handleResetDemoData}
            onApproveDraft={handleApproveDraft}
            onReturnDraft={handleReturnDraft}
          />
        )}

        {activeRole === 'examiner' && (
          <ExaminerShell
            questions={questions}
            drafts={drafts}
            exams={exams}
            results={results}
            currentUser={getCurrentUser('examiner')}
            onReturnToRoles={() => setActiveRole(null)}
            onSwitchRole={(newRole) => setActiveRole(newRole)}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onAddDraft={handleAddDraft}
            onUpdateDraft={handleUpdateDraft}
            onAddQuestionToDraft={handleAddQuestionToDraft}
            onUpdateResult={handleUpdateResult}
          />
        )}

        {activeRole === 'student' && (
          <StudentShell
            exams={exams}
            users={users}
            questions={questions}
            results={results}
            currentUser={getCurrentUser('student')}
            onReturnToRoles={() => setActiveRole(null)}
            onSwitchRole={(newRole) => setActiveRole(newRole)}
            onSubmitExamResult={handleSubmitExamResult}
          />
        )}
      </div>
    </ToastProvider>
  );
}
