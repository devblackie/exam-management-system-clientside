// clientside/src/app/demo/page.tsx
//
// WHAT THIS IS
// ─────────────────────────────────────────────────────────────────────────────
// A fully client-side interactive demo of the SenateDesk system.
// No backend required. All data is seeded mock data that mirrors real
// system shapes. The UI components match the real coordinator interface.
//
// WHY THIS APPROACH (not screenshots, not a video)
// ─────────────────────────────────────────────────────────────────────────────
// Coordinators are academics, not developers. They need to FEEL the system
// working, not read about it. An interactive demo converts 3-5x better than
// a product video for B2B institutional software.
//
// THREE DEMO SCREENS (matching the three highest-value features):
//   1. Student Journey Timeline — the most visually distinctive feature
//   2. Promotion Preview — the core workflow coordinators do every semester
//   3. Marks Status Engine — the academic rules in action
//
// DEPENDENCIES: None beyond what's already in the project.
// All styling uses Tailwind classes matching the existing system design.

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Zap,
  History,
  ArrowRight,
  BookOpen,
  Users,
  FileText,
  TrendingUp,
  Shield,
  Play,
  BookMarked,
  Trophy,
} from "lucide-react";

// ── Mock data types ────────────────────────────────────────────────────────

type NodeType = "ACADEMIC" | "STATUS_CHANGE" | "CARRY_FORWARD" | "GRADUATION";

interface MockTimelineNode {
  type: NodeType;
  yearOfStudy?: number;
  academicYear: string;
  status?: string;
  annualMean?: number;
  weight?: number;
  totalUnits?: number;
  qualifierSuffix?: string;
  isRepeat?: boolean;
  isCurrent?: boolean;
  challenges?: {
    supplementary: string[];
    retakes: string[];
    stayouts: string[];
    specials: string[];
    carryForwards: string[];
    deferred: string[];
    incomplete: string[];
  };
  toStatus?: string;
  fromStatus?: string;
  reason?: string;
  cfUnits?: string[];
  qualifier?: string;
}

interface MockStudent {
  regNo: string;
  name: string;
  program: string;
  status: string;
  currentYear: number;
  cumulativeMean: string;
  classification: string;
  admissionYear: string;
  intake: string;
  totalTimeOutYears: number;
  timeline: MockTimelineNode[];
}

interface MockPromoStudent {
  regNo: string;
  name: string;
  status: "PASS" | "SUPP" | "REPEAT" | "STAYOUT" | "LEAVE";
  details: string;
  mean: string;
  passed: number;
  failed: number;
  total: number;
}

// ── Mock student data ──────────────────────────────────────────────────────

