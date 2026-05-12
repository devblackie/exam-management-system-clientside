// clientside/src/app/demo/components/TimelineNode.tsx

import { 
  Trophy, BookMarked, CheckCircle2, History, 
  AlertCircle, AlertTriangle, Zap, ArrowRight 
} from "lucide-react";
import { MockTimelineNode } from "./types";
import { classify } from "../utils/helpers";

interface TimelineNodeProps {
  node: MockTimelineNode;
  maxWeight: number;
}

export function TimelineNode({ node, maxWeight }: TimelineNodeProps) {
  const weight = node.weight ?? 0;
  const barPct = maxWeight > 0 ? Math.round((weight / maxWeight) * 100) : 0;

  const getNodeStyle = () => {
    if (node.type === "GRADUATION") {
      return { nodeBg: "bg-emerald-600", icon: <Trophy size={10} /> };
    }
    if (node.type === "CARRY_FORWARD") {
      return { nodeBg: "bg-teal-600", icon: <BookMarked size={10} /> };
    }
    if (node.type === "STATUS_CHANGE") {
      const toStatus = (node.toStatus || "").toLowerCase();
      if (toStatus === "active") {
        return { nodeBg: "bg-emerald-700", icon: <CheckCircle2 size={10} /> };
      }
      if (toStatus === "on_leave") {
        return { nodeBg: "bg-amber-600", icon: <ArrowRight size={10} /> };
      }
      return { nodeBg: "bg-slate-600", icon: <History size={10} /> };
    }
    
    const status = (node.status || "").toUpperCase();
    if (status.includes("REPEAT")) {
      return { nodeBg: "bg-red-600", icon: <AlertCircle size={10} /> };
    }
    if (status.includes("SUPP")) {
      return { nodeBg: "bg-yellow-600", icon: <AlertTriangle size={10} /> };
    }
    if (status.includes("SESSION")) {
      return { nodeBg: "bg-blue-600", icon: <History size={10} /> };
    }
    return {
      nodeBg: "bg-[#002B1B]",
      icon: <Zap size={10} className="fill-current" />,
    };
  };

  const nodeStyle = getNodeStyle();
  const hasHurdles = node.challenges && Object.values(node.challenges).some((arr) => arr.length > 0);
  const yearOrdinal = node.type === "ACADEMIC" && node.yearOfStudy ? `Year ${node.yearOfStudy}` : "";

  return (
    <div className="flex gap-6 group">
      <div className="flex-shrink-0 mt-1">
        <div className={`w-5 h-5 rounded-sm rotate-45 border border-white/20 flex items-center justify-center text-white ${nodeStyle.nodeBg}`}>
          <div className="-rotate-45">{nodeStyle.icon}</div>
        </div>
      </div>
      <div className="flex-1 pb-5 border-b border-white/5 last:border-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
            {node.type === "ACADEMIC" ? yearOrdinal : node.type === "GRADUATION" ? "Graduation" : node.type === "CARRY_FORWARD" ? "ENG.14 — Carry Forward" : "Admin Event"}
          </span>
          <span className="text-[9px] font-mono text-white/20">[{node.academicYear}]</span>
          {node.isCurrent && (
            <span className="text-[7px] font-black px-1.5 py-0.5 bg-[#D4AF37] text-[#0A1F16] uppercase tracking-tight">
              Current
            </span>
          )}
          {node.annualMean !== undefined && node.annualMean > 0 && (
            <span className={`text-[7px] font-mono px-1.5 py-0.5 rounded ${classify(node.annualMean).color} bg-white/5`}>
              {node.annualMean.toFixed(1)}%
            </span>
          )}
        </div>

        {node.type === "ACADEMIC" && (
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1 p-3 rounded-lg bg-white/3 border border-white/5">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Standing</p>
              <p className={`text-[9px] font-bold uppercase ${
                (node.status || "").includes("REPEAT") ? "text-red-400" :
                (node.status || "").includes("SUPP") ? "text-amber-400" :
                (node.status || "").includes("SESSION") ? "text-blue-400" : "text-emerald-400"
              }`}>
                {node.status}
              </p>
              {node.qualifierSuffix && (
                <p className="text-[7px] font-mono text-white/30 mt-1">{node.qualifierSuffix}</p>
              )}
            </div>
            <div className="col-span-1 p-3 rounded-lg bg-white/3 border border-white/5">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Hurdles</p>
              <div className="space-y-0.5">
                {!hasHurdles ? (
                  <p className="text-[8px] font-mono text-white/20">Clean year</p>
                ) : (
                  <>
                    {(node.challenges?.supplementary || []).map((unit, idx) => (
                      <span key={idx} className="inline-block text-[7px] font-mono px-1.5 py-0.5 bg-amber-900/40 border border-amber-700/40 text-amber-300 rounded-sm mr-0.5 mb-0.5">
                        {unit}
                      </span>
                    ))}
                    {(node.challenges?.retakes || []).map((unit, idx) => (
                      <span key={idx} className="inline-block text-[7px] font-mono px-1.5 py-0.5 bg-red-900/40 border border-red-700/40 text-red-300 rounded-sm mr-0.5 mb-0.5">
                        RET:{unit}
                      </span>
                    ))}
                    {(node.challenges?.carryForwards || []).map((unit, idx) => (
                      <span key={idx} className="inline-block text-[7px] font-mono px-1.5 py-0.5 bg-teal-900/40 border border-teal-700/40 text-teal-300 rounded-sm mr-0.5 mb-0.5">
                        CF:{unit}
                      </span>
                    ))}
                    {(node.challenges?.incomplete || []).slice(0, 2).map((unit, idx) => (
                      <span key={idx} className="inline-block text-[7px] font-mono px-1.5 py-0.5 bg-slate-800 border border-slate-600 text-slate-400 rounded-sm mr-0.5 mb-0.5">
                        {unit}
                      </span>
                    ))}
                  </>
                )}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#002B1B] border border-[#D4AF37]/10">
              <div className="flex justify-between mb-1">
                <span className="text-[7px] font-black text-[#D4AF37]/60 uppercase">Telemetry</span>
                <span className="text-[7px] font-mono text-white/40">W:{weight}%</span>
              </div>
              <p className="text-sm font-light text-white">{node.totalUnits} units</p>
              <div className="mt-2 h-px bg-white/10 overflow-hidden">
                <div className="h-full bg-[#D4AF37]" style={{ width: `${barPct}%` }} />
              </div>
            </div>
          </div>
        )}

        {node.type === "STATUS_CHANGE" && (
          <div className="p-3 rounded-lg bg-white/3 border border-white/5">
            <p className="text-[9px] font-mono text-white/40">
              Status: <span className="text-white/60">[{(node.fromStatus || "—").toUpperCase().replace(/_/g, " ")}]</span>
              {" → "}
              <span className="text-[#D4AF37]">[{(node.toStatus || "—").toUpperCase().replace(/_/g, " ")}]</span>
            </p>
            {node.reason && <p className="text-[8px] text-white/30 mt-1">{node.reason}</p>}
          </div>
        )}

        {node.type === "CARRY_FORWARD" && (
          <div className="p-3 rounded-lg bg-teal-950/40 border border-teal-800/30">
            <p className="text-[9px] font-black text-teal-400 mb-1">ENG.14 — Carry Forward Granted ({node.qualifier})</p>
            <div className="flex gap-1 flex-wrap">
              {(node.cfUnits || []).map((unit, idx) => (
                <span key={idx} className="text-[8px] font-mono px-2 py-0.5 bg-teal-900/40 border border-teal-700/40 text-teal-300 rounded">
                  {unit}
                </span>
              ))}
            </div>
          </div>
        )}

        {node.type === "GRADUATION" && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-700/30">
            <p className="text-[9px] font-black text-emerald-400">DEGREE AWARDED — {node.reason}</p>
            {node.annualMean && (
              <p className="text-[8px] font-mono text-emerald-300/60 mt-0.5">Final WAA: {node.annualMean.toFixed(2)}%</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}