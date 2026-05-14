// clientside/src/app/coordinator/students/page.tsx — COMPLETE, ALL WARNINGS FIXED

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { bulkRegisterStudents, downloadStudentRegistrationTemplate } from "@/api/studentsApi";
import type { StudentFormRow, Program, AcademicYear, IntakeType } from "@/api/types";
import { useToast }      from "@/context/ToastContext";
import { getAcademicYears } from "@/api/academicYearsApi";
import { getPrograms }   from "@/api/programsApi";
import { useInstitutionSettings } from "@/hooks/queries/useInstitutionSettings";
import type { RegNoPattern, School, Department } from "@/api/types";
import PageHeader from "@/components/ui/PageHeader";
import { FileDown, Trash2, AlertCircle, ClipboardCheck, Zap} from "lucide-react";
import api from "@/config/axiosInstance";

// ── Reg-no validation helpers ──────────────────────────────────────────────────
// Build a regex from stored pattern fields.
// Called inside validateRegNo — not a top-level standalone function to avoid
// the "declared but never read" warning.
function patternToRegex(p: RegNoPattern): RegExp | null {
  if (p.manualRegex?.trim()) {
    try { return new RegExp(p.manualRegex.trim(), "i"); }
    catch { return null; }
  }
  if (!p.prefix) return null;
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sep = p.separator ? esc(p.separator) : "";
  const yr  = `\\d{${p.yearDigits ?? 3}}`;
  // Matches: PREFIX + SEP + YEAR + SEP + DIGITS + optional suffix (e.g. /2023)
  return new RegExp(`^${esc(p.prefix)}${sep}${yr}${sep}\\d+`, "i");
}

