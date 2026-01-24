// clientside/src/components/coordinator/StudentSearch/AcademicStatusBox.tsx
"use client";

import { CheckCircle, AlertTriangle, ArrowUpCircle, Loader2, GraduationCap } from "lucide-react";
import { AcademicStatus } from "@/api/types";
import { promoteStudentApi } from "@/api/coordinatorApi";
import { useState } from "react";
import { downloadTranscriptsWithProgress } from "@/api/promoteApi";

// 1. Define types for the sub-components
type StatusColor = 'blue' | 'amber' | 'orange' | 'red';
type SummaryColor = 'green' | 'red' | 'blue';

interface UnitSectionProps {
  label: string;
  list?: string[];
  color: StatusColor;
  icon: string;
  pulse?: boolean;
}

interface SummaryItemProps {
  color: SummaryColor;
  label: string;
  value: number;
}

interface AcademicStatusBoxProps {
 status: AcademicStatus;
  currentYearOfStudy: number; // The year the student is currently in (from DB)
  viewingYear: number;       // The year currently being viewed/filtered in the UI
  studentId: string;
  onPromoteSuccess: () => void;
}

export default function AcademicStatusBox({ status, currentYearOfStudy, viewingYear, studentId, onPromoteSuccess }: AcademicStatusBoxProps) {
  const [isPromoting, setIsPromoting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

 // Logic: Only show promote button if viewing the current level of the student
  const canPromote = viewingYear === currentYearOfStudy && status.variant === 'success';

  const variantClasses: Record<AcademicStatus['variant'], string> = {
    success: 'bg-green-50 border-green-500 text-green-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800'
  };

  const handlePromote = async () => {
    setIsPromoting(true);
    try {
      // Call your promotion API
      await promoteStudentApi(studentId);
      onPromoteSuccess(); // Refresh the student data
    } catch {
      alert("Promotion failed. Ensure all criteria are met.");
    } finally {
      setIsPromoting(false);
    }
  };



const handleDownloadSingleTranscript = async () => {
setIsDownloading(true);
    try {
      await downloadTranscriptsWithProgress(
        { studentId, yearToPromote: viewingYear, academicYearName: "" }, 
        `Transcript_Year_${viewingYear}`, 
        (p) => setProgress(p)
      );
    } catch {
      alert("Failed to generate transcript.");
    } finally {
      setIsDownloading(false);
      setProgress(null);
    }
  };
  
  return (
    <div className={`mb-6 p-2 rounded-lg border-l-4 flex items-start gap-4 shadow-sm ${variantClasses[status.variant]}`}>
      <div className="mt-1 flex-shrink-0">
        {status.variant === 'success' ? (
          <CheckCircle size={20} className="text-green-600" />
        ) : (
          <AlertTriangle size={20} className={status.variant === 'error' ? 'text-red-600' : 'text-yellow-600'} />
        )}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-md leading-tight mb-1">{status.status}</h3>
          <span className="bg-black/10 px-2 py-0.5 rounded text-[10px] font-bold">YEAR {viewingYear} ANALYSIS</span>
        </div>
        <div className="flex gap-2 mb-3">
          {/* PROMOTE BUTTON */}
          {canPromote && (
            <button
              onClick={handlePromote}
              disabled={isPromoting}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-black uppercase hover:bg-green-700 transition-all shadow-md"
            >
              <ArrowUpCircle size={14} />
              {isPromoting ? "Promoting..." : `Promote to Year ${viewingYear + 1}`}
            </button>
          )}
{/* TRANSCRIPT BUTTON - Only allow if status is success or info (pending data/specials) */}
          {status.variant === 'success' && (
             <button
                onClick={handleDownloadSingleTranscript}
                disabled={isDownloading}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-black uppercase hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
             >
                {isDownloading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <GraduationCap size={14} />
                )}
                {isDownloading ? `Preparing ${progress}%` : `Download Year ${viewingYear} Transcript`}
             </button>
          )}

        </div>
        <p className="text-xs font-mono opacity-90 mb-4">{status.details}</p>

        <div className="space-y-4">
          <UnitSection label="Special Exams Approved" list={status.specialList} color="blue" icon="⭐" />
          <UnitSection label="Incomplete Marks" list={status.incompleteList} color="blue" icon="🔍" />
          <UnitSection label="Missing Records" list={status.missingList} color="blue" icon="❓" />
          <UnitSection label="Pending Supplementaries" list={status.failedList} color="amber" icon="📝" />
          <UnitSection label="Retakes" list={status.retakeList} color="orange" icon="🔄" />
          <UnitSection label="Critical Failures" list={status.reRetakeList} color="red" icon="🚫" pulse />
        </div>

        <div className="mt-5 pt-3 border-t border-black/5 flex gap-6 text-[11px] font-bold uppercase tracking-tighter">
          <SummaryItem color="green" label="Passed" value={status.summary.passed} />
          <SummaryItem color="red" label="Failed" value={status.summary.failed} />
          {status.summary.missing > 0 && <SummaryItem color="blue" label="Missing" value={status.summary.missing} />}
          {status.specialList?.length > 0 && <SummaryItem color="blue" label="Specials" value={status.specialList.length} />}
        </div>
      </div>
    </div>
  );
}

// 2. Apply the interface to UnitSection
function UnitSection({ label, list, color, icon, pulse }: UnitSectionProps) {
  if (!list?.length) return null;

  const colors: Record<StatusColor, string> = {
    blue: "text-blue-600 bg-blue-100/50 border-blue-200",
    amber: "text-amber-600 bg-amber-100/50 border-amber-200",
    orange: "text-orange-600 bg-orange-100/50 border-orange-200",
    red: "text-red-600 bg-red-100 border-red-200"
  };

  return (
    <div>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${colors[color].split(' ')[0]} block mb-1`}>
        {label}
      </span>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {list.map((unit, idx) => (
          <li key={idx} className={`text-xs font-mono p-2 rounded border flex items-center gap-2 ${colors[color]} ${pulse ? 'animate-pulse font-bold' : ''}`}>
            <span>{icon}</span> {unit}
          </li>
        ))}
      </ul>
    </div>
  );
}

// 3. Apply the interface to SummaryItem
function SummaryItem({ color, label, value }: SummaryItemProps) {
  const textColors: Record<SummaryColor, string> = {
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-blue-600"
  };

  const bgColors: Record<SummaryColor, string> = {
    green: "bg-green-500",
    red: "bg-red-500",
    blue: "bg-blue-500"
  };

  return (
    <div className={`flex items-center gap-1 ${textColors[color]}`}>
      <span className={`w-2 h-2 rounded-full ${bgColors[color]}`}></span>
      {label}: {value}
    </div>
  );
}