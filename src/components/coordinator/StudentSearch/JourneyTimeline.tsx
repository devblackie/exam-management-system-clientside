
// // clientside/src/components/coordinator/StudentSearch/JourneyTimeline.tsx
// "use client";
// import React from "react";
// import {
//   AlertCircle, CheckCircle2, GraduationCap, History,
//   AlertTriangle, PlaneTakeoff, Clock, RefreshCcw, Zap,
// } from "lucide-react";
// import { StudentJourneyResponse, StudentJourneyTimeline } from "@/api/types";

// interface JourneyProps { data: StudentJourneyResponse; }

// // ── Outcome styling ────────────────────────────────────────────────────────────
// const getOutcomeDetails = (milestone: StudentJourneyTimeline) => {
//   if (milestone.type === "STATUS_CHANGE") {
//     const isActive = milestone.toStatus === "active";
//     const isDefer  = milestone.toStatus === "deferred";
//     return {
//       text:    isActive ? "STUDIES RESUMED" : isDefer ? "ADMISSION DEFERRED" : "ACADEMIC LEAVE",
//       color:   "text-slate-900",
//       bg:      "bg-white",
//       border:  "border-slate-200",
//       icon:    isActive ? <RefreshCcw size={14} /> : isDefer ? <Clock size={14} /> : <PlaneTakeoff size={14} />,
//       nodeBg:  "bg-slate-900",
//     };
//   }
//   const status     = milestone.status?.toUpperCase() || "";
//   const isPromoted = status.includes("PROMOTED");
//   const isCritical = status.includes("REPEAT") || status.includes("DEREGISTERED");
//   const isWarning  = status.includes("SUPP") || status.includes("SPEC") || status.includes("STAYOUT");
//   return {
//     text:   status || "SUCCESSFULLY PROCEEDED",
//     color:  isPromoted ? "text-[#002B1B]" : isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-green-700",
//     bg:     "bg-white",
//     border: "border-slate-100",
//     icon:   isPromoted ? <Zap size={14} className="fill-current" /> : isCritical ? <AlertCircle size={14} /> : isWarning ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />,
//     nodeBg: isPromoted ? "bg-[#002B1B]" : isCritical ? "bg-red-600" : isWarning ? "bg-yellow-600" : "bg-[#002B1B]",
//   };
// };

// // ── Classification from WAA ────────────────────────────────────────────────────
// const getClassification = (mean: number) => {
//   if (mean >= 70) return { label: "First Class Honours",       color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
//   if (mean >= 60) return { label: "Second Class (Upper)",      color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200"    };
//   if (mean >= 50) return { label: "Second Class (Lower)",      color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200"   };
//   if (mean >= 40) return { label: "Pass",                      color: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200"   };
//   return           { label: "Below Pass Mark",                 color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200"     };
// };

// // ── Telemetry bar width — scale relative to the max weight in the timeline ────
// // This prevents the bar from looking tiny when the real weight is 15%.
// // We show the true % value in the badge; the bar is proportional within [0,maxW].
// const barWidth = (weight: number, maxWeight: number): number => {
//   if (!maxWeight || maxWeight === 0) return 0;
//   return Math.round((weight / maxWeight) * 100);
// };

// export default function JourneyTimeline({ data }: JourneyProps) {
//   const projected = getClassification(Number(data.cumulativeMean));

//   // Pre-compute the maximum weight in this student's timeline for bar scaling
//   const academicEntries = data.timeline.filter(m => m.type === "ACADEMIC");
//   const maxWeight = Math.max(...academicEntries.map(m => m.weight || 0), 1);

//   return (
//     <div className="bg-[#F8F9FA] rounded-xl border border-slate-200/60 overflow-hidden shadow-sm">

