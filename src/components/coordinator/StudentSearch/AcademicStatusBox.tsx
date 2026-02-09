// clientside/src/components/coordinator/StudentSearch/AcademicStatusBox.tsx
"use client";

import {
  CheckCircle,
  AlertTriangle,
  ArrowUpCircle,
  Loader2,
  Fingerprint,
  GraduationCap,
} from "lucide-react";
import { AcademicStatus } from "@/api/types";
import { useState } from "react";
import {
  downloadTranscriptsWithProgress,
  promoteStudentApi,
} from "@/api/promoteApi";

// 1. Define types for the sub-components
type StatusColor = "blue" | "amber" | "orange" | "red";
type SummaryColor = "green" | "red" | "blue";

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
  viewingYear: number; // The year currently being viewed/filtered in the UI
  studentId: string;
  academicYearName: string;
  onPromoteSuccess: () => void;
}

export default function AcademicStatusBox({
  status,
  currentYearOfStudy,
  viewingYear,
  studentId,
  academicYearName,
  onPromoteSuccess,
}: AcademicStatusBoxProps) {
  const [isPromoting, setIsPromoting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  // Logic: Only show promote button if viewing the current level of the student
  const canPromote =
    viewingYear === currentYearOfStudy && status.variant === "success";

  const variantClasses: Record<AcademicStatus["variant"], string> = {
    success: "bg-green-50 border-green-500/20 text-green-900",
    warning: "bg-yellow-50 border-yellow-500/20 text-yellow-900",
    error: "bg-red-50 border-red-500/20 text-red-900",
    info: "bg-blue-50 border-blue-500/20 text-blue-900",
  };

  const handlePromote = async () => {
    if (
      !window.confirm(
        `Are you sure you want to promote this student to Year ${viewingYear + 1}?`,
      )
    ) {
      return;
    }
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
      const academicYearLabel =
        academicYearName || status.academicYearName || "N/A";
      await downloadTranscriptsWithProgress(
        {
          studentId,
          yearToPromote: viewingYear,
          academicYearName: academicYearLabel,
        },
        `Year_${viewingYear}`,
        (p) => setProgress(p),
      );
    } catch {
      alert("Failed to generate transcript.");
    } finally {
      setIsDownloading(false);
      setProgress(null);
    }
  };

  return (
    <div
      className={`mb-6  rounded-lg bg-white border flex items-start gap-4 shadow-sm ${variantClasses[status.variant]}`}
    >
      <div className="flex-1">
        <div className="bg-green-darkest px-6 py-2 flex justify-between rounded-lg rounded-bl-0 rounded-br-0 items-center relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <Fingerprint size={60} className="text-yellow-gold" />
          </div>

          <div className="relative z-10">
            <p className="text-yellow-gold text-[8px] font-black uppercase tracking-[0.3em] mb-1 opacity-70">
              Academic Standing
            </p>{" "}
            <h3 className="text-white text-xs font-black uppercase tracking-tighter ">
              {status.status}
            </h3>
          </div>

          <div className="relative z-10 text-right">
            <span className="text-yellow-gold text-[9px] font-mono block">
              YEAR {viewingYear} ANALYSIS
            </span>
            <div className="flex justify-between ">
              {canPromote && (
                <button
                  onClick={handlePromote}
                  disabled={isPromoting}
                  className="flex items-center bg-transparent mr-2 border-r border-yellow-gold/20 pr-2 text-green-600 text-[9px] font-bold tracking-tight uppercase hover:text-white transition-all shadow-md"
                >
                  {isPromoting
                    ? "Promoting..."
                    : `Promote to Year ${viewingYear + 1}`}
                </button>
              )}

              {status.variant === "success" && (
                <button
                  onClick={handleDownloadSingleTranscript}
                  disabled={isDownloading}
                  className="flex items-center justify-center gap-1  py-1.5  text-white rounded-lg text-[10px] font-bold uppercase hover:text-yellow-gold hover:underline transition-all  disabled:opacity-50"
                >
                  {isDownloading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <GraduationCap size={12} />
                  )}
                  {isDownloading
                    ? `Preparing ${progress}%`
                    : `Year ${viewingYear} Transcript`}
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs font-mono opacity-90 px-6 my-2 tracking-tighter">
          {status.details}
        </p>

        <div className="space-y-1 flex px-6">
          <UnitSection
            label="Special Exams Approved"
            list={status.specialList}
            color="blue"
            icon="⭐"
          />
          <UnitSection
            label="Incomplete Marks"
            list={status.incompleteList}
            color="blue"
            icon="🔍"
          />
          <UnitSection
            label="Missing Records"
            list={status.missingList}
            color="blue"
            icon="❓"
          />
          <UnitSection
            label="Pending Supplementaries"
            list={status.failedList}
            color="amber"
            icon="📝"
          />
          <UnitSection
            label="Retakes"
            list={status.retakeList}
            color="orange"
            icon="🔄"
          />
          <UnitSection
            label="Critical Failures"
            list={status.reRetakeList}
            color="red"
            icon="🚫"
            pulse
          />
        </div>

        <div className="mt-1 px-6 py-2 border-t border-black/5 flex gap-6 text-[11px] font-bold uppercase tracking-tighter">
          <SummaryItem
            color="green"
            label="Passed"
            value={status.summary.passed}
          />
          <SummaryItem
            color="red"
            label="Failed"
            value={status.summary.failed}
          />
          {status.summary.missing > 0 && (
            <SummaryItem
              color="blue"
              label="Missing"
              value={status.summary.missing}
            />
          )}
          {status.specialList?.length > 0 && (
            <SummaryItem
              color="blue"
              label="Specials"
              value={status.specialList.length}
            />
          )}
        </div>
      </div>

      {/* </div> */}
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
    red: "text-red-600 bg-red-100 border-red-200",
  };

  return (
    <div>
      <span
        className={`text-[10px] font-bold m-1 uppercase tracking-tighter ${colors[color].split(" ")[0]} block mb-1`}
      >
        {label}
      </span>
      <ul className="grid grid-cols-1 md:grid-cols-  gap-2 m-1 ">
        {list.map((unit, idx) => (
          <li
            key={idx}
            className={`text-[10px] font-mono p-0.5 rounded border flex items-center gap-1 ${colors[color]} ${pulse ? "animate-pulse font-bold" : ""}`}
          >
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
    blue: "text-blue-600",
  };

  const bgColors: Record<SummaryColor, string> = {
    green: "bg-green-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
  };

  return (
    <div
      className={`flex items-center justify-center text-[10px] tracking-tighter gap-1 ${textColors[color]}`}
    >
      <span className={`w-2 h-2 rounded-full ${bgColors[color]}`}></span>
      {label}: {value}
    </div>
  );
}
