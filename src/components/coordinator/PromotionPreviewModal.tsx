// // src/components/coordinator/PromotionPreviewModal.tsx
// "use client";

// import { useState } from "react";
// import { X, CheckCircle, AlertCircle, ArrowRight, FileText, Loader2, FileWarning, GraduationCap } from "lucide-react";
// import { 
//   PromotionPreviewResponse, 
//   PromotionPreviewRecord, 
//   downloadPromotionReportWithProgress, 
//   downloadIneligibilityNoticesWithProgress,
//   downloadTranscriptsWithProgress, // Import the new function
//   PromotionParams
// } from "@/api/promoteApi";

// interface PreviewModalProps {
//   data: PromotionPreviewResponse;
//   params: PromotionParams;
//   onClose: () => void;
//   onConfirm: () => void;
// }

// export default function PromotionPreviewModal({ data, params, onClose, onConfirm }: PreviewModalProps) {
//   const [activeTab, setActiveTab] = useState<"eligible" | "blocked">("eligible");
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
//   const [statusMsg, setStatusMsg] = useState("");

//   const currentList: PromotionPreviewRecord[] = activeTab === "eligible" ? data.eligible : data.blocked;

//   const formatStudentName = (fullName: string) => {
//     if (!fullName) return "";
//     const parts = fullName.trim().split(/\s+/);
//     if (parts.length <= 1) return fullName.toUpperCase();
//     const lastName = parts.pop()?.toUpperCase();
//     return `${parts.join(" ")} ${lastName}`;
//   };

//   const getDisplayName = (): string => {
//     return params.academicYearName || "Program";
//   };

//   const handleDownloadSummaries = async () => {
//     setDownloadProgress(0);
//     setStatusMsg("Initializing...");
//     setIsDownloading(true);
//     try {
//       await downloadPromotionReportWithProgress(params, getDisplayName(), (percent, message) => {
//         setDownloadProgress(percent);
//         setStatusMsg(message);
//       });
//     } catch (error) {
//       console.error("Summaries download error:", error);
//       alert("Failed to generate summary reports.");
//     } finally {
//       setIsDownloading(false);
//       setTimeout(() => setDownloadProgress(null), 1000);
//     }
//   };

//   const handleDownloadNotices = async () => {
//     setDownloadProgress(0);
//     setStatusMsg("Analyzing blocked students...");
//     setIsDownloading(true);
//     try {
//       await downloadIneligibilityNoticesWithProgress(params, getDisplayName(), (percent, message) => {
//         setDownloadProgress(percent);
//         setStatusMsg(message);
//       });
//     } catch (error: unknown) {
//       const errorMessage = error instanceof Error ? error.message : "Failed to generate notices.";
//       alert(errorMessage);
//     } finally {
//       setIsDownloading(false);
//       setTimeout(() => setDownloadProgress(null), 1000);
//     }
//   };

//   const handleDownloadTranscripts = async () => {
//     setDownloadProgress(0);
//     setStatusMsg("Generating Transcripts...");
//     setIsDownloading(true);
//     try {
//       await downloadTranscriptsWithProgress(params, getDisplayName(), (percent, message) => {
//         setDownloadProgress(percent);
//         setStatusMsg(message);
//       });
//     } catch {
//       alert("Failed to generate transcripts.");
//     } finally {
//       setIsDownloading(false);
//       setTimeout(() => setDownloadProgress(null), 1000);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//       {/* Progress Overlay */}
//       {downloadProgress !== null && (
//         <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[60] backdrop-blur-sm">
//           <div className="bg-white p-8 rounded-2xl shadow-2xl w-80 text-center">
//             <div className="relative pt-1">
//               <div className="flex mb-2 items-center justify-between">
//                 <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
//                   {statusMsg}
//                 </span>
//                 <span className="text-xs font-semibold inline-block text-green-600">
//                   {downloadProgress}%
//                 </span>
//               </div>
//               <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-100">
//                 <div
//                   style={{ width: `${downloadProgress}%` }}
//                   className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"
//                 ></div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
//         {/* Header */}
//         <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
//           <div>
//             <h2 className="text-xl font-bold text-gray-800">Promotion Preview</h2>
//             <p className="text-sm text-gray-500">Year {params.yearToPromote} &rarr; Year {params.yearToPromote + 1}</p>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-gray-200 hover:text-red-500 text-gray-600 rounded-full transition">
//             <X size={24} />
//           </button>
//         </div>

