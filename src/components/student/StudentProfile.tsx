import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Mail, BookOpen, School, Save } from 'lucide-react';
import { DemoUser } from '../../types';
import { useToast } from '../common/Toast';

interface StudentProfileProps {
  currentUser: DemoUser;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ currentUser }) => {
  const { showToast } = useToast();
  const [targetExam, setTargetExam] = useState(currentUser.targetExam || 'JEE Advanced 2026');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [centerPreference, setCenterPreference] = useState('New Delhi - South CBT Lab Hub');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Candidate Profile Updated', 'Preferences synchronized with examination database', 'success');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-900">Candidate Profile & Examination Enrollment</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Verified academic details, roll identifier, and testing center preferences
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
        {/* Candidate Identity Card */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center">
            {currentUser.avatarInitials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{currentUser.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                {currentUser.status} Candidate
              </span>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Roll No: {currentUser.rollNumber} · Batch: {currentUser.batch}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Institutional Email</label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Contact Phone (SMS Alerts)</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Target Examination Goal</label>
              <select
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="JEE Main 2026">JEE Main 2026 Only</option>
                <option value="JEE Advanced 2026">JEE Main + Advanced 2026</option>
                <option value="BITSAT / State CET 2026">BITSAT & State CETs</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Preferred CBT Test Center Hub</label>
              <input
                type="text"
                value={centerPreference}
                onChange={(e) => setCenterPreference(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 block">Institutional Authentication Key:</span>
              Your account is cryptographically mapped to the institutional Super-30 evaluation dataset.
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
