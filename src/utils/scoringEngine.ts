import {
  Exam,
  Question,
  ExamResult,
  DemoUser,
  QuestionEvaluationDetail,
  SubjectPerformanceMetric,
  ResultLifecycleStatus,
} from '../types';

export interface ExamEvaluationResult {
  examResult: ExamResult;
  questionDetails: QuestionEvaluationDetail[];
}

/**
 * Pure evaluation function for CBT exam submissions.
 * Accepts the candidate submission and immutable examination question paper snapshot.
 * Evaluates Single Choice MCQ, Multiple Correct (JEE Advanced), Numerical Value, and Descriptive questions.
 */
export function evaluateExamSubmission(
  exam: Exam,
  questions: Question[],
  responses: Record<string, string>,
  currentUser: DemoUser,
  timeTakenMinutes: number,
  paperSnapshotId?: string
): ExamEvaluationResult {
  let totalScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let attemptedCount = 0;
  let pendingEvaluationCount = 0;

  let totalPaperMarks = 0;
  let maxGradableMarks = 0;

  // Track per-subject aggregations
  const subjectAgg: Record<
    string,
    {
      attempted: number;
      correct: number;
      incorrect: number;
      unattempted: number;
      pendingEvaluation: number;
      score: number;
      maxMarks: number;
    }
  > = {};

  // Initialize subjects from exam definition or questions
  questions.forEach((q) => {
    if (!subjectAgg[q.subject]) {
      subjectAgg[q.subject] = {
        attempted: 0,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        pendingEvaluation: 0,
        score: 0,
        maxMarks: 0,
      };
    }
    subjectAgg[q.subject].maxMarks += q.marks;
    totalPaperMarks += q.marks;
    if (q.type !== 'Descriptive') {
      maxGradableMarks += q.marks;
    }
  });

  const questionDetails: QuestionEvaluationDetail[] = [];

  questions.forEach((q) => {
    const rawAnswer = responses[q.id];
    const isAttempted = rawAnswer !== undefined && rawAnswer.trim().length > 0;
    const studentAns = isAttempted ? rawAnswer.trim() : '';

    let isCorrect = false;
    let isPartiallyCorrect = false;
    let isAwaitingEvaluation = false;
    let awardedScore = 0;

    const sub = subjectAgg[q.subject] || {
      attempted: 0,
      correct: 0,
      incorrect: 0,
      unattempted: 0,
      pendingEvaluation: 0,
      score: 0,
      maxMarks: 0,
    };

    if (isAttempted) {
      attemptedCount++;
      sub.attempted++;

      switch (q.type) {
        case 'Single Choice (MCQ)': {
          // Case-insensitive trimmed check
          isCorrect = studentAns.toUpperCase() === q.correctAnswer.trim().toUpperCase();
          if (isCorrect) {
            awardedScore = q.marks;
            correctCount++;
            sub.correct++;
          } else {
            awardedScore = -Math.abs(q.negativeMarks);
            incorrectCount++;
            sub.incorrect++;
          }
          break;
        }

        case 'Multiple Correct': {
          // Compare sorted comma-separated keys (e.g. "A,B" vs "A,B")
          const studentKeys = studentAns
            .split(',')
            .map((k) => k.trim().toUpperCase())
            .filter(Boolean)
            .sort();
          const correctKeys = q.correctAnswer
            .split(',')
            .map((k) => k.trim().toUpperCase())
            .filter(Boolean)
            .sort();

          const studentJoined = studentKeys.join(',');
          const correctJoined = correctKeys.join(',');

          if (studentJoined === correctJoined) {
            isCorrect = true;
            awardedScore = q.marks;
            correctCount++;
            sub.correct++;
          } else {
            // Check if any incorrect option was chosen
            const hasIncorrectOption = studentKeys.some((k) => !correctKeys.includes(k));
            if (hasIncorrectOption) {
              awardedScore = -Math.abs(q.negativeMarks);
              incorrectCount++;
              sub.incorrect++;
            } else {
              // Documented partial marking: candidate chose subset of correct options with zero incorrect
              const partialMarks = Math.max(1, Math.min(q.marks - 1, studentKeys.length));
              isPartiallyCorrect = true;
              awardedScore = partialMarks;
              correctCount++; // counts as positive yield
              sub.correct++;
            }
          }
          break;
        }

        case 'Numerical Value': {
          const numStudent = parseFloat(studentAns);
          const numCorrect = parseFloat(q.correctAnswer);
          const tolerance = q.tolerance !== undefined ? q.tolerance : 0.05;

          if (!isNaN(numStudent) && !isNaN(numCorrect)) {
            isCorrect = Math.abs(numStudent - numCorrect) <= tolerance;
            if (isCorrect) {
              awardedScore = q.marks;
              correctCount++;
              sub.correct++;
            } else {
              awardedScore = q.negativeMarks > 0 ? -Math.abs(q.negativeMarks) : 0;
              incorrectCount++;
              sub.incorrect++;
            }
          } else {
            // Text comparison fallback
            isCorrect = studentAns.toLowerCase() === q.correctAnswer.trim().toLowerCase();
            awardedScore = isCorrect ? q.marks : (q.negativeMarks > 0 ? -Math.abs(q.negativeMarks) : 0);
            if (isCorrect) {
              correctCount++;
              sub.correct++;
            } else {
              incorrectCount++;
              sub.incorrect++;
            }
          }
          break;
        }

        case 'Descriptive': {
          // Descriptive items are flagged for faculty evaluation; not auto-penalized or auto-awarded full
          isAwaitingEvaluation = true;
          pendingEvaluationCount++;
          sub.pendingEvaluation++;
          awardedScore = 0; // provisional until evaluated
          break;
        }

        default: {
          isCorrect = studentAns.toUpperCase() === q.correctAnswer.trim().toUpperCase();
          awardedScore = isCorrect ? q.marks : -Math.abs(q.negativeMarks);
          if (isCorrect) {
            correctCount++;
            sub.correct++;
          } else {
            incorrectCount++;
            sub.incorrect++;
          }
          break;
        }
      }

      totalScore += awardedScore;
      sub.score += awardedScore;
    } else {
      // Unattempted
      awardedScore = 0;
      sub.unattempted++;
    }

    questionDetails.push({
      questionId: q.id,
      code: q.code,
      subject: q.subject,
      topic: q.topic,
      type: q.type,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      studentAnswer: isAttempted ? studentAns : undefined,
      correctAnswer: q.correctAnswer,
      isAttempted,
      isCorrect,
      isPartiallyCorrect,
      isAwaitingEvaluation,
      awardedScore,
      explanation: q.explanation,
      evaluationRubric: q.evaluationRubric,
    });
  });

  const unattemptedCount = questions.length - attemptedCount;

  // Build subjectWiseStats dictionary
  const subjectWiseStats: Record<string, SubjectPerformanceMetric> = {};
  Object.keys(subjectAgg).forEach((subName) => {
    const data = subjectAgg[subName];
    const gradableAttempted = data.attempted - data.pendingEvaluation;
    const subAccuracy =
      gradableAttempted > 0 ? Math.round((data.correct / gradableAttempted) * 100) : 0;

    subjectWiseStats[subName] = {
      subject: subName,
      attempted: data.attempted,
      correct: data.correct,
      incorrect: data.incorrect,
      unattempted: data.unattempted,
      pendingEvaluation: data.pendingEvaluation,
      score: Math.max(0, data.score),
      maxMarks: data.maxMarks,
      accuracy: subAccuracy,
    };
  });

  const normalizedScore = Math.max(0, totalScore);
  const maxMarks = exam.totalMarks || totalPaperMarks || 300;

  // Accuracy denominator: attempted automatically gradable questions
  const gradableAttemptedCount = attemptedCount - pendingEvaluationCount;
  const accuracy =
    gradableAttemptedCount > 0 ? Math.round((correctCount / gradableAttemptedCount) * 100) : 0;

  // Realistic JEE Percentile & AIR Calculation based on aggregate
  const scoreRatio = maxMarks > 0 ? normalizedScore / maxMarks : 0;
  const percentile = Number(Math.min(99.99, Math.max(75.0, 78.0 + scoreRatio * 21.9)).toFixed(2));
  const simulatedAIR = Math.max(1, Math.round(5000 * Math.pow(1 - scoreRatio, 1.8)));

  const resultStatus: ResultLifecycleStatus =
    pendingEvaluationCount > 0 ? 'Pending Evaluation' : 'Final';

  const physicsScore = subjectWiseStats['Physics']?.score || 0;
  const chemistryScore = subjectWiseStats['Chemistry']?.score || 0;
  const mathScore = subjectWiseStats['Mathematics']?.score || 0;

  const examResult: ExamResult = {
    id: `res-${Date.now()}`,
    submissionId: `sub-${Date.now()}`,
    paperSnapshotId: paperSnapshotId || exam.id,
    examId: exam.id,
    examTitle: exam.title,
    studentId: currentUser.id,
    studentName: currentUser.name,
    rollNumber: currentUser.rollNumber || 'SCH-2026-0842',
    totalScore: normalizedScore,
    maxMarks,
    maxGradableMarks,
    totalPaperMarks,
    percentile,
    rank: simulatedAIR,
    totalCandidates: 3450,
    accuracy,
    physicsScore,
    chemistryScore,
    mathScore,
    submittedAt: new Date().toISOString(),
    attemptedCount,
    correctCount,
    incorrectCount,
    unattemptedCount,
    pendingEvaluationCount,
    timeTakenMinutes,
    resultStatus,
    questionEvaluations: questionDetails,
    subjectWiseStats,
  };

  return {
    examResult,
    questionDetails,
  };
}