//         {/* Tabs */}
//         <div className="grid grid-cols-2 gap-4 p-6 bg-white">
//           <button
//             onClick={() => setActiveTab("eligible")}
//             className={`p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${activeTab === 'eligible' ? 'border-green-500 bg-green-50 hover:bg-green-100' : 'border-gray-100 hover:border-green-200'}`}
//           >
//             <div className="bg-green-500 p-3 rounded-xl text-white"><CheckCircle /></div>
//             <div className="text-left">
//               <p className="text-xs font-bold uppercase text-green-600">Ready to Promote</p>
//               <p className="text-2xl font-black text-gray-800">{data.eligibleCount}</p>
//             </div>
//           </button>

//           <button
//             onClick={() => setActiveTab("blocked")}
//             className={`p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${activeTab === 'blocked' ? 'border-red-500 bg-red-50 hover:bg-red-100' : 'border-gray-100 hover:border-red-200'}`}
//           >
//             <div className="bg-red-500 p-3 rounded-xl text-white"><AlertCircle /></div>
//             <div className="text-left">
//               <p className="text-xs font-bold uppercase text-red-600">Action Required</p>
//               <p className="text-2xl font-black text-gray-800">{data.blockedCount}</p>
//             </div>
//           </button>
//         </div>

//         {/* List Content */}
//         <div className="flex-1 overflow-y-auto p-6 pt-0">
//           <table className="w-full text-left border-collapse">
//             <thead className="sticky top-0 bg-white z-10">
//               <tr className="text-gray-400 text-xs uppercase tracking-widest border-b">
//                 <th className="py-3 px-4">Reg No</th>
//                 <th className="py-3 px-4">Student Name</th>
//                 <th className="py-3 px-4">Status</th>
//                 {activeTab === 'blocked' && <th className="py-3 px-4">Reasons</th>}
//               </tr>
//             </thead>
//             <tbody>
//               {currentList.map((student) => (
//                 <tr key={student.id} className="border-b hover:bg-gray-50 transition">
//                   <td className="py-4 px-4 font-mono text-gray-600 text-sm">{student.regNo}</td>
//                   <td className="py-4 px-4 font-semibold text-sm text-gray-700">{formatStudentName(student.name)}</td>
//                  <td className="py-4 px-4">
//                     {/* ENHANCED STATUS BADGES */}
//                     {student.status === 'ALREADY PROMOTED' ? (
//                       <span className="flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-[10px] font-black bg-emerald-600 text-white shadow-sm">
//                         <CheckCircle size={10} strokeWidth={3} />
//                         PREVIOUSLY PROMOTED
//                       </span>
//                     ) : (
//                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
//                           student.status === 'IN GOOD STANDING' ? 'bg-green-100 text-green-700 border border-green-200' :
//                           student.status === 'SPECIAL EXAM PENDING' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
//                           'bg-red-100 text-red-700 border border-red-200'
//                       }`}>
//                         {student.status}
//                       </span>
//                     )}
//                   </td>
//                   {activeTab === 'blocked' && (
//                     <td className="py-4 px-4">
//                       <div className="flex flex-wrap gap-1">
//                         {student.reasons.map((r, i) => {
//                           const isSpecial = r.toUpperCase().includes("SPECIAL");
//                           return (
//                             <span 
//                               key={i} 
//                               className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${
//                                 isSpecial ? "bg-blue-50 text-blue-600 border-blue-100 font-bold" : "bg-red-50 text-red-600 border-red-100"
//                               }`}
//                             >
//                               {isSpecial && <span className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" />}
//                               {r}
//                             </span>
//                           );
//                         })}
//                       </div>
//                     </td>
//                   )}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Footer */}
//         <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
//           <button
//             onClick={onClose}
//             className="px-6 py-2 font-semibold text-gray-500 hover:text-gray-800 transition"
//           >
//             Cancel
//           </button>

//           <div className="flex flex-wrap gap-3 justify-end">
//             {/* Transcripts Download (Only for Eligible) */}
//             {data.eligibleCount > 0 && (
//               <button
//                 disabled={isDownloading}
//                 onClick={handleDownloadTranscripts}
//                 className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold border-2 border-emerald-700 text-emerald-700 hover:bg-emerald-50 transition disabled:opacity-50"
//               >
//                 {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GraduationCap size={18} />}
//                 Transcripts
//               </button>
//             )}

