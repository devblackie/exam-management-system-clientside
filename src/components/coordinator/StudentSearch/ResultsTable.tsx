
"use client";

import { StudentSearchResult } from "@/api/types";
import { 
  UserX, 
  ChevronRight, 
  Fingerprint, 
  GraduationCap, 
  SearchCode,
  ArrowUpRight
} from "lucide-react";
import { UserMinusIcon } from "@heroicons/react/24/outline";

interface ResultsTableProps {
  results: StudentSearchResult[];
  onSelect: (regNo: string) => void;
  visible: boolean;
  searching?: boolean;
}

export default function ResultsTable({ results, onSelect, visible, searching }: ResultsTableProps) {
  if (!visible || searching) return null;

  // 1. BESPOKE EMPTY STATE
  if (results.length === 0) {
    return (
      <div className="relative group overflow-hidden bg-white border border-green-darkest/5 rounded-lg p-16 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
          <Fingerprint size={160} className="text-green-darkest" />
        </div>

        <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center py-12 mb-6 border border-dashed border-slate-200 group-hover:scale-110 transition-transform duration-500">
          {/* <UserX className="w-10 h-10 text-slate-300" /> */}
        <UserMinusIcon className="w-12 h-12 text-gray-300 mb-4" />

        </div>

        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tighter mb-2">
          No students found
        </h3>
        <p className="text-[11px] font-bold text-slate-400 uppercase max-w-xs leading-relaxed">
          We could not find any student matching that registration number. Please check the format and try again.

        </p>
      </div>
    );
  }

  // 2. EXECUTIVE RESULTS REGISTRY
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Section Header Label */}
      <div className="flex items-center gap-4 mb-6 px-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/40 flex items-center gap-2">
          <SearchCode size={14} className="text-yellow-gold" />
          Registry Match Results
        </h2>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
      </div>

      <div className="bg-white rounded-lg border border-green-darkest/5 overflow-hidden shadow-2xl shadow-green-darkest/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-green-darkest">
              <th className="px-8 py-5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-gold/80">Reg Number</span>
              </th>
              <th className="px-8 py-5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-gold/80">Full Name</span>
              </th>
              <th className="px-8 py-5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-gold/80">Program</span>
              </th>
              <th className="px-8 py-5 text-right">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-gold/80">Access</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {results.map((student) => (
              <tr 
                key={student._id} 
                className="group hover:bg-slate-50/80 transition-all duration-300 cursor-pointer"
                onClick={() => onSelect(student.regNo)}
              >
                {/* Reg No with Monospaced font */}
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-yellow-gold scale-0 group-hover:scale-100 transition-transform duration-300" />
                    <span className="text-sm font-mono font-black text-green-darkest tracking-tighter">
                      {student.regNo}
                    </span>
                  </div>
                </td>

                {/* Name with Bold Weight */}
                <td className="px-8 py-6">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-tight group-hover:text-green-darkest transition-colors">
                    {student.name}
                  </span>
                </td>

                {/* Program with Icon */}
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors">
                    <GraduationCap size={16} className="opacity-40" />
                    <span className="text-xs font-medium italic">
                      {student.program?.name || "Unassigned Curriculum"}
                    </span>
                  </div>
                </td>

                {/* Action Button */}
                <td className="px-8 py-6 text-right">
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-transparent group-hover:underline rounded-xl text-green-darkest group-hover:text-emerald-500 font-black text-[10px] uppercase tracking-widest transition-all duration-500 group-hover:border-green-darkest">
                    Open Profile
                    <ArrowUpRight size={14} className="group-hover:rotate-45 transition-transform duration-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Ribbon */}
        <div className="bg-slate-50/50 px-8 py-4 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {results.length} Identity Matches
          </p>
        
          <div className="flex gap-1">
            <div className="h-1 w-1 rounded-full bg-green-500/30" />
            <div className="h-1 w-8 rounded-full bg-green-500/30" />
          </div>
        </div>
      </div>
    </div>
  );
}