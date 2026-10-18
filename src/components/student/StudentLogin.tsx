import React, { useState } from 'react';
import { GraduationCap, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { DemoUser } from '../../types';
import { useToast } from '../common/Toast';

interface StudentLoginProps {
  students: DemoUser[];
  onLoginSuccess: (student: DemoUser) => void;
  onReturnToRoles: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  students,
  onLoginSuccess,
  onReturnToRoles,
}) => {
  const { showToast } = useToast();
  const [usernameOrId, setUsernameOrId] = useState('aarav.mehta');
  const [password, setPassword] = useState('student123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedInput = usernameOrId.trim().toLowerCase();
    const student = students.find(
      (s) =>
        s.username?.toLowerCase() === trimmedInput ||
        s.rollNumber?.toLowerCase() === trimmedInput ||
        s.email.toLowerCase() === trimmedInput
    );

    if (!student) {
      setErrorMessage('No demo student account matched this username or roll identifier.');
      showToast('Login Failed', 'Invalid credentials', 'error');
      return;
    }

    if (student.status === 'Suspended') {
      setErrorMessage('This demo candidate account has been suspended by administration.');
      showToast('Access Denied', 'Account is suspended', 'error');
      return;
    }

    if (student.password && password !== student.password && password !== 'student123') {
      setErrorMessage('Incorrect demo password. (Default is student123)');
      showToast('Login Failed', 'Incorrect password', 'error');
      return;
    }

    showToast('Signed In', `Welcome to CBT Portal, ${student.name}`, 'success');
    onLoginSuccess(student);
  };

  const handleQuickLogin = (student: DemoUser) => {
    setUsernameOrId(student.username || student.rollNumber || '');
    setPassword(student.password || 'student123');
    showToast('Demo Credentials Loaded', `Selected candidate: ${student.name}`, 'info');
    onLoginSuccess(student);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-sm">
            S
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            SCHLAR Candidate Portal
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Computer-Based Testing (CBT) Candidate Authentication
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-6 sm:px-8 rounded-xl border border-slate-200 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Student ID / Username / Roll Number
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={usernameOrId}
                  onChange={(e) => setUsernameOrId(e.target.value)}
                  placeholder="e.g. aarav.mehta or SCH-2026-0842"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter demo password"
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <span>Sign In to CBT Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              One-Click Demo Candidate Logins
            </span>
            <div className="space-y-1.5">
              {students.slice(0, 3).map((stu) => (
                <button
                  key={stu.id}
                  onClick={() => handleQuickLogin(stu)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs transition-colors"
                >
                  <div>
                    <span className="font-semibold text-slate-900 block">{stu.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Roll: {stu.rollNumber} · {stu.batch}
                    </span>
                  </div>
                  <span className="text-[11px] text-blue-600 font-medium">Log In →</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={onReturnToRoles}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Role Selection</span>
            </button>
            <span className="text-[11px] text-slate-400">Institutional Demo Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
};