//       {/* ── Header ─────────────────────────────────────────────────────────── */}
//       <div className="px-8 py-6 bg-white border-b border-slate-200/60 flex items-center justify-between">
//         <div className="flex items-center gap-6">
//           <div className="h-12 w-12 bg-[#002B1B] flex items-center justify-center rounded-lg shadow-inner">
//             <GraduationCap size={22} className="text-[#EAB308]" />
//           </div>
//           <div>
//             <div className="flex items-center gap-3">
//               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">
//                 {data.admissionYear}
//               </h4>
//               <div className="h-3 w-[1px] bg-slate-300" />
//               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">
//                 {data.intake} Intake
//               </h4>
//             </div>
//             <div className="flex items-center gap-3">
//               <span className="text-lg font-light text-[#002B1B] tracking-tighter">
//                 {data.currentStatus}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* WAA tracker */}
//         <div className="flex flex-col items-center justify-between relative overflow-hidden">
//         <div className="flex items-center gap-6 relative">
//         <div>
//           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
//             Projected Degree Aggregate
//           </h5>
//           <div className="flex flex-col items-baseline">
//             {["DEREGISTERED","DISCONTINUED","ON_LEAVE","DEFERRED"].includes(
//               data.currentStatus.toUpperCase()
//             ) ? (
//               <div className="flex flex-col items-end">
//                 <span className="text-[10px] font-mono text-slate-400 font-bold">WAA / 100.00</span>
//                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight mt-1">
//                   Not applicable — {data.currentStatus.replace("_", " ").toLowerCase()}
//                 </span>
//               </div>
//             ) : (
//               <>
//                 <div className="flex items-baseline gap-2">
//                   <span className="text-[11px] font-light text-[#002B1B] tracking-tighter">
//                     {data.cumulativeMean || "0.00"}
//                   </span>
//                   <span className="text-[10px] font-mono text-slate-400 font-bold">WAA / 100.00</span>
//                 </div>
//                 <div className="flex items-baseline gap-2">
//                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">
//                     Current Standing:
//                   </span>
//                   <span className={`text-[9px] font-black uppercase tracking-tight ${projected.color}`}>
//                     {projected.label}
//                   </span>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
// </div>
// </div>
//       {/* ── Timeline ───────────────────────────────────────────────────────── */}
//       <div className="p-10 relative bg-white">
//         <div className="absolute left-[51px] top-8 bottom-8 w-[1px] bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" />

//         <div className="space-y-12">
//           {data.timeline.length === 0 ? (
//             <div className="ml-16 py-10 text-slate-400 font-mono text-[10px] uppercase tracking-widest">
//               No Historical Logs Found // End of Registry
//             </div>
//           ) : (
//             data.timeline.map((milestone, idx) => {
//               const outcome        = getOutcomeDetails(milestone);
//               const isStatusChange = milestone.type === "STATUS_CHANGE";
//               const w              = milestone.weight || 0;
//               const scaledBar      = barWidth(w, maxWeight);

//               return (
//                 <div key={idx} className="relative flex gap-12 items-start group">

//                   {/* Node dot */}
//                   <div className="relative flex-shrink-0 mt-1">
//                     <div
//                       className={`w-6 h-6 rounded-sm rotate-45 border-2 border-white shadow-sm
//                         flex items-center justify-center text-white
//                         transition-transform group-hover:scale-110 ${outcome.nodeBg}`}
//                     >
//                       <div className="-rotate-45">
//                         {isStatusChange ? outcome.icon : <History size={10} />}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Content */}
//                   <div className="flex-1 pb-4 border-b border-slate-100 last:border-0">

//                     {/* Row header */}
//                     <div className="flex items-center justify-between mb-4">
//                       <div className="flex items-center gap-3">
//                         <span className="text-[10px] font-black text-[#002B1B] uppercase tracking-[0.3em]">
//                           {isStatusChange ? "Admin Log" : `Year ${milestone.yearOfStudy}`}
//                         </span>
//                         <span className="text-[10px] font-mono text-slate-300">
//                           [{milestone.academicYear || "N/A"}]
//                         </span>
//                         {milestone.isCurrent && (
//                           <span className="text-[8px] font-black px-2 py-0.5 bg-[#EAB308] text-[#002B1B] rounded-none uppercase tracking-tighter">
//                             Current Active Phase
//                           </span>
//                         )}
//                       </div>

