// clientside/src/app/coordinator/students/page.tsx
"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import * as xlsxParser from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageHeader     from "@/components/ui/PageHeader";
import { useToast }   from "@/context/ToastContext";

// ── API & hooks ───────────────────────────────────────────────────────────────
import { downloadStudentRegistrationTemplate, bulkRegisterStudents } from "@/api/studentsApi";
import { getPrograms }       from "@/api/programsApi";
import { getAcademicYears }  from "@/api/academicYearsApi";
import { useInstitutionSettings } from "@/hooks/queries/useInstitutionSettings";
import { useStudentStats, useUploadStudentExcel } from "@/hooks/queries/useStudents";
import type { RegNoPattern, School, Department } from "@/api/types";
import type { Program, AcademicYear, StudentFormRow, IntakeType } from "@/api/types";
import api from "@/config/axiosInstance";

// ── Sub-components ────────────────────────────────────────────────────────────
import StudentDropZone   from "@/components/coordinator/Students/StudentDropZone";
import StudentPreviewTable, {
  type ParsedStudentRow,
} from "@/components/coordinator/Students/StudentPreviewTable";
import StudentResultsPanel from "@/components/coordinator/Students/StudentResultsPanel";

// ── Icons ─────────────────────────────────────────────────────────────────────
import {
  UploadCloud, FileDown, ClipboardCheck, Plus, Trash2,
  AlertCircle,  Zap, ChevronRight,
  CheckCircle2, Loader2, Users, RefreshCcw,
  FileSpreadsheet, TableProperties,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface UploadResult {
  message:    string;
  registered: string[];
  duplicates: string[];
  errors:     string[];
  skipped:    number;
}

type Tab    = "excel" | "manual";
type Stage  = "setup" | "drop" | "preview" | "done";

// ── Reg-no helpers ────────────────────────────────────────────────────────────
function patternToRegex(p: RegNoPattern): RegExp | null {
  if (p.manualRegex?.trim()) {
    try { return new RegExp(p.manualRegex.trim(), "i"); }
    catch { return null; }
  }
  if (!p.prefix) return null;
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sep = p.separator ? esc(p.separator) : "";
  const yr  = `\\d{${p.yearDigits ?? 3}}`;
  return new RegExp(`^${esc(p.prefix)}${sep}${yr}${sep}\\d+`, "i");
}

// ── Parse Excel in-browser ────────────────────────────────────────────────────
function parseExcelBuffer(buffer: ArrayBuffer): {
  rows:      ParsedStudentRow[];
  headerRow: number;
} {
  const wb      = xlsxParser.read(buffer, { type: "array" });
  const sheet   = wb.Sheets[wb.SheetNames[0]];
  const rawAll  = xlsxParser.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
  });

  let headerIndex = -1;
  for (let i = 0; i < rawAll.length; i++) {
    const row  = rawAll[i] as string[];
    const cell = (row[0] ?? "").toString().toLowerCase().trim();
    if (cell === "reg no" || cell === "reg. no." || cell === "regno") {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) return { rows: [], headerRow: -1 };

  const dataRows = (rawAll.slice(headerIndex + 1) as string[][]).filter(r =>
    r.some(c => String(c ?? "").trim() !== ""),
  );

  const rows: ParsedStudentRow[] = dataRows.map((row, i) => {
    const regNo  = String(row[0] ?? "").trim().toUpperCase();
    const name   = String(row[1] ?? "").trim();
    const prog   = String(row[2] ?? "").trim();
    const yr     = parseInt(String(row[3] ?? "1")) || 1;
    const intake = String(row[4] ?? "SEPT").trim().toUpperCase();

    let error: string | undefined;
    if (!regNo)  error = "Missing Reg No";
    else if (!name)  error = "Missing Name";
    else if (!prog)  error = "Missing Program";

    return {
      rowNum:  headerIndex + i + 2,
      regNo,
      name,
      program: prog,
      year:    yr,
      intake:  ["JAN","MAY","SEPT"].includes(intake) ? intake : "SEPT",
      error,
    };
  });

  return { rows, headerRow: headerIndex };
}

