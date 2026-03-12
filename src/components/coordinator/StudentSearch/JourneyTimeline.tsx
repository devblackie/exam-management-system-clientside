// clientside/src/components/coordinator/StudentSearch/JourneyTimeline.tsx
"use client";
import React from "react";
import { AlertCircle, CheckCircle2, GraduationCap, History, AlertTriangle, PlaneTakeoff, Clock, RefreshCcw, Zap } from "lucide-react";
import { StudentJourneyResponse, StudentJourneyTimeline } from "@/api/types";

interface JourneyProps {
  data: StudentJourneyResponse;
}

const getOutcomeDetails = (milestone: StudentJourneyTimeline) => {
  if (milestone.type === "STATUS_CHANGE") {
    const isActive = milestone.toStatus === "active";
    const isDefer = milestone.toStatus === "deferred";
    return {
      text: isActive ? "STUDIES RESUMED" : isDefer ? "ADMISSION DEFERRED" : "ACADEMIC LEAVE",
      color: "text-slate-900",
      bg: "bg-white",
      border: "border-slate-200",
      icon: isActive ? <RefreshCcw size={14} /> : isDefer ? <Clock size={14} /> : <PlaneTakeoff size={14} />,
      nodeBg: "bg-slate-900",
    };
  }

  const status = milestone.status?.toUpperCase() || "";
  const isCritical = status.includes("REPEAT") || status.includes("DEREGISTERED");
  const isWarning = status.includes("SUPP") || status.includes("SPEC") || status.includes("STAYOUT");

  return {
    text: status || "SUCCESSFULLY PROCEEDED",
    color: isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-green-700",
    bg: "bg-white",
    border: "border-slate-100",
    icon: isCritical ? <AlertCircle size={14} /> : isWarning ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />,
    nodeBg: isCritical ? "bg-red-600" : isWarning ? "bg-yellow-600" : "bg-[#002B1B]", 
  };
};

