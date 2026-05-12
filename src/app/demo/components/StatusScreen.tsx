// clientside/src/app/demo/components/StatusScreen.tsx

import { useState } from "react";

interface Scenario {
  label: string;
  vals: number[];
  desc: string;
}

const SCENARIOS: Scenario[] = [
  { label: "All pass", vals: [72, 68, 74, 70, 65, 71, 69, 73, 67, 71], desc: "All 10 units above pass mark (40%)" },
  { label: "2 fails (Supp eligible)", vals: [72, 38, 74, 70, 65, 71, 39, 73, 67, 71], desc: "2/10 failed — ≤ ⅓ — supplementary eligible (ENG.13)" },
  { label: "4 fails (Stayout)", vals: [72, 38, 74, 35, 65, 33, 39, 73, 67, 33], desc: "4/10 failed — > ⅓ but < ½ — stayout (ENG.15h)" },
  { label: "6 fails (Repeat)", vals: [38, 38, 42, 35, 65, 33, 39, 41, 37, 33], desc: "6/10 failed — ≥ ½ — repeat year (ENG.16)" },
];

const PASS_MARK = 40;

export function StatusScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scenario = SCENARIOS[selectedIndex];
  const passed = scenario.vals.filter((v) => v >= PASS_MARK).length;
  const failed = scenario.vals.filter((v) => v < PASS_MARK).length;
  const mean = scenario.vals.reduce((a, b) => a + b, 0) / scenario.vals.length;
  const total = scenario.vals.length;

  const getVerdict = () => {
    if (failed >= total / 2 || mean < 40) {
      return { label: "REPEAT YEAR", color: "text-red-400", bg: "bg-red-950/50", border: "border-red-800/40", rule: "ENG.16" };
    }
    if (failed > total / 3) {
      return { label: "STAYOUT", color: "text-orange-400", bg: "bg-orange-950/50", border: "border-orange-800/40", rule: "ENG.15h" };
    }
    if (failed > 0) {
      return { label: "SUPPLEMENTARY", color: "text-amber-400", bg: "bg-amber-950/50", border: "border-amber-800/40", rule: "ENG.13" };
    }
    return { label: "PASS — PROMOTED", color: "text-emerald-400", bg: "bg-emerald-950/50", border: "border-emerald-800/40", rule: "ENG.10" };
  };

  const verdict = getVerdict();

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grid grid-cols-4 gap-2">
        {SCENARIOS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedIndex(idx)}
            className={`p-3 rounded-lg border text-left transition-all ${
              selectedIndex === idx ? "border-[#D4AF37]/40 bg-[#D4AF37]/5" : "border-white/5 bg-white/2 hover:border-white/10"
            }`}
          >
            <p className="text-[9px] font-bold text-white">{s.label}</p>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-0">
        {/* Unit marks grid */}
        <div className="p-4 rounded-xl bg-white/3 border border-white/5">
          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-3">Unit Marks — {scenario.desc}</p>
          <div className="grid grid-cols-10 gap-1.5">
            {scenario.vals.map((value, idx) => (
              <div key={idx} className={`p-2 rounded text-center border ${
                value >= PASS_MARK ? "bg-emerald-950/40 border-emerald-800/30" : "bg-red-950/40 border-red-800/30"
              }`}>
                <p className={`text-sm font-bold ${value >= PASS_MARK ? "text-emerald-400" : "text-red-400"}`}>{value}</p>
                <p className="text-[7px] font-mono text-white/30 mt-0.5">U{idx + 1}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Mean", val: `${mean.toFixed(1)}%`, color: mean >= 40 ? "text-emerald-400" : "text-red-400" },
            { label: "Passed", val: passed, color: "text-emerald-400" },
            { label: "Failed", val: failed, color: "text-red-400" },
            { label: "Pass Rate", val: `${Math.round((passed / total) * 100)}%`, color: passed === total ? "text-emerald-400" : "text-amber-400" },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-lg bg-white/3 border border-white/5 text-center">
              <p className={`text-xl font-bold ${stat.color}`}>{stat.val}</p>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div className={`p-4 rounded-xl border flex items-center gap-4 ${verdict.bg} ${verdict.border}`}>
          <div>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Engine Verdict — {verdict.rule}</p>
            <p className={`text-xl font-bold ${verdict.color}`}>{verdict.label}</p>
          </div>
          <div className="ml-auto font-mono text-[10px] text-white/20 leading-relaxed">
            {failed >= total / 2 || mean < 40 ? "fail ≥ 50% or mean < 40 → REPEAT" :
             failed > total / 3 ? "fail > ⅓ → STAYOUT" :
             failed > 0 ? "fail ≤ ⅓ → SUPPLEMENTARY" : "all pass → PROMOTED"}
          </div>
        </div>
      </div>
    </div>
  );
}