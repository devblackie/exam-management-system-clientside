
"use client";

import { StudentFullRecord } from "@/api/types";
import { GraduationCap } from "lucide-react";

interface StudentProfileHeaderProps {
  student: StudentFullRecord["student"];
}

export default function StudentProfileHeader({
  student,
}: StudentProfileHeaderProps) {
  return (
    <div className="group relative p-6 bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
      {/* Student Details */}
      <div className="flex-1 space-y-2 text-center md:text-left">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[2px] w-8 bg-yellow-gold" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
              Verified Identity Profile
            </h3>
          </div>
          
          <div className="flex items-center justify-between gap-3 mb-2">
            <h2 className="font-black text-sm text-green-darkest/70 uppercase">
              {student.name}
            </h2>
            {/* Added a slight scale effect to the badge on hover */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-darkest text-yellow-gold rounded-md shadow-lg shadow-green-darkest/10 transition-transform group-hover:-translate-y-1">
              <GraduationCap size={14} />
              <span className="text-[10px] font-black tracking-widest uppercase">
                Year {student.currentYear || 1}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between items-start">
            <div className="flex flex-wrap justify-center md:justify-start gap-1 mt-2">
              <p className="font-mono font-bold text-xs text-green-darkest/70 uppercase">
                {student.regNo} •
              </p>
              <div className="space-y-1">
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] block">
                  ACTIVE
                </span>
              </div>
            </div>
            <p className="font-mono text-xs text-green-darkest/70">
              {student.programName}
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Hover Line - now correctly triggered by the parent group */}
      <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-[2px] bg-yellow-gold transition-all duration-700 ease-in-out" />
    </div>
  );
}