//                       {/* Stamp badge */}
//                       {!isStatusChange && (
//                         <div className={`px-3 py-1 border-l-4 ${outcome.border} ${outcome.bg} shadow-sm`}>
//                           <p className={`text-[10px] font-black uppercase tracking-widest ${outcome.color}`}>
//                             {outcome.text}
//                           </p>
//                         </div>
//                       )}
//                     </div>

//                     {/* Cards grid */}
//                     <div className="grid grid-cols-12 gap-4">

//                       {/* Official Standing */}
//                       <div className="col-span-12 lg:col-span-4 p-5 rounded-lg border border-slate-100 bg-[#F8F9FA] group-hover:border-[#EAB308]/30 transition-colors">
//                         <div className="flex items-center gap-2 mb-3">
//                           <div className={`p-1 rounded ${outcome.nodeBg} text-white`}>
//                             {outcome.icon}
//                           </div>
//                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
//                             Official Standing
//                           </span>
//                         </div>
//                         <p className={`text-xs font-bold uppercase tracking-tight ${outcome.color}`}>
//                           {outcome.text}
//                         </p>
//                       </div>

//                       {!isStatusChange ? (
//                         <>
//                           {/* Hurdle Registry */}
//                           <div className="col-span-12 lg:col-span-5 p-5 rounded-lg border border-slate-100 bg-white">
//                             <div className="flex items-center gap-2 mb-3">
//                               <AlertTriangle size={12} className="text-slate-300" />
//                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
//                                 Hurdle Registry
//                               </span>
//                             </div>
//                             <div className="flex flex-wrap gap-2">
//                               {(milestone.challenges?.retakes || []).map((u, i) => (
//                                 <span key={i} className="text-[8px] font-mono border border-red-200 bg-red-50 text-red-700 px-2 py-0.5">
//                                   RET:{u}
//                                 </span>
//                               ))}
//                               {(milestone.challenges?.supplementary || []).map((u, i) => (
//                                 <span key={i} className="text-[8px] font-mono border border-amber-200 bg-amber-50 text-amber-700 px-2 py-0.5">
//                                   SUP:{u}
//                                 </span>
//                               ))}
//                               {(milestone.challenges?.specials || []).map((u, i) => (
//                                 <span key={i} className="text-[8px] font-mono border border-[#002B1B]/10 bg-slate-50 text-[#002B1B] px-2 py-0.5">
//                                   SPEC:{u}
//                                 </span>
//                               ))}
//                               {(milestone.challenges?.retakes?.length || 0) +
//                                (milestone.challenges?.supplementary?.length || 0) +
//                                (milestone.challenges?.specials?.length || 0) === 0 && (
//                                 <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">
//                                   No hurdled units
//                                 </span>
//                               )}
//                             </div>
//                           </div>

//                           {/* Telemetry — shows CORRECT weight from registry */}
//                           <div className="col-span-12 lg:col-span-3 p-5 rounded-lg bg-[#002B1B] flex flex-col justify-center relative overflow-hidden">
//                             <Zap size={40} className="absolute -right-2 -bottom-2 text-white/5 rotate-12" />

//                             <div className="flex justify-between items-start mb-2">
//                               <span className="text-[9px] font-black text-[#EAB308] uppercase tracking-[0.2em]">
//                                 Telemetry
//                               </span>
//                               {/* ── THE WEIGHT BADGE — e.g. "W:15%" for Year 1 ── */}
//                               <span className="text-[8px] font-mono text-white/80 bg-white/10 px-1.5 py-0.5 rounded">
//                                 W:{w}%
//                               </span>
//                             </div>

//                             <p className="text-lg font-light text-white tracking-tighter leading-none">
//                               {milestone.totalUnits} Units
//                             </p>

//                             {/* Bar scales relative to the highest-weighted year */}
//                             <div className="mt-3 w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
//                               <div
//                                 className="h-full bg-[#EAB308] transition-all duration-1000"
//                                 style={{ width: `${scaledBar}%` }}
//                               />
//                             </div>

