import React, { useState } from 'react';
import { BookOpenCheck, Search, Eye, CheckCircle2, Clock } from 'lucide-react';
import { Exam } from '../../types';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface ExaminerExamsProps {
  exams: Exam[];
}

export const ExaminerExams: React.FC<ExaminerExamsProps> = ({ exams }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const filtered = exams.filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Curated Examinations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active and archived test papers curated by the Faculty Examination Committee
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search examinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Title & Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Questions</th>
                <th className="py-3 px-4">Marking Scheme</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{e.title}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{e.code}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{e.category}</td>
                  <td className="py-3.5 px-4 font-mono tabular-nums">
                    {e.totalQuestions} Questions ({e.totalMarks} Marks)
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                    +{e.markingScheme.correct} / {e.markingScheme.incorrect}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${
                        e.status === 'published'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedExam(e)}
                      className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 text-xs font-medium"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedExam && (
        <Modal
          isOpen={!!selectedExam}
          onClose={() => setSelectedExam(null)}
          title={selectedExam.title}
          subtitle={`Examination Code: ${selectedExam.code}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium block">Evaluation Rubric & Penalty Rules:</span>
              <p className="font-mono text-slate-800 mt-1">{selectedExam.negativeMarking}</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Subject Breakdown</h4>
              <div className="space-y-2">
                {selectedExam.subjects.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-white border border-slate-200 flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-800">{s.name} Section</span>
                    <span className="font-mono text-slate-600">
                      {s.questionsCount} Questions ({s.maxMarks} Marks)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
