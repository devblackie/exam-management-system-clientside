// clientside/src/app/demo/components/PromotionScreen.tsx

import { useState } from "react";
import { Play } from "lucide-react";
import { MOCK_PROMO } from "../data/mockData";
import { promoColor, promoBadge, promoLabel } from "../utils/helpers";

export function PromotionScreen() {
  const [run, setRun] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRun = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRun(true);
    }, 1200);
  };

  const eligible = MOCK_PROMO.filter((s) => s.status === "PASS");
  const blocked = MOCK_PROMO.filter((s) => s.status !== "PASS");

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Config bar */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white/3 border border-white/5">
        <div className="flex-1 grid grid-cols-3 gap-3">
          <div>
            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Program</p>
            <p className="text-[10px] font-mono text-white">BSc. Electrical & Electronics Eng.</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Year to Promote</p>
            <p className="text-[10px] font-mono text-white">Year 4 → Year 5</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Academic Year</p>
            <p className="text-[10px] font-mono text-white">2023/2024</p>
          </div>
        </div>
        <button
          onClick={handleRun}
          disabled={loading}
          className="flex items-center gap-2 bg-[#D4AF37] text-[#0A1F16] px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider disabled:opacity-50 flex-shrink-0 transition-all hover:bg-[#F0D264]"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 border border-[#0A1F16]/40 border-t-[#0A1F16] rounded-full animate-spin" />
              Running...
            </span>
          ) : (
            <>
              <Play size={11} /> Run Preview
            </>
          )}
        </button>
      </div>

      {!run ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
            <Play size={24} className="text-[#D4AF37]" />
          </div>
          <p className="text-sm font-light text-white/60">
            Click <span className="text-[#D4AF37] font-bold">Run Preview</span> to see ENG rules applied to all students
          </p>
          <p className="text-[11px] text-white/30">ENG.13, ENG.14, ENG.15h, ENG.16 calculated automatically</p>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col gap-3 min-h-0">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Total", val: MOCK_PROMO.length, color: "text-white" },
              { label: "Eligible", val: eligible.length, color: "text-emerald-400" },
              { label: "Blocked", val: blocked.length, color: "text-amber-400" },
              { label: "Promotion %", val: `${Math.round((eligible.length / MOCK_PROMO.length) * 100)}%`, color: "text-[#D4AF37]" },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-lg bg-white/3 border border-white/5 text-center">
                <p className={`text-lg font-bold ${stat.color}`}>{stat.val}</p>
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Student rows */}
          <div className="flex-1 overflow-y-auto space-y-1">
            {MOCK_PROMO.map((student, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border ${promoColor(student.status)}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold text-white truncate">{student.name}</p>
                    <span className="text-[7px] font-mono text-white/30 flex-shrink-0">{student.regNo}</span>
                  </div>
                  <p className="text-[8px] text-white/40 mt-0.5">{student.details}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${promoBadge(student.status)}`}>
                    {promoLabel(student.status)}
                  </span>
                  <p className="text-[8px] font-mono text-white/30 mt-1">{student.mean}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}