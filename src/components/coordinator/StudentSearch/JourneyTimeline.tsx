// clientside/src/components/coordinator/StudentSearch/JourneyTimeline.tsx
"use client";

import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  History,
  AlertTriangle,
  PlaneTakeoff,
  Clock,
  RefreshCcw,
  Zap,
  ShieldAlert,
  ArrowRight,
  BookMarked,
  TrendingUp,
  Trophy,
  Calendar,
  Gavel,
} from "lucide-react";
import { StudentJourneyResponse, StudentJourneyTimeline } from "@/api/types";

interface JourneyProps {
  data: StudentJourneyResponse;
}

// ── Local unit type ────────────────────────────────────────────────────────
// The challenges arrays hold either plain strings (old backend) or objects
// (new backend). We define this locally so we never depend on whether
// HurdleUnit or UnitHurdle is exported from @/api/types.
interface ResolvedUnit {
  code: string;
  name?: string;
  attempt?: number;
  grounds?: string;
  reason?: string;
  status?: string;
}

// Accepts whatever the backend sends — string or object.
type RawUnit = string | ResolvedUnit;

// ── Resolve any RawUnit to a ResolvedUnit ──────────────────────────────────
function ru(u: RawUnit): ResolvedUnit {
  if (typeof u === "string") return { code: u };
  return u;
}

// ── Backend extra fields not in the shared interface ──────────────────────
// eng22Risk:     ACADEMIC node — at least one unit at attempt ≥ 4
// deferralStatus: DEFERRED_SUPP node — "pending" | "passed" | "failed"
type TimelineNode = StudentJourneyTimeline & {
  eng22Risk?: boolean;
  deferralStatus?: "pending" | "passed" | "failed";
};

// ── challenges arrays use RawUnit ─────────────────────────────────────────
// The shared JourneyChallenges type may use HurdleUnit or UnitHurdle.
// We cast each array to RawUnit[] at the point of use — one cast per block,
// never scattered through the render logic.
type NodeChallenges = {
  supplementary?: RawUnit[];
  retakes?: RawUnit[];
  stayouts?: RawUnit[];
  specials?: RawUnit[];
  carryForwards?: RawUnit[];
  deferred?: RawUnit[];
  incomplete?: RawUnit[];
  discontinuationRisk?: RawUnit[];
};

function getChallenges(m: TimelineNode): NodeChallenges {
  // Cast once here; every caller receives a typed object with no `any`.
  return (m.challenges ?? {}) as NodeChallenges;
}
const classify = (mean: number) => {
  if (mean >= 70)
    return {
      label: "First Class Honours",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    };
  if (mean >= 60)
    return {
      label: "Second Class (Upper)",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    };
  if (mean >= 50)
    return {
      label: "Second Class (Lower)",
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    };
  if (mean >= 40)
    return {
      label: "Pass",
      color: "text-slate-600",
      bg: "bg-slate-50",
      border: "border-slate-200",
    };
  return {
    label: "Below Pass Mark",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  };
};

const barWidth = (w: number, maxW: number) =>
  maxW > 0 ? Math.round((w / maxW) * 100) : 0;


