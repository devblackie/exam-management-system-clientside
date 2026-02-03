// clientside/src/app/coordinator/students/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  getStudents,
  bulkRegisterStudents,
  downloadStudentRegistrationTemplate,
} from "@/api/studentsApi";
import type { StudentFormRow, Program, AcademicYear } from "@/api/types";
import { useToast } from "@/context/ToastContext";
import { getAcademicYears, getPrograms } from "@/api/marksApi";
import PageHeader from "@/components/ui/PageHeader";
import { FileDown, Trash2, AlertCircle, ClipboardCheck, Zap } from "lucide-react";

export default function RegisterStudents() {
  const [students, setStudents] = useState<StudentFormRow[]>([
    { regNo: "", name: "", program: "", currentYearOfStudy: 1 },
  ]);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [selectedAcademicYearId, setSelectedAcademicYearId] =
    useState<string>(""); 
  const [loadingData, setLoadingData] = useState(false);
  const { addToast } = useToast();

  // Fetch programs on mount
  // Inside RegisterStudents component
  useEffect(() => {
    const fetchData = async () => {
      // 1. Use the correct loading state
      setLoadingData(true);
      try {
        const [progData, yearData] = await Promise.all([
          getPrograms(),
          getAcademicYears(),
        ]);

        setPrograms(progData);
        setAcademicYears(yearData);

      // 2. Safely auto-select the current year
      const current = yearData.find((y: AcademicYear) => y.isCurrent || y.isActive);
      if (current) {
        setSelectedAcademicYearId(current._id);
      } else if (yearData.length > 0) {
        // Fallback: Select the first one if no "current" is flagged
        setSelectedAcademicYearId(yearData[0]._id);
      }
      } catch (error) {
        console.error("Fetch error:", error);
        addToast("Failed to load programs and years", "error");
      } finally {
        // 3. Reset the correct loading state
        setLoadingData(false);
      }
    };
    fetchData();
  }, [addToast]);

  const getDuplicates = () => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    students.forEach((s) => {
      const reg = s.regNo.trim().toUpperCase();
      if (reg) {
        if (seen.has(reg)) duplicates.add(reg);
        seen.add(reg);
      }
    });
    return duplicates;
  };

  // Add a new empty row
  const addRow = () => {
    setStudents([
      ...students,
      { regNo: "", name: "", program: "", currentYearOfStudy: 1 },
    ]);
  };

  const updateStudent = (
    index: number,
    field: keyof StudentFormRow,
    value: string | number,
  ) => {
    setStudents((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeRow = (index: number) => {
    if (students.length === 1) {
      addToast("Cannot remove the last row", "error");
      return;
    }
    setStudents(students.filter((_, i) => i !== index));
  };

  const duplicates = getDuplicates();

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    let raw = e.clipboardData.getData("text/plain");
    if (!raw.trim()) return;

    // 1. REMOVE CR
    raw = raw.replace(/\r/g, "");

    // 2. FIX MULTILINE CELLS INSIDE QUOTES
    // Replace ANY newline between quotes with a space
    raw = raw.replace(/"([^"]*?)\n([^"]*?)"/g, (_, a, b) => `"${a} ${b}"`);

    // 3. REMOVE ANY REMAINING STRAY INTERNAL NEWLINES INSIDE QUOTED STRINGS
    raw = raw.replace(/"([^"]*?)"/g, (match) => match.replace(/\n/g, " "));

    // 4. NOW SAFE TO SPLIT INTO ROWS
    const rows = raw.split("\n").map((row) =>
      row.split("\t").map((cell) =>
        cell
          .replace(/["“”‘’]/g, "") // remove quotes
          .replace(/\u00A0/g, " ") // non-breaking spaces
          .replace(/[\u200B-\u200F]/g, "") // zero-width
          .trim(),
      ),
    );

    // Remove empty rows
    const dataRows = rows.filter((r) => r.some((c) => c !== ""));
    if (dataRows.length === 0) return;

    // Detect header
    const firstCell = dataRows[0][0]?.toLowerCase() || "";
    const hasHeader = /reg|no|registration|student|adm/.test(firstCell);
    const start = hasHeader ? 1 : 0;

    const result: StudentFormRow[] = [];

    for (let i = start; i < dataRows.length; i++) {
      const r = dataRows[i];

      const regNo = (r[0] || "").toUpperCase();
      const name = r[1] || "";
      const program = r[2] || "";
      const yearText = r[3] || "";

      if (!regNo || !name || !program) continue;

      let currentYearOfStudy = 1;
      const y = parseInt(yearText);
      if (!isNaN(y) && y >= 1 && y <= 5) currentYearOfStudy = y;

      result.push({ regNo, name, program, currentYearOfStudy });
    }

    if (result.length === 0) {
      addToast("No valid rows found.", "warning");
      return;
    }

    setStudents(result);
    addToast(`Successfully pasted ${result.length} students`, "success");
  };

  const handleDownloadTemplate = async () => {
    if (!selectedProgramId || !selectedAcademicYearId) {
      addToast(
        "Please select both a programme and an academic year.",
        "warning",
      );
      return;
    }

    setIsDownloading(true);
    try {
      // Pass both IDs to your API utility
      await downloadStudentRegistrationTemplate(
        selectedProgramId,
        selectedAcademicYearId,
      );
      addToast("Template downloaded successfully!", "success");
    } catch {
      addToast("Could not download template", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const extractAcademicYear = (regNo: string): string => {
    const match = regNo.match(/\/(\d{2,4})$/);
    if (!match) return "2024/2025"; // Global fallback

    let yearPart = match[1];
    // If user typed 24, convert to 2024
    if (yearPart.length === 2) {
      yearPart = `20${yearPart}`;
    }

    const startYear = Number(yearPart);
    return `${startYear}/${startYear + 1}`;
  };

  const handleSubmit = async () => {
       // 1. Strict Validation: Must have a Year ID selected
  if (!selectedAcademicYearId) {
    addToast("Please select an academic session from the dropdown", "error");
    return;
  }

  const selectedYearDoc = academicYears.find(y => y._id === selectedAcademicYearId);

    const filled = students
    .filter((s) => s.regNo.trim() && s.name.trim() && s.program.trim())
    .map((s) => ({
      regNo: s.regNo.trim().toUpperCase(),
      name: s.name.trim(),
      program: s.program.trim(),
      currentYearOfStudy: s.currentYearOfStudy,
      // FIX: Ensure we send the ObjectId to satisfy the Mongoose ref
      admissionAcademicYear: selectedAcademicYearId, 
      academicYearId: selectedAcademicYearId, // redundancy for backend processing
    }));

    if (filled.length === 0) {
      addToast("Please fill at least one student", "error");
      return;
    }

    // Client-side duplicate check
    const regNos = filled.map((s) => s.regNo.trim().toUpperCase());
    const seen = new Set<string>();
    const clientDuplicates = regNos.filter(
      (reg) => seen.size === seen.add(reg).size,
    );

    if (clientDuplicates.length > 0) {
      addToast(
        `Duplicate reg numbers found in list: ${clientDuplicates.join(", ")}`,
        "error",
      );
      return;
    }

    setLoading(true);

    try {
      // Send only the form data — backend resolves program name → ID
      const response = await bulkRegisterStudents(filled);

      const registeredCount = response.registered?.length || 0;
      const alreadyCount = response.alreadyRegistered?.length || 0;
      let toastMessage = "";

      if (registeredCount > 0) {
        toastMessage = `${registeredCount} student(s) registered successfully.`;
      } else if (alreadyCount > 0) {
        toastMessage = "All students in the list are already registered.";
      }
      addToast(toastMessage, "success");
      setStudents([
        { regNo: "", name: "", program: "", currentYearOfStudy: 1 },
      ]);
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
            alreadyRegistered?: string[];
            duplicates?: string[];
            registered?: string[];
          };
        };
      };

      const responseData = error.response?.data;
      const registeredCount = responseData?.registered?.length || 0;
      const already = responseData?.alreadyRegistered?.join(", ") || "";
      const dups = responseData?.duplicates?.join(", ") || "";

      // Handle true errors
      const msg =
        responseData?.message ||
        "Failed to register students (Network or Server Error)";

      let errorDetail = "";
      if (already) errorDetail += ` Already Exist: ${already}`;
      if (dups) errorDetail += ` Duplicates: ${dups}`;

      addToast(`${msg}${errorDetail}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full p-3 bg-white border border-slate-200 text-green-darkest font-semibold text-xs rounded-xl transition-all outline-none appearance-none";
  const labelStyle =
    "text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block";

  return (
    <div className="max-w-8xl ml-48 my-10 ">
      <div className="bg-[#F8F9FA] min-h-screen rounded-lg shadow-2xl p-10">
        <PageHeader
          title="Student"
          highlightedTitle="Enrollment"
          subtitle="Requirements: Reg No, Full Legal Name, Active Program Code"
        />

        {duplicates.size > 0 && (
          <div className="fixed right-6 top-24 z-50">
            <div className="flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-white">
              <AlertCircle size={18} className="animate-pulse" />
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase tracking-tighter">
                  {duplicates.size} Conflict(s)
                </span>
                <span className="text-[8px] font-bold opacity-80 uppercase">
                  Duplicate Reg Numbers
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-8 bg-white p-8 rounded-lg border border-green-darkest/5 shadow-sm mb-12">
          <div className="col-span-12 lg:col-span-4">
            <label className={labelStyle}>Academic Program</label>
            <select
              className={`${inputBase} ${!selectedProgramId ? "border-yellow-gold/30 bg-yellow-gold/5" : ""}`}
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
            >
              <option value="">Select Program...</option>
              {programs.map((p) => (
                <option key={p._id} value={p._id}>
                  {" "}
                  {p.name}{" "}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <label className={labelStyle}>Academic Session</label>
            <select
              className={`${inputBase} ${!selectedAcademicYearId ? "border-yellow-gold/30 bg-yellow-gold/5" : ""}`}
              value={selectedAcademicYearId}
              onChange={(e) => setSelectedAcademicYearId(e.target.value)}
            >
              <option value="">Choose Session...</option>
              {academicYears.map((y) => (
                <option key={y._id} value={y._id}>
                  {y.year}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-12 lg:col-span-4 flex items-center justify-center bg-gradient-to-r from-green-darkest to-green-dark rounded-lg p-1 shadow-xl">
            <button
              onClick={handleDownloadTemplate}
              disabled={ isDownloading || !selectedProgramId || !selectedAcademicYearId }
              className="group flex items-center gap-3 text-yellow-gold  disabled:opacity-30 disabled:grayscale  transition-all"
            >
              <div className="p-2 rounded-lg bg-white/10 group-hover:bg-yellow-gold group-hover:text-green-darkest transition-all">
                <FileDown size={10} />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Download Template
                </span>
                {!selectedProgramId && (
                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.3em]">
                    Awaiting Selection
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

       

        {/* STEP 2: DATA INGESTION (PASTE AREA) */}
        <div className="mb-4 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-green-darkest/60">
              Active Data Ledger
            </h3>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Zap size={12} className="text-yellow-gold" />
            Pro Tip: Click table and press Ctrl+V to paste from Excel
          </p>
        </div>

        {/* PASTE AREA */}
        <div
          ref={tableRef}
          onPaste={handlePaste}
          tabIndex={0}
          className="bg-white rounded-lg shadow-sm overflow-hidden mb-10 focus-within:ring-2 focus-within:ring-blue-200 transition-all"
          // className="overflow-x-auto border-0 border-dashed border-blue-300 rounded-lg p-2 mb-10 focus:border-blue-600 transition-all"
          style={{ outline: "none" }}
        >
          {/* Your table and inputs here */}
          <table className="w-full rounded-lg">
            <thead className=" ">
              <tr className="bg-slate-100 border-b text-xs text-slate-400 border-slate-100">
                <th className="px-4 py-2 text-left font-bold ">Reg No</th>
                <th className="px-4 py-2 text-left font-bold ">Full Name</th>
                <th className="px-4 py-2 text-left font-bold ">Program</th>
                <th className="px-4 py-2 text-left font-bold ">Year</th>
                <th className="px-4 py-2 text-center font-bold ">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {students.map((student, i) => {
                const safeReg = String(student.regNo || "");
                const safeName = String(student.name || "");
                const safeProgram = String(student.program || "");
                const currentReg = safeReg.trim().toUpperCase();
                const isDuplicate = currentReg && duplicates.has(currentReg);
                const isIncomplete =
                  !safeReg.trim() || !safeName.trim() || !safeProgram.trim();

                return (
                  <tr
                    key={i}
                    className={`
        hover:bg-green-base/10 transition-all duration-200 text-xs 
        ${isDuplicate ? "bg-red-50 border-l-4 border-red-600 rounded-xl shadow-lg" : ""}
        ${
          !isDuplicate && isIncomplete
            ? "bg-orange-50 border-l-4 border-orange-500 "
            : ""
        }
        ${!isDuplicate && !isIncomplete ? "bg-white rounded-xl" : ""}
      `}
                  >
                    <td className="px-1 py-2   ">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={safeReg}
                          onChange={(e) =>
                            updateStudent(
                              i,
                              "regNo",
                              e.target.value.toUpperCase(),
                            )
                          }
                          placeholder="SC/ICT/001/2023"
                          className={`
              w-full p-2.5 text-green-darkest rounded-mono font-bold transition-all outline-none
              ${
                isDuplicate
                  ? "bg-white border-red-500 text-red-700 placeholder-red-400 shadow-md"
                  : !student.regNo.trim()
                    ? "bg-orange-100  "
                    : "bg-gray-50 hover:bg-yellow-gold/70 focus:ring-0"
              }
            `}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={safeName}
                        onChange={(e) =>
                          updateStudent(i, "name", e.target.value)
                        }
                        placeholder="Patrick Kimani"
                        className="text-green-darkest  w-full px-2 rounded focus:ring-0 outline-0  "
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={safeProgram}
                        onChange={(e) =>
                          updateStudent(i, "program", e.target.value)
                        }
                        placeholder="BSc. Information Technology"
                        className="text-green-darkest w-full px-2 rounded focus:ring-0 outline-0  "
                      />
                    </td>
                    <td className="px- py-2  text-center ">
                      <input
                        type="number"
                        value={student.currentYearOfStudy}
                        onChange={(e) =>
                          updateStudent(
                            i,
                            "currentYearOfStudy",
                            Number(e.target.value),
                          )
                        }
                        className="mx-auto p-2.5 bg-transparent text-xs text-green-darkest text-center w-12  rounded outline-0  "
                        min="1"
                        max="6"
                      />
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
            className="px-4 py-2 text-sm border-2 border-dashed border-slate-200 text-slate-400 rounded-lg tracking-wide hover:border-yellow-gold hover:text-green-darkest font-bold transition-all shadow-2xl"
          >
            + Add New Row
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex gap-2 px-4 py-2 text-sm bg-gradient-to-r from-green-darkest to-green-dark text-white-pure rounded-lg hover:from-green-700 hover:to-emerald-800 font-bold  disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-yellow-gold border-t-transparent rounded-full" />
            ) : (
              <ClipboardCheck size={18} />
            )}
            {loading
              ? "Registering..."
              : `Register ${students.filter((s) => s.regNo && s.name && s.program).length} Students`}
          </button>
        </div>
      </div>
    </div>
  );
}