/**
 * Re-evaluates an existing ExamResult when faculty completes manual evaluation for descriptive questions.
 */
export function recalculateResultWithManualEvaluations(
  existingResult: ExamResult,
  descriptiveEvaluations: Record<
    string,
    {
      awardedMarks: number;
      maxMarks: number;
      feedback: string;
      evaluatedAt: string;
      evaluatedBy?: string;
    }
  >
): ExamResult {
  let updatedTotalScore = 0;
  let updatedPhysicsScore = 0;
  let updatedChemistryScore = 0;
  let updatedMathScore = 0;
  let remainingPendingCount = 0;

  const updatedQuestionEvaluations = (existingResult.questionEvaluations || []).map((qEval) => {
    const evalData = descriptiveEvaluations[qEval.questionId];

    if (qEval.type === 'Descriptive' && evalData) {
      const awarded = Math.min(evalData.maxMarks, Math.max(0, evalData.awardedMarks));
      const updatedItem: QuestionEvaluationDetail = {
        ...qEval,
        awardedScore: awarded,
        isAwaitingEvaluation: false,
        isCorrect: awarded > 0,
        manualEvaluation: evalData,
      };

      updatedTotalScore += awarded;
      if (qEval.subject === 'Physics') updatedPhysicsScore += awarded;
      if (qEval.subject === 'Chemistry') updatedChemistryScore += awarded;
      if (qEval.subject === 'Mathematics') updatedMathScore += awarded;

      return updatedItem;
    } else {
      updatedTotalScore += qEval.awardedScore;
      if (qEval.subject === 'Physics') updatedPhysicsScore += qEval.awardedScore;
      if (qEval.subject === 'Chemistry') updatedChemistryScore += qEval.awardedScore;
      if (qEval.subject === 'Mathematics') updatedMathScore += qEval.awardedScore;

      if (qEval.isAwaitingEvaluation) {
        remainingPendingCount++;
      }
      return qEval;
    }
  });

  const normalizedScore = Math.max(0, updatedTotalScore);
  const maxMarks = existingResult.maxMarks || 300;
  const scoreRatio = maxMarks > 0 ? normalizedScore / maxMarks : 0;
  const percentile = Number(Math.min(99.99, Math.max(75.0, 78.0 + scoreRatio * 21.9)).toFixed(2));
  const simulatedAIR = Math.max(1, Math.round(5000 * Math.pow(1 - scoreRatio, 1.8)));

  const resultStatus: ResultLifecycleStatus =
    remainingPendingCount > 0 ? 'Pending Evaluation' : 'Final';

  return {
    ...existingResult,
    totalScore: normalizedScore,
    physicsScore: Math.max(0, updatedPhysicsScore),
    chemistryScore: Math.max(0, updatedChemistryScore),
    mathScore: Math.max(0, updatedMathScore),
    percentile,
    rank: simulatedAIR,
    pendingEvaluationCount: remainingPendingCount,
    resultStatus,
    descriptiveEvaluations,
    questionEvaluations: updatedQuestionEvaluations,
  };
}
