// clientside/src/components/coordinator/StudentSearch/StudentProfileHeader.tsx
"use client";

import { StudentFullRecord } from "@/api/types";
import { GraduationCap, AlertTriangle, CalendarClock } from "lucide-react";
import { useState } from "react";
import { deferAdmission, grantAcademicLeave, revertStatusToActive } from "@/api/studentsApi";


interface StudentProfileHeaderProps {
  student: StudentFullRecord["student"];
  onRefresh: () => void; 
}

export default function StudentProfileHeader({
  student,
  onRefresh,
}: StudentProfileHeaderProps) {
  const [loading, setLoading] = useState(false);

  // --- SAFE DATA HANDLING ---
  // Ensure status exists, otherwise default to "unknown"
  const safeStatus = student.status ?? "unknown";
  const formattedStatus = safeStatus.replace("_", " ").toUpperCase();

  // Mapping status to colors
  const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    on_leave: "bg-yellow-100 text-yellow-700 border-yellow-200",
    deferred: "bg-blue-100 text-blue-700 border-blue-200",
    discontinued: "bg-red-100 text-red-700 border-red-200",
    graduated: "bg-purple-100 text-purple-700 border-purple-200",
    unknown: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const statusBadgeStyle = statusColors[safeStatus] || statusColors.unknown;

  const handleGrantLeave = async () => {
    // 1. Ask for Start Date
    const sDateInput = prompt("Enter Start Date (YYYY-MM-DD)", new Date().toISOString().split('T')[0]);
    if (!sDateInput) return;
    const startDate = new Date(sDateInput);

    // 2. Ask for Duration (Auto-calculate end date)
    const durationInput = prompt(
      `Leave for ${student.name}?\nType '1' for One Year\nType '2' for Two Years`,
      "1"
    );
    if (durationInput === null || !["1", "2"].includes(durationInput)) return;
    
    const years = parseInt(durationInput);
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + years);

    // 3. Ask for Reason
    const reasonInput = prompt(
      `Reason for leave?\nType '1' for Financial\nType '2' for Compassionate\nType '3' for Other`,
      "1"
    );
    if (reasonInput === null) return;
    const reason = reasonInput === "2" ? "Compassionate" : reasonInput === "3" ? "Other" : "Financial";

    setLoading(true);
    try {
      // Send calculated dates to API
      await grantAcademicLeave(student._id, startDate, endDate, reason, reason.toLowerCase());
      onRefresh();
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

    const handleDefer = async () => {
    const years = prompt(
      `Defer Admission for ${student.name}?\nType '1' for One Year\nType '2' for Two Years`,
      "1",
    );
    if (!years || !["1", "2"].includes(years)) return;

    setLoading(true);
    try {
      await deferAdmission(student._id, parseInt(years));
      onRefresh();
    } catch (e: unknown) { // FIX: Changed 'any' to 'unknown'
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("An unknown error occurred");
      }
    } 
    finally { setLoading(false); }
  };

  const handleRevert = async () => {
    if (!confirm(`Revert ${student.name} status to Active?\nThis will undo existing leave/deferment.`)) return;
    setLoading(true);
    try {
      await revertStatusToActive(student._id);
      onRefresh();
    } catch (e: unknown) { // FIX: Changed 'any' to 'unknown'
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("An unknown error occurred");
      }
    } 
    finally { setLoading(false); }
  };

  return (
    <div className="group relative p-6 bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
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
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-darkest text-yellow-gold rounded-md shadow-lg shadow-green-darkest/10">
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
          <div className="block">
          {/* --- STATUS BADGE --- */}
              <span
                className={`mt-2 inline-block text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-[0.1em] ${statusBadgeStyle}`}
              >
                {formattedStatus}
              </span>
            {/* Status Manager Actions */}
            <div className="flex  g mt-1">
              {student.status === "active" ? (
                <>
                  <button
                    onClick={handleGrantLeave}
                    disabled={loading}
                    className="text-xs  py-1  text-green-darkest hover:underline rounded font-light"
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
                </>
              ) : (
                <button
                  onClick={handleRevert}
                  disabled={loading}
                  className="text-xs px-3 py-1 bg-green-darkest text-white rounded font-bold"
                >
                  {loading ? "Processing..." : "Undo / Activate"}
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