const MOCK_STUDENTS: MockStudent[] = [
  {
    regNo: "E024-01-1234/2020",
    name: "ALICE WANJIKU MWANGI",
    program: "BSc. Electrical & Electronics Engineering",
    status: "active",
    currentYear: 4,
    cumulativeMean: "68.45",
    classification: "SECOND CLASS HONOURS (UPPER)",
    admissionYear: "2020/2021",
    intake: "SEPT",
    totalTimeOutYears: 0,
    timeline: [
      {
        type: "ACADEMIC",
        yearOfStudy: 1,
        academicYear: "2020/2021",
        status: "PASS (PROMOTED)",
        annualMean: 71.2,
        weight: 15,
        totalUnits: 10,
        qualifierSuffix: "",
        challenges: {
          supplementary: [],
          retakes: [],
          stayouts: [],
          specials: [],
          carryForwards: [],
          deferred: [],
          incomplete: [],
        },
      },
      {
        type: "ACADEMIC",
        yearOfStudy: 2,
        academicYear: "2021/2022",
        status: "SUPP 2",
        annualMean: 63.5,
        weight: 15,
        totalUnits: 10,
        qualifierSuffix: "",
        challenges: {
          supplementary: ["ECE 201", "ECE 203"],
          retakes: [],
          stayouts: [],
          specials: [],
          carryForwards: [],
          deferred: [],
          incomplete: [],
        },
      },
      {
        type: "ACADEMIC",
        yearOfStudy: 3,
        academicYear: "2022/2023",
        status: "PASS (PROMOTED)",
        annualMean: 67.8,
        weight: 20,
        totalUnits: 10,
        qualifierSuffix: "",
        challenges: {
          supplementary: [],
          retakes: [],
          stayouts: [],
          specials: [],
          carryForwards: [],
          deferred: [],
          incomplete: [],
        },
      },
      {
        type: "ACADEMIC",
        yearOfStudy: 4,
        academicYear: "2023/2024",
        status: "SESSION IN PROGRESS",
        annualMean: 68.9,
        weight: 25,
        totalUnits: 10,
        qualifierSuffix: "",
        isCurrent: true,
        challenges: {
          supplementary: [],
          retakes: [],
          stayouts: [],
          specials: [],
          carryForwards: [],
          deferred: [],
          incomplete: [],
        },
      },
    ],
  },
  {
    regNo: "E024-01-1189/2019",
    name: "BRIAN ODHIAMBO OTIENO",
    program: "BSc. Civil Engineering",
    status: "repeat",
    currentYear: 3,
    cumulativeMean: "44.10",
    classification: "PASS",
    admissionYear: "2019/2020",
    intake: "SEPT",
    totalTimeOutYears: 1,
    timeline: [
      {
        type: "ACADEMIC",
        yearOfStudy: 1,
        academicYear: "2019/2020",
        status: "PASS (PROMOTED)",
        annualMean: 55.3,
        weight: 15,
        totalUnits: 10,
        qualifierSuffix: "",
        challenges: {
          supplementary: [],
          retakes: [],
          stayouts: [],
          specials: [],
          carryForwards: [],
          deferred: [],
          incomplete: [],
        },
      },
      {
        type: "STATUS_CHANGE",
        academicYear: "2020/2021",
        fromStatus: "active",
        toStatus: "on_leave",
        reason: "Financial grounds — ENG.19 leave approved",
      },
      {
        type: "STATUS_CHANGE",
        academicYear: "2021/2022",
        fromStatus: "on_leave",
        toStatus: "active",
        reason: "Studies resumed after financial clearance",
      },
      {
        type: "ACADEMIC",
        yearOfStudy: 2,
        academicYear: "2021/2022",
        status: "REPEAT YEAR",
        annualMean: 36.2,
        weight: 15,
        totalUnits: 10,
        qualifierSuffix: "RP1",
        isRepeat: false,
        challenges: {
          supplementary: [],
          retakes: [],
          stayouts: [],
          specials: [],
          carryForwards: [],
          deferred: [],
          incomplete: ["CIV 201", "CIV 202", "CIV 203", "CIV 204", "CIV 205"],
        },
      },
      {
        type: "ACADEMIC",
        yearOfStudy: 2,
        academicYear: "2022/2023",
        status: "CARRY FORWARD (RP1C)",
        annualMean: 48.5,
        weight: 15,
        totalUnits: 10,
        qualifierSuffix: "RP1C",
        challenges: {
          supplementary: [],
          retakes: [],
          stayouts: [],
          specials: [],
          carryForwards: ["CIV 201", "CIV 203"],
          deferred: [],
          incomplete: [],
        },
      },
      {
        type: "CARRY_FORWARD",
        academicYear: "2022/2023",
        cfUnits: ["CIV 201", "CIV 203"],
        qualifier: "RP1C",
        reason: "ENG.14: 2 units carried forward to Year 3",
      },
      {
        type: "ACADEMIC",
        yearOfStudy: 3,
        academicYear: "2023/2024",
        status: "SESSION IN PROGRESS",
        annualMean: 51.0,
        weight: 20,
        totalUnits: 10,
        qualifierSuffix: "RP1C",
        isCurrent: true,
        challenges: {
          supplementary: [],
          retakes: ["CIV 201", "CIV 203"],
          stayouts: [],
          specials: [],
          carryForwards: [],
          deferred: [],
          incomplete: [],
        },
      },
    ],
  },
  {
    regNo: "E024-01-0891/2018",
    name: "CAROL AKINYI OUMA",
    program: "BSc. Mechanical Engineering",
    status: "graduand",
    currentYear: 5,
    cumulativeMean: "73.22",
    classification: "FIRST CLASS HONOURS",
    admissionYear: "2018/2019",
    intake: "SEPT",
    totalTimeOutYears: 0,
    timeline: [
      {
        type: "ACADEMIC",
        yearOfStudy: 1,
        academicYear: "2018/2019",
        status: "PASS (PROMOTED)",
        annualMean: 70.1,
        weight: 15,
        totalUnits: 10,
        challenges: {
          supplementary: [],
          retakes: [],
          stayouts: [],
          specials: [],
          carryForwards: [],
          deferred: [],
          incomplete: [],
        },
      },
      {
        type: "ACADEMIC",
        yearOfStudy: 2,
        academicYear: "2019/2020",
        status: "PASS (PROMOTED)",
        annualMean: 72.4,
        weight: 15,
        totalUnits: 10,
        challenges: {
          supplementary: [],
          retakes: [],
          stayouts: [],
          specials: [],
          carryForwards: [],
          deferred: [],
          incomplete: [],
        },
      },
      {
        type: "ACADEMIC",
        yearOfStudy: 3,
        academicYear: "2020/2021",
        status: "PASS (PROMOTED)",
        annualMean: 74.8,
        weight: 20,
        totalUnits: 10,
        challenges: {
          supplementary: [],
          retakes: [],
          stayouts: [],
          specials: [],
          carryForwards: [],
          deferred: [],
          incomplete: [],
        },
      },
      {
        type: "ACADEMIC",
        yearOfStudy: 4,
        academicYear: "2021/2022",
        status: "PASS (PROMOTED)",
        annualMean: 75.2,
        weight: 25,
        totalUnits: 10,
        challenges: {
          supplementary: [],
          retakes: [],
          stayouts: [],
          specials: [],
          carryForwards: [],
          deferred: [],
          incomplete: [],
        },
      },
      {
        type: "ACADEMIC",
        yearOfStudy: 5,
        academicYear: "2022/2023",
        status: "PASS (PROMOTED)",
        annualMean: 73.5,
        weight: 25,
        totalUnits: 10,
        challenges: {
          supplementary: [],
          retakes: [],
          stayouts: [],
          specials: [],
          carryForwards: [],
          deferred: [],
          incomplete: [],
        },
      },
      {
        type: "GRADUATION",
        academicYear: "2022/2023",
        status: "GRADUATED",
        annualMean: 73.22,
        reason: "FIRST CLASS HONOURS",
      },
    ],
  },
];

