// clientside/src/components/coordinator/AcademicYears/YearTable.tsx
"use client";

import { Calendar, CheckCircle2, Clock } from "lucide-react";
import { AcademicYear } from "@/api/types";

export const YearTable = ({ years }: { years: AcademicYear[] }) => {
  if (years.length === 0) {
    return (
      <div className="text-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
        <Calendar className="mx-auto text-slate-200 mb-4" size={48} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Chronological Data Found</p>
      </div>
    );
  }

  const formatDate = (dateStr?: string) => 
    dateStr ? new Date(dateStr).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "—";

  return (
    <div className="bg-white rounded-lg border border-green-darkest/5 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Session Cycle</th>
            <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Chronology</th>
            <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {years.map((y) => (
            <tr key={y._id} className="group hover:bg-slate-50/50 transition-all">
              <td className="px-8 py-4">
                <span className="px-4 py-2 bg-green-darkest text-yellow-gold text-xs font-mono font-bold rounded-lg shadow-sm">
                  {y.year}
                </span>
              </td>
              <td className="px-8 py-4">
                <div className="flex items-center gap-3 text-green-darkest font-bold text-xs tracking-tight">
                  <span className="text-slate-400 font-mono text-xs">{formatDate(y.startDate)}</span>
                  <div className="h-[1px] w-4 bg-slate-200" />
                  <span className="text-slate-400 font-mono text-xs">{formatDate(y.endDate)}</span>
                </div>
              </td>
              <td className="px-8 py-4 text-center">
                {y.isCurrent ? (
                  <span className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle2 size={14} /> Active Session
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-6 py-2 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Clock size={14} /> Archived
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};