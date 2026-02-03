"use client";

import React from "react";
import { Trash2, PenLine } from "lucide-react";
import type { Program, ProgramUnit } from "@/api/types";

interface CurriculumTableProps {
  curriculum: ProgramUnit[];
  programs: Program[];
  selectedProgramId: string;
  loading: boolean;
  submitting: boolean;
  onEdit: (link: ProgramUnit) => void;
  onDelete: (id: string) => void;
}

export const CurriculumTable: React.FC<CurriculumTableProps> = ({
  curriculum, programs, selectedProgramId, loading, submitting, onEdit, onDelete,
}) => {
  const selectedProgram = programs.find((p) => p._id === selectedProgramId);
  const sortedCurriculum = [...curriculum].sort((a, b) => 
    a.requiredYear !== b.requiredYear ? a.requiredYear - b.requiredYear : a.requiredSemester - b.requiredSemester
  );

  return (
    <div className="bg-white rounded-lg border border-green-darkest/5 shadow-sm overflow-hidden">
      <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-darkest/60">
          Structure: {selectedProgram?.name || "Unselected"}
        </h2>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-50">
            <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Code</th>
            <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit Specification</th>
            <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Level/Term</th>
            <th className="px-8 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Edit/Delete</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {sortedCurriculum.map((link) => (
            <tr key={link._id} className="group hover:bg-slate-50/50 transition-all">
              <td className="px-8 py-6">
                <span className="px-3 py-1.5 bg-green-darkest text-yellow-gold text-xs font-mono font-bold rounded-lg shadow-sm">
                  {link.unit.code}
                </span>
              </td>
              <td className="px-8 py-4">
                <p className="text-sm font-bold text-green-darkest tracking-tight">{link.unit.name}</p>
              </td>
              <td className="px-8 py-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-green-darkest uppercase">
                  Y{link.requiredYear} • S{link.requiredSemester}
                </div>
              </td>
              <td className="px-8 py-4 text-right">
                <div className="flex justify-end gap-3">
                  <button onClick={() => onEdit(link)} className="p-2 text-slate-300 hover:text-green-dark hover:bg-green-50 rounded-xl transition-all">
                    <PenLine size={16} />
                  </button>
                  <button onClick={() => onDelete(link._id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};