const getClassification = (mean: number) => {
  if (mean >= 70) return { label: "First Class Honours", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (mean >= 60) return { label: "Second Class (Upper)", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
  if (mean >= 50) return { label: "Second Class (Lower)", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
  if (mean >= 40) return { label: "Pass", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" };
  return { label: "Below Pass Mark", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
};

export default function JourneyTimeline({ data }: JourneyProps) {
  const projected = getClassification(Number(data.cumulativeMean));

  return (
    <div className="bg-[#F8F9FA] rounded-xl border border-slate-200/60 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-200/60 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="h-12 w-12 bg-[#002B1B] flex items-center justify-center rounded-lg shadow-inner">
            <GraduationCap size={22} className="text-[#EAB308]" />
          </div>
          <div>
            <div className="flex items-center gap-3">

            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">
              {data.admissionYear} 
            </h4>
            <div className="h-3 w-[1px] bg-slate-300" />
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">
              {data.intake} Intake
            </h4>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-lg font-light text-[#002B1B] tracking-tighter">
                {data.currentStatus}
              </span>
              {/* <div className="h-3 w-[1px] bg-slate-300" /> */}
              {/* <span className="text-[9px] font-mono text-slate-400 uppercase">
                Cohort Identifier: {data.admissionYear.slice(-2)}
                {data.intake.slice(0, 1)}
              </span> */}
            </div>
          </div>
        </div>

        {/* Cumulative Tracker */}
        <div className="flex flex-col items-center justify-between  relative overflow-hidden">
          <div className="flex items-center gap-6 relative z-10">
            <div>
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
                Projected Degree Aggregate
              </h5>
              <div className="flex flex-col items-baseline">
                <div className="flex items-baseline gap-2">
                  <span className="text-[11px] font-light text-[#002B1B] tracking-tighter">
                    {data.cumulativeMean || "0.00"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    WAA / 100.00
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase  tracking-tight">
                    Current Standing:
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase tracking-tight ${projected.color}`}
                  >
                    {projected.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-10 relative bg-white">
        <div className="absolute left-[51px] top-8 bottom-8 w-[1px] bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" />

        <div className="space-y-12">
          {data.timeline.length === 0 ? (
            <div className="ml-16 py-10 text-slate-400 font-mono text-[10px] uppercase tracking-widest">
              No Historical Logs Found // End of Registry
            </div>
          ) : (
            <>
              {data.timeline.map((milestone, idx) => {
                const outcome = getOutcomeDetails(milestone);
                const isStatusChange = milestone.type === "STATUS_CHANGE";
                return (
                  <div
                    key={idx}
                    className="relative flex gap-12 items-start group"
                  >
                    <div className="relative z-10 flex-shrink-0 mt-1">
                      <div
                        className={`w-6 h-6 rounded-sm rotate-45 border-2 border-white shadow-sm flex items-center justify-center text-white transition-transform group-hover:scale-110 ${outcome.nodeBg}`}
                      >
                        <div className="-rotate-45">
                          {isStatusChange ? (
                            outcome.icon
                          ) : (
                            <History size={10} />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 pb-4 border-b border-slate-100 last:border-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-[#002B1B] uppercase tracking-[0.3em]">
                            {isStatusChange
                              ? "Admin Log"
                              : `Year ${milestone.yearOfStudy}`}
                          </span>
                          <span className="text-[10px] font-mono text-slate-300">
                            [{milestone.academicYear}]
                          </span>
                          {milestone.isCurrent && (
                            <span className="text-[8px] font-black px-2 py-0.5 bg-[#EAB308] text-[#002B1B] rounded-none uppercase tracking-tighter">
                              Live Session
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 lg:col-span-4 p-5 rounded-lg border border-slate-100 bg-[#F8F9FA] group-hover:border-[#EAB308]/30 transition-colors">
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className={`p-1 rounded ${outcome.nodeBg} text-white`}
                            >
                              {outcome.icon}
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              Official Standing
                            </span>
                          </div>
                          <p
                            className={`text-xs font-bold uppercase tracking-tight ${outcome.color}`}
                          >
                            {outcome.text}
                          </p>
                        </div>

                        {!isStatusChange ? (
                          <>
                            <div className="col-span-12 lg:col-span-5 p-5 rounded-lg border border-slate-100 bg-white">
                              <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle
                                  size={12}
                                  className="text-slate-300"
                                />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  Hurdle Registry
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {milestone.challenges?.retakes?.map((u, i) => (
                                  <span
                                    key={i}
                                    className="text-[8px] font-mono border border-red-200 bg-red-50 text-red-700 px-2 py-0.5"
                                  >
                                    RET:{u}
                                  </span>
                                ))}
                                {milestone.challenges?.supplementary?.map(
                                  (u, i) => (
                                    <span
                                      key={i}
                                      className="text-[8px] font-mono border border-amber-200 bg-amber-50 text-amber-700 px-2 py-0.5"
                                    >
                                      SUP:{u}
                                    </span>
                                  ),
                                )}
                                {milestone.challenges?.specials?.map((u, i) => (
                                  <span
                                    key={i}
                                    className="text-[8px] font-mono border border-[#002B1B]/10 bg-slate-50 text-[#002B1B] px-2 py-0.5"
                                  >
                                    SPEC:{u}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="col-span-12 lg:col-span-3 p-5 rounded-lg bg-[#002B1B] flex flex-col justify-center relative overflow-hidden group">
                              <Zap
                                size={40}
                                className="absolute -right-2 -bottom-2 text-white/5 rotate-12"
                              />
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[9px] font-black text-[#EAB308] uppercase tracking-[0.2em]">
                                  Telemetry
                                </span>
                                <span className="text-[8px] font-mono text-white/60 bg-white/10 px-1 rounded">
                                  W:{milestone.weight || 0}%
                                </span>
                              </div>
                              <p className="text-lg font-light text-white tracking-tighter leading-none">
                                {milestone.totalUnits} Units
                              </p>
                              <div className="mt-3 w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#EAB308] transition-all duration-1000"
                                  style={{ width: `${milestone.weight || 0}%` }}
                                />
                              </div>
                              <p className="text-[7px] font-mono text-white/30 mt-1 uppercase tracking-widest">
                                Degree Contribution
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className="col-span-12 lg:col-span-8 p-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center gap-6">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                Transition Note
                              </span>
                              <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                                SYSTEM_EVENT: Status shifted to{" "}
                                <span className="text-[#002B1B] font-bold">
                                  [{milestone.toStatus}]
                                </span>
                                . Reason:{" "}
                                {milestone.reason ||
                                  "Administrative realignment"}
                                .
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}




