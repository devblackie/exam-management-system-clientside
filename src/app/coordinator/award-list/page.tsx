// clientside/src/app/coordinator/award-list/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import {GraduationCap, Spotlight, Loader2, Trophy, Users, ChevronDown, ChevronRight, Filter, Fingerprint, ShieldAlert } from "lucide-react";
import { getPrograms } from "@/api/programsApi";
import { getAcademicYears } from "@/api/academicYearsApi";
import { useToast } from "@/context/ToastContext";
import PageHeader from "@/components/ui/PageHeader";
import type { Program, AcademicYear, AwardListEntry } from "@/api/types";
import { downloadAwardListDoc, getAwardList } from "@/api/awardListApi";


const CLASS_ORDER = [
  "FIRST CLASS HONOURS",
  "SECOND CLASS HONOURS (UPPER DIVISION)",
  "SECOND CLASS HONOURS (LOWER DIVISION)",
  "PASS",
];

const CLASS_STYLES: Record<string, { badge: string; row: string }> = {
  "FIRST CLASS HONOURS": { badge: "text-yellow-800", row: "border-l-1 border-yellow-50" },
  "SECOND CLASS HONOURS (UPPER DIVISION)": { badge: "text-blue-800", row: "border-l-1 border-blue-50" },
  "SECOND CLASS HONOURS (LOWER DIVISION)": { badge: "text-slate-700", row: "border-l-1 border-slate-50" },
  PASS: { badge: "text-emerald-800", row: "border-l-1 border-emerald-50" },
};