//             <button
//               disabled={isDownloading}
//               onClick={handleDownloadSummaries}
//               className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition disabled:opacity-50"
//             >
//               {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText size={18} />}
//               Summaries
//             </button>

//             {data.blockedCount > 0 && (
//               <button
//                 disabled={isDownloading}
//                 onClick={handleDownloadNotices}
//                 className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold border-2 border-orange-600 text-orange-600 hover:bg-orange-50 transition disabled:opacity-50"
//               >
//                 {isDownloading && downloadProgress === null ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileWarning size={18} />}
//                 Notices
//               </button>
//             )}

//             <button
//               disabled={data.eligibleCount === 0 || isDownloading}
//               onClick={onConfirm}
//               className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 disabled:opacity-50 transition shadow-lg shadow-green-200"
//             >
//               {/* If everyone is already promoted, the button can reflect that */}
//               {data.eligible.every(s => s.status === 'ALREADY PROMOTED') 
//                 ? "Re-verify Promotion" 
//                 : `Promote ${data.eligibleCount} Students`} 
//               <ArrowRight size={18} />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState } from "react";
// import { X, CheckCircle, AlertCircle, ArrowRight, FileText, Loader2, FileWarning, GraduationCap, ArrowUpCircle } from "lucide-react";
// import {
//   PromotionPreviewResponse,
//   PromotionPreviewRecord,
//   downloadPromotionReportWithProgress,
//   downloadIneligibilityNoticesWithProgress,
//   downloadTranscriptsWithProgress,
//   PromotionParams
// } from "@/api/promoteApi";

// interface PreviewModalProps {
//   data: PromotionPreviewResponse;
//   params: PromotionParams;
//   onClose: () => void;
//   onConfirm: () => void;
// }

// export default function PromotionPreviewModal({ data, params, onClose, onConfirm }: PreviewModalProps) {
//   const [activeTab, setActiveTab] = useState<"eligible" | "blocked">("eligible");
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
//   const [statusMsg, setStatusMsg] = useState("");

//   const currentList: PromotionPreviewRecord[] = activeTab === "eligible" ? data.eligible : data.blocked;

//   const formatStudentName = (fullName: string) => {
//     if (!fullName) return "";
//     const parts = fullName.trim().split(/\s+/);
//     const lastName = parts.pop()?.toUpperCase();
//     return `${parts.join(" ")} ${lastName}`;
//   };

//   const getDisplayName = (): string => {
//     return params.academicYearName || "Program";
//   };

//   const handleDownloadSummaries = async () => {
//     setDownloadProgress(0);
//     setStatusMsg("Initializing...");
//     setIsDownloading(true);
//     try {
//       await downloadPromotionReportWithProgress(params, getDisplayName(), (percent, message) => {
//         setDownloadProgress(percent);
//         setStatusMsg(message);
//       });
//     } catch (error) {
//       console.error("Summaries download error:", error);
//       alert("Failed to generate summary reports.");
//     } finally {
//       setIsDownloading(false);
//       setTimeout(() => setDownloadProgress(null), 1000);
//     }
//   };

//   const handleDownloadNotices = async () => {
//     setDownloadProgress(0);
//     setStatusMsg("Analyzing blocked students...");
//     setIsDownloading(true);
//     try {
//       await downloadIneligibilityNoticesWithProgress(params, getDisplayName(), (percent, message) => {
//         setDownloadProgress(percent);
//         setStatusMsg(message);
//       });
//     } catch (error: unknown) {
//       const errorMessage = error instanceof Error ? error.message : "Failed to generate notices.";
//       alert(errorMessage);
//     } finally {
//       setIsDownloading(false);
//       setTimeout(() => setDownloadProgress(null), 1000);
//     }
//   };

