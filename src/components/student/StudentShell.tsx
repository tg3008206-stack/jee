import React, { useState } from 'react';
import { StudentLogin } from './StudentLogin';
import { StudentExamSelection } from './StudentExamSelection';
import { CbtTestRunner } from './CbtTestRunner';
import { StudentResultScorecard } from './StudentResultScorecard';
import { ExamInstructionsModal } from './ExamInstructionsModal';
import { Exam, DemoUser, ExamResult, Question, UserRole } from '../../types';

interface StudentShellProps {
  exams: Exam[];
  users: DemoUser[];
  questions: Question[];
  results: ExamResult[];
  currentUser: DemoUser;
  onReturnToRoles: () => void;
  onSwitchRole: (role: UserRole) => void;
  onSubmitExamResult: (result: ExamResult) => void;
}

type StudentWorkflowStep = 'login' | 'select_exam' | 'cbt_runner' | 'view_result';

export const StudentShell: React.FC<StudentShellProps> = ({
  exams,
  users,
  questions,
  results,
  currentUser,
  onReturnToRoles,
  onSwitchRole,
  onSubmitExamResult,
}) => {
  const students = users.filter((u) => u.role === 'student');

  // Strict Student Workflow State
  const [authenticatedStudent, setAuthenticatedStudent] = useState<DemoUser | null>(currentUser);
  const [currentStep, setCurrentStep] = useState<StudentWorkflowStep>('select_exam');
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [activeScorecard, setActiveScorecard] = useState<ExamResult | null>(null);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);

  // 1. Student Login handler
  const handleLoginSuccess = (student: DemoUser) => {
    setAuthenticatedStudent(student);
    setCurrentStep('select_exam');
  };

  // 2. Select Exam -> Read Instructions -> Start Exam
  const handleStartExamFlow = (exam: Exam) => {
    setActiveExam(exam);
    setIsInstructionsModalOpen(true);
  };

  const handleProceedFromInstructions = (exam: Exam) => {
    setIsInstructionsModalOpen(false);
    setActiveExam(exam);
    setCurrentStep('cbt_runner');
  };

  // 3. Complete CBT Exam -> View Permitted Result
  const handleCompleteExam = (newResult: ExamResult) => {
    onSubmitExamResult(newResult);
    setActiveScorecard(newResult);
    setCurrentStep('view_result');
  };

  // 4. View existing result
  const handleViewExistingResult = (result: ExamResult) => {
    setActiveScorecard(result);
    setCurrentStep('view_result');
  };

  // Sign out
  const handleLogout = () => {
    setAuthenticatedStudent(null);
    setCurrentStep('login');
  };

  // Step 1: Student Login Screen
  if (currentStep === 'login' || !authenticatedStudent) {
    return (
      <StudentLogin
        students={students}
        onLoginSuccess={handleLoginSuccess}
        onReturnToRoles={onReturnToRoles}
      />
    );
  }

  // Step 3: Interactive CBT Test Runner Engine
  if (currentStep === 'cbt_runner' && activeExam) {
    return (
      <CbtTestRunner
        exam={activeExam}
        currentUser={authenticatedStudent}
        questions={questions}
        onCompleteExam={handleCompleteExam}
        onExitTest={() => setCurrentStep('select_exam')}
      />
    );
  }

  // Step 4: Permitted Result Scorecard
  if (currentStep === 'view_result' && activeScorecard) {
    return (
      <StudentResultScorecard
        result={activeScorecard}
        questions={questions}
        onBackToExams={() => setCurrentStep('select_exam')}
      />
    );
  }

  // Step 2: Minimal Select Exam Screen (Default)
  return (
    <>
      <StudentExamSelection
        currentUser={authenticatedStudent}
        exams={exams}
        results={results}
        onStartExam={handleStartExamFlow}
        onViewResult={handleViewExistingResult}
        onLogout={handleLogout}
      />

      {/* Instructions Modal Briefing */}
      {activeExam && (
        <ExamInstructionsModal
          exam={activeExam}
          isOpen={isInstructionsModalOpen}
          onClose={() => setIsInstructionsModalOpen(false)}
          onProceedToExam={handleProceedFromInstructions}
        />
      )}
    </>
  );
};