function ClassGroup({ classification, students }: {
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
          {open ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${styles.badge}`}>
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
              <span className="text-[10px] font-mono text-slate-300 w-6">{i + 1}</span>
              <span className="text-[11px] font-mono text-slate-500 w-40 shrink-0">{s.regNo}</span>
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

export default function AwardListPage() {
  const { addToast } = useToast();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");

  const [awardList, setAwardList] = useState<AwardListEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<"simple" | "classified" | null>(null);

  // Load metadata
  useEffect(() => {
    Promise.all([getPrograms(), getAcademicYears()])
      .then(([p, y]) => {
        setPrograms(p);
        setAcademicYears(y);
      })
      .catch(() => addToast("Failed to load metadata", "error"));
  }, [addToast]);

  const fetchAwardList = useCallback(async () => {
    if (!selectedProgramId) {
      addToast("Please select a program", "warning");
      return;
    }
    setLoading(true);
    setAwardList(null);
    try {
      const res = await getAwardList(selectedProgramId, selectedAcademicYear || undefined);
      setAwardList(res.data);
      if (res.count === 0) addToast("No eligible graduates found for this selection.", "warning");
    } catch {
      addToast("Failed to load award list", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedProgramId, selectedAcademicYear, addToast]);

  const handleDownload = async (variant: "simple" | "classified") => {
    if (!selectedProgramId) {
      addToast("Please select a program", "warning");
      return;
    }
    setDownloading(variant);
    try {
      const prog = programs.find((p) => p._id === selectedProgramId);
      await downloadAwardListDoc(
        selectedProgramId,
        variant,
        selectedAcademicYear || undefined,
        prog?.code
      );
      const label = variant === "classified" ? "Classified" : "Simple";
      addToast(`${label} Award List downloaded successfully.`, "success");
    } catch {
      addToast("Download failed. Please try again.", "error");
    } finally {
      setDownloading(null);
    }
  };

  const grouped = awardList
    ? CLASS_ORDER.reduce((acc, cls) => {
        const g = awardList.filter((s) => s.classification === cls);
        if (g.length) acc[cls] = g;
        return acc;
      }, {} as Record<string, AwardListEntry[]>)
    : null;

  const summary = CLASS_ORDER.map((cls) => ({
    cls,
    count: awardList?.filter((s) => s.classification === cls).length || 0,
  })).filter((s) => s.count > 0);

  return (
    <div className=" ml-40 my-10 animate-in fade-in duration-700">
      <div className="bg-[#F8F9FA] min-h-screen rounded-lg shadow-2xl p-10">

        <PageHeader
          title="Graduation"
          highlightedTitle="Award List"
          systemLabel="Board of Examiners"
        />       

        {/* SEARCH / FILTER AREA */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-2">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Fingerprint size={14} className="text-yellow-gold" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-darkest/40">
                AWARD LIST FILTER
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
            </div>           

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 block mb-1">
                  PROGRAMME
                </label>
                <select
                  className="w-full bg-white border-0 shadow-md rounded-lg py-3 px-4 text-xs font-medium text-green-darkest outline-none focus:ring-1 focus:ring-yellow-gold/30"
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                >
                  <option value="">Select Programme...</option>
                  {programs.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 block mb-1">
                  ACADEMIC YEAR
                </label>
                <select
                  className="w-full bg-white border-0 shadow-md rounded-lg py-3 px-4 text-xs font-medium text-green-darkest outline-none focus:ring-1 focus:ring-yellow-gold/30"
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
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Filter size={16} />}
                  {loading ? "LOADING..." : "GENERATE PREVIEW"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* EXECUTIVE DATA RIBBON */}
        {awardList && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6 px-2">
             <Spotlight size={18} className="text-yellow-gold" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
                GRADUATION SUMMARY
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Eligible Graduates",
                  val: awardList.length,
                  color: "text-green-darkest",
                },
                ...summary.map((item, idx) => ({
                  label: item.cls.replace("SECOND CLASS HONOURS", "2ND CLASS HONOURS"),
                  val: item.count,
                  color: idx === 0 ? "text-yellow-gold" : "text-emerald-600",
                })),
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="flex-1 px-10 relative group border-r border-green-darkest/[0.06] last:border-r-0"
                >
                  <div className="relative">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-green-darkest/20 group-hover:text-yellow-gold transition-all duration-500 transform group-hover:-translate-y-1">
                        {/* {stat.icon} */}
                      </div>
                      <span className="text-[9px] font-mono text-slate-300 group-hover:text-green-darkest transition-colors">
                        0{index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {stat.label}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-light text-green-darkest tracking-tighter group-hover:tracking-normal transition-all duration-500">
                        {stat.val}
                      </span>
                    </div>

                    <div className="mt-6 w-0 group-hover:w-full h-[2px] bg-yellow-gold transition-all duration-700 ease-in-out" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        {awardList && (
          <>
            {/* Download Buttons */}
            <div className="flex justify-end gap-4 mb-8 px-2">
              <button
                onClick={() => handleDownload("simple")}
                disabled={downloading !== null || awardList.length === 0}
                className="flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 text-green-darkest font-black text-[10px] uppercase tracking-widest rounded-lg hover:border-green-darkest hover:shadow-md transition-all disabled:opacity-40"
              >
                {downloading === "simple" ? <Loader2 size={14} className="animate-spin" /> : <Users size={14} />}
                DOWNLOAD SIMPLE LIST
              </button>

              <button
                onClick={() => handleDownload("classified")}
                disabled={downloading !== null || awardList.length === 0}
                className="flex items-center gap-2 px-8 py-3 bg-green-darkest text-yellow-gold font-black text-[10px] uppercase tracking-widest rounded-lg hover:shadow-xl transition-all disabled:opacity-40"
              >
                {downloading === "classified" ? <Loader2 size={14} className="animate-spin" /> : <Trophy size={14} />}
                DOWNLOAD CLASSIFIED LIST
              </button>
            </div>

            {/* Preview Console */}
            <div className="flex items-center gap-4 mb-6 px-2">
                  <GraduationCap size={18} className="text-yellow-gold" />

              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
                AWARD LIST PREVIEW
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-gold/10 to-green-darkest/5 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
              <div className="relative bg-white border border-green-darkest/5 rounded-xl shadow-sm overflow-hidden">
               
                <div className="p-6">
                  {awardList.length === 0 ? (
                    <p className="text-center text-slate-400 py-16 text-sm">
                      No eligible graduates found for the selected criteria.
                    </p>
                  ) : (
                    Object.entries(grouped || {}).map(([cls, students]) => (
                      <ClassGroup key={cls} classification={cls} students={students} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-12 flex items-center justify-center gap-2 text-green-darkest">
          <ShieldAlert size={12} /> {/* You'll need to import ShieldAlert if you want this */}
          <p className="text-[9px] font-black uppercase tracking-[0.2em]">
            OFFICIAL GRADUATION AWARD REGISTER — CONFIDENTIAL
          </p>
        </div>
      </div>
    </div>
  );
}