const MOCK_PROMO: MockPromoStudent[] = [
  {
    regNo: "E024-01-1234/2020",
    name: "ALICE WANJIKU MWANGI",
    status: "PASS",
    details: "All units cleared — eligible for promotion",
    mean: "68.45",
    passed: 10,
    failed: 0,
    total: 10,
  },
  {
    regNo: "E024-01-1451/2020",
    name: "DAVID KIPCHOGE RONO",
    status: "SUPP",
    details: "SUPP 2: ECE 402, ECE 405",
    mean: "55.20",
    passed: 8,
    failed: 2,
    total: 10,
  },
  {
    regNo: "E024-01-1567/2020",
    name: "ESTHER NJERI KAMAU",
    status: "SUPP",
    details: "SUPP 1: ECE 403",
    mean: "61.30",
    passed: 9,
    failed: 1,
    total: 10,
  },
  {
    regNo: "E024-01-1612/2020",
    name: "FELIX MUTUA MUSYOKA",
    status: "STAYOUT",
    details: "Fail > ⅓ (ENG.15h): ECE 401, 402, 403, 404",
    mean: "38.10",
    passed: 6,
    failed: 4,
    total: 10,
  },
  {
    regNo: "E024-01-1398/2020",
    name: "GRACE WAMBUA NDINDA",
    status: "REPEAT",
    details: "REPEAT YEAR (ENG.16): Mean 31.2% < 40%",
    mean: "31.20",
    passed: 4,
    failed: 6,
    total: 10,
  },
  {
    regNo: "E024-01-1711/2020",
    name: "HENRY OMONDI JUMA",
    status: "PASS",
    details: "All units cleared — eligible for promotion",
    mean: "72.80",
    passed: 10,
    failed: 0,
    total: 10,
  },
  {
    regNo: "E024-01-1823/2020",
    name: "IRENE ACHIENG OTIENO",
    status: "LEAVE",
    details: "Academic Leave — Financial (ENG.19)",
    mean: "0.00",
    passed: 0,
    failed: 0,
    total: 10,
  },
  {
    regNo: "E024-01-1555/2020",
    name: "JAMES KARIUKI WAWERU",
    status: "PASS",
    details: "Carry-forward granted (RP1C): ECE 401",
    mean: "58.90",
    passed: 9,
    failed: 0,
    total: 10,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

const classify = (mean: number) => {
  if (mean >= 70)
    return { label: "First Class Honours", color: "text-emerald-400" };
  if (mean >= 60)
    return { label: "Second Class (Upper)", color: "text-blue-400" };
  if (mean >= 50)
    return { label: "Second Class (Lower)", color: "text-amber-400" };
  if (mean >= 40) return { label: "Pass", color: "text-slate-400" };
  return { label: "Below Pass Mark", color: "text-red-400" };
};

const promoColor = (s: MockPromoStudent["status"]) =>
  ({
    PASS: "bg-emerald-900/40 border-emerald-700/40 text-emerald-300",
    SUPP: "bg-amber-900/40 border-amber-700/40 text-amber-300",
    REPEAT: "bg-red-900/40 border-red-700/40 text-red-300",
    STAYOUT: "bg-orange-900/40 border-orange-700/40 text-orange-300",
    LEAVE: "bg-slate-800/60 border-slate-600/40 text-slate-300",
  })[s];

const promoBadge = (s: MockPromoStudent["status"]) =>
  ({
    PASS: "bg-emerald-500 text-white",
    SUPP: "bg-amber-500 text-white",
    REPEAT: "bg-red-600 text-white",
    STAYOUT: "bg-orange-500 text-white",
    LEAVE: "bg-slate-600 text-white",
  })[s];

const promoLabel = (s: MockPromoStudent["status"]) =>
  ({
    PASS: "PASS",
    SUPP: "SUPPLEMENTARY",
    REPEAT: "REPEAT YEAR",
    STAYOUT: "STAY OUT",
    LEAVE: "ON LEAVE",
  })[s];

// ── Node renderer ──────────────────────────────────────────────────────────

function TimelineNode({
  node,
  maxWeight,
}: {
  node: MockTimelineNode;
  maxWeight: number;
}) {
  const w = node.weight ?? 0;
  const barPct = maxWeight > 0 ? Math.round((w / maxWeight) * 100) : 0;

  const nodeStyle = (() => {
    if (node.type === "GRADUATION")
      return { nodeBg: "bg-emerald-600", icon: <Trophy size={10} /> };
    if (node.type === "CARRY_FORWARD")
      return { nodeBg: "bg-teal-600", icon: <BookMarked size={10} /> };
    if (node.type === "STATUS_CHANGE") {
      const to = (node.toStatus || "").toLowerCase();
      if (to === "active")
        return { nodeBg: "bg-emerald-700", icon: <CheckCircle2 size={10} /> };
      if (to === "on_leave")
        return { nodeBg: "bg-amber-600", icon: <ArrowRight size={10} /> };
      return { nodeBg: "bg-slate-600", icon: <History size={10} /> };
    }
    const s = (node.status || "").toUpperCase();
    if (s.includes("REPEAT"))
      return { nodeBg: "bg-red-600", icon: <AlertCircle size={10} /> };
    if (s.includes("SUPP"))
      return { nodeBg: "bg-yellow-600", icon: <AlertTriangle size={10} /> };
    if (s.includes("SESSION"))
      return { nodeBg: "bg-blue-600", icon: <History size={10} /> };
    return {
      nodeBg: "bg-[#002B1B]",
      icon: <Zap size={10} className="fill-current" />,
    };
  })();

  const hasHurdles =
    node.challenges && Object.values(node.challenges).some((a) => a.length > 0);

  return (
    <div className="flex gap-6 group">
      <div className="flex-shrink-0 mt-1">
        <div
          className={`w-5 h-5 rounded-sm rotate-45 border border-white/20 flex items-center justify-center text-white ${nodeStyle.nodeBg}`}
        >
          <div className="-rotate-45">{nodeStyle.icon}</div>
        </div>
      </div>
      <div className="flex-1 pb-5 border-b border-white/5 last:border-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
            {node.type === "ACADEMIC"
              ? `Year ${node.yearOfStudy}`
              : node.type === "GRADUATION"
                ? "Graduation"
                : node.type === "CARRY_FORWARD"
                  ? "ENG.14 — Carry Forward"
                  : "Admin Event"}
          </span>
          <span className="text-[9px] font-mono text-white/20">
            [{node.academicYear}]
          </span>
          {node.isCurrent && (
            <span className="text-[7px] font-black px-1.5 py-0.5 bg-[#D4AF37] text-[#0A1F16] uppercase tracking-tight">
              Current
            </span>
          )}
          {node.annualMean !== undefined && node.annualMean > 0 && (
            <span
              className={`text-[7px] font-mono px-1.5 py-0.5 rounded ${classify(node.annualMean).color} bg-white/5`}
            >
              {node.annualMean.toFixed(1)}%
            </span>
          )}
        </div>

        {node.type === "ACADEMIC" && (
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1 p-3 rounded-lg bg-white/3 border border-white/5">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">
                Standing
              </p>
              <p
                className={`text-[9px] font-bold uppercase ${
                  (node.status || "").includes("REPEAT")
                    ? "text-red-400"
                    : (node.status || "").includes("SUPP")
                      ? "text-amber-400"
                      : (node.status || "").includes("SESSION")
                        ? "text-blue-400"
                        : "text-emerald-400"
                }`}
              >
                {node.status}
              </p>
              {node.qualifierSuffix && (
                <p className="text-[7px] font-mono text-white/30 mt-1">
                  {node.qualifierSuffix}
                </p>
              )}
            </div>
            <div className="col-span-1 p-3 rounded-lg bg-white/3 border border-white/5">
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">
                Hurdles
              </p>
              <div className="space-y-0.5">
                {!hasHurdles ? (
                  <p className="text-[8px] font-mono text-white/20">
                    Clean year
                  </p>
                ) : (
                  <>
                    {(node.challenges?.supplementary || []).map((u, i) => (
                      <span
                        key={i}
                        className="inline-block text-[7px] font-mono px-1.5 py-0.5 bg-amber-900/40 border border-amber-700/40 text-amber-300 rounded-sm mr-0.5 mb-0.5"
                      >
                        {u}
                      </span>
                    ))}
                    {(node.challenges?.retakes || []).map((u, i) => (
                      <span
                        key={i}
                        className="inline-block text-[7px] font-mono px-1.5 py-0.5 bg-red-900/40 border border-red-700/40 text-red-300 rounded-sm mr-0.5 mb-0.5"
                      >
                        RET:{u}
                      </span>
                    ))}
                    {(node.challenges?.carryForwards || []).map((u, i) => (
                      <span
                        key={i}
                        className="inline-block text-[7px] font-mono px-1.5 py-0.5 bg-teal-900/40 border border-teal-700/40 text-teal-300 rounded-sm mr-0.5 mb-0.5"
                      >
                        CF:{u}
                      </span>
                    ))}
                    {(node.challenges?.incomplete || [])
                      .slice(0, 2)
                      .map((u, i) => (
                        <span
                          key={i}
                          className="inline-block text-[7px] font-mono px-1.5 py-0.5 bg-slate-800 border border-slate-600 text-slate-400 rounded-sm mr-0.5 mb-0.5"
                        >
                          {u}
                        </span>
                      ))}
                  </>
                )}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#002B1B] border border-[#D4AF37]/10">
              <div className="flex justify-between mb-1">
                <span className="text-[7px] font-black text-[#D4AF37]/60 uppercase">
                  Telemetry
                </span>
                <span className="text-[7px] font-mono text-white/40">
                  W:{w}%
                </span>
              </div>
              <p className="text-sm font-light text-white">
                {node.totalUnits} units
              </p>
              <div className="mt-2 h-px bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-[#D4AF37]"
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {node.type === "STATUS_CHANGE" && (
          <div className="p-3 rounded-lg bg-white/3 border border-white/5">
            <p className="text-[9px] font-mono text-white/40">
              Status:{" "}
              <span className="text-white/60">
                [{(node.fromStatus || "—").toUpperCase().replace(/_/g, " ")}]
              </span>
              {" → "}
              <span className="text-[#D4AF37]">
                [{(node.toStatus || "—").toUpperCase().replace(/_/g, " ")}]
              </span>
            </p>
            {node.reason && (
              <p className="text-[8px] text-white/30 mt-1">{node.reason}</p>
            )}
          </div>
        )}

        {node.type === "CARRY_FORWARD" && (
          <div className="p-3 rounded-lg bg-teal-950/40 border border-teal-800/30">
            <p className="text-[9px] font-black text-teal-400 mb-1">
              ENG.14 — Carry Forward Granted ({node.qualifier})
            </p>
            <div className="flex gap-1 flex-wrap">
              {(node.cfUnits || []).map((c, i) => (
                <span
                  key={i}
                  className="text-[8px] font-mono px-2 py-0.5 bg-teal-900/40 border border-teal-700/40 text-teal-300 rounded"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {node.type === "GRADUATION" && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-700/30">
            <p className="text-[9px] font-black text-emerald-400">
              DEGREE AWARDED — {node.reason}
            </p>
            {node.annualMean && (
              <p className="text-[8px] font-mono text-emerald-300/60 mt-0.5">
                Final WAA: {node.annualMean.toFixed(2)}%
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Demo screen: Journey ───────────────────────────────────────────────────

function JourneyScreen() {
  const [selected, setSelected] = useState(0);
  const student = MOCK_STUDENTS[selected];
  const mean = parseFloat(student.cumulativeMean);
  const cls = classify(mean);
  const maxW = Math.max(
    ...student.timeline
      .filter((n) => n.type === "ACADEMIC")
      .map((n) => n.weight ?? 0),
    1,
  );
  const academicNodes = student.timeline.filter((n) => n.type === "ACADEMIC");

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {/* Student list */}
      <div className="col-span-1 space-y-1">
        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2 px-1">
          Select Student
        </p>
        {MOCK_STUDENTS.map((s, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              selected === i
                ? "border-[#D4AF37]/50 bg-[#D4AF37]/5"
                : "border-white/5 bg-white/2 hover:border-white/10"
            }`}
          >
            <p className="text-[10px] font-bold text-white truncate">
              {s.name}
            </p>
            <p className="text-[8px] font-mono text-white/30 mt-0.5">
              {s.regNo}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase ${
                  s.status === "active"
                    ? "bg-emerald-900/50 text-emerald-400"
                    : s.status === "repeat"
                      ? "bg-red-900/50 text-red-400"
                      : s.status === "graduand"
                        ? "bg-[#D4AF37]/20 text-[#D4AF37]"
                        : "bg-slate-800 text-slate-400"
                }`}
              >
                {s.status}
              </span>
              <span className="text-[7px] font-mono text-white/20">
                Y{s.currentYear}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Journey panel */}
      <div className="col-span-2 flex flex-col gap-3 min-h-0">
        {/* Header */}
        <div className="flex items-start justify-between p-4 rounded-xl bg-white/3 border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#002B1B] rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap size={16} className="text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                  {student.admissionYear}
                </span>
                <span className="w-px h-3 bg-white/20" />
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                  {student.intake} Intake
                </span>
              </div>
              <p className="text-sm font-light text-white">
                {student.status.toUpperCase().replace(/_/g, " ")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">
              Projected WAA
            </p>
            <p className="text-xl font-light text-white">
              {student.cumulativeMean}
              <span className="text-[10px] text-white/30 ml-1">/ 100</span>
            </p>
            <p className={`text-[8px] font-black uppercase ${cls.color}`}>
              {cls.label}
            </p>
            {academicNodes.length > 1 && (
              <div className="flex items-end gap-0.5 mt-1 justify-end h-5">
                {academicNodes.map((n, i) => {
                  const h = Math.max(
                    3,
                    Math.round(((n.annualMean ?? 0) / 100) * 20),
                  );
                  const c =
                    (n.annualMean ?? 0) >= 70
                      ? "bg-emerald-400"
                      : (n.annualMean ?? 0) >= 60
                        ? "bg-blue-400"
                        : (n.annualMean ?? 0) >= 50
                          ? "bg-amber-400"
                          : "bg-red-400";
                  return (
                    <div
                      key={i}
                      className={`w-3 rounded-sm ${c}`}
                      style={{ height: `${h}px` }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-white/2 border border-white/5 space-y-4">
          <div className="relative">
            <div className="absolute left-[10px] top-0 bottom-0 w-px bg-white/5" />
            <div className="space-y-4">
              {student.timeline.map((node, i) => (
                <TimelineNode key={i} node={node} maxWeight={maxW} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Demo screen: Promotion Preview ─────────────────────────────────────────

function PromotionScreen() {
  const [run, setRun] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRun = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRun(true);
    }, 1200);
  };

  const eligible = MOCK_PROMO.filter((s) => s.status === "PASS");
  const blocked = MOCK_PROMO.filter((s) => s.status !== "PASS");

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Config bar */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white/3 border border-white/5">
        <div className="flex-1 grid grid-cols-3 gap-3">
          <div>
            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">
              Program
            </p>
            <p className="text-[10px] font-mono text-white">
              BSc. Electrical & Electronics Eng.
            </p>
          </div>
          <div>
            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">
              Year to Promote
            </p>
            <p className="text-[10px] font-mono text-white">Year 4 → Year 5</p>
          </div>
          <div>
            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">
              Academic Year
            </p>
            <p className="text-[10px] font-mono text-white">2023/2024</p>
          </div>
        </div>
        <button
          onClick={handleRun}
          disabled={loading}
          className="flex items-center gap-2 bg-[#D4AF37] text-[#0A1F16] px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider disabled:opacity-50 flex-shrink-0 transition-all hover:bg-[#F0D264]"
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 border border-[#0A1F16]/40 border-t-[#0A1F16] rounded-full animate-spin" />
              Running...
            </span>
          ) : (
            <>
              <Play size={11} /> Run Preview
            </>
          )}
        </button>
      </div>

      {!run ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
            <Play size={24} className="text-[#D4AF37]" />
          </div>
          <p className="text-sm font-light text-white/60">
            Click <span className="text-[#D4AF37] font-bold">Run Preview</span>{" "}
            to see ENG rules applied to all students
          </p>
          <p className="text-[11px] text-white/30">
            ENG.13, ENG.14, ENG.15h, ENG.16 calculated automatically
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col gap-3 min-h-0">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Total", val: MOCK_PROMO.length, color: "text-white" },
              {
                label: "Eligible",
                val: eligible.length,
                color: "text-emerald-400",
              },
              {
                label: "Blocked",
                val: blocked.length,
                color: "text-amber-400",
              },
              {
                label: "Promotion %",
                val: `${Math.round((eligible.length / MOCK_PROMO.length) * 100)}%`,
                color: "text-[#D4AF37]",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="p-3 rounded-lg bg-white/3 border border-white/5 text-center"
              >
                <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Student rows */}
          <div className="flex-1 overflow-y-auto space-y-1">
            {MOCK_PROMO.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg border ${promoColor(s.status)}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold text-white truncate">
                      {s.name}
                    </p>
                    <span className="text-[7px] font-mono text-white/30 flex-shrink-0">
                      {s.regNo}
                    </span>
                  </div>
                  <p className="text-[8px] text-white/40 mt-0.5">{s.details}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${promoBadge(s.status)}`}
                  >
                    {promoLabel(s.status)}
                  </span>
                  <p className="text-[8px] font-mono text-white/30 mt-1">
                    {s.mean}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Demo screen: Status Engine ─────────────────────────────────────────────

function StatusScreen() {
  const scenarios = [
    {
      label: "All pass",
      vals: [72, 68, 74, 70, 65, 71, 69, 73, 67, 71],
      desc: "All 10 units above pass mark (40%)",
    },
    {
      label: "2 fails (Supp eligible)",
      vals: [72, 38, 74, 70, 65, 71, 39, 73, 67, 71],
      desc: "2/10 failed — ≤ ⅓ — supplementary eligible (ENG.13)",
    },
    {
      label: "4 fails (Stayout)",
      vals: [72, 38, 74, 35, 65, 33, 39, 73, 67, 33],
      desc: "4/10 failed — > ⅓ but < ½ — stayout (ENG.15h)",
    },
    {
      label: "6 fails (Repeat)",
      vals: [38, 38, 42, 35, 65, 33, 39, 41, 37, 33],
      desc: "6/10 failed — ≥ ½ — repeat year (ENG.16)",
    },
  ];
  const [sel, setSel] = useState(0);
  const sc = scenarios[sel];
  const passMark = 40;
  const passed = sc.vals.filter((v) => v >= passMark).length;
  const failed = sc.vals.filter((v) => v < passMark).length;
  const mean = sc.vals.reduce((a, b) => a + b, 0) / sc.vals.length;
  const total = sc.vals.length;

  const verdict = (() => {
    if (failed >= total / 2 || mean < 40)
      return {
        label: "REPEAT YEAR",
        color: "text-red-400",
        bg: "bg-red-950/50",
        border: "border-red-800/40",
        rule: "ENG.16",
      };
    if (failed > total / 3)
      return {
        label: "STAYOUT",
        color: "text-orange-400",
        bg: "bg-orange-950/50",
        border: "border-orange-800/40",
        rule: "ENG.15h",
      };
    if (failed > 0)
      return {
        label: "SUPPLEMENTARY",
        color: "text-amber-400",
        bg: "bg-amber-950/50",
        border: "border-amber-800/40",
        rule: "ENG.13",
      };
    return {
      label: "PASS — PROMOTED",
      color: "text-emerald-400",
      bg: "bg-emerald-950/50",
      border: "border-emerald-800/40",
      rule: "ENG.10",
    };
  })();

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="grid grid-cols-4 gap-2">
        {scenarios.map((s, i) => (
          <button
            key={i}
            onClick={() => setSel(i)}
            className={`p-3 rounded-lg border text-left transition-all ${
              sel === i
                ? "border-[#D4AF37]/40 bg-[#D4AF37]/5"
                : "border-white/5 bg-white/2 hover:border-white/10"
            }`}
          >
            <p className="text-[9px] font-bold text-white">{s.label}</p>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-0">
        {/* Unit marks grid */}
        <div className="p-4 rounded-xl bg-white/3 border border-white/5">
          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-3">
            Unit Marks — {sc.desc}
          </p>
          <div className="grid grid-cols-10 gap-1.5">
            {sc.vals.map((v, i) => (
              <div
                key={i}
                className={`p-2 rounded text-center border ${
                  v >= passMark
                    ? "bg-emerald-950/40 border-emerald-800/30"
                    : "bg-red-950/40 border-red-800/30"
                }`}
              >
                <p
                  className={`text-sm font-bold ${v >= passMark ? "text-emerald-400" : "text-red-400"}`}
                >
                  {v}
                </p>
                <p className="text-[7px] font-mono text-white/30 mt-0.5">
                  U{i + 1}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              label: "Mean",
              val: `${mean.toFixed(1)}%`,
              color: mean >= 40 ? "text-emerald-400" : "text-red-400",
            },
            { label: "Passed", val: passed, color: "text-emerald-400" },
            { label: "Failed", val: failed, color: "text-red-400" },
            {
              label: "Pass Rate",
              val: `${Math.round((passed / total) * 100)}%`,
              color: passed === total ? "text-emerald-400" : "text-amber-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="p-3 rounded-lg bg-white/3 border border-white/5 text-center"
            >
              <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div
          className={`p-4 rounded-xl border flex items-center gap-4 ${verdict.bg} ${verdict.border}`}
        >
          <div>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">
              Engine Verdict — {verdict.rule}
            </p>
            <p className={`text-xl font-bold ${verdict.color}`}>
              {verdict.label}
            </p>
          </div>
          <div className="ml-auto font-mono text-[10px] text-white/20 leading-relaxed">
            {failed >= total / 2 || mean < 40 ? (
              <>fail ≥ 50% or mean &lt; 40 → REPEAT</>
            ) : failed > total / 3 ? (
              <>fail &gt; ⅓ → STAYOUT</>
            ) : failed > 0 ? (
              <>fail ≤ ⅓ → SUPPLEMENTARY</>
            ) : (
              <>all pass → PROMOTED</>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main demo page ─────────────────────────────────────────────────────────

type ScreenId = "journey" | "promotion" | "engine";

export default function DemoPage() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>("journey");

  const screens: {
    id: ScreenId;
    label: string;
    icon: React.ReactNode;
    desc: string;
  }[] = [
    {
      id: "journey",
      label: "Journey Timeline",
      icon: <TrendingUp size={14} />,
      desc: "Full student history from admission to graduation",
    },
    {
      id: "promotion",
      label: "Promotion Preview",
      icon: <Users size={14} />,
      desc: "ENG rules applied to the full cohort",
    },
    {
      id: "engine",
      label: "Status Engine",
      icon: <Zap size={14} />,
      desc: "Academic standing calculated in real time",
    },
  ];

  return (
    <div className="min-h-screen bg-[#071510] text-white font-sans antialiased">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-[#D4AF37]/15 bg-[#071510]/90 backdrop-blur-md flex items-center">
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#D4AF37] rounded-md flex items-center justify-center">
              <svg viewBox="0 0 18 18" width="14" height="14" fill="none">
                <path
                  d="M9 2L15 5.5V12.5L9 16L3 12.5V5.5L9 2Z"
                  stroke="#0A1F16"
                  strokeWidth="1.5"
                />
                <path
                  d="M9 6L12 7.75V11.25L9 13L6 11.25V7.75L9 6Z"
                  fill="#0A1F16"
                />
              </svg>
            </div>
            <span className="font-bold text-[#D4AF37] text-sm">SenateDesk</span>
          </Link>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#D4AF37]/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50 animate-pulse" />
            Interactive Demo
          </div>
          <Link
            href="/#pricing"
            className="flex items-center gap-1.5 bg-[#D4AF37] text-[#0A1F16] px-4 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider hover:bg-[#F0D264] transition-colors"
          >
            Get Started <ChevronRight size={11} />
          </Link>
        </div>
      </nav>

      <div className="pt-14 flex flex-col h-screen">
        {/* Demo header */}
        <div className="px-6 py-4 border-b border-[#D4AF37]/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-[#D4AF37]/50 uppercase tracking-widest mb-0.5">
                  Live Interactive Demo
                </p>
                <h1 className="text-lg font-bold text-white">
                  SenateDesk — Academic Management System
                </h1>
              </div>
              <div className="flex items-center gap-1 p-1 bg-white/3 border border-white/5 rounded-xl">
                {screens.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveScreen(s.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                      activeScreen === s.id
                        ? "bg-[#D4AF37] text-[#0A1F16]"
                        : "text-white/40 hover:text-white"
                    }`}
                  >
                    {s.icon}
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                    {screens.find((s) => s.id === activeScreen)?.desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo body */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="max-w-7xl mx-auto h-full">
            {/* System chrome — simulates the real coordinator interface */}
            <div className="h-full rounded-2xl border border-white/8 bg-[#0A1F16]/50 overflow-hidden flex flex-col">
              {/* Fake window chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-black/20">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-5 max-w-xs rounded bg-white/5 flex items-center px-2">
                    <span className="text-[8px] font-mono text-white/20">
                      app.senatedesk.co.ke/coordinator
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield size={10} className="text-emerald-400/60" />
                  <span className="text-[8px] text-emerald-400/60 font-mono">
                    Secure
                  </span>
                </div>
              </div>

              {/* Fake sidebar + content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-48 border-r border-white/5 bg-black/10 p-3 flex flex-col gap-1 flex-shrink-0">
                  <div className="mb-2 px-2">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                      Coordinator
                    </p>
                    <p className="text-[9px] font-bold text-white/50 truncate">
                      Dr. J. Mwangi
                    </p>
                  </div>
                  {[
                    {
                      icon: <Users size={10} />,
                      label: "Students",
                      active: activeScreen === "journey",
                    },
                    {
                      icon: <TrendingUp size={10} />,
                      label: "Promotion",
                      active: activeScreen === "promotion",
                    },
                    {
                      icon: <Zap size={10} />,
                      label: "Status Engine",
                      active: activeScreen === "engine",
                    },
                    {
                      icon: <FileText size={10} />,
                      label: "Senate Reports",
                      active: false,
                    },
                    {
                      icon: <BookOpen size={10} />,
                      label: "Mark Sheets",
                      active: false,
                    },
                    {
                      icon: <Shield size={10} />,
                      label: "Disciplinary",
                      active: false,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded text-[9px] font-medium cursor-default ${
                        item.active
                          ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                          : "text-white/20"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 p-5 overflow-hidden">
                  {activeScreen === "journey" && <JourneyScreen />}
                  {activeScreen === "promotion" && <PromotionScreen />}
                  {activeScreen === "engine" && <StatusScreen />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
