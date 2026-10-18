export type UserRole = 'admin' | 'examiner' | 'student';

export interface SubjectStats {
  name: 'Physics' | 'Chemistry' | 'Mathematics';
  questionsCount: number;
  maxMarks: number;
}

export type ExamStatus = 'draft' | 'scheduled' | 'published' | 'completed' | 'cancelled';

export interface Exam {
  id: string;
  code: string;
  title: string;
  category: 'JEE Main' | 'JEE Advanced' | 'Sectional Mock';
  status: ExamStatus;
  durationMinutes: number;
  totalMarks: number;
  totalQuestions: number;
  startDate: string;
  endDate: string;
  examDate?: string;
  startTime?: string;
  endTime?: string;
  scheduledDateTime?: string;
  venue?: string;
  subjects: SubjectStats[];
  enrolledCount: number;
  completedCount: number;
  assignedExaminer: string;
  questionPaperReady: boolean;
  paperReadinessStatus: 'Ready for CBT' | 'Drafting in Progress' | 'Peer Review Required' | 'Incomplete';
  paperDraftId?: string;
  paperSnapshot?: Question[];
  paperVersion?: number;
  paperApprovedAt?: string;
  paperApprovedBy?: string;
  paperReviewNotes?: string;
  visibility: 'Public to Enrolled Batches' | 'Hidden / Restricted';
  negativeMarking: string;
  markingScheme: {
    correct: number;
    incorrect: number;
    unattempted: number;
  };
  difficulty: 'Standard' | 'Moderate' | 'Challenging';
  batch: string;
  instructions: string[];
}

export type QuestionType = 'Single Choice (MCQ)' | 'Multiple Correct' | 'Numerical Value' | 'Descriptive';

export interface Question {
  id: string;
  code: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
  topic: string;
  subtopic?: string;
  type: QuestionType;
  difficulty: 'Easy' | 'Moderate' | 'Difficult';
  questionText: string;
  options?: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
  tolerance?: number;
  unit?: string;
  marks: number;
  negativeMarks: number;
  explanation: string;
  evaluationRubric?: string;
  createdDate?: string;
  lastEdited: string;
  author: string;
  status: 'Approved' | 'Review Required' | 'Draft';
  isArchived?: boolean;
  usageCount?: number;
}


export interface DemoUser {
  id: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  role: UserRole;
  rollNumber?: string;
  batch?: string;
  targetExam?: string;
  department?: string;
  status: 'Active' | 'Suspended' | 'Pending';
  lastActive: string;
  avatarInitials: string;
  assignedExams?: string[];
}

export interface PlatformSettings {
  defaultDurationMinutes: number;
  defaultSubjects: string[];
  defaultInstructions: string[];
  resultVisibility: 'immediate' | 'after_conclusion' | 'manual_approval';
  showRankImmediately: boolean;
  allowCalculator: boolean;
  autoSaveIntervalSeconds: number;
  enableStrictProctoring: boolean;
}


export interface QuestionEvaluationDetail {
  questionId: string;
  code: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics' | string;
  topic: string;
  type: QuestionType | string;
  marks: number;
  negativeMarks: number;
  studentAnswer?: string;
  correctAnswer: string;
  isAttempted: boolean;
  isCorrect: boolean;
  isPartiallyCorrect?: boolean;
  isAwaitingEvaluation?: boolean;
  awardedScore: number;
  explanation: string;
  evaluationRubric?: string;
  manualEvaluation?: {
    awardedMarks: number;
    maxMarks: number;
    feedback: string;
    evaluatedAt: string;
    evaluatedBy?: string;
  };
}

export interface SubjectPerformanceMetric {
  subject: string;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  pendingEvaluation: number;
  score: number;
  maxMarks: number;
  accuracy: number;
}

export type ResultLifecycleStatus = 'Final' | 'Provisional' | 'Pending Evaluation';

export interface ExamResult {
  id: string;
  submissionId?: string;
  paperSnapshotId?: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  totalScore: number;
  maxMarks: number;
  maxGradableMarks?: number;
  totalPaperMarks?: number;
  percentile: number;
  rank: number;
  totalCandidates: number;
  accuracy: number;
  physicsScore: number;
  chemistryScore: number;
  mathScore: number;
  submittedAt: string;
  attemptedCount: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  pendingEvaluationCount?: number;
  timeTakenMinutes: number;
  resultStatus?: ResultLifecycleStatus;
  isSampleData?: boolean;
  questionEvaluations?: QuestionEvaluationDetail[];
  subjectWiseStats?: Record<string, SubjectPerformanceMetric>;
  descriptiveEvaluations?: Record<
    string,
    {
      awardedMarks: number;
      maxMarks: number;
      feedback: string;
      evaluatedAt: string;
      evaluatedBy?: string;
    }
  >;
}


export interface ScheduleItem {
  id: string;
  examId: string;
  title: string;
  category: string;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  mode: 'CBT - Online Lab' | 'Proctored Remote';
  targetBatches: string[];
  status: 'Upcoming' | 'Live' | 'Completed';
  registrations: number;
}

export interface ActivityLog {
  id: string;
  actor: string;
  role: UserRole;
  action: string;
  target: string;
  timestamp: string;
  badgeType: 'blue' | 'green' | 'amber' | 'neutral';
}

export type PaperLifecycleStatus = 'Drafting' | 'Submitted for Review' | 'Approved' | 'Returned for Changes';

export interface QuestionPaperDraft {
  id: string;
  examId?: string;
  title: string;
  examType: 'JEE Main' | 'JEE Advanced' | 'Sectional Mock';
  targetDate: string;
  totalQuestions: number;
  totalMarks: number;
  physicsCount: number;
  chemistryCount: number;
  mathCount: number;
  status: PaperLifecycleStatus;
  version?: number;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt?: string;
  completionPercentage: number;
  leadExaminer: string;
  questionIds: string[];
  questionSnapshots?: Question[];
  updatedAt: string;
}

