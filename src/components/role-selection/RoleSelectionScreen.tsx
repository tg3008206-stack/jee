import React, { useState } from 'react';
import { Shield, BookOpen, GraduationCap, ArrowRight, CheckCircle2, ChevronRight, School, Sparkles } from 'lucide-react';
import { UserRole } from '../../types';

interface RoleSelectionScreenProps {
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectRole }) => {
  const [hoveredRole, setHoveredRole] = useState<UserRole | null>(null);

  const roles = [
    {
      id: 'admin' as UserRole,
      title: 'Administrator',
      icon: Shield,
      tagline: 'Platform Governance & Scheduling',
      description:
        'Manage competitive exams, schedule CBT lab sessions, oversee candidate enrollments, inspect audit logs, and review institutional performance analytics.',
      responsibilities: [
        'CBT examination configuration & publishing',
        'Demo user & candidate access management',
        'Examination schedules & lab slots',
        'Institutional percentile & result overview',
      ],
      actionLabel: 'Enter Admin Console',
      badgeColor: 'border-slate-300 text-slate-800 bg-slate-100',
    },
    {
      id: 'examiner' as UserRole,
      title: 'Examiner & Faculty',
      icon: BookOpen,
      tagline: 'Question Authoring & Evaluation',
      description:
        'Curate JEE Main & Advanced question repositories across Physics, Chemistry, and Mathematics. Assemble balanced test papers, verify answer keys, and evaluate submissions.',
      responsibilities: [
        'Subject-wise question bank management (P/C/M)',
        'Question paper builder with marking schemes',
        'Difficulty and topic coverage balancing',
        'Submission evaluation & item analysis reports',
      ],
      actionLabel: 'Enter Examiner Studio',
      badgeColor: 'border-indigo-200 text-indigo-900 bg-indigo-50',
    },
    {
      id: 'student' as UserRole,
      title: 'Candidate / Student',
      icon: GraduationCap,
      tagline: 'CBT Test Taker & Analysis',
      description:
        'Experience the computer-based testing interface. Review upcoming examination schedules, inspect test guidelines, attempt practice tests, and view detailed scorecards.',
      responsibilities: [
        'Available & scheduled JEE mock tests',
        'Authentic CBT instructions & test simulation',
        'Section-wise question navigation & review palette',
        'Subject scorecards, percentiles & AIR analytics',
      ],
      actionLabel: 'Enter Student Portal',
      badgeColor: 'border-blue-200 text-blue-900 bg-blue-50',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="max-w-6xl w-full mx-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-xs">
              S
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-950">SCHLAR</span>
              <span className="text-xs text-slate-500 block leading-tight">JEE Competitive Exam Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            <School className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-medium">Institutional Evaluation Sandbox</span>
          </div>
        </div>

        {/* Hero Introduction */}
        <div className="text-center pt-10 pb-8 max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-wider text-blue-700 uppercase mb-2">
            Multi-Role Computer-Based Testing System
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            Select Your Role to Enter Workspace
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Welcome to the SCHLAR JEE examination engine demo. Choose one of the three primary roles below to explore the customized workflows and realistic examination data.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {roles.map((role) => {
            const Icon = role.icon;
            const isHovered = hoveredRole === role.id;

            return (
              <div
                key={role.id}
                onMouseEnter={() => setHoveredRole(role.id)}
                onMouseLeave={() => setHoveredRole(null)}
                onClick={() => onSelectRole(role.id)}
                className={`relative flex flex-col justify-between p-6 rounded-xl bg-white border transition-all duration-200 cursor-pointer ${
                  isHovered
                    ? 'border-blue-600 shadow-md ring-1 ring-blue-600/30 -translate-y-0.5'
                    : 'border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Role Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                        role.id === 'admin'
                          ? 'bg-slate-100 text-slate-800'
                          : role.id === 'examiner'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${role.badgeColor}`}>
                      {role.tagline}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 leading-snug">{role.title}</h2>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{role.description}</p>

                  {/* Core Responsibilities */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Core Capabilities
                    </p>
                    <ul className="space-y-1.5">
                      {role.responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRole(role.id);
                    }}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-colors ${
                      role.id === 'admin'
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : role.id === 'examiner'
                        ? 'bg-indigo-700 hover:bg-indigo-800 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <span>{role.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Demo Notice Disclaimer */}
        <div className="mt-8 p-4 rounded-lg bg-slate-100/80 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Institutional Demonstration Mode:</span>
            <span>Role selection is an interactive switch for demonstration purposes. All mock datasets are locally synchronized.</span>
          </div>
          <div className="text-[11px] text-slate-500 whitespace-nowrap">
            Built for JEE Main & Advanced Standards
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-400">
        SCHLAR Competitive Examination Platform &copy; 2026. Designed for institutional excellence.
      </footer>
    </div>
  );
};
