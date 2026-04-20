// clientside/src/components/coordinator/StudentSearch/AcademicStatusBox.tsx
"use client";

import {
  Fingerprint, AlertTriangle, Info,
  CheckCircle2, Clock, PlaneTakeoff, XCircle, CalendarClock,
} from "lucide-react";
import { AcademicStatus } from "@/api/types";
import { useState } from "react";
import { promoteStudentApi } from "@/api/promoteApi";
import DeferSuppModal from "./DeferSuppModal";

type StatusColor = "blue" | "amber" | "orange" | "red" | "teal";
type SummaryColor = "green" | "red" | "blue" | "teal";

interface UnitSectionProps {
  label: string;
  list?: (string | { displayName: string; grounds?: string; reason?: string })[];
  color: StatusColor;
  icon: React.ReactNode;
  pulse?: boolean;
}

interface SummaryItemProps { color: SummaryColor; label: string; value: number; }

interface AcademicStatusBoxProps {
  status:             AcademicStatus;
  currentYearOfStudy: number;
  viewingYear:        number;
  studentId:          string;
  studentName?:       string;
  studentRegNo?:      string;
  academicYearName:   string;
  onPromoteSuccess:   () => void;
}

const SESSION_BANNERS: Record<string, {
  bg: string; border: string; title: string; body: string; icon: React.ReactNode;
}> = {
  ORDINARY: {
    bg: "bg-blue-50", border: "border-blue-200",
    title: "Session in progress — ORDINARY",
    body: "Marks are currently being entered. Academic statuses, deregistration, and promotion decisions are not triggered until the session is set to SUPPLEMENTARY by the coordinator.",
    icon: <Clock size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />,
  },
  SUPPLEMENTARY: {
    bg: "bg-amber-50", border: "border-amber-200",
    title: "Supplementary & specials period",
    body: "Ordinary results are finalised. Students who miss the supp period may defer to the next ordinary examination period (ENG.13b / ENG.18c) using the Defer button below.",
    icon: <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />,
  },
};

const ADMIN_STATUS_CONFIG: Record<string, {
  bg: string; border: string; title: string; body: string; icon: React.ReactNode;
}> = {
  "ACADEMIC LEAVE": {
    bg: "bg-blue-50", border: "border-blue-200",
    title: "Academic Leave — studies paused",
    body: "This student has been granted academic leave. Academic analysis, supplementary tracking, and promotion decisions are suspended until the student resumes studies.",
    icon: <PlaneTakeoff size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />,
  },
  DEFERMENT: {
    bg: "bg-indigo-50", border: "border-indigo-200",
    title: "Admission deferred",
    body: "This student has deferred their admission. They will join the programme at the start of the next academic cycle following their deferment period.",
    icon: <Clock size={14} className="text-indigo-500 flex-shrink-0 mt-0.5" />,
  },
  DISCONTINUED: {
    bg: "bg-red-50", border: "border-red-200",
    title: "Student discontinued",
    body: "This student has been discontinued from the programme. Readmission requires Senate approval per ENG.21.",
    icon: <XCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />,
  },
  DEREGISTERED: {
    bg: "bg-red-50", border: "border-red-200",
    title: "Student deregistered",
    body: "This student has been deregistered from the programme. They may apply for re-admission within the following semester if good cause is shown (ENG.23f).",
    icon: <XCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />,
  },
};

const VARIANT_CLASSES: Record<AcademicStatus["variant"], string> = {
  success: "bg-green-50 border-green-500/20 text-green-900",
  warning: "bg-yellow-50 border-yellow-500/20 text-yellow-900",
  error:   "bg-red-50 border-red-500/20 text-red-900",
  info:    "bg-blue-50 border-blue-500/20 text-blue-900",
};