//   const handleDownloadTranscripts = async () => {
//     setDownloadProgress(0);
//     setStatusMsg("Generating Transcripts...");
//     setIsDownloading(true);
//     try {
//       await downloadTranscriptsWithProgress(params, getDisplayName(), (percent, message) => {
//         setDownloadProgress(percent);
//         setStatusMsg(message);
//       });
//     } catch {
//       alert("Failed to generate transcripts.");
//     } finally {
//       setIsDownloading(false);
//       setTimeout(() => setDownloadProgress(null), 1000);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-green-darkest/40 backdrop-blur-md z-50 flex items-center justify-center p-6">

//       {/* 1. BESPOKE PROGRESS OVERLAY (The 'Data Cruncher') */}
//       {downloadProgress !== null && (
//         <div className="fixed inset-0 bg-green-darkest/80 flex items-center justify-center z-[70] backdrop-blur-xl transition-all">
//           <div className="w-full max-w-md p-10 text-center">
//             <div className="relative inline-block mb-8">
//               <Loader2 className="w-20 h-20 text-yellow-gold animate-spin stroke-[1px]" />
//               <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-yellow-gold">
//                 {downloadProgress}%
//               </span>
//             </div>
//             <h3 className="text-yellow-gold font-black uppercase tracking-[0.3em] text-sm mb-2">{statusMsg}</h3>
//             <p className="text-white/40 text-[10px] uppercase tracking-widest">Generating Secure Institutional Documents</p>
//             <div className="mt-8 h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
//               <div
//                 className="h-full bg-yellow-gold transition-all duration-500 ease-out"
//                 style={{ width: `${downloadProgress}%` }}
//               />
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="bg-white rounded-lg w-full max-w-6xl max-h-[85vh] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.3)] flex flex-col ">

//         {/* 2. HEADER: Dark & Authoritative */}
//         <div className="px-10 py-8 bg-green-darkest text-white flex justify-between items-center">
//           <div className="flex items-center gap-6">
//             <div className="h-14 w-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-yellow-gold">
//               <ArrowUpCircle size={32} strokeWidth={1.5} />
//             </div>
//             <div>
//               <h2 className="text-xl font-black tracking-tight uppercase">Promotion <span className="text-yellow-gold font-light italic">Analysis</span></h2>
//               <div className="flex items-center gap-3 mt-1">
//                 <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Year {params.yearToPromote} Registry</span>
//                 <ArrowRight size={12} className="text-yellow-gold" />
//                 <span className="text-[10px] font-bold text-yellow-gold uppercase tracking-widest text-emerald-400">Next Academic Stage</span>
//               </div>
//             </div>
//           </div>
//           <button onClick={onClose} className="h-12 w-12 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
//             <X size={28} />
//           </button>
//         </div>

//         {/* 3. VERDICT TABS: Large Numerical Focus */}
//         <div className="flex bg-slate-50 border-b border-slate-200">
//           <button
//             onClick={() => setActiveTab("eligible")}
//             className={`flex-1 py-8 px-10 transition-all flex items-center justify-between border-r border-slate-200 group relative ${activeTab === 'eligible' ? 'bg-white' : 'hover:bg-slate-100/50'}`}
//           >
//             <div className="flex items-center gap-5">
//               <div className={`p-4 rounded-2xl transition-all ${activeTab === 'eligible' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-200 text-slate-400'}`}>
//                 <CheckCircle size={24} />
//               </div>
//               <div className="text-left">
//                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Qualified Candidates</p>
//                 <p className={`text-4xl font-black tracking-tighter ${activeTab === 'eligible' ? 'text-green-darkest' : 'text-slate-400'}`}>{data.eligibleCount}</p>
//               </div>
//             </div>
//             {activeTab === 'eligible' && <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-600" />}
//           </button>

//           <button
//             onClick={() => setActiveTab("blocked")}
//             className={`flex-1 py-8 px-10 transition-all flex items-center justify-between group relative ${activeTab === 'blocked' ? 'bg-white' : 'hover:bg-slate-100/50'}`}
//           >
//             <div className="flex items-center gap-5">
//               <div className={`p-4 rounded-2xl transition-all ${activeTab === 'blocked' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-slate-200 text-slate-400'}`}>
//                 <AlertCircle size={24} />
//               </div>
//               <div className="text-left">
//                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ineligible / Pending</p>
//                 <p className={`text-4xl font-black tracking-tighter ${activeTab === 'blocked' ? 'text-green-darkest' : 'text-slate-400'}`}>{data.blockedCount}</p>
//               </div>
//             </div>
//             {activeTab === 'blocked' && <div className="absolute bottom-0 left-0 h-1 w-full bg-red-600" />}
//           </button>
//         </div>

