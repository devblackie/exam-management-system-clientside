// clientside/src/components/programs/ProgramTable.tsx
"use client";

import type { Program } from "@/api/types";
import { BookOpen, Calendar } from "lucide-react";

export default function ProgramTable({ programs }: { programs: Program[] }) {
  if (programs.length === 0) {
    return (
      <div className="text-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
        <BookOpen className="mx-auto text-slate-200 mb-4" size={48} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Academic Programs Identified</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-green-darkest/5 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Program Identity</th>
            <th className="px-8 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Code</th>
            <th className="px-8 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {programs.map((program) => (
            <tr key={program._id} className="group hover:bg-slate-50/50 transition-all">
              <td className="px-8 py-4">
                <p className="text-sm font-bold text-green-darkest tracking-tight">{program.name}</p>
              </td>
              <td className="px-8 py-4 text-center">
                <span className="px-4 py-2 bg-green-darkest text-yellow-gold text-xs font-mono font-bold rounded-lg shadow-sm">
                  {program.code}
                </span>
              </td>
              <td className="px-8 py-4 text-right">
                <div className="flex items-center justify-end gap-2 text-green-darkest font-black text-xs">
                  <Calendar size={14} className="text-slate-300" />
                  {program.durationYears} Years
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}