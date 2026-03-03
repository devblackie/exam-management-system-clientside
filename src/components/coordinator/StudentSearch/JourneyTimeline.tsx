// import React from "react";
// import { AlertTriangle, CheckCircle, GraduationCap, Info } from "lucide-react";

// interface JourneyProps {
//   data: {
//     admissionYear: string;
//     currentStatus: string;
//     timeline: Array<{
//       academicYear: string;
//       yearOfStudy: number;
//       challenges: {
//         supplementary: string[];
//         retakes: string[];
//         specials: string[];
//       };
//     }>;
//   };
// }

// export default function JourneyTimeline({ data }: JourneyProps) {
//   return (
//     <div className="p-8 space-y-8 bg-white">
//       <div className="flex items-center gap-4 p-4 border rounded-lg bg-slate-50">
//         <GraduationCap className="text-green-darkest" size={32} />
//         <div>
//           <h4 className="font-bold text-slate-800">
//             Admission Year: {data.admissionYear}
//           </h4>
//           <p className="text-xs text-slate-500 uppercase font-black">
//             Current Status: {data.currentStatus}
//           </p>
//         </div>
//       </div>

//       <div className="relative border-l-2 border-slate-200 ml-4 space-y-12">
//         {data.timeline.map((milestone, idx) => (
//           <div key={idx} className="relative pl-8">
//             <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-yellow-gold border-4 border-white shadow-sm" />

//             <div className="flex flex-col gap-1">
//               <span className="text-[10px] font-black text-green-darkest/40 uppercase tracking-widest">
//                 Academic Year {milestone.academicYear}
//               </span>
//               <h3 className="text-xl font-bold text-slate-800">
//                 Year {milestone.yearOfStudy} Milestones
//               </h3>
//             </div>

//             <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
//               {/* Challenges Section */}
//               <div className="p-4 rounded-xl border border-red-100 bg-red-50/30">
//                 <div className="flex items-center gap-2 mb-2 text-red-600">
//                   <AlertTriangle size={16} />
//                   <span className="text-xs font-bold uppercase">
//                     Academic Challenges
//                   </span>
//                 </div>
//                 {milestone.challenges.supplementary.length > 0 ||
//                 milestone.challenges.retakes.length > 0 ? (
//                   <ul className="text-xs space-y-1 text-slate-600">
//                     {milestone.challenges.supplementary.map((u) => (
//                       <li key={u}>• Supp: {u}</li>
//                     ))}
//                     {milestone.challenges.retakes.map((u) => (
//                       <li key={u} className="text-red-700 font-bold">
//                         • Retake: {u}
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <p className="text-xs text-slate-400 italic">
//                     No failures recorded
//                   </p>
//                 )}
//               </div>

//               {/* Special Exams Section */}
//               <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30">
//                 <div className="flex items-center gap-2 mb-2 text-blue-600">
//                   <Info size={16} />
//                   <span className="text-xs font-bold uppercase">
//                     Special Considerations
//                   </span>
//                 </div>
//                 {milestone.challenges.specials.length > 0 ? (
//                   <p className="text-xs text-slate-600">
//                     Specials: {milestone.challenges.specials.join(", ")}
//                   </p>
//                 ) : (
//                   <p className="text-xs text-slate-400 italic">None</p>
//                 )}
//               </div>

//               {/* Status Section */}
//               <div className="p-4 rounded-xl border border-green-100 bg-green-50/30">
//                 <div className="flex items-center gap-2 mb-2 text-green-700">
//                   <CheckCircle size={16} />
//                   <span className="text-xs font-bold uppercase">
//                     Year Outcome
//                   </span>
//                 </div>
//                 <p className="text-xs font-bold text-green-800">
//                   {milestone.challenges.retakes.length > 0
//                     ? "REPEAT YEAR"
//                     : "PROCEEDED"}
//                 </p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// top of file with initial version of JourneyTimeline component, showing a basic timeline of academic milestones with challenges and outcomes.



"use client";
import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  History,
  AlertTriangle,
  ArrowRightCircle,
  BriefcaseBusiness,
  University,
  PlaneTakeoff, 
  Clock, 
} from "lucide-react";
import { StudentJourneyResponse, StudentJourneyTimeline } from "@/api/types";

interface JourneyProps {
  data: StudentJourneyResponse;
}