//         {/* 4. THE DATA GRID: Clean, High-Contrast */}
//         <div className="flex-1 overflow-y-auto px-10 py-6 custom-scrollbar">
//           <table className="w-full text-left">
//             <thead className="sticky top-0 bg-white z-10 border-b border-slate-100">
//               <tr className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
//                 <th className="py-4 px-2">Institutional ID</th>
//                 <th className="py-4 px-2">Legal Identity</th>
//                 <th className="py-4 px-2">System Status</th>
//                 {activeTab === 'blocked' && <th className="py-4 px-2">Audit Observations</th>}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-50">
//               {currentList.map((student) => (
//                 <tr key={student.id} className="group hover:bg-slate-50/80 transition-all">
//                   <td className="py-5 px-2 font-mono text-xs font-bold text-slate-500 group-hover:text-green-darkest">{student.regNo}</td>
//                   <td className="py-5 px-2 font-black text-xs text-green-darkest tracking-tight uppercase">{formatStudentName(student.name)}</td>
//                   <td className="py-5 px-2">
//                     <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${student.status === 'IN GOOD STANDING' ? 'bg-emerald-50 text-emerald-700' :
//                         student.status === 'SPECIAL EXAM PENDING' ? 'bg-amber-50 text-amber-700' :
//                           'bg-red-50 text-red-700'
//                       }`}>
//                       {student.status === 'ALREADY PROMOTED' && <CheckCircle size={10} />}
//                       {student.status}
//                     </span>
//                   </td>
//                   {activeTab === 'blocked' && (
//                     <td className="py-5 px-2">
//                       <div className="flex flex-wrap gap-1.5">
//                         {student.reasons.map((r, i) => (
//                           <span key={i} className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-sm border border-slate-200">
//                             {r}
//                           </span>
//                         ))}
//                       </div>
//                     </td>
//                   )}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* 5. FOOTER: Command Bar */}
//         <div className="px-10 py-8 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-6">
//           <button onClick={onClose} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-green-darkest transition-colors">
//             Discard Analysis
//           </button>

//           <div className="flex items-center gap-3">
//             <div className="flex gap-2 mr-4 pr-4 border-r border-slate-200">
//               <ActionButton icon={<GraduationCap size={16} />} label="Transcripts" onClick={handleDownloadTranscripts} active={data.eligibleCount > 0} color="text-emerald-700 hover:bg-emerald-50 border-emerald-100" />
//               <ActionButton icon={<FileText size={16} />} label="Executive Summary" onClick={handleDownloadSummaries} active={true} color="text-slate-700 hover:bg-white border-slate-200" />
//               <ActionButton icon={<FileWarning size={16} />} label="Notices" onClick={handleDownloadNotices} active={data.blockedCount > 0} color="text-red-700 hover:bg-red-50 border-red-100" />
//             </div>

//             <button
//               disabled={data.eligibleCount === 0 || isDownloading}
//               onClick={onConfirm}
//               className="bg-green-darkest text-yellow-gold h-14 px-10 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-green-darkest/20 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-4 disabled:opacity-30"
//             >
//               {data.eligible.every(s => s.status === 'ALREADY PROMOTED')
//                 ? "Re-verify Class Status"
//                 : `Authorize Promotion for ${data.eligibleCount} Students`}
//               <ArrowRight size={18} />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Sub-component for consistent action buttons
// function ActionButton({ icon, label, onClick, active, color }: any) {
//   if (!active) return null;
//   return (
//     <button
//       onClick={onClick}
//       className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${color}`}
//     >
//       {icon}
//       {label}
//     </button>
//   );
// }

// clientside/src/components/coordinator/PromotionPreviewModal.tsx
"use client";

import { useState } from "react";
import { X, CheckCircle, AlertCircle, ArrowRight, FileText, Loader2, FileWarning, GraduationCap, ArrowUpRight, ShieldCheck } from "lucide-react";
import { 
  PromotionPreviewResponse, 
  PromotionPreviewRecord, 
  downloadPromotionReportWithProgress, 
  downloadIneligibilityNoticesWithProgress,
  downloadTranscriptsWithProgress,
  PromotionParams
} from "@/api/promoteApi";

