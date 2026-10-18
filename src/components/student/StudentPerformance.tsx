import React from 'react';
import { TrendingUp, BarChart3, CheckCircle2, AlertCircle, Award } from 'lucide-react';
import { ExamResult } from '../../types';

interface StudentPerformanceProps {
  results: ExamResult[];
}

export const StudentPerformance: React.FC<StudentPerformanceProps> = ({ results }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-900">Longitudinal Performance & Progress Analytics</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Track score trajectories, topic-wise strengths, speed efficiency, and negative marking control
        </p>
      </div>

      {/* Top Trajectory Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Average Percentile</span>
          <div className="text-2xl font-bold text-blue-700 font-mono tabular-nums mt-1">
            99.13 %ile
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            +1.2% progression over past 3 test cycles
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Negative Penalty Ratio</span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            4.2%
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Under 5% threshold (Optimal risk-taking)
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-xs font-medium text-slate-500">Mean Question Speed</span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            2.1 min/Q
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Standard target: 2.0 min for JEE Main</div>
        </div>
      </div>

      {/* Subject Topic Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Topic-wise Proficiency Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Physics */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="font-bold text-blue-900 text-sm block">Physics Domain</span>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>Rotational Motion</span>
                  <span className="font-mono font-semibold">92%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>Electrostatics & Magnetism</span>
                  <span className="font-mono font-semibold">86%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '86%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>Wave Optics</span>
                  <span className="font-mono font-semibold">75%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Chemistry */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="font-bold text-indigo-900 text-sm block">Chemistry Domain</span>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>Coordination Compounds</span>
                  <span className="font-mono font-semibold">89%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '89%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>Thermodynamics</span>
                  <span className="font-mono font-semibold">84%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '84%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>Organic Reaction Mechanisms</span>
                  <span className="font-mono font-semibold">72%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Mathematics */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="font-bold text-emerald-900 text-sm block">Mathematics Domain</span>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>3D Vectors & Matrices</span>
                  <span className="font-mono font-semibold">88%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>Differential Calculus</span>
                  <span className="font-mono font-semibold">82%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>Integral Calculus & Area</span>
                  <span className="font-mono font-semibold">70%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '70%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
