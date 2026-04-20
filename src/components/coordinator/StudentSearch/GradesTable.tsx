// clientside/src/components/coordinator/StudentSearch/GradesTable.tsx
"use client";

import { GradeRecord } from "@/api/types";
import { Info } from "lucide-react";

interface GradesTableProps {
  grades:        GradeRecord[];
  isCrossYear?:  boolean; // passed per-grade eventually; for now flag via grade metadata
}

export default function GradesTable({ grades }: GradesTableProps) {
  if (grades.length === 0) {
    return (
      <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-xl m-4">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
          No grade records found for this year of study.
        </p>
      </div>
    );
  }

  // Group by academic year for a cleaner display
  const gradesByYear: Record<string, GradeRecord[]> = {};
  grades.forEach(g => {
    const yr = g.academicYear?.year || "Unknown";
    if (!gradesByYear[yr]) gradesByYear[yr] = [];
    gradesByYear[yr].push(g);
  });

  const years = Object.keys(gradesByYear).sort().reverse();
  const hasMultipleYears = years.length > 1;

  return (
    <div className="overflow-x-auto">
      {hasMultipleYears && (
        <div className="mx-4 mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2">
          <Info size={12} className="text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-[9px] text-slate-500 leading-relaxed">
            Grades from multiple academic years are shown. Prior-year marks (grey rows) belong to
            units passed before the current cohort year — this is normal for special exam students,
            stayout retakers, and repeat-year students.
          </p>
        </div>
      )}

      <table className="w-full border-collapse">
        <thead className="bg-green-darkest text-[9px] text-white/70 uppercase tracking-[0.2em]">
          <tr>
            <th className="px-5 py-3 text-left font-black">Session</th>
            <th className="px-5 py-3 text-left font-black">Sem</th>
            <th className="px-5 py-3 text-left font-black">Code</th>
            <th className="px-5 py-3 text-left font-black">Unit Name</th>
            <th className="px-5 py-3 text-center font-black">Mark</th>
            <th className="px-5 py-3 text-center font-black">Grade</th>
            <th className="px-5 py-3 text-center font-black">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-50">
          {years.flatMap((yr, yIdx) =>
            gradesByYear[yr].map((grade, gIdx) => {
              const isPriorYear = yIdx > 0; // prior years — softer styling
              const markVal = grade.totalMark || grade.agreedMark || 0;

              return (
                <tr
                  key={`${yr}-${gIdx}`}
                  className={`text-xs transition-colors group ${
                    isPriorYear
                      ? "bg-slate-100/80 hover:bg-slate-100/60"
                      : "hover:bg-green-50/40"
                  }`}
                >
                  <td className={`px-5 py-3 font-mono font-medium ${isPriorYear ? "text-slate-400" : "text-slate-500"}`}>
                    <div className="flex items-center gap-1.5">
                      {isPriorYear && (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" title="Prior academic year" />
                      )}
                      {yr}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      isPriorYear ? " text-slate-400" : " text-slate-600"
                    }`}>
                      {grade.semester && grade.semester !== "N/A" ? `S${grade.semester}` : "—"}
                    </span>
                  </td>
                  <td className={`px-5 py-3 font-mono font-black text-[11px] ${isPriorYear ? "text-slate-400" : "text-blue-700"}`}>
                    {grade.unit?.code || "N/A"}
                  </td>
                  <td className={`px-5 py-3 font-medium ${isPriorYear ? "text-slate-400" : "text-green-darkest"}`}>
                    {grade.unit?.name || "Unit details missing"}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs ${
                 markVal >= 40 ? "text-green-darkest"
                      : markVal > 0  ? "text-yellow-gold"
                      : "text-slate-300"
                    }`}>
                      {markVal > 0 ? markVal.toFixed(1) : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs ${
                      
                       grade.grade === "E" ? "text-yellow-gold"
                      : "text-green-darkest"
                    }`}>
                      {grade.grade || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <StatusBadge status={grade.status} />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Legend for multi-year */}
      {hasMultipleYears && (
        <div className="flex items-center gap-4 px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-600" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Current year</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Prior year (carried over)</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalised = status === "FAIL" || status === "F" ? "SUPPLEMENTARY" : status;

  const config: Record<string, { bg: string; text: string; dot: string }> = {
    PASS:          { bg:"",  text: "text-emerald-700", dot: "bg-emerald-500"  },
    SUPPLEMENTARY: { bg:"",  text: "text-purple-700",  dot: "bg-purple-500"   },
    RETAKE:        { bg:"",  text: "text-orange-700",  dot: "bg-orange-500"   },
    SPECIAL:       { bg:"",  text: "text-blue-700",    dot: "bg-blue-500"     },
    INCOMPLETE:    { bg:"",  text: "text-amber-700",   dot: "bg-amber-500"    },
  };

  const c = config[normalised] || {  text: "text-slate-600", dot: "bg-slate-400" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider  ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {normalised}
    </span>
  );
}