// ── Node visual identity ───────────────────────────────────────────────────
function nodeStyle(m: TimelineNode): {
  text: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  nodeBg: string;
} {
  switch (m.type) {
    case "GRADUATION":
      return {
        text: "GRADUATED — DEGREE AWARDED",
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-300",
        icon: <Trophy size={14} />,
        nodeBg: "bg-emerald-600",
      };

    case "CARRY_FORWARD":
      return {
        text: `CARRY FORWARD GRANTED (${m.qualifier || "RP1C"}) — ENG.14`,
        color: "text-teal-700",
        bg: "bg-teal-50",
        border: "border-teal-200",
        icon: <BookMarked size={14} />,
        nodeBg: "bg-teal-600",
      };

    case "DEFERRED_SUPP": {
      const sp = m.reason === "special_deferred";
      return {
        text: sp
          ? "SPECIAL DEFERRED — ENG.18c"
          : "SUPPLEMENTARY DEFERRED — ENG.13b",
        color: "text-indigo-700",
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        icon: <Calendar size={14} />,
        nodeBg: "bg-indigo-600",
      };
    }

    case "DISCIPLINARY": {
      const O: Record<string, { text: string; nodeBg: string; color: string }> =
        {
          PENDING: {
            text: "DISCIPLINARY — PENDING HEARING",
            nodeBg: "bg-red-500",
            color: "text-red-700",
          },
          SENT_HOME: {
            text: "DISCIPLINARY — SENT HOME",
            nodeBg: "bg-red-700",
            color: "text-red-900",
          },
          WARNING: {
            text: "DISCIPLINARY — WARNING ISSUED",
            nodeBg: "bg-orange-600",
            color: "text-orange-800",
          },
          REINSTATED: {
            text: "DISCIPLINARY — REINSTATED",
            nodeBg: "bg-emerald-600",
            color: "text-emerald-700",
          },
          DISCONTINUED: {
            text: "DISCIPLINARY — DISCONTINUED",
            nodeBg: "bg-slate-800",
            color: "text-slate-800",
          },
          DISMISSED: {
            text: "DISCIPLINARY — CASE DISMISSED",
            nodeBg: "bg-slate-500",
            color: "text-slate-600",
          },
        };
      const o = O[m.outcome || "PENDING"] ?? O.PENDING;
      return {
        ...o,
        bg: "bg-red-50",
        border: "border-red-300",
        icon: <Gavel size={14} />,
      };
    }

    case "STATUS_CHANGE": {
      const to = (m.toStatus || "").toLowerCase();
      if (to.includes("disciplinary"))
        return {
          text: "DISCIPLINARY SUSPENSION",
          color: "text-red-700",
          bg: "bg-red-50",
          border: "border-red-300",
          icon: <ShieldAlert size={14} />,
          nodeBg: "bg-red-600",
        };
      if (to === "active")
        return {
          text: "STUDIES RESUMED",
          color: "text-emerald-700",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          icon: <RefreshCcw size={14} />,
          nodeBg: "bg-emerald-700",
        };
      if (to === "deferred")
        return {
          text: "ADMISSION DEFERRED",
          color: "text-indigo-700",
          bg: "bg-indigo-50",
          border: "border-indigo-200",
          icon: <Clock size={14} />,
          nodeBg: "bg-indigo-700",
        };
      if (to === "on_leave" || to === "academic_leave")
        return {
          text: "ACADEMIC LEAVE GRANTED",
          color: "text-amber-700",
          bg: "bg-amber-50",
          border: "border-amber-200",
          icon: <PlaneTakeoff size={14} />,
          nodeBg: "bg-amber-600",
        };
      if (to === "discontinued")
        return {
          text: "DISCONTINUED — ENG.22",
          color: "text-red-700",
          bg: "bg-red-50",
          border: "border-red-300",
          icon: <AlertCircle size={14} />,
          nodeBg: "bg-red-700",
        };
      if (to === "deregistered")
        return {
          text: "DEREGISTERED — ENG.23",
          color: "text-red-700",
          bg: "bg-red-50",
          border: "border-red-300",
          icon: <AlertCircle size={14} />,
          nodeBg: "bg-red-700",
        };
      if (to === "graduand" || to === "graduated")
        return {
          text: "GRADUAND STATUS SET",
          color: "text-emerald-700",
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          icon: <Trophy size={14} />,
          nodeBg: "bg-emerald-600",
        };
      return {
        text: (m.toStatus || "ADMIN EVENT").toUpperCase().replace(/_/g, " "),
        color: "text-slate-700",
        bg: "bg-slate-50",
        border: "border-slate-200",
        icon: <History size={14} />,
        nodeBg: "bg-slate-600",
      };
    }

    default: {
      // ACADEMIC
      const s = (m.status || "").toUpperCase();
      if (s.includes("REPEAT"))
        return {
          text: s,
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
          icon: <AlertCircle size={14} />,
          nodeBg: "bg-red-600",
        };
      if (s === "STAYOUT" || s.includes("STAY"))
        return {
          text: "STAY OUT — ENG.15h",
          color: "text-amber-700",
          bg: "bg-amber-50",
          border: "border-amber-200",
          icon: <AlertTriangle size={14} />,
          nodeBg: "bg-amber-600",
        };
      if (s.includes("SUPP") || s.includes("SPEC"))
        return {
          text: s,
          color: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-amber-200",
          icon: <AlertTriangle size={14} />,
          nodeBg: "bg-yellow-600",
        };
      if (s.includes("SESSION IN PROGRESS"))
        return {
          text: "SESSION IN PROGRESS",
          color: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-200",
          icon: <History size={14} />,
          nodeBg: "bg-blue-600",
        };
      if (s.includes("DEREGISTERED") || s.includes("DISCONTINUED"))
        return {
          text: s,
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-300",
          icon: <AlertCircle size={14} />,
          nodeBg: "bg-red-700",
        };
      // Pass / promoted
      return {
        text: s || "PASS (PROMOTED)",
        color: "text-[#002B1B]",
        bg: "bg-white",
        border: "border-slate-100",
        icon: <Zap size={14} className="fill-current" />,
        nodeBg: "bg-[#002B1B]",
      };
    }
  }
}