//                             <p className="text-[7px] font-mono text-white/30 mt-1 uppercase tracking-widest">
//                               Degree Contribution
//                             </p>
//                           </div>
//                         </>
//                       ) : (
//                         <div className="col-span-12 lg:col-span-8 p-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center gap-6">
//                           <div className="flex flex-col">
//                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
//                               Transition Note
//                             </span>
//                             <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
//                               SYSTEM_EVENT: Status shifted to{" "}
//                               <span className="text-[#002B1B] font-bold">[{milestone.toStatus}]</span>.
//                               {" "}Reason: {milestone.reason || "Administrative realignment"}.
//                             </p>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




// clientside/src/components/coordinator/StudentSearch/JourneyTimeline.tsx
//
// WHAT WAS MISSING IN THE ORIGINAL
// ─────────────────────────────────────────────────────────────────────────────
// 1. Carry-forward units not shown — student could carry 2 units to Y2 and the
//    timeline would say "PASS" with zero mention of the carried units
// 2. Deferred supplementary units not surfaced
// 3. Attempt number per unit not displayed — impossible to tell if a student
//    is on attempt 3 vs attempt 1 just from the timeline
// 4. WAA progress shown only as final number, not year-by-year evolution
// 5. Disciplinary events missing entirely
// 6. totalTimeOutYears not shown anywhere
//
// ALL OF THESE ARE NOW FIXED BELOW

"use client";

import React from "react";
import {
  AlertCircle, CheckCircle2, GraduationCap, History,
  AlertTriangle, PlaneTakeoff, Clock, RefreshCcw, Zap,
  ShieldAlert, ArrowRight, BookOpen, TrendingUp,
} from "lucide-react";
import { StudentJourneyResponse, StudentJourneyTimeline } from "@/api/types";

interface JourneyProps { data: StudentJourneyResponse; }

// ── Outcome styling ────────────────────────────────────────────────────────────
const getOutcomeDetails = (milestone: StudentJourneyTimeline) => {
  if (milestone.type === "STATUS_CHANGE") {
    const to = milestone.toStatus?.toLowerCase() ?? "";
    const isResume      = to === "active";
    const isDefer       = to === "deferred";
    const isDisciplinary= to.includes("disciplinary");
    return {
      text:   isDisciplinary ? "DISCIPLINARY SUSPENSION" : isResume ? "STUDIES RESUMED" : isDefer ? "ADMISSION DEFERRED" : "ACADEMIC LEAVE",
      color:  isDisciplinary ? "text-red-700"   : "text-slate-900",
      bg:     "bg-white",
      border: isDisciplinary ? "border-red-300" : "border-slate-200",
      icon:   isDisciplinary ? <ShieldAlert size={14} /> : isResume ? <RefreshCcw size={14} /> : isDefer ? <Clock size={14} /> : <PlaneTakeoff size={14} />,
      nodeBg: isDisciplinary ? "bg-red-600"     : "bg-slate-900",
    };
  }

  const status     = milestone.status?.toUpperCase() || "";
  const isPromoted = status.includes("PROMOTED") || status === "PASS";
  const isCritical = status.includes("REPEAT") || status.includes("DEREGISTERED") || status.includes("DISCONTINUED");
  const isWarning  = status.includes("SUPP") || status.includes("SPEC") || status.includes("STAYOUT");
  const isCarry    = status.includes("CARRY");

  return {
    text:   status || "SUCCESSFULLY PROCEEDED",
    color:  isPromoted ? "text-[#002B1B]" : isCritical ? "text-red-600" : isWarning ? "text-amber-600" : isCarry ? "text-teal-700" : "text-green-700",
    bg:     "bg-white",
    border: "border-slate-100",
    icon:   isPromoted ? <Zap size={14} className="fill-current" /> : isCritical ? <AlertCircle size={14} /> : isWarning ? <AlertTriangle size={14} /> : isCarry ? <BookOpen size={14} /> : <CheckCircle2 size={14} />,
    nodeBg: isPromoted ? "bg-[#002B1B]" : isCritical ? "bg-red-600" : isWarning ? "bg-yellow-600" : isCarry ? "bg-teal-600" : "bg-[#002B1B]",
  };
};

