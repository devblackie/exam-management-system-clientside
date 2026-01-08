// clientside/src/app/coordinator/students/page.tsx
"use client";

import { useState, useRef } from "react";
import { getStudents, bulkRegisterStudents } from "@/api/studentsApi";
import type { StudentFromAPI, StudentFormRow } from "@/api/types";
import { useToast } from "@/context/ToastContext";

export default function RegisterStudents() {
  const [students, setStudents] = useState<StudentFormRow[]>([
    { regNo: "", name: "", program: "", yearOfStudy: 1 },
  ]);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  // Add a new empty row
  const addRow = () => {
    setStudents([
      ...students,
      { regNo: "", name: "", program: "", yearOfStudy: 1 },
    ]);
  };

  const updateStudent = (
    index: number,
    field: keyof StudentFormRow,
    value: string | number
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

  // Add this inside your component, after the state declarations
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

  const duplicates = getDuplicates();

  // const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
  //   e.preventDefault();

  //   const raw = e.clipboardData.getData("text/plain");

  //   console.log("==== RAW PASTED START ====");
  //   console.log(JSON.stringify(raw, null, 2));
  //   console.log("==== RAW PASTED END ====");
  // };

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
          .trim()
      )
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

      let yearOfStudy = 1;
      const y = parseInt(yearText);
      if (!isNaN(y) && y >= 1 && y <= 5) yearOfStudy = y;

      result.push({ regNo, name, program, yearOfStudy });
    }

    if (result.length === 0) {
      addToast("No valid rows found.", "warning");
      return;
    }

    setStudents(result);
    addToast(`Successfully pasted ${result.length} students`, "success");
  };

  const extractAcademicYear = (regNo: string): string => {
    const match = regNo.match(/\/(\d{4})$/);
    return match ? `${match[1]}/${Number(match[1]) + 1}` : "2024/2025";
  };

  const handleSubmit = async () => {
    const filled = students
      .filter((s) => s.regNo.trim() && s.name.trim() && s.program.trim())
      .map((s) => ({
        ...s,
        admissionAcademicYear: extractAcademicYear(s.regNo),
      }));

    if (filled.length === 0) {
      addToast("Please fill at least one student", "error");
      return;
    }

    // Client-side duplicate check
    const regNos = filled.map((s) => s.regNo.trim().toUpperCase());
    const seen = new Set<string>();
    const clientDuplicates = regNos.filter(
      (reg) => seen.size === seen.add(reg).size
    );

    if (clientDuplicates.length > 0) {
      addToast(
        `Duplicate reg numbers found in list: ${clientDuplicates.join(", ")}`,
        "error"
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

      addToast(toastMessage, "success"); // ✅ Always show success/skip toast

      // RESET THE FORM INSTEAD OF RELOADING ALL STUDENTS
      setStudents([{ regNo: "", name: "", program: "", yearOfStudy: 1 }]);
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

  return (
    <div className="max-w-8xl ml-48 my-10 ">
      <div className="bg-white min-h-screen rounded-3xl shadow-2xl p-10">
       
       

         <div className="rounded-lg shadow-md border border-green-dark/20 p-4 ">
          <h1 className="text-2xl font-bold text-green-darkest">
            Register Students
          </h1>
 <p className=" text-green-dark">
          Add students to your institution. Required:{" "}
          <strong>Reg No, Name, Program</strong>
        </p>
         
        </div>

        {duplicates.size > 0 && (
          <div className="fixed right-6 top-24 z-50">
            <div className="mb-4 p-4 bg-red-600 text-white font-bold text-center rounded-full shadow-lg animate-pulse">
              <span className="text-xs animate-bounce">{duplicates.size}</span>
            </div>
          </div>
        )}

        {/* PASTE AREA */}
        <div
          ref={tableRef}
          onPaste={handlePaste}
          tabIndex={0}
          className="overflow-x-auto border-0 border-dashed border-blue-300 rounded-2xl p-6 mb-10 focus:border-blue-600 transition-all"
          style={{ outline: "none" }}
        >
          {/* Your table and inputs here */}
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-darkest to-green-dark text-lime-bright">
              <tr>
                <th className="px-4 py-2 text-left font-bold text-lg">
                  Reg No
                </th>
                <th className="px-6 py-2 text-left font-bold text-lg">
                  Full Name
                </th>
                <th className="px-6 py-2 text-left font-bold text-lg">
                  Program
                </th>
                <th className="px-6 py-2 text-left font-bold text-lg">Year</th>
                <th className="px-4 py-2 text-center font-bold text-lg">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border">
              {students.map((student, i) => {
           

                const safeReg = String(student.regNo || "");
                const safeName = String(student.name || "");
                const safeProgram = String(student.program || "");

                const currentReg = safeReg.trim().toUpperCase();
                const isDuplicate = currentReg && duplicates.has(currentReg);
                const isIncomplete =
                  !safeReg.trim() || !safeName.trim() || !safeProgram.trim(); // FIXED: Using safeProgram string here

                return (
                  <tr
                    key={i}
                    className={`
        hover:bg-green-base/20 transition-all duration-200
        ${isDuplicate ? "bg-red-100 border-l-4 border-red-600 shadow-lg" : ""}
        ${
          !isDuplicate && isIncomplete
            ? "bg-orange-50 border-l-4 border-orange-500"
            : ""
        }
        ${!isDuplicate && !isIncomplete ? "bg-white" : ""}
      `}
                  >
                    <td className="px-1 py-2   ">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          // value={student.regNo}
                          value={safeReg}
                          onChange={(e) =>
                            updateStudent(
                              i,
                              "regNo",
                              e.target.value.toUpperCase()
                            )
                          }
                          placeholder="SC/ICT/001/2023"
                          className={`
              w-full px-3 py-2 text-green-darkest rounded-lg font-bold transition-all outline-none
              ${
                isDuplicate
                  ? "bg-red-200 border-2 border-red-700 text-red-900 placeholder-red-400 shadow-md"
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
                        // value={student.name}
                        value={safeName}
                        onChange={(e) =>
                          updateStudent(i, "name", e.target.value)
                        }
                        placeholder="Patrick Kim"
                        className="text-green-darkest w-full px-2 rounded focus:ring-0 outline-0  "
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        // value={student.program}
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
                        value={student.yearOfStudy}
                        onChange={(e) =>
                          updateStudent(
                            i,
                            "yearOfStudy",
                            Number(e.target.value)
                          )
                        }
                        className="text-green-darkest text-center w-12  rounded focus:ring-0 outline-0  "
                        min="1"
                        max="6"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => removeRow(i)}
                        className="text-red-600 hover:text-red-800 font-bold  transition"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex gap-8 justify-center">
          <button
            onClick={addRow}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white-pure rounded-2xl hover:from-blue-700 hover:to-indigo-800 font-bold transition shadow-2xl"
          >
            + Add New Row
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-white-pure rounded-2xl hover:from-green-700 hover:to-emerald-800 font-bold  disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"
          >
            {loading
              ? "Saving..."
              : `Register ${
                  students.filter((s) => s.regNo && s.name && s.program).length
                } Students`}
          </button>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-green-darkest">Pro tip: Copy from Excel</p>
        </div>
      </div>
    </div>
  );
}
