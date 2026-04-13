// clientside/src/app/coordinator/award-list/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  GraduationCap,
  Download,
  Loader2,
  Trophy,
  Users,
  ChevronDown,
  ChevronRight,
  Filter,
} from "lucide-react";
import api from "@/config/axiosInstance";
import { getPrograms } from "@/api/programsApi";
import { getAcademicYears } from "@/api/academicYearsApi";
import { useToast } from "@/context/ToastContext";
import PageHeader from "@/components/ui/PageHeader";
import type { Program, AcademicYear, AwardListParams, AwardDocParams } from "@/api/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AwardListEntry {
  studentId: string;
  regNo: string;
  name: string;
  waa: number;
  classification: string;
  graduationYear: number;
}

interface AwardListResponse {
  success: boolean;
  count: number;
  data: AwardListEntry[];
}

const CLASS_ORDER = [
  "FIRST CLASS HONOURS",
  "SECOND CLASS HONOURS (UPPER DIVISION)",
  "SECOND CLASS HONOURS (LOWER DIVISION)",
  "PASS",
];

const CLASS_STYLES: Record<string, { badge: string; row: string }> = {
  "FIRST CLASS HONOURS": {
    badge: "bg-yellow-50 text-yellow-800 border border-yellow-300",
    row: "border-l-4 border-yellow-400",
  },
  "SECOND CLASS HONOURS (UPPER DIVISION)": {
    badge: "bg-blue-50 text-blue-800 border border-blue-200",
    row: "border-l-4 border-blue-400",
  },
  "SECOND CLASS HONOURS (LOWER DIVISION)": {
    badge: "bg-slate-50 text-slate-700 border border-slate-200",
    row: "border-l-4 border-slate-400",
  },
  PASS: {
    badge: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    row: "border-l-4 border-emerald-400",
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function ClassGroup({
  classification,
  students,
}: {
  classification: string;
  students: AwardListEntry[];
}) {
  const [open, setOpen] = useState(true);
  const styles = CLASS_STYLES[classification] || CLASS_STYLES.PASS;

  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDown size={14} className="text-slate-400" />
          ) : (
            <ChevronRight size={14} className="text-slate-400" />
          )}
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${styles.badge}`}
          >
            {classification}
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {students.length} student{students.length !== 1 ? "s" : ""}
        </span>
      </button>

      {open && (
        <div className="divide-y divide-slate-50">
          {students.map((s, i) => (
            <div
              key={s.studentId}
              className={`flex items-center gap-4 px-5 py-3 hover:bg-slate-50/80 ${styles.row}`}
            >
              <span className="text-[10px] font-mono text-slate-300 w-6">
                {i + 1}
              </span>
              <span className="text-[11px] font-mono text-slate-500 w-40 shrink-0">
                {s.regNo}
              </span>
              <span className="text-[11px] font-semibold text-green-darkest flex-1 uppercase">
                {s.name}
              </span>
              <span className="text-[11px] font-black text-slate-600 font-mono">
                {s.waa.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AwardListPage() {
  const { addToast } = useToast();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");

  const [awardList, setAwardList] = useState<AwardListEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<
    "simple" | "classified" | null
  >(null);

  // Load programs and years
  useEffect(() => {
    Promise.all([getPrograms(), getAcademicYears()])
      .then(([p, y]) => {
        setPrograms(p);
        setAcademicYears(y);
      })
      .catch(() => addToast("Failed to load metadata", "error"));
  }, []);

  // ── Fetch award list (preview) ─────────────────────────────────────────────
  const fetchAwardList = useCallback(async () => {
    if (!selectedProgramId) {
      addToast("Please select a program", "warning");
      return;
    }
    setLoading(true);
    setAwardList(null);
    try {
      const params: AwardListParams = { programId: selectedProgramId };
      if (selectedAcademicYear) params.academicYear = selectedAcademicYear;
      const res = await api.get<AwardListResponse>("/promote/award-list", {
        params,
      });
      setAwardList(res.data.data);
      if (res.data.count === 0)
        addToast("No eligible graduates found for this selection.", "warning");
    } catch {
      addToast("Failed to load award list", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedProgramId, selectedAcademicYear, addToast]);

  // ── Download handlers ──────────────────────────────────────────────────────
  const download = async (variant: "simple" | "classified") => {
    if (!selectedProgramId) {
      addToast("Please select a program", "warning");
      return;
    }
    setDownloading(variant);
    try {
      const params: AwardDocParams = {
        programId: selectedProgramId,
        variant, // server reads this to choose format
      };
      if (selectedAcademicYear) params.academicYear = selectedAcademicYear;

      const res = await api.get("/promote/award-list-doc", {
        params,
        responseType: "blob",
      });

      const prog = programs.find((p) => p._id === selectedProgramId);
      const year = selectedAcademicYear.replace("/", "_") || "ALL";
      const label = variant === "classified" ? "CLASSIFIED" : "SIMPLE";
      const fname = `Award_List_${prog?.code || "PROG"}_${year}_${label}.docx`;

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fname);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      addToast(`${label} award list downloaded.`, "success");
    } catch {
      addToast("Download failed.", "error");
    } finally {
      setDownloading(null);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const grouped = awardList
    ? CLASS_ORDER.reduce(
        (acc, cls) => {
          const g = (awardList || []).filter((s) => s.classification === cls);
          if (g.length) acc[cls] = g;
          return acc;
        },
        {} as Record<string, AwardListEntry[]>,
      )
    : null;

  const summary = awardList
    ? CLASS_ORDER.map((cls) => ({
        cls,
        count: (awardList || []).filter((s) => s.classification === cls).length,
      })).filter((s) => s.count > 0)
    : [];

  const inputClass =
    "w-full p-3 bg-white border border-slate-200 text-green-darkest font-semibold text-xs rounded-lg outline-none appearance-none";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="ml-48 my-10 min-h-screen bg-[#F8F9FA]">
      <div className="bg-[#F8F9FA] min-h-screen rounded-lg shadow-2xl p-9 border border-white">
        <PageHeader
          title="Graduation"
          highlightedTitle="Award List"
          systemLabel=""
          subtitle="Preview and download the official graduation award list for eligible students."
        />

        {/* ── Filters ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-lg border border-green-darkest/5 shadow-sm mb-8">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Program
            </label>
            <select
              className={inputClass}
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
            >
              <option value="">Select Program...</option>
              {programs.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.code} — {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Academic Year{" "}
              <span className="text-slate-300">
                (optional — leave blank for all)
              </span>
            </label>
            <select
              className={inputClass}
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
            >
              <option value="">All Years</option>
              {academicYears.map((y) => (
                <option key={y._id} value={y.year}>
                  {y.year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchAwardList}
              disabled={!selectedProgramId || loading}
              className="w-full py-3 bg-green-darkest text-yellow-gold font-black text-[11px] uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 disabled:opacity-40 hover:shadow-xl transition-all"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Filter size={16} />
              )}
              {loading ? "Loading..." : "Preview Award List"}
            </button>
          </div>
        </div>

        {/* ── Summary ribbon ── */}
        {awardList && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="col-span-2 md:col-span-1 bg-green-darkest text-white rounded-lg p-5 flex flex-col justify-between">
                <GraduationCap size={20} className="text-yellow-gold mb-2" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/50">
                    Total Graduates
                  </p>
                  <p className="text-4xl font-light tracking-tighter">
                    {awardList.length}
                  </p>
                </div>
              </div>
              {summary.map(({ cls, count }) => {
                const styles = CLASS_STYLES[cls] || CLASS_STYLES.PASS;
                return (
                  <div
                    key={cls}
                    className="bg-white rounded-lg p-4 border border-slate-100 shadow-sm"
                  >
                    <span
                      className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${styles.badge}`}
                    >
                      {cls.replace("SECOND CLASS HONOURS", "2ND CLASS")}
                    </span>
                    <p className="text-3xl font-light text-green-darkest mt-3 tracking-tighter">
                      {count}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* ── Download buttons ── */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => download("simple")}
                disabled={downloading !== null || awardList.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-green-darkest font-black text-[10px] uppercase tracking-widest rounded-lg hover:border-green-darkest hover:shadow-md transition-all disabled:opacity-40"
              >
                {downloading === "simple" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Users size={14} />
                )}
                Download Simple List
              </button>
              <button
                onClick={() => download("classified")}
                disabled={downloading !== null || awardList.length === 0}
                className="flex items-center gap-2 px-6 py-3 bg-green-darkest text-yellow-gold font-black text-[10px] uppercase tracking-widest rounded-lg hover:shadow-xl transition-all disabled:opacity-40"
              >
                {downloading === "classified" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trophy size={14} />
                )}
                Download Classified List
              </button>
            </div>

            {/* ── Preview table ── */}
            <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <GraduationCap size={16} className="text-green-darkest" />
                <h3 className="text-[10px] font-black text-green-darkest uppercase tracking-widest">
                  Award List Preview
                </h3>
              </div>

              <div className="p-5">
                {awardList.length === 0 ? (
                  <p className="text-center text-slate-400 py-10 text-sm">
                    No eligible graduates found.
                  </p>
                ) : (
                  Object.entries(grouped || {}).map(([cls, students]) => (
                    <ClassGroup
                      key={cls}
                      classification={cls}
                      students={students}
                    />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