// ── Classification ────────────────────────────────────────────────────────────
const getClassification = (mean: number) => {
  if (mean >= 70) return { label: "First Class Honours",  color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (mean >= 60) return { label: "Second Class (Upper)", color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200"    };
  if (mean >= 50) return { label: "Second Class (Lower)", color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200"   };
  if (mean >= 40) return { label: "Pass",                 color: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200"   };
  return             { label: "Below Pass Mark",          color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200"     };
};

const barWidth = (weight: number, maxWeight: number): number =>
  maxWeight > 0 ? Math.round((weight / maxWeight) * 100) : 0;

// ── Attempt badge ─────────────────────────────────────────────────────────────
// Shows which attempt a unit is on — critical for spotting students at risk
function AttemptBadge({ attempt }: { attempt: number }) {
  const color = attempt >= 4 ? "bg-red-100 text-red-700 border-red-200"
              : attempt === 3 ? "bg-orange-100 text-orange-700 border-orange-200"
              : attempt === 2 ? "bg-amber-100 text-amber-700 border-amber-200"
              : "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${color}`}>
      ATT {attempt}
    </span>
  );
}

export default function JourneyTimeline({ data }: JourneyProps) {
  const projected    = getClassification(Number(data.cumulativeMean));
  const academicEntries = data.timeline.filter(m => m.type === "ACADEMIC");
  const maxWeight    = Math.max(...academicEntries.map(m => m.weight || 0), 1);
  const terminalStatuses = ["DEREGISTERED","DISCONTINUED","ON_LEAVE","DEFERRED"];
  const isTerminal   = terminalStatuses.includes(data.currentStatus.toUpperCase());

  return (
    <div className="bg-[#F8F9FA] rounded-xl border border-slate-200/60 overflow-hidden shadow-sm">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="px-8 py-6 bg-white border-b border-slate-200/60">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="h-12 w-12 bg-[#002B1B] flex items-center justify-center rounded-lg shadow-inner">
              <GraduationCap size={22} className="text-[#EAB308]" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{data.admissionYear}</span>
                <span className="h-3 w-[1px] bg-slate-300" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{data.intake} Intake</span>
                {/* Time-out years — shown if student has taken academic leave */}
                {(data.totalTimeOutYears ?? 0) > 0 && (
                  <>
                    <span className="h-3 w-[1px] bg-slate-300" />
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">
                      {data.totalTimeOutYears}yr out
                    </span>
                  </>
                )}
              </div>
              <span className="text-lg font-light text-[#002B1B] tracking-tighter">{data.currentStatus}</span>
            </div>
          </div>

          {/* WAA + Classification */}
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Projected Degree Aggregate</p>
              {isTerminal ? (
                <p className="text-[10px] font-mono text-slate-400">N/A — {data.currentStatus.replace(/_/g," ").toLowerCase()}</p>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 justify-end">
                    <span className="text-xl font-light text-[#002B1B]">{data.cumulativeMean || "0.00"}</span>
                    <span className="text-[10px] font-mono text-slate-400">WAA / 100.00</span>
                  </div>
                  <p className={`text-[9px] font-black uppercase tracking-tight ${projected.color}`}>{projected.label}</p>
                </>
              )}
            </div>
            {/* Year-by-year WAA mini-sparkline */}
            {academicEntries.length > 1 && !isTerminal && (
              <div className="flex items-end gap-1 h-8">
                {academicEntries.map((m, i) => {
                  const h = Math.max(4, Math.round(((m.annualMean ?? 0) / 100) * 32));
                  const color = (m.annualMean ?? 0) >= 70 ? "bg-emerald-400"
                              : (m.annualMean ?? 0) >= 60 ? "bg-blue-400"
                              : (m.annualMean ?? 0) >= 50 ? "bg-amber-400"
                              : (m.annualMean ?? 0) >= 40 ? "bg-slate-300"
                              : "bg-red-400";
                  return (
                    <div key={i} className="flex flex-col items-center gap-0.5 group/bar relative">
                      <div className={`w-4 rounded-sm ${color} transition-all`} style={{ height: `${h}px` }} />
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 hidden group-hover/bar:block bg-[#002B1B] text-white text-[8px] font-mono px-1.5 py-1 rounded whitespace-nowrap z-10">
                        Y{m.yearOfStudy}: {(m.annualMean ?? 0).toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
                <TrendingUp size={12} className="text-slate-300 mb-0.5 ml-1" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Timeline ──────────────────────────────────────────────────────── */}
      <div className="p-10 relative bg-white">
        <div className="absolute left-[51px] top-8 bottom-8 w-[1px] bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" />
        <div className="space-y-12">
          {data.timeline.length === 0 ? (
            <div className="ml-16 py-10 text-slate-400 font-mono text-[10px] uppercase tracking-widest">
              No Historical Logs Found // End of Registry
            </div>
          ) : data.timeline.map((milestone, idx) => {
            const outcome        = getOutcomeDetails(milestone);
            const isStatusChange = milestone.type === "STATUS_CHANGE";
            const w              = milestone.weight || 0;
            const scaledBar      = barWidth(w, maxWeight);

            return (
              <div key={idx} className="relative flex gap-12 items-start group">
                {/* Node */}
                <div className="relative flex-shrink-0 mt-1">
                  <div className={`w-6 h-6 rounded-sm rotate-45 border-2 border-white shadow-sm flex items-center justify-center text-white transition-transform group-hover:scale-110 ${outcome.nodeBg}`}>
                    <div className="-rotate-45">{isStatusChange ? outcome.icon : <History size={10} />}</div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-4 border-b border-slate-100 last:border-0">
                  {/* Row header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-[#002B1B] uppercase tracking-[0.3em]">
                        {isStatusChange ? "Admin Event" : `Year ${milestone.yearOfStudy}`}
                      </span>
                      <span className="text-[10px] font-mono text-slate-300">[{milestone.academicYear || "N/A"}]</span>
                      {milestone.isCurrent && (
                        <span className="text-[8px] font-black px-2 py-0.5 bg-[#EAB308] text-[#002B1B] rounded-none uppercase tracking-tighter">
                          Current Active Phase
                        </span>
                      )}
                      {/* Annual mean badge for academic entries */}
                      {!isStatusChange && milestone.annualMean !== undefined && (
                        <span className={`text-[8px] font-mono px-2 py-0.5 rounded ${getClassification(milestone.annualMean).bg} ${getClassification(milestone.annualMean).color} border ${getClassification(milestone.annualMean).border}`}>
                          {milestone.annualMean.toFixed(1)}% this year
                        </span>
                      )}
                    </div>
                    {!isStatusChange && (
                      <div className={`px-3 py-1 border-l-4 ${outcome.border} ${outcome.bg} shadow-sm`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${outcome.color}`}>{outcome.text}</p>
                      </div>
                    )}
                  </div>

                  {/* Cards grid */}
                  <div className="grid grid-cols-12 gap-4">
                    {/* Official Standing */}
                    <div className="col-span-12 lg:col-span-4 p-5 rounded-lg border border-slate-100 bg-[#F8F9FA] group-hover:border-[#EAB308]/30 transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`p-1 rounded ${outcome.nodeBg} text-white`}>{outcome.icon}</div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Official Standing</span>
                      </div>
                      <p className={`text-xs font-bold uppercase tracking-tight ${outcome.color}`}>{outcome.text}</p>
                      {/* Qualifier suffix — shows RP1, RP1D, RP1C etc */}
                      {milestone.qualifierSuffix && (
                        <p className="text-[8px] font-mono text-slate-400 mt-1">
                          Qualifier: <span className="text-[#002B1B] font-bold">{milestone.qualifierSuffix}</span>
                        </p>
                      )}
                    </div>

                    {!isStatusChange ? (
                      <>
                        {/* Hurdle Registry — now shows attempt numbers */}
                        <div className="col-span-12 lg:col-span-5 p-5 rounded-lg border border-slate-100 bg-white">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle size={12} className="text-slate-300" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hurdle Registry</span>
                          </div>
                          <div className="space-y-1.5">
                            {(milestone.challenges?.retakes || []).map((u, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-[8px] font-mono border border-red-200 bg-red-50 text-red-700 px-2 py-0.5">RET:{typeof u === "object" ? u.code : u}</span>
                                {typeof u === "object" && u.attempt && <AttemptBadge attempt={u.attempt} />}
                              </div>
                            ))}
                            {(milestone.challenges?.supplementary || []).map((u, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-[8px] font-mono border border-amber-200 bg-amber-50 text-amber-700 px-2 py-0.5">SUP:{typeof u === "object" ? u.code : u}</span>
                                {typeof u === "object" && u.attempt && <AttemptBadge attempt={u.attempt} />}
                              </div>
                            ))}
                            {(milestone.challenges?.specials || []).map((u, i) => (
                              <span key={i} className="text-[8px] font-mono border border-[#002B1B]/10 bg-slate-50 text-[#002B1B] px-2 py-0.5 block">SPEC:{typeof u === "object" ? u.code : u}</span>
                            ))}

                            {/* ── NEW: Carry-forward units ──────────────── */}
                            {(milestone.challenges?.carryForwards || []).map((u, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-[8px] font-mono border border-teal-200 bg-teal-50 text-teal-700 px-2 py-0.5">CF:{typeof u === "object" ? u.code : u}</span>
                                <span className="text-[7px] font-black text-teal-600 uppercase tracking-wider">Carried Fwd</span>
                              </div>
                            ))}

                            {/* ── NEW: Deferred supplementary units ──────── */}
                            {(milestone.challenges?.deferred || []).map((u, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-[8px] font-mono border border-indigo-200 bg-indigo-50 text-indigo-700 px-2 py-0.5">DEF:{typeof u === "object" ? u.code : u}</span>
                                <ArrowRight size={10} className="text-indigo-400" />
                                <span className="text-[7px] font-black text-indigo-600 uppercase tracking-wider">Next Ordinary</span>
                              </div>
                            ))}

                            {(milestone.challenges?.retakes?.length || 0) +
                             (milestone.challenges?.supplementary?.length || 0) +
                             (milestone.challenges?.specials?.length || 0) +
                             (milestone.challenges?.carryForwards?.length || 0) +
                             (milestone.challenges?.deferred?.length || 0) === 0 && (
                              <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">No hurdled units</span>
                            )}
                          </div>
                        </div>

                        {/* Telemetry */}
                        <div className="col-span-12 lg:col-span-3 p-5 rounded-lg bg-[#002B1B] flex flex-col justify-center relative overflow-hidden">
                          <Zap size={40} className="absolute -right-2 -bottom-2 text-white/5 rotate-12" />
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] font-black text-[#EAB308] uppercase tracking-[0.2em]">Telemetry</span>
                            <span className="text-[8px] font-mono text-white/80 bg-white/10 px-1.5 py-0.5 rounded">W:{w}%</span>
                          </div>
                          <p className="text-lg font-light text-white tracking-tighter leading-none">{milestone.totalUnits} Units</p>
                          <div className="mt-3 w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#EAB308] transition-all duration-1000" style={{ width: `${scaledBar}%` }} />
                          </div>
                          <p className="text-[7px] font-mono text-white/30 mt-1 uppercase tracking-widest">Degree Contribution</p>
                        </div>
                      </>
                    ) : (
                      /* Status change event */
                      <div className="col-span-12 lg:col-span-8 p-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center gap-6">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Transition Note</span>
                          <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                            SYSTEM_EVENT: Status shifted to{" "}
                            <span className="text-[#002B1B] font-bold">[{milestone.toStatus}]</span>.{" "}
                            Reason: {milestone.reason || "Administrative realignment"}.
                          </p>
                          {/* Disciplinary case link */}
                          {milestone.toStatus?.includes("disciplinary") && (
                            <p className="text-[9px] text-red-600 font-bold mt-2 uppercase tracking-wider">
                              ⚠ Disciplinary case filed — system access blocked until reinstated by admin
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}