// ── Attempt risk badge ─────────────────────────────────────────────────────
function AttemptBadge({ attempt }: { attempt?: number }) {
  if (!attempt || attempt < 1) return null;
  const color =
    attempt >= 5
      ? "bg-red-200 text-red-900 border-red-500 font-black"
      : attempt >= 4
        ? "bg-red-100 text-red-700 border-red-400"
        : attempt === 3
          ? "bg-orange-100 text-orange-700 border-orange-300"
          : attempt === 2
            ? "bg-amber-100 text-amber-700 border-amber-300"
            : "bg-slate-100 text-slate-500 border-slate-200";
  return (
    <span
      className={`inline-flex items-center text-[7px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${color}`}
    >
      ATT {attempt}
      {attempt >= 4 ? " ⚠" : ""}
    </span>
  );
}

// ── Unit chip ──────────────────────────────────────────────────────────────
function UnitChip({
  u,
  chipCls,
  prefix,
  suffix,
}: {
  u: RawUnit; // accepts both string and object forms
  chipCls: string;
  prefix?: string;
  suffix?: string;
}) {
  const { code, name, attempt, grounds, reason, status } = ru(u);
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span
        className={`text-[8px] font-mono px-2 py-0.5 rounded-sm border ${chipCls}`}
        title={name || code}
      >
        {prefix && <span className="mr-0.5 opacity-50">{prefix}:</span>}
        {code}
        {grounds && <span className="ml-1 opacity-60">({grounds})</span>}
        {reason && (
          <span className="ml-1 opacity-60">({reason.replace(/_/g, " ")})</span>
        )}
      </span>
      <AttemptBadge attempt={attempt} />
      {status === "passed" && (
        <span title="Cleared">
          <CheckCircle2
            size={9}
            className="text-emerald-500 flex-shrink-0"
            aria-label="Cleared"
          />
        </span>
      )}
      {suffix && (
        <span className="text-[7px] font-black text-slate-400 uppercase tracking-wide">
          {suffix}
        </span>
      )}
    </div>
  );
}

