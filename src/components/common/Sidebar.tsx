import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Calendar,
  Users,
  Award,
  Settings,
  HelpCircle,
  FileEdit,
  ClipboardList,
  BarChart3,
  BookOpenCheck,
  UserCheck,
  LogOut,
  X,
  GraduationCap,
} from 'lucide-react';
import { UserRole } from '../../types';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface SidebarProps {
  role: UserRole;
  currentNav: string;
  onNavigate: (navId: string) => void;
  onReturnToRoles: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  currentNav,
  onNavigate,
  onReturnToRoles,
  isMobileOpen,
  onCloseMobile,
}) => {
  const getNavItems = (): NavItemConfig[] => {
    switch (role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'examinations', label: 'Examinations', icon: FileSpreadsheet, badge: 5 },
          { id: 'schedule', label: 'Schedule', icon: Calendar },
          { id: 'users', label: 'Users', icon: Users, badge: 8 },
          { id: 'results', label: 'Results', icon: Award },
          { id: 'settings', label: 'Settings', icon: Settings },
        ];
      case 'examiner':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'question_bank', label: 'Question Bank', icon: HelpCircle, badge: 'P/C/M' },
          { id: 'paper_builder', label: 'Paper Builder', icon: FileEdit, badge: 'Drafts' },
          { id: 'examinations', label: 'Examinations', icon: BookOpenCheck },
          { id: 'submissions', label: 'Submissions', icon: ClipboardList },
          { id: 'reports', label: 'Performance Reports', icon: BarChart3 },
        ];
      case 'student':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'available_exams', label: 'Available Exams', icon: BookOpenCheck, badge: 3 },
          { id: 'upcoming_exams', label: 'Upcoming Exams', icon: Calendar, badge: 1 },
          { id: 'my_results', label: 'My Results', icon: Award },
          { id: 'performance', label: 'Performance', icon: BarChart3 },
          { id: 'profile', label: 'Profile', icon: UserCheck },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleSubheading = () => {
    if (role === 'admin') return 'Administration Console';
    if (role === 'examiner') return 'Question Bank & Evaluation';
    return 'Candidate CBT Portal';
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0B1528] text-slate-300 w-64 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold tracking-tight text-lg">
            S
          </div>
          <div>
            <div className="text-base font-bold tracking-wider text-white">SCHLAR</div>
            <div className="text-[11px] text-slate-400 font-medium tracking-tight">JEE Exam Platform</div>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="p-1 text-slate-400 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role Indicator Banner */}
      <div className="mx-4 my-3 px-3.5 py-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white uppercase tracking-wider leading-none">
              {role}
            </p>
            <p className="text-[11px] text-slate-400 truncate mt-1">
              {getRoleSubheading()}
            </p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? 'bg-blue-700/80 text-blue-100'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Return to Role Selection */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070e1b]">
        <button
          onClick={onReturnToRoles}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/60"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span>Exit to Role Selection</span>
        </button>
        <div className="mt-2 text-center text-[10px] text-slate-500 font-mono">
          Demo Environment v1.0
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 h-screen sticky top-0 z-40 border-r border-slate-800">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 flex-1 max-w-xs w-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