// Map academic status to severity for visual indicators
const getOutcomeDetails = (milestone: StudentJourneyTimeline) => {
  // Check for Leave/Deferment
  if (milestone.leaveInfo) {
    const isDefer = milestone.leaveInfo.type === "DEFERMENT";
    return {
      text: isDefer ? "ADMISSION DEFERRED" : "ACADEMIC LEAVE",
      color: isDefer ? "text-blue-700" : "text-amber-700",
      bg: isDefer ? "bg-blue-50" : "bg-amber-50",
      border: isDefer ? "border-blue-200" : "border-amber-200",
      icon: isDefer ? <Clock size={16} /> : <PlaneTakeoff size={16} />,
    };
  }

  // Normal progression outcomes
  if (milestone.challenges.retakes.length > 0)
    return {
      text: "REPEAT YEAR REQUIRED",
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      icon: <AlertCircle size={16} />,
    };
  if (milestone.challenges.supplementary.length > 0)
    return {
      text: "PROCEED WITH SUPPLEMENTARIES",
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: <AlertTriangle size={16} />,
    };
  return {
    text: "SUCCESSFULLY PROCEEDED",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: <CheckCircle2 size={16} />,
  };
};

export default function JourneyTimeline({ data }: JourneyProps) {
  return (
    <div className="bg-white">
      {/* Header Summary Card */}
      <div className="p-6 border-b border-green-darkest/10 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-darkest rounded-xl text-white">
            <GraduationCap size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-green-darkest uppercase tracking-tighter">
              Academic Path: {data.admissionYear} Intake
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase ${
                  data.currentStatus === "active"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-yellow-100 text-yellow-700 border-yellow-200"
                }`}
              >
                Current Status: {data.currentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 relative">
        {/* Vertical Line Track */}
        <div className="absolute left-12 top-8 bottom-8 w-[2px] bg-gradient-to-b from-green-darkest/20 via-slate-200 to-transparent" />

        <div className="space-y-12">
          {data.timeline.length === 0 ? (
            <div className="ml-16 py-10 text-slate-400 italic text-sm">
              No historical academic milestones found for this student.
            </div>
          ) : (
            data.timeline.map((milestone, idx) => {
              const outcome = getOutcomeDetails(milestone);
              return (
                <div
                  key={idx}
                  className="relative flex gap-10 items-start group"
                >
                  {/* Timeline Node */}
                  <div className="relative z-10 flex-shrink-0 mt-1">
                    <div
                      className={`w-8 h-8 rounded-full border-4 border-white shadow-md flex items-center justify-center ${
                        milestone.leaveInfo
                          ? "bg-amber-500 text-white"
                          : milestone.challenges.retakes.length > 0
                            ? "bg-red-500 text-white"
                            : "bg-green-darkest text-white"
                      }`}
                    >
                      {milestone.leaveInfo ? (
                        <Clock size={14} />
                      ) : (
                        <History size={14} />
                      )}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="flex-1">
                    <div className="flex flex-col mb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {milestone.leaveInfo
                          ? "Break in Study"
                          : `Year ${milestone.yearOfStudy}`}{" "}
                        • {milestone.academicYear}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Status Card */}
                      <div
                        className={`p-4 rounded-xl border ${outcome.border} ${outcome.bg}`}
                      >
                        <div
                          className={`flex items-center gap-2 mb-2 ${outcome.color}`}
                        >
                          {outcome.icon}
                          <span className="text-[10px] font-black uppercase tracking-wider">
                            Academic Milestone
                          </span>
                        </div>
                        <p className={`text-sm font-bold ${outcome.color}`}>
                          {outcome.text}
                        </p>
                        {milestone.leaveInfo && (
                          <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase italic">
                            Reason: {milestone.leaveInfo.reason}
                          </p>
                        )}
                      </div>

                      {/* Deficiency Card / Empty Details Card */}
                      {!milestone.leaveInfo ? (
                        <>
                          <div className="p-4 rounded-xl border border-slate-100 bg-white">
                            <div className="flex items-center gap-2 mb-2 text-slate-400">
                              <AlertTriangle size={16} />
                              <span className="text-[10px] font-black uppercase tracking-wider">
                                Challenges
                              </span>
                            </div>
                            <div className="space-y-1">
                              {milestone.challenges.retakes.map((u, i) => (
                                <span
                                  key={i}
                                  className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded mr-1"
                                >
                                  RETAKE: {u}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="p-4 rounded-xl border border-green-50 bg-green-50/30">
                            <div className="flex items-center gap-2 mb-2 text-green-700">
                              <BriefcaseBusiness size={16} />
                              <span className="text-[10px] font-black uppercase tracking-wider">
                                Summary
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-600 leading-relaxed">
                              {milestone.totalUnits} Units Evaluated.
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="lg:col-span-2 p-4 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
                          <p className="text-[11px] text-slate-400 italic font-medium">
                            No academic marks recorded for this period due to
                            authorized {milestone.leaveInfo.type.toLowerCase()}.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}