// ── Has any hurdle ─────────────────────────────────────────────────────────
function hasHurdles(c: TimelineNode["challenges"]): boolean {
  if (!c) return false;
  return [
    c.supplementary,
    c.retakes,
    c.stayouts,
    c.specials,
    c.carryForwards,
    c.deferred,
    c.incomplete,
    c.discontinuationRisk,
  ].some((arr) => (arr?.length ?? 0) > 0);
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function JourneyTimeline({ data }: JourneyProps) {
  const projected = classify(Number(data.cumulativeMean));
  const academicEntries = data.timeline.filter((m) => m.type === "ACADEMIC");
  const maxWeight = Math.max(...academicEntries.map((m) => m.weight || 0), 1);
  const isTerminal = [
    "DEREGISTERED",
    "DISCONTINUED",
    "ON_LEAVE",
    "DEFERRED",
    "DISCIPLINARY_SUSPENSION",
  ].includes(data.currentStatus.toUpperCase());

  return (
    <div className="bg-[#F8F9FA] rounded-xl border border-slate-200/60 overflow-hidden shadow-sm">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="px-8 py-6 bg-white border-b border-slate-200/60">
        <div className="flex items-start justify-between gap-6">
          {/* Left — identity */}
          <div className="flex items-center gap-5">
            <div className="h-12 w-12 bg-[#002B1B] flex items-center justify-center rounded-lg shadow-inner flex-shrink-0">
              <GraduationCap size={22} className="text-[#EAB308]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                  {data.admissionYear}
                </span>
                <span className="h-3 w-px bg-slate-300" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                  {data.intake} Intake
                </span>
                {(data.totalTimeOutYears ?? 0) > 0 && (
                  <>
                    <span className="h-3 w-px bg-slate-300" />
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">
                      {data.totalTimeOutYears}yr out
                    </span>
                  </>
                )}
              </div>
              <p className="text-lg font-light text-[#002B1B] tracking-tighter">
                {data.currentStatus.replace(/_/g, " ")}
              </p>
              {data.classification && !isTerminal && (
                <p
                  className={`text-[9px] font-black uppercase tracking-tight mt-0.5 ${projected.color}`}
                >
                  {data.classification}
                </p>
              )}
            </div>
          </div>

          {/* Right — WAA + sparkline */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
                Projected Degree Aggregate
              </p>
              {isTerminal ? (
                <p className="text-[10px] font-mono text-slate-400">
                  N/A — {data.currentStatus.replace(/_/g, " ").toLowerCase()}
                </p>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 justify-end">
                    <span className="text-xl font-light text-[#002B1B]">
                      {data.cumulativeMean || "0.00"}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      WAA / 100.00
                    </span>
                  </div>
                  <p
                    className={`text-[9px] font-black uppercase tracking-tight ${projected.color}`}
                  >
                    {projected.label}
                  </p>
                </>
              )}
            </div>
            {/* Year-by-year sparkline */}
            {academicEntries.length > 1 && !isTerminal && (
              <div className="flex items-end gap-1 h-8">
                {academicEntries.map((m, i) => {
                  const mean = m.annualMean ?? 0;
                  const h = Math.max(4, Math.round((mean / 100) * 32));
                  const col =
                    mean >= 70
                      ? "bg-emerald-400"
                      : mean >= 60
                        ? "bg-blue-400"
                        : mean >= 50
                          ? "bg-amber-400"
                          : mean >= 40
                            ? "bg-slate-300"
                            : "bg-red-400";
                  return (
                    <div
                      key={i}
                      className="relative group/bar flex flex-col items-center"
                    >
                      <div
                        className={`w-4 rounded-sm ${col} transition-all`}
                        style={{ height: `${h}px` }}
                      />
                      <div className="absolute bottom-full mb-1 hidden group-hover/bar:block bg-[#002B1B] text-white text-[8px] font-mono px-1.5 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                        Y{m.yearOfStudy}: {mean.toFixed(1)}%
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

      {/* ── TIMELINE ──────────────────────────────────────────────────────── */}
      <div className="p-10 relative bg-white">
        <div className="absolute left-[51px] top-8 bottom-8 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" />
        <div className="space-y-12">
          {data.timeline.length === 0 ? (
            <div className="ml-16 py-10 text-slate-400 font-mono text-[10px] uppercase tracking-widest">
              No Historical Logs Found // End of Registry
            </div>
          ) : (
            (data.timeline as TimelineNode[]).map((m, idx) => {
              const ns = nodeStyle(m);
              const w = m.weight || 0;

              return (
                <div
                  key={idx}
                  className="relative flex gap-12 items-start group"
                >
                  {/* ── Node ─────────────────────────────────────────────── */}
                  <div className="relative flex-shrink-0 mt-1">
                    <div
                      className={`w-6 h-6 rounded-sm rotate-45 border-2 border-white shadow-sm flex items-center justify-center text-white transition-transform group-hover:scale-110 ${ns.nodeBg}`}
                    >
                      <div className="-rotate-45 flex items-center justify-center">
                        {ns.icon}
                      </div>
                    </div>
                  </div>

                  {/* ── Content ──────────────────────────────────────────── */}
                  <div className="flex-1 pb-4 border-b border-slate-100 last:border-0">
                    {/* Row label row */}
                    <div className="flex items-start justify-between mb-4 gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black text-[#002B1B] uppercase tracking-[0.3em]">
                          {m.type === "ACADEMIC"
                            ? `Year ${m.yearOfStudy}`
                            : m.type === "GRADUATION"
                              ? "Graduation"
                              : m.type === "CARRY_FORWARD"
                                ? "ENG.14 — Carry Forward"
                                : m.type === "DEFERRED_SUPP"
                                  ? "Deferral Event"
                                  : m.type === "DISCIPLINARY"
                                    ? "Disciplinary Registry"
                                    : "Admin Event"}
                        </span>
                        <span className="text-[10px] font-mono text-slate-300">
                          [{m.academicYear || "N/A"}]
                        </span>
                        {m.isCurrent && (
                          <span className="text-[8px] font-black px-2 py-0.5 bg-[#EAB308] text-[#002B1B] rounded-none uppercase tracking-tighter">
                            Current Active Phase
                          </span>
                        )}
                        {/* Annual mean badge */}
                        {m.type === "ACADEMIC" && (m.annualMean ?? 0) > 0 && (
                          <span
                            className={`text-[8px] font-mono px-2 py-0.5 rounded border ${classify(m.annualMean!).bg} ${classify(m.annualMean!).color} ${classify(m.annualMean!).border}`}
                          >
                            {m.annualMean!.toFixed(1)}% this year
                          </span>
                        )}
                        {/* ENG.22 risk pulse */}
                        {m.eng22Risk && (
                          <span className="text-[8px] font-black px-2 py-0.5 bg-red-100 text-red-700 border border-red-300 rounded uppercase tracking-wider animate-pulse">
                            ⚠ ENG.22 RISK
                          </span>
                        )}
                      </div>
                      {/* Outcome stamp — ACADEMIC and GRADUATION only */}
                      {(m.type === "ACADEMIC" || m.type === "GRADUATION") && (
                        <div
                          className={`px-3 py-1 border-l-4 ${ns.border} ${ns.bg} shadow-sm flex-shrink-0`}
                        >
                          <p
                            className={`text-[10px] font-black uppercase tracking-widest ${ns.color}`}
                          >
                            {ns.text}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* ════════════════════════════════════════════════════ */}
                    {/* ACADEMIC NODE cards                                  */}
                    {/* ════════════════════════════════════════════════════ */}
                    {(m.type === "ACADEMIC" || m.type === "GRADUATION") && (
                      <div className="grid grid-cols-12 gap-4">
                        {/* Official Standing */}
                        <div className="col-span-12 lg:col-span-4 p-5 rounded-lg border border-slate-100 bg-[#F8F9FA] group-hover:border-[#EAB308]/30 transition-colors">
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className={`p-1 rounded ${ns.nodeBg} text-white flex-shrink-0`}
                            >
                              {ns.icon}
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              Official Standing
                            </span>
                          </div>
                          <p
                            className={`text-xs font-bold uppercase tracking-tight ${ns.color}`}
                          >
                            {ns.text}
                          </p>
                          {m.qualifierSuffix && (
                            <p className="text-[8px] font-mono text-slate-400 mt-1.5">
                              Reg. qualifier:{" "}
                              <span className="text-[#002B1B] font-black">
                                {m.qualifierSuffix}
                              </span>
                            </p>
                          )}
                          {m.isRepeat && (
                            <p className="text-[8px] font-black text-red-600 uppercase tracking-wider mt-1">
                              Repeat Year — ENG.16
                            </p>
                          )}
                          {m.type === "GRADUATION" &&
                            (m.annualMean ?? 0) > 0 && (
                              <p className="text-[11px] font-bold text-emerald-700 mt-2">
                                Final WAA: {m.annualMean!.toFixed(2)}%
                              </p>
                            )}
                          {m.type === "GRADUATION" && m.reason && (
                            <p className="text-[9px] font-black text-emerald-600 mt-1 uppercase">
                              {m.reason}
                            </p>
                          )}
                        </div>

                        {/* Hurdle Registry (ACADEMIC only) */}
                        {m.type === "ACADEMIC" && (
                          <div className="col-span-12 lg:col-span-5 p-5 rounded-lg border border-slate-100 bg-white">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertTriangle
                                size={12}
                                className="text-slate-300"
                              />
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Hurdle Registry
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {/* Supplementary — ENG.13 */}
                              {(m.challenges?.supplementary || []).map(
                                (u, i) => (
                                  <UnitChip
                                    key={`s${i}`}
                                    u={u}
                                    prefix="SUPP"
                                    chipCls="border-amber-200 bg-amber-50 text-amber-700"
                                  />
                                ),
                              )}

                              {/* Retakes — ENG.15a/b */}
                              {(m.challenges?.retakes || []).map((u, i) => (
                                <UnitChip
                                  key={`r${i}`}
                                  u={u}
                                  prefix="RET"
                                  chipCls="border-red-200 bg-red-50 text-red-700"
                                />
                              ))}

                              {/* Stayouts — ENG.15h */}
                              {(m.challenges?.stayouts || []).map((u, i) => (
                                <UnitChip
                                  key={`so${i}`}
                                  u={u}
                                  prefix="A/SO"
                                  suffix="Sit next ordinary"
                                  chipCls="border-orange-200 bg-orange-50 text-orange-700"
                                />
                              ))}

                              {/* Specials — ENG.18 */}
                              {(m.challenges?.specials || []).map((u, i) => (
                                <UnitChip
                                  key={`sp${i}`}
                                  u={u}
                                  prefix="SPEC"
                                  chipCls="border-purple-200 bg-purple-50 text-purple-700"
                                />
                              ))}

                              {/* Carry-forwards — ENG.14 */}
                              {(m.challenges?.carryForwards || []).map(
                                (u, i) => {
                                  const { code, attempt, status } = ru(u);
                                  return (
                                    <div
                                      key={`cf${i}`}
                                      className="flex items-center gap-1.5"
                                    >
                                      <span className="text-[8px] font-mono px-2 py-0.5 rounded-sm border border-teal-200 bg-teal-50 text-teal-700">
                                        CF:{code}
                                      </span>
                                      <AttemptBadge attempt={attempt} />
                                      {status === "passed" && (
                                        <span title="CF Cleared">
                                          <CheckCircle2
                                            size={9}
                                            className="text-emerald-500"
                                            aria-label="CF Cleared"
                                          />
                                        </span>
                                      )}
                                      {status === "pending" && (
                                        <span className="text-[7px] font-black text-teal-600 uppercase tracking-wide">
                                          Pending
                                        </span>
                                      )}
                                    </div>
                                  );
                                },
                              )}

                              {/* Deferred — ENG.13b / ENG.18c */}
                              {(m.challenges?.deferred || []).map((u, i) => {
                                const { code, reason, status } = ru(u);
                                const sp = reason === "special_deferred";
                                return (
                                  <div
                                    key={`def${i}`}
                                    className="flex items-center gap-1.5"
                                  >
                                    <span className="text-[8px] font-mono px-2 py-0.5 rounded-sm border border-indigo-200 bg-indigo-50 text-indigo-700">
                                      DEF:{code}
                                    </span>
                                    <ArrowRight
                                      size={9}
                                      className="text-indigo-400"
                                    />
                                    <span className="text-[7px] font-black text-indigo-600 uppercase tracking-wide">
                                      {sp
                                        ? "Special→Ordinary"
                                        : "Supp→Ordinary"}
                                    </span>
                                    {status === "passed" && (
                                      <span title="Cleared">
                                        <CheckCircle2
                                          size={9}
                                          className="text-emerald-500"
                                          aria-label="Cleared"
                                        />
                                      </span>
                                    )}
                                  </div>
                                );
                              })}

                              {/* Incomplete / missing */}
                              {(m.challenges?.incomplete || []).map((u, i) => (
                                <UnitChip
                                  key={`inc${i}`}
                                  u={u}
                                  prefix="INC"
                                  chipCls="border-slate-200 bg-slate-50 text-slate-500"
                                />
                              ))}

                              {/* ENG.22 discontinuation risk */}
                              {(m.challenges?.discontinuationRisk || []).map(
                                (u, i) => {
                                  const { code, attempt } = ru(u);
                                  return (
                                    <div
                                      key={`dr${i}`}
                                      className="flex items-center gap-1.5"
                                    >
                                      <span className="text-[8px] font-mono px-2 py-0.5 rounded-sm border border-red-300 bg-red-100 text-red-800 font-black">
                                        ENG.22:{code}
                                      </span>
                                      <AttemptBadge attempt={attempt} />
                                      <span className="text-[7px] font-black text-red-700 uppercase tracking-wide">
                                        Discontinuation Risk
                                      </span>
                                    </div>
                                  );
                                },
                              )}

                              {/* Empty */}
                              {!hasHurdles(m.challenges) && (
                                <span className="text-[9px] font-mono text-slate-300 uppercase tracking-widest">
                                  No hurdled units — clean year
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Telemetry (ACADEMIC only) */}
                        {m.type === "ACADEMIC" && (
                          <div className="col-span-12 lg:col-span-3 p-5 rounded-lg bg-[#002B1B] flex flex-col justify-center relative overflow-hidden">
                            <Zap
                              size={40}
                              className="absolute -right-2 -bottom-2 text-white/5 rotate-12 pointer-events-none"
                            />
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[9px] font-black text-[#EAB308] uppercase tracking-[0.2em]">
                                Telemetry
                              </span>
                              <span className="text-[8px] font-mono text-white/80 bg-white/10 px-1.5 py-0.5 rounded">
                                W:{w}%
                              </span>
                            </div>
                            <p className="text-lg font-light text-white tracking-tighter leading-none">
                              {m.totalUnits} Units
                            </p>
                            <div className="mt-3 w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#EAB308] transition-all duration-1000"
                                style={{ width: `${barWidth(w, maxWeight)}%` }}
                              />
                            </div>
                            <p className="text-[7px] font-mono text-white/30 mt-1 uppercase tracking-widest">
                              Degree Contribution
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ════════════════════════════════════════════════════ */}
                    {/* STATUS_CHANGE card                                   */}
                    {/* ════════════════════════════════════════════════════ */}
                    {m.type === "STATUS_CHANGE" && (
                      <div
                        className={`p-5 rounded-lg border ${ns.border} ${ns.bg}`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`p-1.5 rounded ${ns.nodeBg} text-white flex-shrink-0`}
                          >
                            {ns.icon}
                          </div>
                          <p
                            className={`text-[11px] font-black uppercase tracking-widest ${ns.color}`}
                          >
                            {ns.text}
                          </p>
                        </div>
                        <p className="text-[10px] font-mono text-slate-500 leading-relaxed">
                          Status changed from{" "}
                          <span className="font-bold text-slate-700">
                            [
                            {(m.fromStatus || "—")
                              .replace(/_/g, " ")
                              .toUpperCase()}
                            ]
                          </span>{" "}
                          →{" "}
                          <span className="font-bold text-[#002B1B]">
                            [
                            {(m.toStatus || "—")
                              .replace(/_/g, " ")
                              .toUpperCase()}
                            ]
                          </span>
                          .
                          {m.reason && (
                            <span className="text-slate-400 ml-1">
                              {m.reason}
                            </span>
                          )}
                        </p>
                        {/* Leave details */}
                        {m.leaveInfo && (
                          <div className="mt-3 p-3 bg-white/50 rounded border border-white/80 grid grid-cols-2 gap-2">
                            {[
                              { label: "Type", value: m.leaveInfo.type },
                              { label: "Grounds", value: m.leaveInfo.reason },
                              {
                                label: "Duration",
                                value: m.leaveInfo.duration,
                              },
                              {
                                label: "End Date",
                                value: m.leaveInfo.endDate ?? "Pending",
                              },
                            ].map((r) => (
                              <div key={r.label}>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                  {r.label}
                                </p>
                                <p className="text-[10px] font-mono text-slate-700">
                                  {r.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ════════════════════════════════════════════════════ */}
                    {/* DISCIPLINARY card                                    */}
                    {/* ════════════════════════════════════════════════════ */}
                    {m.type === "DISCIPLINARY" && (
                      <div className="p-5 rounded-lg border border-red-200 bg-red-50">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`p-1.5 rounded ${ns.nodeBg} text-white flex-shrink-0`}
                          >
                            <Gavel size={13} />
                          </div>
                          <p
                            className={`text-[11px] font-black uppercase tracking-widest ${ns.color}`}
                          >
                            {ns.text}
                          </p>
                          {m.hearingDate && (
                            <span className="ml-auto text-[9px] font-mono text-red-500 flex-shrink-0">
                              Hearing: {m.hearingDate}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-2">
                          {[
                            {
                              label: "Grounds",
                              value: (m.grounds || "—")
                                .replace(/_/g, " ")
                                .toUpperCase(),
                            },
                            { label: "Outcome", value: m.outcome || "PENDING" },
                            {
                              label: "Case Ref",
                              value: m.caseId?.slice(-8).toUpperCase() ?? "—",
                            },
                          ].map((r) => (
                            <div
                              key={r.label}
                              className="bg-white/60 rounded p-2"
                            >
                              <p className="text-[8px] font-black text-red-400 uppercase tracking-widest">
                                {r.label}
                              </p>
                              <p className="text-[10px] font-mono text-red-800 font-bold">
                                {r.value}
                              </p>
                            </div>
                          ))}
                        </div>
                        {m.reason && (
                          <p className="text-[9px] font-mono text-red-600 leading-relaxed italic">
                            &quot;{m.reason}&quot;
                          </p>
                        )}
                      </div>
                    )}

                    {/* ════════════════════════════════════════════════════ */}
                    {/* CARRY_FORWARD card                                   */}
                    {/* ════════════════════════════════════════════════════ */}
                    {m.type === "CARRY_FORWARD" && (
                      <div className="p-5 rounded-lg border border-teal-200 bg-teal-50">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-1.5 rounded bg-teal-600 text-white flex-shrink-0">
                            <BookMarked size={13} />
                          </div>
                          <p className="text-[11px] font-black text-teal-700 uppercase tracking-widest">
                            ENG.14 — Carry Forward Granted ({m.qualifier})
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(m.cfUnits || []).map((code, i) => (
                            <span
                              key={i}
                              className="text-[9px] font-mono px-2 py-0.5 rounded border border-teal-300 bg-white text-teal-800"
                            >
                              {code}
                            </span>
                          ))}
                        </div>
                        <p className="text-[9px] font-mono text-teal-600">
                          {m.reason}
                        </p>
                      </div>
                    )}

                    {/* ════════════════════════════════════════════════════ */}
                    {/* DEFERRED_SUPP card                                   */}
                    {/* ════════════════════════════════════════════════════ */}
                    {m.type === "DEFERRED_SUPP" && (
                      <div className="p-5 rounded-lg border border-indigo-200 bg-indigo-50">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-1.5 rounded bg-indigo-600 text-white flex-shrink-0">
                            <Calendar size={13} />
                          </div>
                          <p className="text-[11px] font-black text-indigo-700 uppercase tracking-widest">
                            {m.reason === "special_deferred"
                              ? "Special Deferred — ENG.18c"
                              : "Supplementary Deferred — ENG.13b"}
                          </p>
                          <span
                            className={`ml-auto text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wide flex-shrink-0 ${
                              m.deferralStatus === "passed"
                                ? "bg-emerald-100 text-emerald-700"
                                : m.deferralStatus === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-indigo-100 text-indigo-700"
                            }`}
                          >
                            {(m.deferralStatus || "PENDING").toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-indigo-600">
                          Unit: <span className="font-bold">{m.unitCode}</span>
                          {m.unitName && (
                            <span className="ml-2 text-indigo-400">
                              {m.unitName}
                            </span>
                          )}
                        </p>
                        <p className="text-[9px] font-mono text-indigo-400 mt-1">
                          From Year {m.yearOfStudy} ({m.academicYear}) →
                          deferred to next ordinary examination period.
                        </p>
                      </div>
                    )}
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


