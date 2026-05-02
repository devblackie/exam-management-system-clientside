// clientside/src/components/coordinator/PromotionPreviewModal.tsx

"use client";

import { useState } from "react";
import {
  X, CheckCircle, AlertCircle, ArrowRight, FileText, Loader2,
  GraduationCap, ArrowUpRight, ShieldCheck, RotateCcw, Table2,
  
} from "lucide-react";
import {
  PromotionPreviewResponse,
  PromotionPreviewRecord,
  downloadPromotionReportWithProgress,
  downloadCmsWithProgress,
  undoPromotionApi,
  PromotionParams,

} from "@/api/promoteApi";

interface PreviewModalProps { data: PromotionPreviewResponse; params: PromotionParams; onClose: () => void; onConfirm: () => void;}

export default function PromotionPreviewModal({ data, params, onClose, onConfirm }: PreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"eligible" | "blocked">("eligible");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCmsDownloading, setIsCmsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [cmsProgress, setCmsProgress] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [cmsStatusMsg, setCmsStatusMsg] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmCount, setConfirmCount] = useState(0);

  // Undo state
  const [undoStudentId, setUndoStudentId] = useState<string | null>(null);
  const [undoStudentName, setUndoStudentName] = useState<string>("");
  const [isUndoing, setIsUndoing] = useState(false);
  const [undoError, setUndoError] = useState<string | null>(null);

  // const [isJourneyDownloading, setIsJourneyDownloading] = useState(false);
  // const [journeyProgress, setJourneyProgress] = useState<number | null>(null);
  // const [journeyMsg, setJourneyMsg] = useState("");


  const currentList: PromotionPreviewRecord[] = activeTab === "eligible" ? data.eligible : data.blocked;

  const formatStudentName = (fullName: string) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    const lastName = parts.pop()?.toUpperCase();
    return (
      <span>
        {parts.join(" ")} {lastName}
      </span>
    );
  };

  // ── Senate reports download ──────────────────────────────────────────
  const handleDownloadSummaries = async () => {
    setDownloadProgress(0);
    setStatusMsg("Initializing...");
    setIsDownloading(true);
    try {
      await downloadPromotionReportWithProgress(
        params,
        params.programName || "Program",
        (percent, message) => {
          setDownloadProgress(percent);
          setStatusMsg(message);
        },
      );
    } catch (error) {
      console.error("Summaries download error:", error);
      alert("Failed to generate summary reports.");
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadProgress(null), 1000);
    }
  };

  // ── CMS-only download ────────────────────────────────────────────────
  const handleDownloadCms = async () => {
    setCmsProgress(0);
    setCmsStatusMsg("Initializing...");
    setIsCmsDownloading(true);
    try {
      await downloadCmsWithProgress(
        params,
        params.programName || "Program",
        (percent, message) => {
          setCmsProgress(percent);
          setCmsStatusMsg(message);
        },
      );
    } catch (error) {
      console.error("CMS download error:", error);
      alert("Failed to generate Consolidated Mark Sheet.");
    } finally {
      setIsCmsDownloading(false);
      setTimeout(() => setCmsProgress(null), 1000);
    }
  };

  

  // ── Undo promotion ───────────────────────────────────────────────────
  const initiateUndo = (studentId: string, studentName: string) => {
    setUndoStudentId(studentId);
    setUndoStudentName(studentName);
    setUndoError(null);
  };

  const confirmUndo = async () => {
    if (!undoStudentId) return;
    setIsUndoing(true);
    setUndoError(null);
    try {
      const result = await undoPromotionApi(undoStudentId);
      if (result.success) {
        setUndoStudentId(null);
        // Trigger a refresh of the preview — the parent will need to re-fetch
        onConfirm(); // reuse this to signal data needs refreshing
        onClose();
      } else {
        setUndoError(result.message);
      }
    } catch {
      setUndoError("Failed to undo promotion. Check server logs.");
    } finally {
      setIsUndoing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 bg-green-darkest/40 backdrop-blur-md z-50 flex items-center justify-center p-6">
      {/* ── Promotion in-progress blur overlay ──────────────────────── */}
      {isConfirming && (
        <div
          className="absolute inset-0 bg-green-darkest/70 z-[80]
                  backdrop-blur-sm flex flex-col items-center justify-center gap-6"
        >
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 rounded-full border-4 border-yellow-gold/20" />
            <div
              className="absolute inset-0 rounded-full border-4 border-t-yellow-gold
                      animate-spin"
            />
            {confirmCount > 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black text-yellow-gold">
                  {confirmCount}
                </span>
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-white text-sm font-black uppercase tracking-widest">
              {confirmCount > 0
                ? "Starting promotion..."
                : "Promoting students..."}
            </p>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">
              {confirmCount > 0
                ? "Close this window to abort"
                : "Do not close this window"}
            </p>
          </div>
        </div>
      )}
      {/* ── Undo confirmation dialog ────────────────────────────────── */}
      {undoStudentId && (
        <div className="absolute inset-0 bg-green-darkest/60 z-[60] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <RotateCcw size={20} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-green-darkest uppercase tracking-tight">
                  Undo Promotion
                </h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                  This action is reversible only if no marks exist in the next
                  year.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to reverse the promotion for{" "}
              <span className="font-black text-green-darkest">
                {undoStudentName}
              </span>
              . The student will be returned to Year {params.yearToPromote} and
              their last academic history entry will be removed.
            </p>

            {undoError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-[10px] font-bold text-red-700 leading-relaxed">
                  {undoError}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setUndoStudentId(null);
                  setUndoError(null);
                }}
                className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest
                           text-slate-400 hover:text-slate-600 border border-slate-200
                           rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUndo}
                disabled={isUndoing}
                className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest
                           bg-orange-500 text-white rounded-xl hover:bg-orange-600
                           transition-colors disabled:opacity-50 flex items-center
                           justify-center gap-2"
              >
                {isUndoing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Reversing...
                  </>
                ) : (
                  <>
                    <RotateCcw size={14} />
                    Confirm Undo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Download progress overlays ──────────────────────────────── */}
      {(downloadProgress !== null || cmsProgress !== null) && (
        <div className="absolute inset-0 bg-green-darkest/90 flex items-center justify-center z-[70] backdrop-blur-xl">
          <div className="w-full max-w-md text-center p-12">
            <div className="relative mb-8">
              <div className="h-24 w-24 rounded-full border-2 border-yellow-gold/20 flex items-center justify-center mx-auto">
                <Loader2 className="animate-spin text-yellow-gold" size={40} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-yellow-gold">
                {downloadProgress ?? cmsProgress}%
              </div>
            </div>
            <h3 className="text-white text-xl font-black uppercase tracking-widest mb-2">
              {downloadProgress !== null
                ? "Generating Reports"
                : "Generating CMS"}
            </h3>
            <p className="text-yellow-gold/50 text-[10px] font-bold uppercase tracking-widest">
              {downloadProgress !== null ? statusMsg : cmsStatusMsg}
            </p>
            <div className="mt-8 h-[1px] w-full bg-white/10 overflow-hidden">
              <div
                style={{ width: `${downloadProgress ?? cmsProgress}%` }}
                className="h-full bg-yellow-gold transition-all duration-500 shadow-[0_0_15px_rgba(212,175,55,0.5)]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Main modal ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col">
        {/* Header */}
        <div className="px-10 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-6">
            <div className="h-10 w-10 bg-green-darkest rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-yellow-gold" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-yellow-gold/10 text-yellow-gold text-[9px] font-black rounded uppercase tracking-widest">
                  Preview Mode
                </span>
              </div>
              <h2 className="text-xl font-black text-green-darkest tracking-tighter uppercase">
                Academic <span className="font-light">Progression</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Transition Path
              </p>
              <div className="flex items-center gap-3 font-mono text-green-darkest font-bold">
                <span>Year {params.yearToPromote}</span>
                <ArrowRight size={14} className="text-yellow-gold" />
                <span>Year {params.yearToPromote + 1}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 flex items-center justify-center hover:bg-red-50
                         hover:text-red-500 text-slate-400 rounded-2xl transition-all
                         border border-slate-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100/50 m-6 rounded ">
          <button
            onClick={() => setActiveTab("eligible")}
            className={`flex-1 py- px- rounded transition-all flex items-center justify-center gap-4 ${activeTab === "eligible" ? "bg-white shadow-xl text-green-darkest hover:bg-green-100 border border-emerald-400/50" : "text-green-800/70 hover:text-slate-600"}`}
          >
            <CheckCircle
              size={18}
              className={activeTab === "eligible" ? "text-emerald-500" : ""}
            />
            <div className="text-left">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60">
                Eligible For Promotion
              </p>
              <p className="text-xs font-black">
                {data.eligibleCount} Students
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("blocked")}
            className={`flex-1 py-2 px-6 rounded transition-all flex items-center justify-center gap-4 ${activeTab === "blocked" ? "bg-white shadow-xl text-amber-700 hover:bg-amber-100 border border-amber-400/50" : "text-amber-800/70 hover:text-slate-600"}`}
          >
            <AlertCircle
              size={18}
              className={activeTab === "blocked" ? "text-amber-700" : ""}
            />
            <div className="text-left">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-60">
                Requires Review
              </p>
              <p className="text-xs font-black">{data.blockedCount} Students</p>
            </div>
          </button>
        </div>

        {/* Student list */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-white z-20">
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-200">
                <th className="px-4">Registration NO</th>
                <th className="px-4">Student Name</th>
                <th className="px-4">Internal Status</th>
                {activeTab === "blocked" && (
                  <th className="px-4 text-right">Ineligibility Metadata</th>
                )}
                {activeTab === "eligible" && (
                  <th className=" px-4 text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
              {currentList.map((student) => (
                <tr
                  key={student.id}
                  className="group hover:bg-slate-50/80 transition-all"
                >
                  <td className="px-4 font-mono text-xs text-slate-500">
                    {student.regNo}
                  </td>
                  <td className="px-4 text-xs text-slate-500 font-medium">
                    {formatStudentName(student.name)}
                  </td>
                  <td className="py-1 px-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 rounded text-[9.5px] font-bold uppercase tracking-wider ${
                        student.status === "graduand"
                          ? "text-amber-700"
                          : student.status === "PASS"
                            ? "text-emerald-700"
                            : student.status === "ALREADY PROMOTED"
                              ? "text-green-dark"
                              : student.status === "ACADEMIC LEAVE"
                                ? "text-blue-700"
                                : student.status === "DEFERMENT"
                                  ? "text-indigo-700"
                                  : student.status === "SPECIAL EXAM PENDING"
                                    ? "text-indigo-700"
                                    : "text-red-700"
                      }`}
                    >
                      {student.status === "graduand" && (
                        <GraduationCap size={12} />
                      )}
                      {student.status === "SPECIAL EXAM PENDING" && (
                        <div className="w-1 h-1 bg-indigo-600 rounded-full animate-pulse" />
                      )}
                      {student.status}
                    </span>
                  </td>

                  {activeTab === "blocked" && (
                    <td className="py-2 px-4">
                      <ol>
                        {student.reasons.map((r, i) => (
                          <li
                            key={i}
                            className="text-[9px] px-2 py-1 text-slate-500 font-bold"
                          >
                            {r.toUpperCase()}
                          </li>
                        ))}
                      </ol>
                    </td>
                  )}

                  {activeTab === "eligible" && (
                    <td className="py-1 px-4 text-center">
                      {student.status === "ALREADY PROMOTED" && (
                        <button
                          onClick={() => initiateUndo(student.id, student.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5
                                     text-[9px] font-black uppercase tracking-wider
                                     text-orange-600 border border-orange-200
                                     bg-orange-50 rounded-lg hover:bg-orange-100
                                     transition-colors"
                          title="Undo this student's promotion"
                        >
                          <RotateCcw size={11} />
                          Undo
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer action bar */}
        <div className="px-10 py-8 bg-green-darkest flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-3 flex-wrap">
            {/* CMS download — separate, fast */}
            <button
              disabled={isCmsDownloading || isDownloading}
              onClick={handleDownloadCms}
              className="group flex items-center gap-3 px-5 py-3 rounded-xl font-black
                         text-[10px] uppercase tracking-widest text-white/70 border
                         border-white/10 hover:border-emerald-400 hover:text-emerald-400
                         transition-all disabled:opacity-40"
            >
              {isCmsDownloading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  CMS {cmsProgress}%
                </>
              ) : (
                <>
                  <Table2
                    size={16}
                    className="group-hover:scale-110 group-hover:rotate-6 transition-transform"
                  />
                  Download CMS
                </>
              )}
            </button>

            {/* Full senate reports ZIP */}
            <button
              disabled={isDownloading || isCmsDownloading}
              onClick={handleDownloadSummaries}
              className="group flex items-center gap-3 px-5 py-3 rounded-xl font-black
                         text-[10px] uppercase tracking-widest text-white/70 border
                         border-white/10 hover:border-blue-400 hover:text-blue-400
                         transition-all disabled:opacity-40"
            >
              {isDownloading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {downloadProgress}%
                </>
              ) : (
                <>
                  <FileText
                    size={16}
                    className="group-hover:scale-110 group-hover:rotate-12 transition-transform"
                  />
                  Generate Senate Reports
                </>
              )}
            </button>
            {/* <button
              disabled={isJourneyDownloading || isDownloading || isCmsDownloading}
              onClick={handleDownloadJourneyCms}
              className="group flex items-center gap-3 px-5 py-3 rounded-xl font-black
                        text-[10px] uppercase tracking-widest text-white/70 border
                      border-white/10 hover:border-yellow-gold hover:text-yellow-gold
                        transition-all disabled:opacity-40"
            >
              {isJourneyDownloading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Journey CMS {journeyProgress}%
                </>
              ) : (
               <>
                  <BookOpen size={16} className="group-hover:scale-110 transition-transform" />
                  Download Journey CMS
               </>
              )}
            </button> */}
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={onClose}
              className="text-[10px] font-black text-white/40 uppercase tracking-widest
                         hover:text-white transition-colors"
            >
              Abort Process
            </button>
            <button
              disabled={
                data.eligibleCount === 0 ||
                isDownloading ||
                isCmsDownloading ||
                isConfirming
              }
              // onClick={onConfirm}
              onClick={async () => {
                if (isConfirming) return; // hard guard against double-click

                setIsConfirming(true);
                // 3-second countdown so coordinator can abort
                for (let i = 3; i >= 1; i--) {
                  setConfirmCount(i);
                  await new Promise((r) => setTimeout(r, 1000));
                }
                setConfirmCount(0);
                try {
                  await onConfirm();
                } finally {
                  setIsConfirming(false);
                }
              }}
              className="bg-yellow-gold text-green-darkest px-8 py-3 rounded-lg font-black
                         text-[11px] uppercase tracking-[0.2em] flex items-center gap-3
                         hover:scale-105 active:scale-95 transition-all
                         shadow-[0_15px_30px_-5px_rgba(212,175,55,0.4)]
                         disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isConfirming ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {confirmCount > 0
                    ? `Promoting in ${confirmCount}...`
                    : "Promoting..."}
                </>
              ) : (
                <>
                  Confirm Promotion
                  <ArrowUpRight size={18} strokeWidth={3} />
                </>
              )}
              {/* Confirm Promotion */}
              {/* <ArrowUpRight size={18} strokeWidth={3} /> */}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


