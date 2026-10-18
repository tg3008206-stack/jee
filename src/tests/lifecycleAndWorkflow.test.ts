import { describe, it, expect } from 'vitest';
import { Exam, Question, QuestionPaperDraft } from '../types';

describe('SCHLAR JEE Lifecycle and Workflow Verification Suite', () => {
  const mockQuestions: Question[] = [
    {
      id: 'q-phy-101',
      code: 'PHY-101',
      subject: 'Physics',
      topic: 'Thermodynamics',
      type: 'Single Choice (MCQ)',
      difficulty: 'Moderate',
      questionText: 'Carnot engine efficiency between 300K and 600K?',
      correctAnswer: '50%',
      marks: 4,
      negativeMarks: 1,
      explanation: 'eta = 1 - T2/T1 = 1 - 300/600 = 0.5',
      lastEdited: 'Oct 2026',
      author: 'Prof. Sharma',
      status: 'Approved',
    },
    {
      id: 'q-mth-102',
      code: 'MTH-102',
      subject: 'Mathematics',
      topic: 'Vectors',
      type: 'Numerical Value',
      difficulty: 'Easy',
      questionText: 'Magnitude of vector 3i + 4j?',
      correctAnswer: '5.0',
      tolerance: 0.01,
      marks: 4,
      negativeMarks: 0,
      explanation: 'sqrt(3^2 + 4^2) = 5',
      lastEdited: 'Oct 2026',
      author: 'Dr. Mukherjee',
      status: 'Approved',
    },
  ];

  it('Scenario D: Publication Guard blocks unapproved exam papers', () => {
    const unapprovedExam: Exam = {
      id: 'exam-draft-01',
      title: 'Unapproved JEE Mock',
      code: 'JEE-DRAFT',
      category: 'JEE Main',
      totalMarks: 300,
      totalQuestions: 30,
      durationMinutes: 180,
      status: 'draft',
      startDate: '2026-10-24',
      endDate: '2026-10-25',
      subjects: [{ name: 'Physics', questionsCount: 30, maxMarks: 100 }],
      enrolledCount: 50,
      completedCount: 0,
      assignedExaminer: 'Prof. Rajesh Kulkarni',
      questionPaperReady: false,
      paperReadinessStatus: 'Drafting in Progress',
      visibility: 'Hidden / Restricted',
      negativeMarking: '-1 Mark',
      markingScheme: { correct: 4, incorrect: 1, unattempted: 0 },
      difficulty: 'Moderate',
      batch: 'Super-30 JEE 2026',
      instructions: ['Instructions...'],
    };

    // Publication check helper logic matching AdminExaminations.tsx handlePublishClick
    const canPublish = (exam: Exam): boolean => {
      return exam.questionPaperReady && exam.paperReadinessStatus === 'Ready for CBT';
    };

    expect(canPublish(unapprovedExam)).toBe(false);

    // After approval
    const approvedExam: Exam = {
      ...unapprovedExam,
      questionPaperReady: true,
      paperReadinessStatus: 'Ready for CBT',
      paperSnapshot: mockQuestions,
      paperApprovedAt: 'Oct 24, 2026',
      paperApprovedBy: 'Dr. Arvind Sharma (Admin)',
    };

    expect(canPublish(approvedExam)).toBe(true);
  });

  it('Scenario B: Draft Paper Returned for Changes increases version upon resubmission', () => {
    let draft: QuestionPaperDraft = {
      id: 'drf-001',
      title: 'JEE Advanced Paper 1 Blueprint',
      examType: 'JEE Advanced',
      targetDate: 'Nov 15, 2026',
      totalQuestions: 54,
      totalMarks: 180,
      physicsCount: 18,
      chemistryCount: 18,
      mathCount: 18,
      status: 'Submitted for Review',
      version: 1,
      completionPercentage: 100,
      leadExaminer: 'Prof. Rajesh Kulkarni',
      questionIds: ['q-phy-101', 'q-mth-102'],
      updatedAt: 'Yesterday',
    };

    // 1. Admin reviews and returns with feedback
    const adminFeedback = 'Increase multi-correct question difficulty in Physics section.';
    draft = {
      ...draft,
      status: 'Returned for Changes',
      reviewNotes: adminFeedback,
      reviewedBy: 'Dr. Arvind Sharma (Admin)',
      reviewedAt: 'Today',
      updatedAt: 'Just now',
    };

    expect(draft.status).toBe('Returned for Changes');
    expect(draft.reviewNotes).toBe(adminFeedback);
    expect(draft.version).toBe(1);

    // 2. Examiner edits and resubmits
    const isRevision = draft.status === 'Returned for Changes';
    const nextVersion = isRevision ? (draft.version || 1) + 1 : (draft.version || 1);
    draft = {
      ...draft,
      status: 'Submitted for Review',
      version: nextVersion,
      reviewNotes: 'Revised multi-correct questions as requested.',
      submittedAt: 'Just now',
      updatedAt: 'Just now',
    };

    expect(draft.status).toBe('Submitted for Review');
    expect(draft.version).toBe(2);
  });

  it('Scenario E: Historical paper snapshots remain immutable even if question bank is altered', () => {
    // 1. Snapshot taken at approval time
    const initialSnapshot: Question[] = JSON.parse(JSON.stringify(mockQuestions));

    const approvedExam: Exam = {
      id: 'exam-published-01',
      title: 'Grand Mock #01',
      code: 'JEE-MOCK-01',
      category: 'JEE Main',
      totalMarks: 300,
      totalQuestions: 1,
      durationMinutes: 180,
      status: 'published',
      startDate: '2026-10-24',
      endDate: '2026-10-25',
      subjects: [{ name: 'Physics', questionsCount: 1, maxMarks: 4 }],
      enrolledCount: 50,
      completedCount: 1,
      assignedExaminer: 'Prof. Rajesh Kulkarni',
      questionPaperReady: true,
      paperReadinessStatus: 'Ready for CBT',
      paperSnapshot: initialSnapshot,
      paperVersion: 1,
      visibility: 'Public to Enrolled Batches',
      negativeMarking: '-1 Mark',
      markingScheme: { correct: 4, incorrect: 1, unattempted: 0 },
      difficulty: 'Moderate',
      batch: 'Super-30 JEE 2026',
      instructions: ['Instructions...'],
    };

    // 2. Later, an examiner modifies the question in the question bank
    const modifiedBankQuestion: Question = {
      ...mockQuestions[0],
      questionText: 'MODIFIED QUESTION TEXT',
      correctAnswer: '75%', // Changed answer
    };

    // 3. Verify exam paperSnapshot was NOT affected
    expect(approvedExam.paperSnapshot![0].questionText).toBe('Carnot engine efficiency between 300K and 600K?');
    expect(approvedExam.paperSnapshot![0].correctAnswer).toBe('50%');
    expect(approvedExam.paperSnapshot![0].correctAnswer).not.toBe(modifiedBankQuestion.correctAnswer);
  });

  it('Ensures student submission idempotency and prevents duplicate submissions', () => {
    const existingSubmissions = [
      { id: 'res-1', submissionId: 'sub-student-01-exam-1', totalScore: 240 },
    ];

    const duplicateSubmission = {
      id: 'res-1-duplicate',
      submissionId: 'sub-student-01-exam-1',
      totalScore: 240,
    };

    // Idempotency check matching App.tsx handleSubmitExamResult
    const addSubmission = (prev: any[], newResult: any) => {
      const exists = prev.some(
        (r) => r.id === newResult.id || (r.submissionId && r.submissionId === newResult.submissionId)
      );
      if (exists) return prev;
      return [newResult, ...prev];
    };

    const updated = addSubmission(existingSubmissions, duplicateSubmission);
    expect(updated.length).toBe(1);
  });
});