interface PreviewModalProps {
  data: PromotionPreviewResponse;
  params: PromotionParams;
  onClose: () => void;
  onConfirm: () => void;
}

export default function PromotionPreviewModal({ data, params, onClose, onConfirm }: PreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"eligible" | "blocked">("eligible");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  const currentList: PromotionPreviewRecord[] = activeTab === "eligible" ? data.eligible : data.blocked;

  const formatStudentName = (fullName: string) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    const lastName = parts.pop()?.toUpperCase();
  return (
  
        <span className="">
          {parts.join(" ")} {lastName}
        </span>
 
    );
  };


    const getDisplayName = (): string => {
    return params.academicYearName || "Program";
  };

  const handleDownloadSummaries = async () => {
    setDownloadProgress(0);
    setStatusMsg("Initializing...");
    setIsDownloading(true);
    try {
      await downloadPromotionReportWithProgress(params, getDisplayName(), (percent, message) => {
        setDownloadProgress(percent);
        setStatusMsg(message);
      });
    } catch (error) {
      console.error("Summaries download error:", error);
      alert("Failed to generate summary reports.");
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadProgress(null), 1000);
    }
  };

    const handleDownloadNotices = async () => {
    setDownloadProgress(0);
    setStatusMsg("Analyzing blocked students...");
    setIsDownloading(true);
    try {
      await downloadIneligibilityNoticesWithProgress(params, getDisplayName(), (percent, message) => {
        setDownloadProgress(percent);
        setStatusMsg(message);
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate notices.";
      alert(errorMessage);
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadProgress(null), 1000);
    }
  };

  const handleDownloadTranscripts = async () => {
    setDownloadProgress(0);
    setStatusMsg("Generating Transcripts...");
    setIsDownloading(true);
    try {
      await downloadTranscriptsWithProgress(params, getDisplayName(), (percent, message) => {
        setDownloadProgress(percent);
        setStatusMsg(message);
      });
    } catch {
      alert("Failed to generate transcripts.");
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadProgress(null), 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-green-darkest/40 backdrop-blur-md z-50 flex items-center justify-center p-6">
      
      {/* EXECUTIVE DOWNLOAD OVERLAY */}
      {downloadProgress !== null && (
        <div className="absolute inset-0 bg-green-darkest/90 flex items-center justify-center z-[70] backdrop-blur-xl transition-all duration-500">
          <div className="w-full max-w-md text-center p-12">
            <div className="relative mb-8">
              <div className="h-24 w-24 rounded-full border-2 border-yellow-gold/20 flex items-center justify-center mx-auto">
                <Loader2 className="animate-spin text-yellow-gold" size={40} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-yellow-gold">
                {downloadProgress}%
              </div>
            </div>
            <h3 className="text-white text-xl font-black uppercase tracking-widest mb-2">Generating Dossier</h3>
            <p className="text-yellow-gold/50 text-[10px] font-bold uppercase tracking-widest">{statusMsg}</p>
            <div className="mt-8 h-[1px] w-full bg-white/10 overflow-hidden">
               <div style={{ width: `${downloadProgress}%` }} className="h-full bg-yellow-gold transition-all duration-500 shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col ">
        
        {/* HEADER: Institutional Layout */}
        <div className="px-10 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-6">
            <div className="h-10 w-10 bg-green-darkest rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-yellow-gold" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-yellow-gold/10 text-yellow-gold text-[9px] font-black rounded uppercase tracking-widest">Preview Mode</span>
               
              </div>
              <h2 className="text-xl font-black text-green-darkest tracking-tighter uppercase">
                Academic <span className="font-light">Progression</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-8">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transition Path</p>
                <div className="flex items-center gap-3 font-mono text-green-darkest font-bold">
                  <span>Year {params.yearToPromote}</span>
                  <ArrowRight size={14} className="text-yellow-gold" />
                  <span>Year {params.yearToPromote + 1}</span>
                </div>
             </div>
             <button onClick={onClose} className="h-10 w-10 flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-2xl transition-all border border-slate-200">
               <X size={20} />
             </button>
          </div>
        </div>

        {/* METRIC TABS: Ribbon Style */}
        <div className="flex gap-1 p-2 bg-slate-100/50 m-6 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab("eligible")}
            className={`flex-1 py-2 px-6 rounded-xl transition-all flex items-center justify-center gap-4 ${activeTab === 'eligible' ? 'bg-white shadow-xl text-green-darkest hover:bg-green-100 border border-emerald-400/50' : 'text-green-800/70 hover:text-slate-600'}`}
          >
            <CheckCircle size={24} className={activeTab === 'eligible' ? 'text-emerald-500' : ''} />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Verified Eligible</p>
              <p className="text-md font-black">{data.eligibleCount} Students</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("blocked")}
            className={`flex-1 py-2 px-6 rounded-xl transition-all flex items-center justify-center gap-4 ${activeTab === 'blocked' ? 'bg-white shadow-xl text-red-600 hover:bg-red-100 border border-red-400/50' : 'text-red-800/70 hover:text-slate-600'}`}
          >
            <AlertCircle size={24} className={activeTab === 'blocked' ? 'text-red-500' : ''} />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Requires Review</p>
              <p className="text-md font-black">{data.blockedCount} Students</p>
            </div>
          </button>
        </div>

        {/* LIST: High-Contrast Ledger */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white z-20">
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="py-5 px-4">Registration ID</th>
                <th className="py-5 px-4">Student Name</th>
                <th className="py-5 px-4">Internal Status</th>
                {activeTab === 'blocked' && <th className="py-5 px-4 text-right">Ineligibility Metadata</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentList.map((student) => (
                <tr key={student.id} className="group hover:bg-slate-50/80 transition-all">
                  <td className="py-4 px-4 font-mono text-sm text-slate-500">{student.regNo}</td>
                  <td className="py-4 px-4 text-sm text-slate-500 font-medium">{formatStudentName(student.name)}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-[9.5px] font-bold uppercase tracking-wider border ${
                      student.status === 'IN GOOD STANDING' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      student.status === 'ALREADY PROMOTED' ? 'bg-green-darkest text-yellow-gold border-green-darkest shadow-md' :
                   student.status === 'SPECIAL EXAM PENDING' ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-[0_0_10px_rgba(79,70,229,0.1)]' :
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {/* {student.status === 'ALREADY PROMOTED' && <ShieldCheck size={10} />}
                      {student.status} */}

                      {student.status === 'SPECIAL EXAM PENDING' && <div className="w-1 h-1 bg-indigo-600 rounded-full animate-pulse" />}
                      {student.status}
                    </span>
                  </td>
                  {activeTab === 'blocked' && (
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 justify-end">
                        {student.reasons.map((r, i) => (
                          <span key={i} className="text-[9px] px-2 py-1 bg-white border border-slate-200 text-slate-500 font-bold rounded shadow-sm">
                            {r.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER: Dark Control Bar */}
        <div className="px-10 py-8 bg-green-darkest flex justify-between items-center">
          <div className="flex gap-4">
            <button
              disabled={isDownloading}
              onClick={handleDownloadTranscripts}
              className="group flex items-center gap-3 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white/70 border border-white/10 hover:border-yellow-gold hover:text-yellow-gold transition-all"
            >
              <GraduationCap size={16} className="group-hover:rotate-12 group-hover:scale-110 transition-transform" />
              Transcripts
            </button>
            <button
              disabled={isDownloading}
              onClick={handleDownloadSummaries}
              className="group flex items-center gap-3 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white/70 border border-white/10 hover:border-blue-400 hover:text-blue-400 transition-all"
            >
              <FileText size={16} className="group-hover:scale-110 group-hover:rotate-12 transition-transform" />
              Ledger
            </button>
            {data.blockedCount > 0 && (
              <button
                disabled={isDownloading}
                onClick={handleDownloadNotices}
                className="flex items-center gap-2 px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white/70  border border-white/10 hover:border-orange-600 hover:text-orange-600 transition-all"
              >
                <FileWarning size={16} />
                Issue Notices
              </button>
            )}
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onClose} className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">
              Abort Process
            </button>
            <button
              disabled={data.eligibleCount === 0 || isDownloading}
              onClick={onConfirm}
              className="bg-yellow-gold text-green-darkest px-8 py-3 rounded-lg font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_15px_30px_-5px_rgba(212,175,55,0.4)]"
            >
              Confirm Promotion
              <ArrowUpRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}