// ── Step badge ────────────────────────────────────────────────────────────────
function StepBadge({
  n, active, done,
}: { n: number; active: boolean; done: boolean }) {
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 ${
      done  ? "bg-emerald-500 text-white"
             : active ? "bg-green-darkest text-yellow-gold" : "bg-slate-100 text-slate-400"
    }`}>
      {done ? <CheckCircle2 size={13} /> : n}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function StudentRegistrationPage() {
  const { addToast }       = useToast();
  const { data: settings } = useInstitutionSettings();

  // ── Coordinator scope ──────────────────────────────────────────────────────
  const [myDeptCode,   setMyDeptCode]   = useState<string | null>(null);
  const [mySchoolCode, setMySchoolCode] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ schoolCode?: string; departmentCode?: string; institutionWide?: boolean }>("/auth/me")
      .then(r => {
        setMySchoolCode(r.data.schoolCode  ?? null);
        setMyDeptCode(r.data.departmentCode ?? null);
      })
      .catch(() => {});
  }, []);

  // ── Reg-no validation (shared by both tabs) ───────────────────────────────
  const deptPatterns = useCallback((): RegNoPattern[] => {
    if (!mySchoolCode || !myDeptCode || !settings?.schools) return [];
    const school = settings.schools.find(
      (s: School) => s.code === mySchoolCode.toUpperCase(),
    );
    if (!school) return [];
    const dept = school.departments?.find(
      (d: Department) => d.code === myDeptCode.toUpperCase(),
    );
    return dept?.regNoPatterns ?? [];
  }, [mySchoolCode, myDeptCode, settings]);

  const validateRegNo = useCallback((regNo: string): string | null => {
    if (!regNo.trim()) return null;
    const patterns = deptPatterns();
    if (patterns.length === 0)          return null;
    if (!settings?.enforceRegNoPattern) return null;
    const upper = regNo.trim().toUpperCase();
    for (const p of patterns) {
      const regex = patternToRegex(p);
      if (regex && regex.test(upper)) return null;
    }
    const examples = patterns.map(p => p.example).filter(Boolean).join("  or  ");
    return `Invalid reg no for ${myDeptCode}. Expected: ${examples || "check settings"}`;
  }, [deptPatterns, settings, myDeptCode]);

  // ── Tab ────────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>("excel");

  // ══════════════════════════════════════════════════════════════════════════
  // EXCEL UPLOAD TAB STATE
  // ══════════════════════════════════════════════════════════════════════════
  const [programs,       setPrograms]       = useState<Program[]>([]);
  const [academicYears,  setAcademicYears]  = useState<AcademicYear[]>([]);
  const [selectedProgId, setSelectedProgId] = useState("");
  const [selectedYearId, setSelectedYearId] = useState("");
  const [isDownloading,  setIsDownloading]  = useState(false);

  // File / parse / result
  const [file,       setFile]       = useState<File | null>(null);
  const [parsing,    setParsing]    = useState(false);
  const [parseError, setParseError] = useState("");
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadPct,    setUploadPct]    = useState(0);

  const uploadMutation = useUploadStudentExcel();

  const excelStage: Stage = useMemo(() => {
    if (uploadResult)      return "done";
    if (parsedRows.length) return "preview";
    if (file)              return "drop";
    return "setup";
  }, [uploadResult, parsedRows, file]);

  // Load selectors on mount
  useEffect(() => {
    Promise.all([getPrograms(), getAcademicYears()])
      .then(([progs, years]) => {
        setPrograms(progs);
        setAcademicYears(years);
        const cur = years.find((y: AcademicYear) => y.isCurrent || y.isActive);
        if (cur) setSelectedYearId(cur._id);
        else if (years.length) setSelectedYearId(years[0]._id);
        if (progs.length) setSelectedProgId(progs[0]._id);
      })
      .catch(() => addToast("Failed to load setup data", "error"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setParsing(true);
    setParseError("");
    setParsedRows([]);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const { rows, headerRow } = parseExcelBuffer(
          e.target!.result as ArrayBuffer,
        );
        if (headerRow === -1) {
          setParseError(
            "Header row not found. Make sure column A header is 'Reg No'.",
          );
        } else if (rows.length === 0) {
          setParseError("No student data found below the header row.");
        } else {
          setParsedRows(rows);
        }
      } catch {
        setParseError("Could not read this file. Use a valid .xlsx or .csv.");
      } finally {
        setParsing(false);
      }
    };
    reader.onerror = () => {
      setParseError("File reading failed.");
      setParsing(false);
    };
    reader.readAsArrayBuffer(f);
  }, []);

  const handleClearExcel = useCallback(() => {
    setFile(null);
    setParsedRows([]);
    setParseError("");
    setUploadResult(null);
    setUploadPct(0);
    setParsing(false);
  }, []);

  const handleRemoveRow = useCallback((index: number) => {
    setParsedRows(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleExcelUpload = async () => {
    if (!file || uploadMutation.isPending) return;
    const validCount = parsedRows.filter(r => !r.error).length;
    if (validCount === 0) {
      addToast("No valid rows to submit.", "error");
      return;
    }
    setUploadPct(0);
    try {
      const res = await uploadMutation.mutateAsync({
        file,
        onProgress: pct => setUploadPct(pct),
      });
      setUploadResult(res);
      addToast(
        res.registered.length > 0
          ? `${res.registered.length} student(s) registered.`
          : "Upload complete.",
        res.errors.length > 0 ? "warning" : "success",
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Upload failed.";
      addToast(msg, "error");
    }
  };

  const handleDownloadTemplate = async () => {
    if (!selectedProgId || !selectedYearId) {
      addToast("Select a program and academic year first.", "warning");
      return;
    }
    setIsDownloading(true);
    try {
      await downloadStudentRegistrationTemplate(selectedProgId, selectedYearId);
      addToast("Template downloaded!", "success");
    } catch {
      addToast("Could not download template.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // MANUAL TAB STATE
  // ══════════════════════════════════════════════════════════════════════════
  const [manualStudents, setManualStudents] = useState<StudentFormRow[]>([
    { regNo: "", name: "", program: "", currentYearOfStudy: 1, intake: "SEPT" },
  ]);
  const [manualProgId,  setManualProgId]  = useState("");
  const [manualYearId,  setManualYearId]  = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  // Sync selectors to what excel tab loaded
  useEffect(() => {
    if (programs.length && !manualProgId) setManualProgId(programs[0]._id);
  }, [programs, manualProgId]);
  useEffect(() => {
    if (academicYears.length && !manualYearId)
      setManualYearId(academicYears[0]._id);
  }, [academicYears, manualYearId]);

  const duplicates = useMemo(() => {
    const seen = new Set<string>();
    const dups = new Set<string>();
    manualStudents.forEach(s => {
      const r = s.regNo.trim().toUpperCase();
      if (r) { if (seen.has(r)) dups.add(r); seen.add(r); }
    });
    return dups;
  }, [manualStudents]);

  const addManualRow = () =>
    setManualStudents(prev => [
      ...prev,
      { regNo: "", name: "", program: manualProgId, currentYearOfStudy: 1, intake: "SEPT" },
    ]);

  const updateManualStudent = (
    index: number,
    field: keyof StudentFormRow,
    value: string | number,
  ) => {
    setManualStudents(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeManualRow = (index: number) => {
    if (manualStudents.length === 1) {
      addToast("Cannot remove the last row.", "error");
      return;
    }
    setManualStudents(prev => prev.filter((_, i) => i !== index));
  };

  const handleManualPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    let raw = e.clipboardData.getData("text/plain");
    if (!raw.trim()) return;
    raw = raw.replace(/\r/g, "");

    const rows = raw
      .split("\n")
      .map(row =>
        row.split("\t").map(cell =>
          cell.replace(/["""'']/g, "").replace(/\u00A0/g, " ").trim(),
        ),
      );

    const dataRows = rows.filter(r => r.some(c => c !== ""));
    if (!dataRows.length) return;

    const firstCell = (dataRows[0][0] ?? "").toLowerCase();
    const hasHeader = /reg|no|registration|student|adm/.test(firstCell);
    const start     = hasHeader ? 1 : 0;

    const result: StudentFormRow[] = [];
    let rejected = 0;

    for (let i = start; i < dataRows.length; i++) {
      const r      = dataRows[i];
      const regNo  = (r[0] ?? "").toUpperCase();
      const name   = r[1] ?? "";
      const prog   = r[2] ?? "";
      if (!regNo || !name || !prog) continue;

      const err = validateRegNo(regNo);
      if (err) { rejected++; continue; }

      const rawIntake = (r[4] ?? "SEPT").toUpperCase();
      const intake: IntakeType = ["JAN","MAY","SEPT"].includes(rawIntake)
        ? (rawIntake as IntakeType)
        : "SEPT";

      const yr    = parseInt(r[3] ?? "1") || 1;
      result.push({ regNo, name, program: prog, currentYearOfStudy: yr, intake });
    }

    if (!result.length) {
      addToast("No valid rows. Check reg no format.", "warning");
      return;
    }
    setManualStudents(result);
    addToast(
      `Pasted ${result.length} student(s)${rejected ? ` — ${rejected} rejected` : ""}`,
      rejected ? "warning" : "success",
    );
  };

  const handleManualSubmit = async () => {
    if (!manualProgId)  { addToast("Academic Program required.", "error"); return; }
    if (!manualYearId)  { addToast("Academic Session required.", "error"); return; }

    const invalidRows = manualStudents
      .filter(s => s.regNo.trim())
      .map(s => ({ regNo: s.regNo, err: validateRegNo(s.regNo.trim().toUpperCase()) }))
      .filter(r => r.err !== null);

    if (invalidRows.length) {
      addToast(
        `${invalidRows.length} invalid reg no(s): ${invalidRows.slice(0, 3).map(r => r.regNo).join(", ")}…`,
        "error",
      );
      return;
    }

    const filled = manualStudents
      .filter(s => s.regNo.trim() && s.name.trim())
      .map(s => {
        const finalProgId = s.program || manualProgId;
        const progObj     = programs.find(p => p._id === finalProgId);
        return {
          regNo:              s.regNo.trim().toUpperCase(),
          name:               s.name.trim(),
          program:            finalProgId,
          currentYearOfStudy: Number(s.currentYearOfStudy) || 1,
          intake:             s.intake,
          academicYearId:     manualYearId,
          rawProgram:         progObj?.name ?? "",
        };
      });

    if (!filled.length) { addToast("Add at least one student.", "error"); return; }

    setManualLoading(true);
    try {
      const res = await bulkRegisterStudents({ students: filled });
      const registered = res.registered?.length ?? 0;
      if (registered > 0) addToast(`${registered} student(s) registered.`, "success");
      setManualStudents([
        { regNo: "", name: "", program: "", currentYearOfStudy: 1, intake: "SEPT" },
      ]);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string } } })?.response?.data;
      addToast(data?.message ?? "Failed to register students.", "error");
    } finally {
      setManualLoading(false);
    }
  };

  // ── Shared student list (for header stat) ─────────────────────────────────
  const { data: stats } = useStudentStats();

  // ── Shared style tokens ───────────────────────────────────────────────────
  const inpBase =
    "w-full bg-white border border-green-darkest/10 rounded-lg py-2.5 px-4 text-xs font-mono text-green-darkest outline-none focus:ring-2 focus:ring-yellow-gold/20 transition-all";
  const lblBase =
    "text-[10px] font-black uppercase tracking-[0.25em] text-green-darkest/50 block mb-1.5";
  const currentPatterns = deptPatterns();

  // Excel stage steps
  const excelSteps = [
    { n: 1, label: "Configure",  done: excelStage !== "setup"    },
    { n: 2, label: "Upload",     done: excelStage === "preview" || excelStage === "done" },
    { n: 3, label: "Review",     done: excelStage === "done"      },
    { n: 4, label: "Done",       done: false                       },
  ];

  return (
    <ProtectedRoute allowed={["coordinator", "admin"]}>
      <div className="max-w-8xl lg:ml-48 my-10">
        <div className="bg-[#F8F9FA] min-h-screen rounded-xl shadow-2xl p-8 md:p-10">

          {/* ── Header ──────────────────────────────────────────────────── */}
          <PageHeader
            title="Student"
            highlightedTitle="Enrollment"
            subtitle={`Department: ${myDeptCode ?? "…"} — ${stats?.total ?? 0} students`}
            actions={
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Active: <span className="text-green-darkest">{stats?.active ?? 0}</span>
                  </span>
                </div>
              </div>
            }
          />

          

          {/* ── No patterns notice ───────────────────────────────────────── */}
          {currentPatterns.length === 0 && myDeptCode && (
            <div className="flex items-center gap-2 mb-5 p-3 bg-slate-50 border border-slate-200 rounded-xl w-fit">
              <AlertCircle size={13} className="text-slate-400 shrink-0" />
              <p className="text-[10px] text-slate-500">
                No reg no patterns for <strong>{myDeptCode}</strong> — all formats accepted.
              </p>
            </div>
          )}

          {/* Duplicate floating badge (manual tab) */}
          {tab === "manual" && duplicates.size > 0 && (
            <div className="fixed right-6 top-24 z-50">
              <div className="flex items-center gap-3 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-white">
                <AlertCircle size={16} className="animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase">{duplicates.size} Duplicate(s)</span>
                  <span className="text-[8px] opacity-80 uppercase">Reg Numbers</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab switcher ─────────────────────────────────────────────── */}
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-8 w-fit shadow-sm">
            {([
              { id: "excel",  label: "Excel Upload", icon: <UploadCloud size={13} /> },
              { id: "manual", label: "Manual Entry",  icon: <TableProperties size={13} /> },
            ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                  tab === t.id
                    ? "bg-green-darkest text-yellow-gold shadow-md"
                    : "text-slate-400 hover:text-green-darkest"
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

              {/* EXCEL TAB */}
          <AnimatePresence mode="wait">
            {tab === "excel" ? (
              <motion.div key="excel-tab"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                {/* Step indicator */}
                <div className="flex items-center gap-0 mb-8">
                  {excelSteps.map((s, i) => (
                    <div key={s.label} className="flex items-center">
                      <div className="flex items-center gap-2">
                        <StepBadge
                          n={s.n}
                          active={
                            (excelStage === "setup"   && s.n === 1) ||
                            (excelStage === "drop"    && s.n === 2) ||
                            (excelStage === "preview" && s.n === 3) ||
                            (excelStage === "done"    && s.n === 4)
                          }
                          done={s.done}
                        />
                        <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${
                          s.done ? "text-emerald-500" : "text-slate-400"
                        }`}>{s.label}</span>
                      </div>
                      {i < excelSteps.length - 1 && (
                        <ChevronRight size={13} className="text-slate-300 mx-3" />
                      )}
                    </div>
                  ))}
                </div>

                <AnimatePresence mode="wait">

                  {/* ── Setup + Drop ────────────────────────────────────── */}
                  {(excelStage === "setup" || excelStage === "drop") && (
                    <motion.div key="setup-drop"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                      {/* Step 1 — Configure */}
                      <div className="bg-white rounded-2xl border border-green-darkest/5 shadow-sm p-7 mb-5">
                        <div className="flex items-center gap-2 mb-5">
                          <FileSpreadsheet size={15} className="text-slate-400" />
                          <h3 className="text-[11px] font-black text-green-darkest uppercase tracking-wider">
                            Step 1 — Configure & Download Template
                          </h3>
                        </div>

                        {/* Program + year selectors */}
                        <div className="grid grid-cols-12 gap-6 bg-white p-7 rounded-2xl border border-green-darkest/5 shadow-sm mb-8">
                  <div className="col-span-12 lg:col-span-4">
                            <label className={lblBase}>Academic Program</label>
                            <select className={inpBase} value={selectedProgId}
                              onChange={e => setSelectedProgId(e.target.value)}>
                              <option value="">Select program…</option>
                              {programs.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-12 lg:col-span-4">
                            <label className={lblBase}>Academic Session</label>
                            <select className={inpBase} value={selectedYearId}
                              onChange={e => setSelectedYearId(e.target.value)}>
                              <option value="">Select year…</option>
                              {academicYears.map(y => (
                                <option key={y._id} value={y._id}>{y.year}</option>
                              ))}
                            </select>
                          </div>
                  <div className="col-span-12 lg:col-span-4 flex items-end">
                  <button onClick={handleDownloadTemplate}
                          disabled={isDownloading || !selectedProgId || !selectedYearId}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-darkest to-green-dark text-yellow-gold font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg hover:scale-[1.02] transition-all">
                          {isDownloading
                            ? <Loader2 size={13} className="animate-spin" />
                            : <FileDown size={13} />}
                          {isDownloading ? "Generating…" : "Download Template"}
                        </button>
                        </div>

                        </div>

                       
                      </div>

                      {/* Step 2 — Drop */}
                      <div className="bg-white rounded-2xl border border-green-darkest/5 shadow-sm p-7">
                        <div className="flex items-center gap-2 mb-5">
                          <UploadCloud size={15} className="text-slate-400" />
                          <h3 className="text-[11px] font-black text-green-darkest uppercase tracking-wider">
                            Step 2 — Upload Filled Template
                          </h3>
                        </div>

                        <StudentDropZone
                          file={file}
                          parsing={parsing}
                          onFile={handleFile}
                          onClear={handleClearExcel}
                        />

                        {/* Parse error */}
                        <AnimatePresence>
                          {parseError && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                              <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                              <p className="text-[11px] font-bold text-red-700">{parseError}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Preview ─────────────────────────────────────────── */}
                  {excelStage === "preview" && (
                    <motion.div key="preview"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                      <div className="bg-white rounded-2xl border border-green-darkest/5 shadow-sm p-7">
                        <div className="flex items-center justify-between mb-5">
                          <div className="flex items-center gap-2">
                            <Users size={15} className="text-slate-400" />
                            <h3 className="text-[11px] font-black text-green-darkest uppercase tracking-wider">
                              Step 3 — Review & Confirm
                            </h3>
                          </div>
                          <button onClick={handleClearExcel}
                            className="flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors">
                            <RefreshCcw size={11} /> Change File
                          </button>
                        </div>

                        <StudentPreviewTable
                          rows={parsedRows}
                          onRemoveRow={handleRemoveRow}
                        />

                        {/* Submit bar */}
                        <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100">
                          <p className="text-[10px] font-mono text-slate-400">
                            {parsedRows.filter(r => !r.error).length} of{" "}
                            {parsedRows.length} rows will be submitted
                          </p>

                          <div className="flex items-center gap-4">
                            {uploadMutation.isPending && (
                              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                                <div className="h-1.5 w-28 bg-slate-100 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-green-darkest rounded-full"
                                    animate={{ width: `${uploadPct}%` }}
                                    transition={{ duration: 0.3 }}
                                  />
                                </div>
                                {uploadPct}%
                              </div>
                            )}
                            <button onClick={handleExcelUpload}
                              disabled={
                                uploadMutation.isPending ||
                                parsedRows.filter(r => !r.error).length === 0
                              }
                              className="flex items-center gap-2 px-7 py-3 bg-green-darkest hover:bg-green-800 text-yellow-gold text-[10px] font-black uppercase tracking-widest rounded-xl disabled:opacity-40 transition-all shadow-lg">
                              {uploadMutation.isPending
                                ? <Loader2 size={13} className="animate-spin" />
                                : <ClipboardCheck size={13} />}
                              {uploadMutation.isPending
                                ? "Registering…"
                                : `Register ${parsedRows.filter(r => !r.error).length} Students`}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── Done ────────────────────────────────────────────── */}
                  {excelStage === "done" && uploadResult && (
                    <motion.div key="done"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                      <div className="bg-white rounded-2xl border border-green-darkest/5 shadow-sm p-7">
                        <div className="flex items-center gap-2 mb-6">
                          <CheckCircle2 size={17} className="text-emerald-500" />
                          <h3 className="text-[11px] font-black text-green-darkest uppercase tracking-wider">
                            Registration Complete
                          </h3>
                        </div>
                        <StudentResultsPanel
                          result={uploadResult}
                          onReset={handleClearExcel}
                        />
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </motion.div>

            ) : (
            /* ══════════════════════════════════════════════════════════════
               MANUAL TAB
            ══════════════════════════════════════════════════════════════ */
              <motion.div key="manual-tab"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                {/* Program + year selectors */}
                <div className="grid grid-cols-12 gap-6 bg-white p-7 rounded-2xl border border-green-darkest/5 shadow-sm mb-8">
                  <div className="col-span-12 lg:col-span-4">
                    <label className={lblBase}>Academic Program</label>
                    <select
                      className={`${inpBase} ${!manualProgId ? "border-yellow-gold/30 bg-yellow-gold/5" : ""}`}
                      value={manualProgId}
                      onChange={e => setManualProgId(e.target.value)}>
                      <option value="">Select Program…</option>
                      {programs.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-12 lg:col-span-4">
                    <label className={lblBase}>Academic Session</label>
                    <select
                      className={`${inpBase} ${!manualYearId ? "border-yellow-gold/30 bg-yellow-gold/5" : ""}`}
                      value={manualYearId}
                      onChange={e => setManualYearId(e.target.value)}>
                      <option value="">Choose Session…</option>
                      {academicYears.map(y => (
                        <option key={y._id} value={y._id}>{y.year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-12 lg:col-span-4 flex items-end">
                    <button
                      onClick={async () => {
                        if (!manualProgId || !manualYearId) {
                          addToast("Select program and year first.", "warning");
                          return;
                        }
                        try {
                          await downloadStudentRegistrationTemplate(manualProgId, manualYearId);
                          addToast("Template downloaded!", "success");
                        } catch {
                          addToast("Could not download template.", "error");
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-darkest to-green-dark text-yellow-gold font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg hover:scale-[1.02] transition-all">
                      <FileDown size={13} /> Download Template
                    </button>
                  </div>
                </div>

                {/* Ledger header */}
                <div className="mb-3 flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-green-darkest/60">
                      Active Data Ledger
                    </h3>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Zap size={11} className="text-yellow-gold" />
                    Ctrl+V to paste from Excel
                  </p>
                </div>

                {/* Paste table */}
                <div
                  onPaste={handleManualPaste}
                  tabIndex={0}
                  className="bg-white rounded-lg border border-green-darkest/5 shadow-sm overflow-hidden mb-8 focus-within:ring-2 focus-within:ring-yellow-gold/20 transition-all outline-none"
                  className="bg-white rounded-lg shadow-sm overflow-hidden mb-10 focus-within:ring-2 focus-within:ring-blue-200 transition-all"
//           style={{ outline: "none" }}
                >
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-4 py-2.5 text-left">Reg No</th>
                        <th className="px-4 py-2.5 text-left">Full Name</th>
                        <th className="px-4 py-2.5 text-left">Program</th>
                        <th className="px-4 py-2.5 text-center w-20">Year</th>
                        <th className="px-4 py-2.5 text-left w-24">Intake</th>
                        <th className="px-4 py-2.5 text-center w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {manualStudents.map((student, i) => {
                        const safeReg      = String(student.regNo ?? "");
                        const safeName     = String(student.name  ?? "");
                        const safeProgram  = String(student.program ?? "");
                        const currentReg   = safeReg.trim().toUpperCase();
                        const isDuplicate  = !!(currentReg && duplicates.has(currentReg));
                        const regError     = currentReg ? validateRegNo(currentReg) : null;
                        const regInvalid   = regError !== null;
                        const hasProgram   = safeProgram.length > 0;

                        return (
                          
                          <tr
                     key={i}
                    className={`hover:bg-green-base/10 transition-all duration-200 text-xs ${
                       isDuplicate ? "bg-red-50 border-l-4 border-red-600" :
                       regInvalid  ? "bg-orange-50 border-l-4 border-orange-400" : "bg-white"
                     }`}
                   >
                     <td className="px-1 py-2">
                       <div>
                         <input
                           type="text"
                           value={safeReg}
                           onChange={e => updateManualStudent(i, "regNo", e.target.value.toUpperCase())}
                           placeholder={currentPatterns[0]?.example ?? "Reg No"}
                           className={`w-full p-2.5 text-green-darkest rounded font-bold transition-all outline-none ${
                             isDuplicate ? "bg-white border border-red-500 text-red-700" :
                             regInvalid  ? "bg-orange-50 border border-orange-400 text-orange-700" :
                             !student.regNo.trim() ? "bg-orange-100" : "bg-gray-50 hover:bg-yellow-gold/20"
                           }`}
                         />
                         {regInvalid && currentReg && (
                           <p className="text-[9px] text-orange-600 mt-0.5 ml-1">{regError}</p>
                         )}
                       </div>
                     </td>

                            <td className="px-4 py-2">
                              <input type="text"
                                value={safeName}
                                onChange={e => updateManualStudent(i, "name", e.target.value)}
                                placeholder="Student Full Name"
                                className="text-green-darkest w-full px-2 py-1.5 rounded-lg bg-transparent outline-none border border-transparent hover:border-slate-200 focus:border-yellow-gold/30 transition-all text-xs"
                              />
                            </td>

                            <td className="px-4 py-2">
                              <select
                                value={hasProgram ? safeProgram : manualProgId}
                                onChange={e => updateManualStudent(i, "program", e.target.value)}
                                className="text-green-darkest w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 outline-none cursor-pointer font-semibold text-xs">
                                <option value="" disabled>Select Program</option>
                                {programs.map(p => (
                                  <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                              </select>
                            </td>

                            <td className="px-2 py-2 text-center">
                              <input type="number"
                                value={student.currentYearOfStudy}
                                onChange={e =>
                                  updateManualStudent(i, "currentYearOfStudy", Number(e.target.value))
                                }
                                min={1} max={6}
                                className="mx-auto w-12 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-green-darkest outline-none"
                              />
                            </td>

                            <td className="px-4 py-2">
                              <select
                                value={student.intake || "SEPT"}
                                onChange={e => updateManualStudent(i, "intake", e.target.value)}
                                className="text-green-darkest w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 outline-none font-bold text-[10px]">
                                <option value="JAN">JAN</option>
                                <option value="MAY">MAY</option>
                                <option value="SEPT">SEPT</option>
                              </select>
                            </td>

                            <td className="px-4 py-2 text-right">
                              <button onClick={() => removeManualRow(i)}
                                className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between gap-4">
                  <button onClick={addManualRow}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm border-2 border-dashed border-slate-200 text-slate-400 rounded-xl hover:border-yellow-gold hover:text-green-darkest font-bold transition-all">
                    <Plus size={14} /> Add Row
                  </button>

                  <button onClick={handleManualSubmit}
                    disabled={manualLoading}
                    className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-green-darkest to-green-dark text-yellow-gold text-[10px] font-black uppercase tracking-widest rounded-xl disabled:opacity-50 shadow-lg hover:scale-[1.02] transition-all">
                    {manualLoading
                      ? <Loader2 size={14} className="animate-spin" />
                      : <ClipboardCheck size={14} />}
                    {manualLoading
                      ? "Registering…"
                      : `Register ${
                          manualStudents.filter(
                            s => s.regNo && s.name && s.program &&
                                 !validateRegNo(s.regNo.trim().toUpperCase()),
                          ).length
                        } Students`}
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </ProtectedRoute>
  );
}