export default function AcademicStatusBox({
  status, currentYearOfStudy, viewingYear, studentId,
  studentName = "", studentRegNo = "", academicYearName, onPromoteSuccess,
}: AcademicStatusBoxProps) {
  const [isPromoting,    setIsPromoting]    = useState(false);
  const [showDeferModal, setShowDeferModal] = useState(false);

  const hasDeferredUnits = (status.deferredList?.length ?? 0) > 0;

  const canPromote =
    viewingYear === currentYearOfStudy &&
    status.variant === "success";

  // Show defer button when in SUPPLEMENTARY session, student has pending
  // failed/special units, and is not in a terminal state.
  const canDefer =
    viewingYear === currentYearOfStudy &&
    status.sessionState === "SUPPLEMENTARY" &&
    (status.failedList?.length > 0 || status.specialList?.length > 0) &&
    !["REPEAT YEAR", "STAYOUT", "DEREGISTERED", "DISCONTINUED"].some(
      s => status.status.includes(s),
    );

  const adminStatusKey = Object.keys(ADMIN_STATUS_CONFIG).find(
    key => status.status.toUpperCase().includes(key),
  );
  const isLockedAdminStatus = !!adminStatusKey;

  const sessionBannerKey =
    status.sessionState && SESSION_BANNERS[status.sessionState] ? status.sessionState : null;

  const showSessionBanner =
    sessionBannerKey &&
    !(sessionBannerKey === "SUPPLEMENTARY" && status.status === "PASS") &&
    !isLockedAdminStatus;

  const handlePromote = async () => {
    if (!window.confirm(`Promote this student to Year ${viewingYear + 1}?`)) return;
    setIsPromoting(true);
    try {
      await promoteStudentApi(studentId);
      onPromoteSuccess();
    } catch {
      alert("Promotion failed. Ensure all criteria are met.");
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <>
      <div className={`mb-6 rounded-lg bg-white border flex items-start gap-4 shadow-sm ${VARIANT_CLASSES[status.variant]}`}>
        <div className="flex-1">

          {/* Dark header bar */}
          <div className="bg-green-darkest px-6 py-2 flex justify-between rounded-t-lg items-center relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
              <Fingerprint size={60} className="text-yellow-gold" />
            </div>

            <div className="relative z-1">
              <p className="text-yellow-gold text-[8px] font-black uppercase tracking-[0.3em] mb-1 opacity-70">
                Academic Standing
              </p>
              <h3 className="text-white text-xs font-black uppercase tracking-tighter">
                {status.status}
              </h3>
            </div>

            <div className="relative z-1 text-right flex items-center gap-3">
              <span className="text-yellow-gold text-[9px] font-mono block">
                YEAR {viewingYear} ANALYSIS
              </span>

              {canDefer && (
                <button
                  onClick={() => setShowDeferModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/20 border border-amber-400/40
                             text-amber-300 text-[8px] font-black uppercase tracking-wider rounded-lg
                             hover:bg-amber-400/30 transition-all"
                  title="Defer supplementary/special to next ordinary period (ENG.13b/ENG.18c)"
                >
                  <CalendarClock size={11} />
                  Defer to Next Ordinary
                </button>
              )}

              {canPromote && (
                <button
                  onClick={handlePromote}
                  disabled={isPromoting}
                  className="text-green-300 text-[9px] font-bold tracking-tight uppercase
                             hover:text-white transition-all"
                >
                  {isPromoting ? "Promoting..." : `Promote → Year ${viewingYear + 1}`}
                </button>
              )}
            </div>
          </div>

          {/* Admin status banner */}
          {isLockedAdminStatus && adminStatusKey && (
            <div className={`mx-6 mt-3 flex items-start gap-3 p-3 rounded-lg border ${ADMIN_STATUS_CONFIG[adminStatusKey].bg} ${ADMIN_STATUS_CONFIG[adminStatusKey].border}`}>
              {ADMIN_STATUS_CONFIG[adminStatusKey].icon}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-0.5 text-slate-700">
                  {ADMIN_STATUS_CONFIG[adminStatusKey].title}
                </p>
                <p className="text-[9px] text-slate-600 leading-relaxed">
                  {ADMIN_STATUS_CONFIG[adminStatusKey].body}
                </p>
              </div>
            </div>
          )}

          {/* Session banner */}
          {showSessionBanner && sessionBannerKey && (
            <div className={`mx-6 mt-3 flex items-start gap-3 p-3 rounded-lg border ${SESSION_BANNERS[sessionBannerKey].bg} ${SESSION_BANNERS[sessionBannerKey].border}`}>
              {SESSION_BANNERS[sessionBannerKey].icon}
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-0.5 text-slate-700">
                  {SESSION_BANNERS[sessionBannerKey].title}
                </p>
                <p className="text-[9px] text-slate-600 leading-relaxed">
                  {SESSION_BANNERS[sessionBannerKey].body}
                </p>
              </div>
            </div>
          )}

          {/* Pending defer nudge — only when there are still units to defer */}
          {canDefer && !hasDeferredUnits && (
            <div className="mx-6 mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
              <CalendarClock size={12} className="text-amber-600 flex-shrink-0" />
              <p className="text-[9px] text-amber-700 font-bold leading-relaxed">
                Student has {(status.failedList?.length || 0) + (status.specialList?.length || 0)} pending unit(s).
                Use <strong>Defer to Next Ordinary</strong> above to allow promotion while these units
                are sat in the next academic year&apos;s ordinary examination period.
              </p>
            </div>
          )}

          {/* Deferred units — shown after a successful defer */}
          {hasDeferredUnits && (
            <div className="mx-6 mt-2 p-3 bg-teal-50 border border-teal-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={13} className="text-teal-600 flex-shrink-0" />
                <p className="text-[9px] font-black text-teal-800 uppercase tracking-wider">
                  {status.deferredList!.length} Unit{status.deferredList!.length > 1 ? "s" : ""} Deferred to Next Ordinary Period (ENG.13b/18c)
                </p>
              </div>
              <ul className="space-y-1">
                {status.deferredList!.map((u, i) => (
                  <li key={i} className="flex items-center gap-2 text-[9px] text-teal-700 font-mono">
                    <CalendarClock size={10} className="text-teal-500 flex-shrink-0" />
                    {u.displayName}
                    <span className="ml-auto text-[8px] px-1.5 py-0.5 bg-teal-100 rounded text-teal-600 font-black uppercase">
                      {u.reason === "special_deferred" ? "SPECIAL" : "SUPP"}
                    </span>
                  </li>
                ))}
              </ul>
              {canPromote && (
                <p className="text-[8px] text-teal-600 mt-2 font-bold">
                  ✓ All outstanding units deferred — student is eligible for promotion.
                </p>
              )}
            </div>
          )}

          {/* Details */}
          <p className="text-xs font-mono opacity-90 px-6 my-2 tracking-tighter">
            {status.details}
          </p>

          {/* Unit lists */}
          {!isLockedAdminStatus && (
            <div className="space-y-3 mb-4 px-6">
              <UnitSection
                label="Special Exams Approved"
                list={status.specialList}
                color="blue"
                icon={<Info size={14} />}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UnitSection
                  label="Incomplete Marks"
                  list={status.incompleteList}
                  color="blue"
                  icon={<Info size={14} />}
                />
                <UnitSection
                  label="Missing Records"
                  list={status.missingList}
                  color="blue"
                  icon={<AlertTriangle size={14} />}
                />
                <UnitSection
                  label="Ordinary Failures (Supp Eligible)"
                  list={status.failedList?.filter(f => f.attempt === 1).map(f => f.displayName)}
                  color="amber"
                  icon={<AlertTriangle size={14} />}
                />
                <UnitSection
                  label="Retakes (Staying Out)"
                  list={status.failedList?.filter(f => typeof f.attempt === "number" && f.attempt > 1 && f.attempt < 5).map(f => f.displayName)}
                  color="orange"
                  icon={<AlertTriangle size={14} />}
                />
                <UnitSection
                  label="Critical Failure (Disc. Risk)"
                  list={status.failedList?.filter(f => typeof f.attempt === "number" && f.attempt >= 5).map(f => f.displayName)}
                  color="red"
                  icon={<AlertTriangle size={14} />}
                  pulse
                />
              </div>
            </div>
          )}

          {isLockedAdminStatus && (
            <div className="px-6 mb-4">
              <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">
                Academic analysis paused — resume studies to view unit standing.
              </p>
            </div>
          )}

          {/* Summary footer */}
          <div className="mt-1 px-6 py-2 border-t border-black/5 flex gap-6 text-[11px] font-bold uppercase tracking-tighter bg-slate-50/50 rounded-b-lg">
            <SummaryItem color="green" label="Passed"   value={status.summary.passed}  />
            <SummaryItem color="red"   label="Failed"   value={status.summary.failed}  />
            {status.summary.missing > 0 && (
              <SummaryItem color="blue" label="Missing" value={status.summary.missing} />
            )}
            {status.specialList?.length > 0 && (
              <SummaryItem color="blue" label="Specials" value={status.specialList.length} />
            )}
            {hasDeferredUnits && (
              <SummaryItem color="teal" label="Deferred" value={status.deferredList!.length} />
            )}
          </div>
        </div>
      </div>

      {/* Defer Supp Modal */}
      <DeferSuppModal
        isOpen={showDeferModal}
        onClose={() => setShowDeferModal(false)}
        studentId={studentId}
        studentName={studentName}
        studentRegNo={studentRegNo}
        academicYear={academicYearName}
        currentYear={viewingYear}
        failedList={status.failedList || []}
        specialList={status.specialList || []}
        onSuccess={onPromoteSuccess}
      />
    </>
  );
}

function UnitSection({ label, list, color, icon, pulse }: UnitSectionProps) {
  if (!list?.length) return null;

  const colors: Record<StatusColor, string> = {
    blue:   "text-blue-700 bg-blue-100 border-blue-200",
    amber:  "text-amber-700 bg-amber-100 border-amber-200",
    orange: "text-orange-700 bg-orange-100 border-orange-200",
    red:    "text-red-700 bg-red-100 border-red-200",
    teal:   "text-teal-700 bg-teal-100 border-teal-200",
  };

  return (
    <div className="border border-slate-100 rounded-lg p-3 bg-white">
      <span className={`text-[10px] font-black uppercase tracking-wider block mb-2 ${colors[color].split(" ")[0]}`}>
        {label}
      </span>
      <ul className="grid gap-2">
        {list.map((item, idx) => {
          const isObject       = typeof item === "object" && item !== null;
          const displayContent = isObject
            ? `${item.displayName}${item.grounds ? ` — ${item.grounds}` : ""}${item.reason ? ` — ${item.reason}` : ""}`
            : item;
          return (
            <li key={idx} className={`text-[10px] font-mono p-2 rounded-md border flex items-center gap-2 ${colors[color]} ${pulse ? "animate-pulse font-bold" : ""}`}>
              {icon}
              <span className="flex-1">{displayContent}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SummaryItem({ color, label, value }: SummaryItemProps) {
  const textColors: Record<SummaryColor, string> = { green: "text-green-700", red: "text-red-700", blue: "text-blue-700", teal: "text-teal-700" };
  const bgColors:   Record<SummaryColor, string> = { green: "bg-green-500",   red: "bg-red-500",   blue: "bg-blue-500",   teal: "bg-teal-500"   };
  return (
    <div className={`flex items-center justify-center text-[10px] tracking-tighter gap-1 ${textColors[color]}`}>
      <span className={`w-2 h-2 rounded-full ${bgColors[color]}`} />
      {label}: {value}
    </div>
  );
}
