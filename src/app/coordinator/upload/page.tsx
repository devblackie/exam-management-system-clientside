// clientside/src/app/coordinator/upload/page.tsx
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { uploadMarks, downloadTemplate } from "@/api/marksApi";
import api from "@/config/axiosInstance";
import { useToast } from "@/context/ToastContext";
import { branding } from "@/config/branding";
import { getPrograms } from "@/api/programsApi";
import { getAcademicYears } from "@/api/academicYearsApi";
import { getProgramUnits } from "@/api/programUnitsApi";
import type { Program, AcademicYear, ProgramUnit } from "@/api/types";
import {
  CloudCheck, FileDown, UploadCloud, Loader2, CheckCircle2, AlertTriangle, Cpu,
  Database, ChevronDown, ChevronRight, BarChart3, FileSpreadsheet, BookOpen, FileText,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";

interface UploadResult { message: string; total: number; success: number; errors: string[] }

interface MarkEntry {
  _id: string; source: "detailed" | "direct"; regNo: string; studentName: string; unitCode: string;
  unitName: string; programName: string; programCode: string; agreedMark: number;
  attempt: string; isSpecial: boolean; academicYear: string; session: string; uploadedAt: string;
}

interface StatsResponse {
  summary: { totalRecords: number; detailed: number; direct: number; academicYears: string[] };
  grouped: Record<string, Record< string, Record<string, { programName: string; entries: MarkEntry[] }>>>;
}

const YEARS_OF_STUDY = [1, 2, 3, 4, 5];
const SEMESTERS = [1, 2];

const SessionBadge = ({ session }: { session: string }) => {
  const styles: Record<string, string> = { ORDINARY: "text-blue-700 ", SUPPLEMENTARY: "text-amber-700 ", CLOSED: "text-slate-500 " };
  return (
    <span
      className={`text-[9px] font-black px-2 py-0.5  uppercase tracking-widest ${styles[session] ?? styles.CLOSED}`}
    >
      {session}
    </span>
  );
};

const CollapsibleGroup = ({ title, badge, count, children, defaultOpen = false}: {
  title: React.ReactNode; badge?: React.ReactNode; count: number; children: React.ReactNode; defaultOpen?: boolean; }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDown size={14} className="text-slate-400" />
          ) : (
            <ChevronRight size={14} className="text-slate-400" />
          )}
          <span className="text-[11px] font-black text-green-darkest uppercase tracking-tight">
            {title}
          </span>
          {badge}
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {count.toLocaleString()} record{count !== 1 ? "s" : ""}
        </span>
      </button>
      {open && <div className="border-t border-slate-100">{children}</div>}
    </div>
  );
};

