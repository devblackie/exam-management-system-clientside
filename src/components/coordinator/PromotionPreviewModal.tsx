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