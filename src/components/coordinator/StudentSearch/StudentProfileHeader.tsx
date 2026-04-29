// clientside/src/components/coordinator/StudentSearch/StudentProfileHeader.tsx
"use client";

import { StudentFullRecord } from "@/api/types";
import { GraduationCap, RotateCcw, Loader2 } from "lucide-react";
import { useState } from "react";
import { deferAdmission, grantAcademicLeave, readmitStudent, revertStatusToActive } from "@/api/studentsApi";
import { undoPromotionApi } from "@/api/promoteApi";

interface StudentProfileHeaderProps { student: StudentFullRecord["student"];  calculatedStatus?: string; onRefresh: () => void; }

export default function StudentProfileHeader({ student, calculatedStatus, onRefresh }: StudentProfileHeaderProps) {
  const [loading, setLoading] = useState(false);
  const [undoError, setUndoError] = useState<string | null>(null);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);

  const displayStatus = (student.status === 'active' && calculatedStatus) ? calculatedStatus.toLowerCase() : student.status ?? "unknown";
  const safeStatus = displayStatus;
  const formattedStatus = safeStatus.replace("_", " ").toUpperCase();

  // Mapping status to colors
  const statusColors: Record<string, string> = {
    active: "text-emerald-700",
    on_leave: "text-yellow-700",
    deferred: "text-blue-700",
    discontinued: "text-red-700",
    deregistered: "text-orange-700",
    graduated: "text-purple-700",
    unknown: "text-gray-700",
  };

  const statusBadgeStyle = statusColors[safeStatus] || statusColors.unknown;
  // const canUndo = student.status === "active" && student.currentYear > 1;
 
  // ── Handlers ─────────────────────────────────────────────────────────────
 
  const handleUndoPromotion = async () => {
    setLoading(true);
    setUndoError(null);
    try {
      const result = await undoPromotionApi(student._id);
      if (result.success) {
        setShowUndoConfirm(false);
        onRefresh();
      } else {
        setUndoError(result.message);
      }
    } catch (e: unknown) {
      if (e instanceof Error) setUndoError(e.message);
      else setUndoError("Undo failed. Check server logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleGrantLeave = async () => {
    // 1. Ask for Start Date
    const sDateInput = prompt("Enter Start Date (YYYY-MM-DD)", new Date().toISOString().split('T')[0]);
    if (!sDateInput) return;
    const startDate = new Date(sDateInput);

    // 2. Ask for Duration (Auto-calculate end date)
    const durationInput = prompt( `Leave for ${student.name}?\nType '1' for One Year\nType '2' for Two Years`, "1" );
    if (durationInput === null || !["1", "2"].includes(durationInput)) return;
    
    const years = parseInt(durationInput);
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + years);

    // 3. Ask for Reason
    const reasonInput = prompt( `Reason for leave?\nType '1' for Financial\nType '2' for Compassionate\nType '3' for Other`, "1" );
    if (reasonInput === null) return;
    const reason = reasonInput === "2" ? "Compassionate" : reasonInput === "3" ? "Other" : "Financial";

    setLoading(true);
    try {
      // Send calculated dates to API
      await grantAcademicLeave(student._id, startDate, endDate, reason, reason.toLowerCase());
      onRefresh();
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
      else alert("An unknown error occurred");      
    } finally {setLoading(false); }    
  };

  const handleDefer = async () => {
    const years = prompt(`Defer Admission for ${student.name}?\nType '1' for One Year\nType '2' for Two Years`, "1" );
    if (!years || !["1", "2"].includes(years)) return;

    setLoading(true);
    try {
      await deferAdmission(student._id, parseInt(years));
      onRefresh();
    } catch (e: unknown) { // FIX: Changed 'any' to 'unknown'
      if (e instanceof Error) alert(e.message);
      else alert("An unknown error occurred");      
    } 
    finally {setLoading(false); }
  };

  const handleReadmit = async () => {
    const yearInput = prompt(
      `Re-entry year for ${student.name} (leave blank to auto-determine):`,
      "",
    );
    if (yearInput === null) return;
    const remarks = prompt(
      `Formal Readmission for ${student.name}.\nThis student was ${formattedStatus}.\nPlease enter the readmission reason (e.g., Senate Minute #, Medical Clearance):`,
      "Approved by Department Board" );
    
    if (!remarks) return;
  
    setLoading(true);
    try {
      // await readmitStudent(student._id, remarks, yearInput.trim() ? parseInt(yearInput.trim()) : undefined);
      await readmitStudent(student._id, remarks);
      onRefresh();
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
      else alert("Readmission failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async () => {
    if (!confirm(`Revert ${student.name} status to Active?\nThis will undo existing leave/deferment.`)) return;
    setLoading(true);
    try {
      await revertStatusToActive(student._id);
      onRefresh();
    } catch (e: unknown) { // FIX: Changed 'any' to 'unknown'
      if (e instanceof Error) alert(e.message);
      else alert("An unknown error occurred");      
    } 
    finally {setLoading(false); }
  };

  return (
    <div className="group relative p-6 bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
      {showUndoConfirm && (
        <div className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center p-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <RotateCcw size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-black text-green-darkest uppercase">
                Undo Promotion
              </p>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider">
                Returns student to Year {student.currentYear - 1}
              </p>
            </div>
          </div>

          <p className="text-[10px] text-slate-600 text-center leading-relaxed max-w-xs">
            The student will be returned to Year {student.currentYear - 1}. The
            last academic history entry will be removed. This is blocked if
            marks already exist in Year {student.currentYear}.
          </p>

          {undoError && (
            <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-[9px] font-bold text-red-700 leading-relaxed">
                {undoError}
              </p>
            </div>
          )}

          <div className="flex gap-3 w-full">
            <button
              onClick={() => {
                setShowUndoConfirm(false);
                setUndoError(null);
              }}
              className="flex-1 py-2 text-[10px] font-black uppercase text-slate-400
                         border border-slate-200 rounded-lg hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUndoPromotion}
              disabled={loading}
              className="flex-1 py-2 text-[10px] font-black uppercase bg-orange-500
                         text-white rounded-lg hover:bg-orange-600 transition-colors
                         disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Reversing...
                </>
              ) : (
                <>
                  <RotateCcw size={12} />
                  Confirm Undo
                </>
              )}
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 space-y-2 text-center md:text-left">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[2px] w-8 bg-yellow-gold" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
              Identity Profile
            </h3>
          </div>

          <div className="flex items-center justify-between gap-3 mb-2">
            <h2 className="font-black text-sm text-green-darkest/70 uppercase">
              {student.name}
            </h2>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-darkest text-yellow-gold rounded shadow-lg shadow-green-darkest/10">
              <GraduationCap size={14} />
              <span className="text-[10px] font-black tracking-widest uppercase">
                Year {student.currentYear || 1}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="font-mono font-bold text-xs text-green-darkest/70 uppercase">
                {student.regNo}
              </p>
              <p className="font-mono text-xs text-green-darkest/70">
                {student.programName}
              </p>
            </div>

            {/* Status Manager Actions */}
            <div className="flex flex-col justify-end items-end">
              {/* --- STATUS BADGE --- */}
              <span
                className={`mt-2 inline-block text-[9px] font-black px- py-0.5 uppercase tracking-[0.1em] ${statusBadgeStyle}`}
              >
                {formattedStatus}
              </span>
              <div className="flex mt-1">
                {student.status === "active" ? (
                  <>
                    <button
                      onClick={handleGrantLeave}
                      disabled={loading}
                      className="text-xs  py-1  text-green-darkest hover:underline rounded-lg font-light"
                    >
                      {loading ? "Processing..." : "Leave"}
                    </button>
                    {student.currentYear === 1 && (
                      <button
                        onClick={handleDefer}
                        disabled={loading}
                        className="text-xs px-1 py- text-green-darkest hover:underline font-light"
                      >
                        {loading ? "Processing..." : " | Defer"}
                      </button>
                    )}

                    {/* {canUndo && (
                      <button
                        onClick={() => {
                          setShowUndoConfirm(true);
                          setUndoError(null);
                        }}
                        disabled={loading}
                        className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5
                   text-amber-700 border border-amber-200 bg-amber-50
                   rounded font-black uppercase tracking-tight
                   hover:bg-orange-100 transition-colors ml-1"
                        title={`Undo — return to Year ${student.currentYear - 1}`}
                      >
                        <RotateCcw size={10} />
                        Undo Y{student.currentYear}
                      </button>
                    )} */}
                  </>
                ) : ["deregistered", "discontinued"].includes(safeStatus) ? (
                  <button
                    onClick={handleReadmit}
                    disabled={loading}
                    className="text-[10px] px-2 py-1 bg-yellow-gold text-green-darkest rounded font-black shadow-lg hover:bg-green-darkest hover:text-white hover:font-bold transition-colors uppercase tracking-wider"
                  >
                    {loading ? "Processing..." : "Readmission"}
                  </button>
                ) : (
                  <button
                    onClick={handleRevert}
                    disabled={loading}
                    className="text-[10px] px-2 py-1 bg-yellow-gold text-green-darkest rounded font-black shadow-lg hover:bg-green-darkest hover:text-white hover:font-bold transition-colors uppercase tracking-wider"
                  >
                    {loading ? "Processing..." : "Activate"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-[2px] bg-yellow-gold transition-all duration-700 ease-in-out" />
    </div>
  );
}