// ─── Derive a "filename" from an entry group ──────────────────────────────────
// The backend returns entries grouped by program. Each group represents
// marks for one unit uploaded at a specific time. We synthesise a display
// name from unitCode + uploadedAt date.
const deriveUploadBatches = (entries: MarkEntry[]) => {
  // Group by unitCode + date (YYYY-MM-DD) — each unique combo is one "file"
  const batchMap = new Map<string, {unitCode: string; unitName: string; source: string; date: string; count: number; attempt: string;}>();

  for (const e of entries) {
    const date = new Date(e.uploadedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const key = `${e.unitCode}|${date}|${e.attempt}`;
    if (!batchMap.has(key)) {
      batchMap.set(key, { unitCode: e.unitCode, unitName: e.unitName, source: e.source, date, count: 0, attempt: e.attempt});
    }
    batchMap.get(key)!.count++;
  }

  return Array.from(batchMap.values()).sort((a, b) => b.date.localeCompare(a.date));
};

export default function UploadMarks() {
  const { addToast } = useToast();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [programUnits, setProgramUnits] = useState<ProgramUnit[]>([]);

  const [isTemplateDownloading, setIsTemplateDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
  const [selectedYearOfStudy, setSelectedYearOfStudy] = useState<number | undefined>();
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>();
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [unitType, setUnitType] = useState<"theory" | "lab" | "workshop">("theory");
  const [examMode, setExamMode] = useState<"standard" | "mandatory_q1">("standard");
  const [templateMode, setTemplateMode] = useState<"detailed" | "direct">("direct");

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading2] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"upload" | "records">("upload");

  // ── Data loading ───────────────────────────────────────────────────────────
  useEffect(() => {
    getPrograms()
      .then(setPrograms)
      .catch(() => addToast("Failed to load programs.", "error"));
    getAcademicYears()
      .then(setAcademicYears)
      .catch(() => addToast("Failed to load academic years.", "error"));
  }, [addToast]);

  useEffect(() => {
    if (selectedProgramId)
      getProgramUnits(selectedProgramId)
        .then(setProgramUnits)
        .catch(() => addToast("Failed to load units.", "error"));
    else setProgramUnits([]);
    setSelectedUnitId("");
  }, [selectedProgramId, addToast]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await api.get<StatsResponse>("/marks/upload-stats");
      setStats(res.data);
    } catch {
      addToast("Failed to load upload records.", "error");
    } finally {
      setStatsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filteredProgramUnits = useMemo(() => {
    if (!selectedYearOfStudy || !selectedSemester) return programUnits;
    return programUnits.filter((pu) => pu.requiredYear === selectedYearOfStudy && pu.requiredSemester === selectedSemester);
  }, [programUnits, selectedYearOfStudy, selectedSemester]);

  const isUnitUnlocked = !!selectedProgramId && !!selectedYearOfStudy && !!selectedSemester;
  const isDownloadEnabled = !!selectedProgramId && !!selectedUnitId && !!selectedAcademicYearId && !!selectedYearOfStudy && !!selectedSemester;

  const inputClass =
    "w-full p-3 bg-white border border-slate-200 text-green-darkest font-semibold text-xs rounded-lg transition-all outline-none appearance-none";
  const disabledStyles =
    "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60";

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDownloadTemplate = async () => {
    if (!isDownloadEnabled || isTemplateDownloading) return;
    setIsTemplateDownloading(true);
    try {
      await downloadTemplate( selectedProgramId, selectedUnitId, selectedAcademicYearId, selectedYearOfStudy!, selectedSemester!, examMode, unitType, templateMode );
      addToast(`${templateMode === "direct" ? "Direct Entry" : "Detailed"} template generated.`, "success");
    } catch (err: unknown) {
      addToast( err instanceof Error ? err.message : "Template generation failed.", "error");
    } finally {
      setIsTemplateDownloading(false);
    }
  };

  const handleFile = (f: File) => {
    if (f.name.match(/\.(csv|xlsx|xls)$/i)) { setFile(f); setResult(null); } 
    else addToast("Invalid file format. Use .xlsx or .csv", "error");
  };

  const handleUpload = async () => {
    if (!file || isUploading) return;
    setIsUploading(true);
    setUploading2(true);
    setUploadProgress("Uploading...");
    try {
      const data = await uploadMarks(file);
      setResult(data);
      addToast(
        data.success === data.total ? "Upload complete." : "Upload processed with remarks.",
        data.success === data.total ? "success" : "warning",
      );
      await loadStats();
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Upload failed.", "error");
    } finally {
      setIsUploading(false);
      setUploading2(false);
      setUploadProgress(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="ml-48 my-10 min-h-screen bg-[#F8F9FA] overflow-hidden">
      {/* Loading overlay */}
      {(uploading || isTemplateDownloading) && (
        <div className="fixed inset-0 bg-green-darkest/30 backdrop-blur-sm z-[200] flex items-center justify-center">
          <div className="bg-white rounded-2xl px-10 py-8 shadow-2xl flex items-center gap-6">
            <Loader2 size={24} className="animate-spin text-green-darkest" />
            <div>
              <p className="text-xs font-black text-green-darkest uppercase tracking-widest">
                {uploading ? "Processing Upload" : "Generating Template"}
              </p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">
                {uploadProgress || "Please wait — do not close this window"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#F8F9FA] min-h-screen rounded-lg shadow-2xl p-9 border border-white">
        <PageHeader
          title="Upload"
          highlightedTitle="Student Marks"
          systemLabel=""
          subtitle={`Select the Academic Context and download the official ${branding.school} scoresheet template.`}
        />

        {/* Tab switcher */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-8 max-w-sm">
          {(["upload", "records"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? "bg-green-darkest text-yellow-gold shadow-md" : "text-slate-400 hover:text-green-darkest"
              }`}
            >
              {tab === "upload" ? (
                <>
                  <UploadCloud size={14} /> Upload
                </>
              ) : (
                <>
                  <BarChart3 size={14} /> Records
                  {stats && (
                    <span className="ml-1 bg-yellow-gold text-green-darkest text-[8px] font-black px-1.5 py-0.5 rounded-full">
                      {stats.summary.totalRecords}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        {/* ════ TAB 1: UPLOAD ════ */}
        {activeTab === "upload" && (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4 px-2">
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
                  01. Define Academic Context
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-6 bg-white p-8 rounded-lg border border-green-darkest/5 shadow-sm">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    Program
                  </label>
                  <select
                    className={inputClass}
                    value={selectedProgramId}
                    onChange={(e) => setSelectedProgramId(e.target.value)}
                  >
                    <option value="">Select Program</option>
                    {programs.map((p) => ( <option key={p._id} value={p._id}> {p.code} — {p.name} </option> ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    Academic Year
                  </label>
                  <select
                    className={inputClass}
                    value={selectedAcademicYearId}
                    onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                  >
                    <option value="">Academic Year...</option>
                    {academicYears.map((y) => ( <option key={y._id} value={y._id}> {y.year} {y.isCurrent ? "(Current)" : ""} </option> ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    Year of Study
                  </label>
                  <select
                    className={inputClass}
                    value={selectedYearOfStudy || ""}
                    onChange={(e) => setSelectedYearOfStudy(parseInt(e.target.value))}
                  >
                    <option value="">Year of Study...</option>
                    {YEARS_OF_STUDY.map((y) => ( <option key={y} value={y}> Year {y} </option> ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    Semester
                  </label>
                  <select
                    className={inputClass}
                    value={selectedSemester || ""}
                    onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                  >
                    <option value="">Semester...</option>
                    {SEMESTERS.map((s) => ( <option key={s} value={s}> Semester {s} </option> ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    Complexity
                  </label>
                  <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                    {(["detailed", "direct"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setTemplateMode(mode)}
                        className={`flex-1 py-2 rounded-md text-[10px] font-black transition-all ${
                          templateMode === mode ? "bg-green-darkest text-yellow-gold shadow-md" : "text-slate-400 hover:text-green-darkest"
                        }`}
                      >
                        {mode.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 relative">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">
                    Unit Module
                  </label>
                  <select
                    className={`${inputClass} ${!isUnitUnlocked ? disabledStyles : ""}`}
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    disabled={!isUnitUnlocked}
                  >
                    <option value="">
                      {isUnitUnlocked ? "Choose Unit..." : "Select Context First..."}
                    </option>
                    {filteredProgramUnits.map((pu) => (
                      <option key={pu._id} value={pu.unit._id}>
                        {pu.unit.code}: {pu.unit.name}
                      </option>
                    ))}
                  </select>
                </div>

                {templateMode === "detailed" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">
                        Unit Type
                      </label>
                      <select
                        className={inputClass}
                        value={unitType}
                        onChange={(e) => setUnitType(e.target.value as "theory" | "lab" | "workshop")}
                      >
                        <option value="theory">Theory (20/10)</option>
                        <option value="lab">Lab (15/5/10)</option>
                        <option value="workshop">Workshop (40/60)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">
                        Exam Format
                      </label>
                      <select
                        className={inputClass}
                        value={examMode}
                        onChange={(e) => setExamMode(e.target.value as "standard" | "mandatory_q1")}
                      >
                        <option value="standard">Standard Grading</option>
                        <option value="mandatory_q1">Compulsory Q1</option>
                      </select>
                    </div>
                  </>
                )}

                {templateMode === "direct" && (
                  <div className="col-span-2 flex items-center px-4">
                    <p className="text-[10px] text-slate-400 italic">
                      * Direct mode imports final CA (30) and Exam (70) totals
                      directly.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-10">
              <div className="col-span-12 lg:col-span-4">
                <div className="bg-white border border-green-darkest/5 rounded-lg p-8 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-green-darkest uppercase tracking-tight mb-2">
                      Protocol Template
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                      Download the pre-formatted scoresheet. System validation
                      requires this exact structure.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadTemplate}
                    disabled={!isDownloadEnabled || uploading || isTemplateDownloading}
                    className="mt-8 w-full py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-green-darkest font-black text-[11px] uppercase tracking-widest hover:bg-yellow-gold hover:border-yellow-gold transition-all disabled:opacity-30"
                  >
                    {isTemplateDownloading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />{" "}
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileDown size={18} /> Generate Scoresheet
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-8">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files[0])
                      handleFile(e.dataTransfer.files[0]);
                  }}
                  className={`relative border-2 border-dashed rounded-lg p-12 transition-all duration-500 flex flex-col items-center justify-center min-h-[300px] ${
                    dragActive ? "border-yellow-gold bg-yellow-gold/5 scale-[1.01]" : "border-slate-200 bg-white" }`}
                >
                  {!file ? (
                    <>
                      <div className="h-16 w-16 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 mb-6">
                        <UploadCloud size={32} />
                      </div>
                      <p className="text-[11px] font-black text-green-darkest uppercase tracking-[0.3em] mb-4">
                        Awaiting Document Upload
                      </p>
                      <label className="px-8 py-3 bg-green-darkest text-yellow-gold font-black text-[10px] uppercase tracking-widest rounded-lg cursor-pointer hover:shadow-xl transition-all">
                        Browse Files
                        <input
                          type="file"
                          accept=".csv,.xlsx"
                          disabled={uploading || isTemplateDownloading}
                          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </>
                  ) : (
                    <div className="text-center animate-in fade-in zoom-in duration-300">
                      <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
                        <Database size={32} />
                      </div>
                      <p className="text-sm font-black text-green-darkest mb-1">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mb-8 uppercase">
                        {(file.size / 1024).toFixed(1)} KB — Ready for
                        Processing
                      </p>
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={() => setFile(null)}
                          className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition"
                        >
                          Remove
                        </button>
                        <button
                          onClick={handleUpload}
                          disabled={uploading}
                          className="px-8 py-3 bg-green-darkest text-yellow-gold font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center gap-3 shadow-2xl disabled:opacity-50"
                        >
                          {uploading ? ( <Cpu className="animate-spin" size={14} /> ) : ( <CloudCheck size={16} /> )}
                          {uploading ? "Processing..." : "Process Results"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {result && (
              <div className="mt-12 animate-in slide-in-from-bottom-6 duration-700">
                <div className="flex items-center gap-4 mb-6 px-2">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
                    03. Ingestion Summary
                  </h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
                </div>
                <div
                  className={`p-1 bg-white border rounded-lg overflow-hidden ${result.success === result.total ? "border-emerald-500/20" : "border-yellow-gold/20"}`}
                >
                  <div className="flex items-center p-4 gap-10">
                    <div
                      className={`h-12 w-12 rounded-lg flex items-center justify-center ${result.success === result.total ? "bg-emerald-50 text-emerald-600" : "bg-yellow-50 text-yellow-600"}`}
                    >
                      {result.success === result.total ? ( <CheckCircle2 size={24} /> ) : ( <AlertTriangle size={24} /> )}
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-8">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Status
                        </p>
                        <p className="text-sm font-black text-green-darkest uppercase">
                          {result.success === result.total ? "Success" : "Partial"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Records
                        </p>
                        <p className="text-xl font-black text-green-darkest">
                          {result.success}{" "}
                          <span className="text-slate-500">
                            / {result.total}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Integrity
                        </p>
                        <p className="text-xl font-black text-emerald-600">
                          {((result.success / result.total) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                  {result.errors.length > 0 && (
                    <div className="border-t border-slate-100 p-8 bg-slate-50/50">
                      <p className="text-[10px] font-black text-red-500 tracking-[0.3em] mb-4">
                        Conflict Log ({result.errors.length} error
                        {result.errors.length !== 1 ? "s" : ""})
                      </p>
                      <div className="space-y-2">
                        {result.errors.map((error, i) => (
                          <div
                            key={i}
                            className="flex gap-3 text-xs font-medium text-slate-600 bg-white p-3 rounded-lg border border-slate-100 shadow-sm"
                          >
                            <span className="text-red-400">•</span> {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ════ TAB 2: RECORDS ════ */}
        {activeTab === "records" && (
          <div className="animate-in fade-in duration-300">
            {statsLoading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  Loading records...
                </span>
              </div>
            ) : !stats ? (
              <p className="text-center text-slate-400 py-20 text-sm">
                No records found.
              </p>
            ) : (
              <>
                {/* Summary ribbon */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    {
                      label: "Total Records",
                      value: stats.summary.totalRecords,
                      icon: <BarChart3 size={20} />,
                      color: "bg-green-darkest text-yellow-gold",
                    },
                    {
                      label: "Detailed Sheets",
                      value: stats.summary.detailed,
                      icon: <FileSpreadsheet size={20} />,
                      color: "bg-blue-600 text-white",
                    },
                    {
                      label: "Direct Entry",
                      value: stats.summary.direct,
                      icon: <BookOpen size={20} />,
                      color: "bg-purple-600 text-white",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      // className="bg-white border border-slate-100 rounded-lg p-5 flex items-center gap-4 shadow-sm"
                      className="flex-1 px-10 relative group border-r border-green-darkest/[0.06] last:border-r-0"
                    >
                      <div className="relative ">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="text-green-darkest/20 group-hover:text-yellow-gold transition-all duration-500 transform group-hover:-translate-y-1">
                            {s.icon}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            {s.label}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-light text-green-darkest tracking-tighter group-hover:tracking-normal transition-all duration-500">
                            {s.value.toLocaleString()}
                          </span>
                        </div>

                        <div className="mt-6 w-0 group-hover:w-full h-[2px] bg-yellow-gold transition-all duration-700 ease-in-out" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mb-4">
                  <button
                    onClick={loadStats}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-green-darkest transition-colors flex items-center gap-2"
                  >
                    <Loader2
                      size={12}
                      className={statsLoading ? "animate-spin" : ""}
                    />
                    Refresh
                  </button>
                </div>

                {/* Grouped: Year → Session → Program → Files */}
                <div className="space-y-4">
                  {stats.summary.academicYears.length === 0 && (
                    <p className="text-center text-slate-400 py-10 text-sm">
                      No mark records uploaded yet.
                    </p>
                  )}

                  {stats.summary.academicYears.map((yr) => {
                    const yearData = stats.grouped[yr];
                    const yearCount = Object.values(yearData).flatMap((s) => Object.values(s).flatMap((p) => p.entries)).length;

                    return (
                      <CollapsibleGroup
                        key={yr}
                        title={yr}
                        count={yearCount}
                        defaultOpen={yr === stats.summary.academicYears[0]}
                      >
                        <div className="p-3 space-y-3 bg-slate-50/50">
                          {Object.entries(yearData).map(
                            ([session, programs]) => { const sessCount = Object.values(programs).flatMap((p) => p.entries).length;
                              return (
                                <CollapsibleGroup key={session} title={session} badge={<SessionBadge session={session} />} count={sessCount} defaultOpen >
                                  <div className="p-3 space-y-3">
                                    {Object.entries(programs).map(
                                      ([progCode, { programName, entries }]) => {
                                        const batches = deriveUploadBatches(entries);
                                        return (
                                          <CollapsibleGroup key={progCode} title={`${progCode} — ${programName}`} count={entries.length} >
                                            {/* Show files (batches) not individual student rows */}
                                            <div className="divide-y divide-slate-50">
                                              {batches.map((batch, bi) => (
                                                <div
                                                  key={bi}
                                                  className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50/80 transition-colors"
                                                >
                                                  <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <FileText
                                                      size={16}
                                                      className="text-slate-500"
                                                    />
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-black text-green-darkest truncate">
                                                      Scoresheet_
                                                      {batch.unitCode}_
                                                      {yr.replace("/", "-")}
                                                      .xlsx
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 font-mono">
                                                      {batch.unitCode} ·{" "}
                                                      {batch.unitName}
                                                      {batch.attempt !==
                                                        "1st" && (
                                                        <span className="ml-2 uppercase font-bold text-purple-600">
                                                          · {batch.attempt}
                                                        </span>
                                                      )}
                                                    </p>
                                                  </div>
                                                  <div className="flex items-center gap-3 flex-shrink-0">
                                                    <span
                                                      className={`text-[9px] font-black px-2 py-0.5  uppercase ${
                                                        batch.source === "direct" ? " text-yellow-gold " : " text-amber-600 " }`}
                                                    >
                                                      {batch.source}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400 font-mono">
                                                      {batch.count} rows
                                                    </span>
                                                    <span className="text-[9px] text-slate-300 font-mono">
                                                      {batch.date}
                                                    </span>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </CollapsibleGroup>
                                        );
                                      },
                                    )}
                                  </div>
                                </CollapsibleGroup>
                              );
                            },
                          )}
                        </div>
                      </CollapsibleGroup>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
