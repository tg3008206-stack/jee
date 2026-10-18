import React, { useState } from 'react';
import { Sidebar } from '../common/Sidebar';
import { Header } from '../common/Header';
import { AdminDashboard } from './AdminDashboard';
import { AdminExaminations } from './AdminExaminations';
import { AdminSchedule } from './AdminSchedule';
import { AdminUsers } from './AdminUsers';
import { AdminResults } from './AdminResults';
import { AdminSettings } from './AdminSettings';
import { Exam, ScheduleItem, ActivityLog, ExamResult, DemoUser, UserRole, PlatformSettings, QuestionPaperDraft, Question } from '../../types';
import { useToast } from '../common/Toast';

interface AdminShellProps {
  exams: Exam[];
  schedules: ScheduleItem[];
  activities: ActivityLog[];
  results: ExamResult[];
  users: DemoUser[];
  settings: PlatformSettings;
  drafts?: QuestionPaperDraft[];
  questions?: Question[];
  currentUser: DemoUser;
  onReturnToRoles: () => void;
  onSwitchRole: (role: UserRole) => void;
  onAddExam: (exam: Exam) => void;
  onUpdateExam: (exam: Exam) => void;
  onCancelExam: (examId: string) => void;
  onToggleExamStatus: (examId: string) => void;
  onUpdateExamSchedule: (examId: string, newDate: string, startTime: string, duration: number, venue: string) => void;
  onToggleUserStatus: (userId: string) => void;
  onAddUser: (user: DemoUser) => void;
  onUpdateUser: (user: DemoUser) => void;
  onUpdateSettings: (settings: PlatformSettings) => void;
  onResetDemoData: () => void;
  onApproveDraft?: (draftId: string, notes?: string) => void;
  onReturnDraft?: (draftId: string, feedback: string) => void;
}

export const AdminShell: React.FC<AdminShellProps> = ({
  exams,
  schedules,
  activities,
  results,
  users,
  settings,
  drafts = [],
  questions = [],
  currentUser,
  onReturnToRoles,
  onSwitchRole,
  onAddExam,
  onUpdateExam,
  onCancelExam,
  onToggleExamStatus,
  onUpdateExamSchedule,
  onToggleUserStatus,
  onAddUser,
  onUpdateUser,
  onUpdateSettings,
  onResetDemoData,
  onApproveDraft,
  onReturnDraft,
}) => {
  const [currentNav, setCurrentNav] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const examiners = users.filter((u) => u.role === 'examiner');

  const getPageTitle = () => {
    switch (currentNav) {
      case 'dashboard':
        return 'Admin Dashboard';
      case 'examinations':
        return 'Examinations Management';
      case 'schedule':
        return 'Examination Schedules';
      case 'users':
        return 'User & Candidate Registry';
      case 'results':
        return 'Examination Results & Scorecards';
      case 'settings':
        return 'Platform Settings';
      default:
        return 'Admin Workspace';
    }
  };

  const getPageSubtitle = () => {
    switch (currentNav) {
      case 'dashboard':
        return 'Institutional status, metrics, and quick actions';
      case 'examinations':
        return 'Create, edit, schedule, and publish competitive examination papers';
      case 'schedule':
        return 'Slot calendar, room allocations, and conflict verification';
      case 'users':
        return 'Demo students, roll codes, and examiner credentials';
      case 'results':
        return 'Performance scorecards, percentile matrices, and submissions';
      case 'settings':
        return 'CBT system parameters, defaults, and result visibility';
      default:
        return undefined;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <Sidebar
        role="admin"
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
          role="admin"
          currentUser={currentUser}
          onReturnToRoles={onReturnToRoles}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onSwitchRole={onSwitchRole}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {currentNav === 'dashboard' && (
            <AdminDashboard
              exams={exams}
              users={users}
              schedules={schedules}
              activities={activities}
              results={results}
              onNavigate={(nav) => setCurrentNav(nav)}
              onOpenCreateExam={() => setCurrentNav('examinations')}
            />
          )}

          {currentNav === 'examinations' && (
            <AdminExaminations
              exams={exams}
              examiners={examiners}
              drafts={drafts}
              questions={questions}
              onAddExam={onAddExam}
              onUpdateExam={onUpdateExam}
              onCancelExam={onCancelExam}
              onToggleStatus={onToggleExamStatus}
              onApproveDraft={onApproveDraft}
              onReturnDraft={onReturnDraft}
            />
          )}

          {currentNav === 'schedule' && (
            <AdminSchedule
              exams={exams}
              examiners={examiners}
              onUpdateExamSchedule={onUpdateExamSchedule}
            />
          )}

          {currentNav === 'users' && (
            <AdminUsers
              users={users}
              onToggleUserStatus={onToggleUserStatus}
              onAddUser={onAddUser}
              onUpdateUser={onUpdateUser}
            />
          )}

          {currentNav === 'results' && (
            <AdminResults results={results} exams={exams} />
          )}

          {currentNav === 'settings' && (
            <AdminSettings
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              onResetDemoData={onResetDemoData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