export default function RegisterStudents() {
  const [students, setStudents] = useState<StudentFormRow[]>([
    { regNo: "", name: "", program: "", currentYearOfStudy: 1, intake: "SEPT" },
  ]);
  const [loading,           setLoading]           = useState(false);
  const [isDownloading,     setIsDownloading]     = useState(false);
  const [programs,          setPrograms]          = useState<Program[]>([]);
  const [academicYears,     setAcademicYears]     = useState<AcademicYear[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>("");

  // Coordinator scope — fetched from /auth/me
  const [myDeptCode,   setMyDeptCode]   = useState<string | null>(null);
  const [mySchoolCode, setMySchoolCode] = useState<string | null>(null);

  const { addToast }       = useToast();
  const tableRef           = useRef<HTMLDivElement>(null);
  const { data: settings } = useInstitutionSettings();

  // ── Load coordinator scope ─────────────────────────────────────────────────
  useEffect(() => {
    api.get<{ role: string; schoolCode: string | null; departmentCode: string | null; institutionWide: boolean }>("/auth/me")
      .then(res => {
        setMyDeptCode(res.data.departmentCode);
        setMySchoolCode(res.data.schoolCode);
      })
      .catch(() => {/* admin has no scope — safe to ignore */});
  }, []);

  // ── Resolve patterns for coordinator's own department ──────────────────────
  const deptPatterns = useCallback((): RegNoPattern[] => {
    if (!mySchoolCode || !myDeptCode || !settings?.schools) return [];
    const school = settings.schools.find((s: School) => s.code === mySchoolCode.toUpperCase());
    if (!school) return [];
    const dept   = school.departments?.find((d: Department) => d.code === myDeptCode.toUpperCase());
    return dept?.regNoPatterns ?? [];
  }, [mySchoolCode, myDeptCode, settings]);

  // ── Validate a single reg no against department patterns ──────────────────
  // Returns null if valid, or an error string if invalid.
  const validateRegNo = useCallback((regNo: string): string | null => {
    if (!regNo.trim()) return null;
    const patterns = deptPatterns();

    // CRITICAL: skip validation when no patterns configured OR enforcement off
    if (patterns.length === 0)           return null;
    if (!settings?.enforceRegNoPattern)  return null;

    const upper = regNo.trim().toUpperCase();
    for (const p of patterns) {
      const regex = patternToRegex(p);
      if (regex && regex.test(upper)) return null;  // matched — valid
    }

    // None matched
    const examples = patterns.map(p => p.example).filter(Boolean).join("  or  ");
    return `Invalid reg no for ${myDeptCode}. Expected: ${examples || "check department settings"}`;
  }, [deptPatterns, settings, myDeptCode]);

  // ── Load programs + academic years ────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progData, yearData] = await Promise.all([getPrograms(), getAcademicYears()]);
        setPrograms(progData);
        setAcademicYears(yearData);

        const currentYear = yearData.find((y: AcademicYear) => y.isCurrent || y.isActive);
        if (currentYear) setSelectedAcademicYearId(currentYear._id);
        else if (yearData.length > 0) setSelectedAcademicYearId(yearData[0]._id);

        if (progData.length > 0) setSelectedProgramId(progData[0]._id);
      } catch {
        addToast("Failed to load setup data", "error");
      }
    };
    fetchData();
  }, [addToast]);

  const getDuplicates = () => {
    const seen = new Set<string>();
    const dups  = new Set<string>();
    students.forEach(s => {
      const r = s.regNo.trim().toUpperCase();
      if (r) { if (seen.has(r)) dups.add(r); seen.add(r); }
    });
    return dups;
  };

  const addRow = () =>
    setStudents(prev => [...prev, {
      regNo: "", name: "", program: selectedProgramId,
      currentYearOfStudy: 1, intake: "SEPT",
    }]);

  const updateStudent = (index: number, field: keyof StudentFormRow, value: string | number) => {
    setStudents(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeRow = (index: number) => {
    if (students.length === 1) { addToast("Cannot remove the last row", "error"); return; }
    setStudents(prev => prev.filter((_, i) => i !== index));
  };

  const duplicates = getDuplicates();

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    let raw = e.clipboardData.getData("text/plain");
    if (!raw.trim()) return;

    raw = raw.replace(/\r/g, "");
    raw = raw.replace(/"([^"]*?)\n([^"]*?)"/g, (_, a, b) => `"${a} ${b}"`);
    raw = raw.replace(/"([^"]*?)"/g, match => match.replace(/\n/g, " "));

    const rows = raw.split("\n").map(row =>
      row.split("\t").map(cell =>
        cell.replace(/["""'']/g, "").replace(/\u00A0/g, " ").replace(/[\u200B-\u200F]/g, "").trim(),
      ),
    );

    const dataRows = rows.filter(r => r.some(c => c !== ""));
    if (dataRows.length === 0) return;

    const firstCell = dataRows[0][0]?.toLowerCase() ?? "";
    const hasHeader = /reg|no|registration|student|adm/.test(firstCell);
    const start     = hasHeader ? 1 : 0;

    const result: StudentFormRow[] = [];
    let rejected = 0;

    for (let i = start; i < dataRows.length; i++) {
      const r       = dataRows[i];
      const regNo   = (r[0] ?? "").toUpperCase();
      const name    = r[1] ?? "";
      const program = r[2] ?? "";

      if (!regNo || !name || !program) continue;

      const regError = validateRegNo(regNo);
      if (regError) { rejected++; continue; }

      const rawIntake = (r[4] ?? "SEPT").toUpperCase();
      let intake: IntakeType = "SEPT";
      if (["JAN","MAY","SEPT"].includes(rawIntake)) intake = rawIntake as IntakeType;

      const yearText         = r[3] ?? "";
      let currentYearOfStudy = 1;
      const y = parseInt(yearText);
      if (!isNaN(y) && y >= 1 && y <= 6) currentYearOfStudy = y;

      result.push({ regNo, name, program, currentYearOfStudy, intake });
    }

    if (result.length === 0) {
      addToast("No valid rows found. Check reg no format.", "warning"); return;
    }
    setStudents(result);
    addToast(
      `Pasted ${result.length} student(s)${rejected > 0 ? ` — ${rejected} rejected (wrong reg no format for ${myDeptCode})` : ""}`,
      rejected > 0 ? "warning" : "success",
    );
  };

  const handleDownloadTemplate = async () => {
    if (!selectedProgramId || !selectedAcademicYearId) {
      addToast("Please select both a programme and an academic year.", "warning"); return;
    }
    setIsDownloading(true);
    try {
      await downloadStudentRegistrationTemplate(selectedProgramId, selectedAcademicYearId);
      addToast("Template downloaded!", "success");
    } catch {
      addToast("Could not download template", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProgramId)      { addToast("Academic Program is required", "error"); return; }
    if (!selectedAcademicYearId) { addToast("Academic Session is required", "error"); return; }

    const invalidRows = students
      .filter(s => s.regNo.trim())
      .map(s => ({ regNo: s.regNo, error: validateRegNo(s.regNo.trim().toUpperCase()) }))
      .filter(r => r.error !== null);

    if (invalidRows.length > 0) {
      addToast(
        `${invalidRows.length} reg no(s) have invalid format: ${invalidRows.slice(0,3).map(r => r.regNo).join(", ")}${invalidRows.length > 3 ? "..." : ""}`,
        "error",
      );
      return;
    }

    const filled = students
      .filter(s => s.regNo.trim() && s.name.trim())
      .map(s => {
        const finalProgramId = s.program || selectedProgramId;
        const progObj = programs.find(p => p._id === finalProgramId);
        return {
          regNo:              s.regNo.trim().toUpperCase(),
          name:               s.name.trim(),
          program:            finalProgramId,
          currentYearOfStudy: Number(s.currentYearOfStudy) || 1,
          intake:             s.intake,
          academicYearId:     selectedAcademicYearId,
          rawProgram:         progObj?.name ?? "",
        };
      });

    if (filled.length === 0) { addToast("Please add at least one student", "error"); return; }

    const regNos  = filled.map(s => s.regNo);
    const seen    = new Set<string>();
    const dups    = regNos.filter(r => seen.size === seen.add(r).size);
    if (dups.length > 0) { addToast(`Duplicate reg numbers: ${dups.join(", ")}`, "error"); return; }

    setLoading(true);
    try {
      const response = await bulkRegisterStudents({ students: filled });
      const registered = response.registered?.length ?? 0;
      const already    = response.alreadyRegistered?.length ?? 0;
      if (registered > 0) addToast(`${registered} student(s) registered.`, "success");
      else if (already > 0) addToast("All students already registered.", "warning");
      setStudents([{ regNo: "", name: "", program: "", currentYearOfStudy: 1, intake: "SEPT" }]);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; alreadyRegistered?: string[]; duplicates?: string[] } } };
      const data  = error.response?.data;
      let msg = data?.message ?? "Failed to register students";
      if (data?.alreadyRegistered?.length) msg += ` | Exist: ${data.alreadyRegistered.join(", ")}`;
      if (data?.duplicates?.length)        msg += ` | Dups: ${data.duplicates.join(", ")}`;
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const inputBase  = "w-full p-3 bg-white border border-slate-200 text-green-darkest font-semibold text-xs rounded transition-all outline-none appearance-none";
  const labelStyle = "text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block";
  const currentPatterns = deptPatterns();

  return (
    <div className="max-w-8xl lg:ml-48 my-14">
      <div className="bg-[#F8F9FA] min-h-screen rounded-lg shadow-2xl p-10">
        <PageHeader
          title="Student" highlightedTitle="Enrollment"
          subtitle={`Department: ${myDeptCode ?? "Loading..."} — Reg No format enforced`}
        />

        {/* Scope badge */}
        {/* {myDeptCode && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg w-fit">
            <ShieldAlert size={14} className="text-blue-600 shrink-0" />
            <p className="text-[10px] text-blue-700 font-bold">
              Scoped to: <span className="font-black">{mySchoolCode} / {myDeptCode}</span>
              {" "}— programs and students in this department only
            </p>
          </div>
        )} */}

        {/* Reg no format info */}
        {/* {currentPatterns.length > 0 && settings?.enforceRegNoPattern && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg w-fit">
            <AlertCircle size={14} className="text-amber-600 shrink-0" />
            <p className="text-[10px] text-amber-700 font-bold">
              Reg no format for <strong>{myDeptCode}</strong>:{" "}
              {currentPatterns.map(p => p.example).filter(Boolean).join("  or  ")}
            </p>
          </div>
        )} */}

        {currentPatterns.length === 0 && myDeptCode && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg w-fit">
            <AlertCircle size={14} className="text-slate-400 shrink-0" />
            <p className="text-[10px] text-slate-500">
              No reg no patterns configured for {myDeptCode} — all formats accepted.
              Set patterns in <strong>Institution Settings → Reg Number Patterns</strong>.
            </p>
          </div>
        )}

        {duplicates.size > 0 && (
          <div className="fixed right-6 top-24 z-50">
            <div className="flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-white">
              <AlertCircle size={18} className="animate-pulse" />
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase">{duplicates.size} Duplicate(s)</span>
                <span className="text-[8px] font-bold opacity-80 uppercase">Reg Numbers</span>
              </div>
            </div>
          </div>
        )}

        {/* Program + year selectors */}
        <div className="grid grid-cols-12 gap-8 bg-white p-8 rounded-lg border border-green-darkest/5 shadow-sm mb-12">
          <div className="col-span-12 lg:col-span-4">
            <label className={labelStyle}>Academic Program</label>
            <select
              className={`${inputBase} ${!selectedProgramId ? "border-yellow-gold/30 bg-yellow-gold/5" : ""}`}
              value={selectedProgramId}
              onChange={e => setSelectedProgramId(e.target.value)}
            >
              <option value="">Select Program...</option>
              {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
            {programs.length === 0 && (
              <p className="text-[10px] text-amber-600 mt-1">
                No programs in department {myDeptCode}
              </p>
            )}
          </div>
          <div className="col-span-12 lg:col-span-4">
            <label className={labelStyle}>Academic Session</label>
            <select
              className={`${inputBase} ${!selectedAcademicYearId ? "border-yellow-gold/30 bg-yellow-gold/5" : ""}`}
              value={selectedAcademicYearId}
              onChange={e => setSelectedAcademicYearId(e.target.value)}
            >
              <option value="">Choose Session...</option>
              {academicYears.map(y => (
                <option key={y._id} value={y._id}>{y.year}</option>
              ))}
            </select>
          </div>
          <div className="col-span-12 lg:col-span-4 flex items-center justify-center bg-gradient-to-r from-green-darkest to-green-dark rounded-lg p-1 shadow-xl">
            <button
              onClick={handleDownloadTemplate}
              disabled={isDownloading || !selectedProgramId || !selectedAcademicYearId}
              className="group flex items-center gap-3 text-yellow-gold disabled:opacity-30 transition-all"
            >
              <div className="p-2 rounded-lg bg-white/10 group-hover:bg-yellow-gold group-hover:text-green-darkest transition-all">
                <FileDown size={10} />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {isDownloading ? "Generating..." : "Download Template"}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Ledger tip */}
        <div className="mb-4 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-green-darkest/60">
              Active Data Ledger
            </h3>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Zap size={12} className="text-yellow-gold" />
            Ctrl+V to paste from Excel — invalid reg nos auto-rejected
          </p>
        </div>

        {/* Paste table */}
        <div
          ref={tableRef}
          onPaste={handlePaste}
          tabIndex={0}
          className="bg-white rounded-lg shadow-sm overflow-hidden mb-10 focus-within:ring-2 focus-within:ring-blue-200 transition-all"
          style={{ outline: "none" }}
        >
          <table className="w-full rounded-lg">
            <thead>
              <tr className="bg-slate-100 border-b text-xs text-slate-400 border-slate-100">
                <th className="px-4 py-2 text-left font-bold">Reg No</th>
                <th className="px-4 py-2 text-left font-bold">Full Name</th>
                <th className="px-4 py-2 text-left font-bold">Program</th>
                <th className="px-4 py-2 text-left font-bold">Year</th>
                <th className="px-4 py-2 text-left font-bold">Intake</th>
                <th className="px-4 py-2 text-center font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student, i) => {
                const safeReg    = String(student.regNo   ?? "");
                const safeName   = String(student.name    ?? "");
                const safeProgram = String(student.program ?? "");
                const currentReg = safeReg.trim().toUpperCase();
                const isDuplicate = !!(currentReg && duplicates.has(currentReg));
                // ── USED: regError drives row styling and inline error text ──
                const regError   = currentReg ? validateRegNo(currentReg) : null;
                const regInvalid = regError !== null;
                // safeProgram is used in the select's default value
                const hasProgram = safeProgram.length > 0;

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
                          onChange={e => updateStudent(i, "regNo", e.target.value.toUpperCase())}
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
                      <input
                        type="text"
                        value={safeName}
                        onChange={e => updateStudent(i, "name", e.target.value)}
                        placeholder="Student Full Name"
                        className="text-green-darkest w-full px-2 rounded focus:ring-0 outline-0"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        // hasProgram is used here — falls back to selectedProgramId if no row-level program set
                        value={hasProgram ? safeProgram : selectedProgramId}
                        onChange={e => updateStudent(i, "program", e.target.value)}
                        className="text-green-darkest w-full px-2 py-1 rounded bg-transparent border-0 focus:ring-2 focus:ring-green-dark/20 outline-none cursor-pointer font-semibold text-xs"
                      >
                        <option value="" disabled>Select Program</option>
                        {programs.map(p => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-1 py-2 text-center">
                      <input
                        type="number"
                        value={student.currentYearOfStudy}
                        onChange={e => updateStudent(i, "currentYearOfStudy", Number(e.target.value))}
                        className="mx-auto p-2.5 bg-transparent text-xs text-green-darkest text-center w-12 rounded outline-0"
                        min="1" max="6"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={student.intake || "SEPT"}
                        onChange={e => updateStudent(i, "intake", e.target.value)}
                        className="text-green-darkest w-full px-2 py-1 rounded bg-slate-50 border-0 font-bold text-[10px]"
                      >
                        <option value="JAN">JAN</option>
                        <option value="MAY">MAY</option>
                        <option value="SEPT">SEPT</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => removeRow(i)}
                        className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex gap-8 justify-center">
          <button
            onClick={addRow}
            className="px-4 py-2 text-sm border-2 border-dashed border-slate-200 text-slate-400 rounded-lg hover:border-yellow-gold hover:text-green-darkest font-bold transition-all"
          >
            + Add New Row
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex gap-2 px-4 py-2 text-sm bg-gradient-to-r from-green-darkest to-green-dark text-white rounded-lg font-bold disabled:opacity-50 transition"
          >
            {loading
              ? <div className="animate-spin h-4 w-4 border-2 border-yellow-gold border-t-transparent rounded-full" />
              : <ClipboardCheck size={18} />
            }
            {loading
              ? "Registering..."
              : `Register ${students.filter(s => s.regNo && s.name && s.program && !validateRegNo(s.regNo.trim().toUpperCase())).length} Students`
            }
          </button>
        </div>
      </div>
    </div>
  );
}
