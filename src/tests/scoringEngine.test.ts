import { describe, it, expect } from 'vitest';
import { evaluateExamSubmission, recalculateResultWithManualEvaluations } from '../utils/scoringEngine';
import { Exam, Question, DemoUser } from '../types';

describe('SCHLAR JEE Scoring Engine QA Suite', () => {
  const dummyUser: DemoUser = {
    id: 'usr-student-01',
    name: 'Rahul Verma',
    username: 'rahul.verma',
    email: 'rahul.verma@jee.demo',
    role: 'student',
    rollNumber: 'SCH-2026-0842',
    batch: 'Super-30 JEE 2026',
    status: 'Active',
    avatarInitials: 'RV',
    lastActive: 'Just now',
  };

  const dummyExam: Exam = {
    id: 'exam-test-1',
    title: 'Test Exam JEE Main',
    code: 'JEE-TEST',
    category: 'JEE Main',
    totalMarks: 300,
    totalQuestions: 4,
    durationMinutes: 180,
    status: 'published',
    startDate: '2026-10-24',
    endDate: '2026-10-25',
    subjects: [
      { name: 'Physics', questionsCount: 1, maxMarks: 4 },
      { name: 'Chemistry', questionsCount: 2, maxMarks: 9 },
      { name: 'Mathematics', questionsCount: 1, maxMarks: 4 },
    ],
    enrolledCount: 10,
    completedCount: 0,
    assignedExaminer: 'Prof. Rajesh Kulkarni',
    questionPaperReady: true,
    paperReadinessStatus: 'Ready for CBT',
    visibility: 'Public to Enrolled Batches',
    negativeMarking: '-1 Mark per incorrect response',
    markingScheme: { correct: 4, incorrect: 1, unattempted: 0 },
    difficulty: 'Moderate',
    batch: 'Super-30 JEE 2026',
    instructions: ['Sample instruction'],
  };

  const sampleQuestions: Question[] = [
    {
      id: 'q1',
      code: 'PHY-01',
      subject: 'Physics',
      topic: 'Kinematics',
      type: 'Single Choice (MCQ)',
      difficulty: 'Easy',
      questionText: 'What is acceleration due to gravity on earth surface?',
      options: [
        { id: 'A', text: '9.8 m/s²' },
        { id: 'B', text: '8.9 m/s²' },
      ],
      correctAnswer: 'A',
      marks: 4,
      negativeMarks: 1,
      explanation: 'Standard gravity is 9.8 m/s²',
      lastEdited: 'Today',
      author: 'Prof. Sharma',
      status: 'Approved',
    },
    {
      id: 'q2',
      code: 'MTH-01',
      subject: 'Mathematics',
      topic: 'Calculus',
      type: 'Multiple Correct',
      difficulty: 'Difficult',
      questionText: 'Which of the following functions are continuous at x = 0?',
      options: [
        { id: 'A', text: 'sin(x)' },
        { id: 'B', text: 'cos(x)' },
        { id: 'C', text: '1/x' },
        { id: 'D', text: 'x²' },
      ],
      correctAnswer: 'A,B,D',
      marks: 4,
      negativeMarks: 2,
      explanation: 'sin(x), cos(x), and x² are continuous everywhere. 1/x is discontinuous at 0.',
      lastEdited: 'Today',
      author: 'Dr. Mukherjee',
      status: 'Approved',
    },
    {
      id: 'q3',
      code: 'CHM-01',
      subject: 'Chemistry',
      topic: 'Physical Chemistry',
      type: 'Numerical Value',
      difficulty: 'Moderate',
      questionText: 'Calculate pH of 0.01 M HCl solution.',
      correctAnswer: '2.0',
      tolerance: 0.05,
      marks: 4,
      negativeMarks: 1,
      explanation: 'pH = -log[H+] = -log(10^-2) = 2',
      lastEdited: 'Today',
      author: 'Prof. Kulkarni',
      status: 'Approved',
    },
    {
      id: 'q4',
      code: 'CHM-02',
      subject: 'Chemistry',
      topic: 'Electrochemistry',
      type: 'Descriptive',
      difficulty: 'Moderate',
      questionText: 'Derive the Nernst equation for galvanic cell.',
      correctAnswer: 'E = E° - (RT/nF)lnQ',
      marks: 5,
      negativeMarks: 0,
      explanation: 'Thermodynamic derivation linking delta G to cell EMF.',
      evaluationRubric: '2 marks for delta G equation, 2 marks for ln Q expansion, 1 mark for final form.',
      lastEdited: 'Today',
      author: 'Prof. Kulkarni',
      status: 'Approved',
    },
  ];

  it('1. Evaluates Single Choice MCQ correctly for both correct and negative marking', () => {
    // Case A: Correct answer
    const resA = evaluateExamSubmission(dummyExam, [sampleQuestions[0]], { q1: 'A' }, dummyUser, 10);
    expect(resA.examResult.totalScore).toBe(4);
    expect(resA.examResult.correctCount).toBe(1);
    expect(resA.examResult.incorrectCount).toBe(0);
    expect(resA.examResult.unattemptedCount).toBe(0);

    // Case B: Incorrect answer incurs negative penalty
    const resB = evaluateExamSubmission(dummyExam, [sampleQuestions[0]], { q1: 'B' }, dummyUser, 10);
    // Score normalized to 0 if total is negative
    expect(resB.examResult.totalScore).toBe(0);
    expect(resB.examResult.correctCount).toBe(0);
    expect(resB.examResult.incorrectCount).toBe(1);
    expect(resB.questionDetails[0].awardedScore).toBe(-1);

    // Case C: Unattempted receives 0 marks
    const resC = evaluateExamSubmission(dummyExam, [sampleQuestions[0]], {}, dummyUser, 10);
    expect(resC.examResult.totalScore).toBe(0);
    expect(resC.examResult.correctCount).toBe(0);
    expect(resC.examResult.unattemptedCount).toBe(1);
    expect(resC.questionDetails[0].awardedScore).toBe(0);
  });

  it('2. Evaluates Multiple Correct questions with full marks, negative marks, and partial credit', () => {
    const qMulti = sampleQuestions[1]; // Correct is A,B,D

    // Full correct: A,B,D
    const resFull = evaluateExamSubmission(dummyExam, [qMulti], { q2: 'A,B,D' }, dummyUser, 10);
    expect(resFull.examResult.totalScore).toBe(4);
    expect(resFull.questionDetails[0].isCorrect).toBe(true);

    // Partial correct: candidate chose subset A,B without any incorrect options
    const resPartial = evaluateExamSubmission(dummyExam, [qMulti], { q2: 'A,B' }, dummyUser, 10);
    expect(resPartial.questionDetails[0].isPartiallyCorrect).toBe(true);
    expect(resPartial.questionDetails[0].awardedScore).toBeGreaterThan(0);
    expect(resPartial.questionDetails[0].awardedScore).toBeLessThan(4);

    // Incorrect option chosen: candidate chose C (which is incorrect) along with A
    const resWrong = evaluateExamSubmission(dummyExam, [qMulti], { q2: 'A,C' }, dummyUser, 10);
    expect(resWrong.questionDetails[0].isCorrect).toBe(false);
    expect(resWrong.questionDetails[0].awardedScore).toBe(-2);
  });

  it('3. Evaluates Numerical Value questions within floating-point tolerance', () => {
    const qNum = sampleQuestions[2]; // Correct: 2.0 with tolerance 0.05

    // Exact match
    const resExact = evaluateExamSubmission(dummyExam, [qNum], { q3: '2.0' }, dummyUser, 10);
    expect(resExact.questionDetails[0].isCorrect).toBe(true);
    expect(resExact.questionDetails[0].awardedScore).toBe(4);

    // Within tolerance (2.03 is within 0.05)
    const resTol = evaluateExamSubmission(dummyExam, [qNum], { q3: '2.03' }, dummyUser, 10);
    expect(resTol.questionDetails[0].isCorrect).toBe(true);
    expect(resTol.questionDetails[0].awardedScore).toBe(4);

    // Outside tolerance (2.15 is outside 0.05)
    const resWrong = evaluateExamSubmission(dummyExam, [qNum], { q3: '2.15' }, dummyUser, 10);
    expect(resWrong.questionDetails[0].isCorrect).toBe(false);
    expect(resWrong.questionDetails[0].awardedScore).toBe(-1);
  });

  it('4. Handles Descriptive questions as Pending Evaluation until faculty manual review', () => {
    const qDesc = sampleQuestions[3];

    // Student submits descriptive derivation
    const initialSubmission = evaluateExamSubmission(
      dummyExam,
      [qDesc],
      { q4: 'Delta G = Delta G° + RT ln Q. -nFE = -nFE° + RT ln Q. E = E° - (RT/nF)lnQ' },
      dummyUser,
      15
    );

    expect(initialSubmission.examResult.resultStatus).toBe('Pending Evaluation');
    expect(initialSubmission.examResult.pendingEvaluationCount).toBe(1);
    expect(initialSubmission.questionDetails[0].isAwaitingEvaluation).toBe(true);
    expect(initialSubmission.examResult.totalScore).toBe(0);

    // Faculty reviews and awards 4.5 marks out of 5
    const recalculated = recalculateResultWithManualEvaluations(initialSubmission.examResult, {
      q4: {
        awardedMarks: 4.5,
        maxMarks: 5,
        feedback: 'Accurate derivation and clean thermodynamic rationale.',
        evaluatedAt: new Date().toISOString(),
        evaluatedBy: 'Prof. Rajesh Kulkarni',
      },
    });

    expect(recalculated.resultStatus).toBe('Final');
    expect(recalculated.pendingEvaluationCount).toBe(0);
    expect(recalculated.totalScore).toBe(4.5);
    expect(recalculated.chemistryScore).toBe(4.5);
    expect(recalculated.questionEvaluations?.[0].isCorrect).toBe(true);
  });

  it('5. Computes realistic JEE percentile and All-India Mock Rank', () => {
    const result = evaluateExamSubmission(
      dummyExam,
      sampleQuestions,
      {
        q1: 'A',
        q2: 'A,B,D',
        q3: '2.0',
      },
      dummyUser,
      45
    );

    expect(result.examResult.percentile).toBeGreaterThanOrEqual(75.0);
    expect(result.examResult.percentile).toBeLessThanOrEqual(99.99);
    expect(result.examResult.rank).toBeGreaterThanOrEqual(1);
    expect(result.examResult.rank).toBeLessThanOrEqual(5000);
  });
});
