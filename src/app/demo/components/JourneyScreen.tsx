// clientside/src/app/demo/components/JourneyScreen.tsx

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { MOCK_STUDENTS } from "../data/mockData";
import { TimelineNode } from "./TimelineNode";
import { classify } from "../utils/helpers";

export function JourneyScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const student = MOCK_STUDENTS[selectedIndex];
  const mean = parseFloat(student.cumulativeMean);
  const classification = classify(mean);
  const maxWeight = Math.max(
    ...student.timeline.filter((n) => n.type === "ACADEMIC").map((n) => n.weight ?? 0),
    1
  );
  const academicNodes = student.timeline.filter((n) => n.type === "ACADEMIC");

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {/* Student list */}
      <div className="col-span-1 space-y-1">
        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2 px-1">
          Select Student
        </p>
        {MOCK_STUDENTS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              selectedIndex === idx
                ? "border-[#D4AF37]/50 bg-[#D4AF37]/5"
                : "border-white/5 bg-white/2 hover:border-white/10"
            }`}
          >
            <p className="text-[10px] font-bold text-white truncate">{s.name}</p>
            <p className="text-[8px] font-mono text-white/30 mt-0.5">{s.regNo}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${
                s.status === "active" ? "bg-emerald-900/50 text-emerald-400" :
                s.status === "repeat" ? "bg-red-900/50 text-red-400" :
                s.status === "graduand" ? "bg-[#D4AF37]/20 text-[#D4AF37]" : "bg-slate-800 text-slate-400"
              }`}>
                {s.status}
              </span>
              <span className="text-[7px] font-mono text-white/20">Y{s.currentYear}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Journey panel */}
      <div className="col-span-2 flex flex-col gap-3 min-h-0">
        {/* Header */}
        <div className="flex items-start justify-between p-4 rounded-xl bg-white/3 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#002B1B] rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap size={16} className="text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{student.admissionYear}</span>
                <span className="w-px h-3 bg-white/20" />
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{student.intake} Intake</span>
              </div>
              <p className="text-sm font-light text-white">{student.status.toUpperCase().replace(/_/g, " ")}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Projected WAA</p>
            <p className="text-xl font-light text-white">
              {student.cumulativeMean}
              <span className="text-[10px] text-white/30 ml-1">/ 100</span>
            </p>
            <p className={`text-[8px] font-black uppercase ${classification.color}`}>{classification.label}</p>
            {academicNodes.length > 1 && (
              <div className="flex items-end gap-0.5 mt-1 justify-end h-5">
                {academicNodes.map((n, idx) => {
                  const height = Math.max(3, Math.round(((n.annualMean ?? 0) / 100) * 20));
                  const barColor = (n.annualMean ?? 0) >= 70 ? "bg-emerald-400" :
                                   (n.annualMean ?? 0) >= 60 ? "bg-blue-400" :
                                   (n.annualMean ?? 0) >= 50 ? "bg-amber-400" : "bg-red-400";
                  return <div key={idx} className={`w-3 rounded-sm ${barColor}`} style={{ height: `${height}px` }} />;
                })}
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-white/2 border border-white/5 space-y-4">
          <div className="relative">
            <div className="absolute left-[10px] top-0 bottom-0 w-px bg-white/5" />
            <div className="space-y-4">
              {student.timeline.map((node, idx) => (
                <TimelineNode key={idx} node={node} maxWeight={maxWeight} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}