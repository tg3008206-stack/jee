import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, Clock, FileCheck, AlertTriangle, RotateCcw } from 'lucide-react';
import { PlatformSettings } from '../../types';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface AdminSettingsProps {
  settings: PlatformSettings;
  onUpdateSettings: (settings: PlatformSettings) => void;
  onResetDemoData: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  onUpdateSettings,
  onResetDemoData,
}) => {
  const { showToast } = useToast();

  const [defaultDuration, setDefaultDuration] = useState(settings.defaultDurationMinutes);
  const [resultVisibility, setResultVisibility] = useState(settings.resultVisibility);
  const [showRankImmediately, setShowRankImmediately] = useState(settings.showRankImmediately);
  const [allowCalculator, setAllowCalculator] = useState(settings.allowCalculator);
  const [autoSaveInterval, setAutoSaveInterval] = useState(settings.autoSaveIntervalSeconds);
  const [strictProctoring, setStrictProctoring] = useState(settings.enableStrictProctoring);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PlatformSettings = {
      ...settings,
      defaultDurationMinutes: Number(defaultDuration),
      resultVisibility,
      showRankImmediately,
      allowCalculator,
      autoSaveIntervalSeconds: Number(autoSaveInterval),
      enableStrictProctoring: strictProctoring,
    };
    onUpdateSettings(updated);
    showToast('Platform Settings Saved', 'Operational examination defaults updated across workspaces', 'success');
  };

  const handleConfirmReset = () => {
    onResetDemoData();
    setIsResetModalOpen(false);
    showToast('Demo Data Restored', 'All examinations, schedules, and mock results reset to original baseline', 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Examination Platform Operational Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure system-wide test defaults, candidate result publishing rules, and CBT engine settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo Data</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Examination Defaults */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Standard Examination Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Default Examination Duration (Minutes)
              </label>
              <input
                type="number"
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Standard JEE Main duration is 180 minutes.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                CBT Client Auto-Save Sync Interval (Seconds)
              </label>
              <input
                type="number"
                value={autoSaveInterval}
                onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Synchronizes student question palette and draft responses.
              </span>
            </div>
          </div>
        </div>

        {/* Result Visibility Policies */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Student Result & Scorecard Visibility
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Scorecard Release Cadence
              </label>
              <select
                value={resultVisibility}
                onChange={(e) => setResultVisibility(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="immediate">Immediate: Students view marks upon submission</option>
                <option value="after_conclusion">After Exam Window Closes: Scorecards withheld until end date</option>
                <option value="manual_approval">Manual Approval: Administrator must release results</option>
              </select>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="showRank"
                checked={showRankImmediately}
                onChange={(e) => setShowRankImmediately(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 h-4 w-4"
              />
              <label htmlFor="showRank" className="text-slate-700 font-medium cursor-pointer">
                Display All-India Mock Rank & Percentile in Candidate Scorecard
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="calc"
                checked={allowCalculator}
                onChange={(e) => setAllowCalculator(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 h-4 w-4"
              />
              <label htmlFor="calc" className="text-slate-700 font-medium cursor-pointer">
                Allow Virtual On-Screen Calculator (Disabled by default for standard JEE parity)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="proctor"
                checked={strictProctoring}
                onChange={(e) => setStrictProctoring(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 h-4 w-4"
              />
              <label htmlFor="proctor" className="text-slate-700 font-medium cursor-pointer">
                Strict Proctoring: Window blur detection & full-screen browser enforcement
              </label>
            </div>
          </div>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      {isResetModalOpen && (
        <Modal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          title="Confirm Platform Demo Reset"
          subtitle="Restore all examination datasets to baseline"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Restore Baseline Demo Data?</p>
                <p className="mt-1 text-amber-800 leading-relaxed">
                  This will reset all created examinations, student response sessions, question paper blueprints, and evaluation scores to the default institutional baseline.
                </p>
              </div>
            </div>

            <p className="text-slate-600">
              Use this option whenever you wish to restart the examination demonstration workflow from scratch.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-2xs"
              >
                Confirm & Reset Platform
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
