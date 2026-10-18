import React from 'react';
import { Calendar, Clock, MapPin, Building, ShieldCheck, AlertCircle } from 'lucide-react';
import { ScheduleItem } from '../../types';
import { useToast } from '../common/Toast';

interface UpcomingExamsProps {
  schedules: ScheduleItem[];
}

export const UpcomingExams: React.FC<UpcomingExamsProps> = ({ schedules }) => {
  const { showToast } = useToast();
  const upcoming = schedules.filter((s) => s.status === 'Upcoming');

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-900">Upcoming Examination Calendar</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Scheduled computer-based tests, laboratory allocations, and reporting guidelines
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {upcoming.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {item.category}
                </span>
                <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Confirmed Slot
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug">{item.title}</h3>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">{item.date}</span>
                  <span className="text-slate-300">·</span>
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.timeSlot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>Venue: {item.mode}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hall Ticket Verification & Biometric Check-in opens 45 mins prior</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">Roll: SCH-2026-0842</span>
              <button
                onClick={() => showToast('Admit Card Generated', `Simulated hall ticket for ${item.title} ready`, 'info')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Download Admit Card
              </button>
            </div>
          </div>
        ))}

        {upcoming.length === 0 && (
          <div className="col-span-2 p-8 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
            No upcoming examination slots are currently assigned.
          </div>
        )}
      </div>
    </div>
  );
};
