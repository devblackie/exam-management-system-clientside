// clientside/src/app/coordinator/student-search/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  searchStudents,
  getStudentRecord,
  downloadTranscript,
  getRawMarks,
  saveRawMarks,
} from "@/api/studentsApi";
import type {
  StudentSearchResult,
  StudentFullRecord,
  GradeRecord,
  RawMark,
  SaveMarksPayload,
} from "@/api/types";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/context/ToastContext";
import { AlertTriangle, CheckCircle, X } from "lucide-react";
import { getAcademicYears } from "@/api/academicYearsApi";
import type { AcademicYear } from "@/api/types";

// Helper to extract error message from unknown error objects
const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message || "Request failed";
  }
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred";
};

export default function StudentSearchPage() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentFullRecord | null>(null);
  const [rawMarks, setRawMarks] = useState<RawMark[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"grades" | "raw">("grades");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMark, setEditingMark] = useState<RawMark | null>(null);
  const [savingMarks, setSavingMarks] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const { addToast } = useToast();

  // 
  const fetchRawMarks = async () => {
    if (!selectedStudent) return;
    try {
      const marks = await getRawMarks(selectedStudent.student.regNo);
      setRawMarks(marks);
    } catch {
      console.error("Failed to load raw marks");
      addToast("Failed to fetch results", "error");
      setRawMarks([]);
    }
  };

  // 1. Fetch years from DB on mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const years = await getAcademicYears();
        setAcademicYears(years);
        // Automatically select the most recent year
        if (years.length > 0) {
          setSelectedYear(years[years.length - 1].year);
        }
      } catch {
        addToast("Failed to load academic years from database", "error");
      }
    };
    fetchYears();
  }, []);

  useEffect(() => {
    if (selectedStudent && activeTab === "raw") fetchRawMarks();
  }, [selectedStudent, activeTab]);


  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    console.log("Searching for:", query);

    try {
      const results = await searchStudents(query);
      console.log("Search results:", results);
      setSearchResults(results);
      setSelectedStudent(null);
    } catch (err) {
      console.error("Search error:", err);
      addToast("Student not found or server error", "error");
    } finally {
      setSearching(false);
    }
  };

  const viewStudent = async (regNo: string) => {
    if (!selectedYear) {
      addToast("Please select an academic year first", "warning");
      return;
    }

    const encoded = encodeURIComponent(regNo);
    setLoading(true);
    console.log("Fetching record for:", regNo);

    try {
      const record = await getStudentRecord(encoded, selectedYear);
      console.log("Full record loaded:", record);
      setSelectedStudent(record);
      setRawMarks([]);
      setActiveTab("grades");
    } catch (err) {
      console.error("Failed to load student record:", err);
      addToast("Failed to load student record", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" max-w-8xl ml-48  my-10">
      <div className="bg-white rounded-3xl shadow-2xl p-10 min-h-screen">
        {/* ... header and search bar ... */}
        <div className="rounded-lg shadow-md border border-green-dark/20 p-4 mb-4">
          <h1 className="text-2xl font-bold text-green-darkest">
            Student Academic Records Portal
          </h1>
        </div>

        {/* Search Bar */}
        <div className=" rounded-lg shadow-md  mb-4">
          <div className="flex ">
            <input
              type="text"
              placeholder="e.g. SC/ICT/001/2023"
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-4 py-2 text-sm text-green-darkest/50  border border-r-transparent border-green-dark/20 rounded-br-none rounded-tr-none rounded-lg placeholder-green-dark/50 focus:outline-0 focus:border-green-darkest"
            />

            {/* NEW YEAR SELECTOR */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 bg-white border border-l-transparent border-green-dark/20  text-green-darkest font-bold outline-none cursor-pointer"
            >
              <option value="" disabled>Select Year</option>
              {academicYears.map((y) => (
                <option key={y._id} value={y.year}>
                  {y.year}
                </option>
              ))}
            </select>

            <button
              onClick={handleSearch}
              disabled={searching}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-white-pure rounded-lg rounded-bl-none rounded-tl-none  hover:from-green-700 hover:to-emerald-800 font-bold  disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              {searching ? "Searching..." : "Search Student"}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && !selectedStudent && (
          <div className=" rounded-lg  overflow-hidden border shadow-xl">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-darkest to-green-dark text-lime-bright">
                <tr>
                  <th className="text-left p-4 font-semibold ">Reg No</th>
                  <th className="text-left p-4 font-semibold ">Full Name</th>
                  <th className="text-left p-4 font-semibold">Program</th>
                  <th className="text-right p-4"></th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((student) => (
                  <tr
                    key={student._id}
                    className="border-t hover:bg-green-dark/30 transition"
                  >
                    <td className="p-4 font-mono text-green-darkest">
                      {student.regNo}
                    </td>
                    <td className="p-4 text-green-darkest">{student.name}</td>
                    <td className="p-4 text-green-darkest">
                      {student.program?.name || "N/A"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => viewStudent(student.regNo)}
                        className="text-green-dark hover:text-green-darkest font-medium"
                      >
                        View Record →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Selected Student */}
        {selectedStudent && (
          <div className=" rounded-lg shadow-md border border-green-dark/20 p-8">
            {/* Student Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-green-dark">
                  {selectedStudent.student.name}
                </h2>
                <p className="text-md text-green-darkest/70 mt-1">
                  {selectedStudent.student.regNo} •{" "}
                  {selectedStudent.student.program}
                </p>
              </div>
              <div className="text-right">
                <div

                >

                  {/* ACADEMIC STATUS ALERT BOX */}
                  {selectedStudent?.academicStatus && (
                    <div className={`mb-6 p-4 rounded-xl border-l-4 flex items-start gap-3 shadow-sm ${selectedStudent.academicStatus.variant === 'success' ? 'bg-green-50 border-green-500 text-green-800' :
                        selectedStudent.academicStatus.variant === 'warning' ? 'bg-yellow-50 border-yellow-500 text-yellow-800' :
                          'bg-red-50 border-red-500 text-red-800'
                      }`}>
                      <div className="mt-1 flex-shrink-0">
                        {selectedStudent.academicStatus.variant === 'success' ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : (
                          <AlertTriangle size={20} className={selectedStudent.academicStatus.variant === 'error' ? 'text-red-600' : 'text-yellow-600'} />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-md leading-tight mb-1">
                          {selectedStudent.academicStatus.status}
                        </h3>
                        <p className="text-xs font-mono opacity-90 mb-4">
                          {selectedStudent.academicStatus.details}
                        </p>

                        {/* UNIT BREAKDOWN GRID */}
                        <div className="space-y-4">

                          {/* 1. MISSING UNITS (Info/Blue) */}
                          {selectedStudent.academicStatus.missingList?.length > 0 && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 block mb-1">Missing Records</span>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {selectedStudent.academicStatus.missingList.map((unitStr, idx) => (
                                  <li key={idx} className="text-xs font-mono bg-blue-100/50 border border-blue-200 p-2 rounded flex items-center gap-2">
                                    <span className="text-blue-500">❓</span> {unitStr}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* 2. SUPPLEMENTARIES / FAILED (Warning/Amber) */}
                          {selectedStudent.academicStatus.failedList?.length > 0 && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block mb-1">Pending Supplementaries (1st Attempt)</span>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {selectedStudent.academicStatus.failedList.map((unitStr, idx) => (
                                  <li key={idx} className="text-xs font-mono bg-amber-100/50 border border-amber-200 p-2 rounded flex items-center gap-2">
                                    <span className="text-amber-500">📝</span> {unitStr}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* 3. RETAKES (Danger/Orange) */}
                          {selectedStudent.academicStatus.retakeList?.length > 0 && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 block mb-1">Carry Over / Retakes (2nd Attempt)</span>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {selectedStudent.academicStatus.retakeList.map((unitStr, idx) => (
                                  <li key={idx} className="text-xs font-mono bg-orange-100/50 border border-orange-200 p-2 rounded flex items-center gap-2 font-semibold">
                                    <span className="text-orange-600">🔄</span> {unitStr}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* 4. RE-RETAKES (Critical/Red) */}
                          {selectedStudent.academicStatus.reRetakeList?.length > 0 && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 block mb-1">Critical Failures (3rd Attempt+)</span>
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {selectedStudent.academicStatus.reRetakeList.map((unitStr, idx) => (
                                  <li key={idx} className="text-xs font-mono bg-red-100 border border-red-200 p-2 rounded flex items-center gap-2 font-bold animate-pulse">
                                    <span className="text-red-600">🚫</span> {unitStr}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Summary Footer */}
                        <div className="mt-5 pt-3 border-t border-black/5 flex gap-6 text-[11px] font-bold uppercase tracking-tighter">
                          <div className="flex items-center gap-1 text-green-600">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Passed: {selectedStudent.academicStatus.summary.passed}
                          </div>
                          <div className="flex items-center gap-1 text-red-600">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Failed: {selectedStudent.academicStatus.summary.failed}
                          </div>
                          {selectedStudent.academicStatus.summary.missing > 0 && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              Missing: {selectedStudent.academicStatus.summary.missing}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
                <div className="flex gap- mt-4">
                  {/* Full Transcript */}
                  <button
                    onClick={() =>
                      downloadTranscript(selectedStudent!.student.regNo)
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-white-pure rounded-lg rounded-br-none rounded-tr-none  hover:from-green-700 hover:to-emerald-800 font-bold  disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"
                  >
                    Download Full Transcript
                  </button>

                  {/* Per Year */}
                  <select
                    onChange={(e) => {
                      if (e.target.value && selectedStudent) {
                        downloadTranscript(
                          selectedStudent.student.regNo,
                          e.target.value
                        );
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-lime-bright to-green-dark text-white-pure rounded-lg rounded-bl-none rounded-tl-none  hover:from-green-700 hover:to-emerald-800 font-bold  disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Download by Year
                    </option>
                    {selectedStudent &&
                      [
                        ...new Set(
                          selectedStudent.grades.map(
                            (g: GradeRecord) => g.academicYear.year
                          )
                        ),
                      ]
                        .sort()
                        .map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Tabs */}
            <div className="flex gap-10 border-b-2 border-green-darkest/30 mb-4">
              <button
                onClick={() => setActiveTab("grades")}
                className={`pb-4 px-2 text-xl font-bold border-b-4 transition ${activeTab === "grades"
                  ? "border-green-darkest text-green-dark"
                  : "border-transparent text-green-darkest"
                  }`}
              >
                Grades
              </button>
              <button
                onClick={() => setActiveTab("raw")}
                className={`pb-4 px-2 text-xl font-bold border-b-4 transition ${activeTab === "raw"
                  ? "border-green-darkest text-green-dark"
                  : "border-transparent text-green-darkest"
                  }`}
              >
                Marks
              </button>
            </div>

            {/* Final Grades Tab */}
            {activeTab === "grades" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-darkest to-green-dark font-semibold text-lime-bright">
                    <tr>
                      <th className="p-4 text-left">Year</th>
                      <th className="p-4 text-left">Semester</th>
                      <th className="p-4 text-left">Unit Code</th>
                      <th className="p-4 text-left">Unit Name</th>
                      <th className="p-4 text-center">Grade</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudent?.grades.map((grade: GradeRecord) => (
                      <tr
                        key={grade._id}
                        className="border-t border-green-darkest/20 text-sm text-green-darkest hover:bg-green-dark/30"
                      >
                        {/* 1. Academic Year */}
                        <td className="p-2">
                          {grade.academicYear?.year || "N/A"}
                        </td>

                        {/* 2. Semester */}
                        <td className="p-2">
                          {grade.semester && grade.semester !== "N/A"
                            ? `Semester ${grade.semester}`
                            : "Not Set"}
                        </td>

                        {/* 3. Unit Code */}
                        <td className="p-2 font-mono">
                          {grade.unit?.code || "N/A"}
                        </td>

                        {/* 4. Unit Name */}
                        <td className="p-2">
                          {grade.unit?.name || "Unit details missing"}
                        </td>

                        {/* 5. Grade */}
                        <td className="p-4 text-center font-semibold">
                          {grade.grade}
                        </td>

                        {/* 6. Status */}
                        <td className="p-2 text-center">
                          <span
                            className={`py-1 px-4  rounded-full text-xs font-medium ${grade.status === "PASS"
                              ? "bg-green-100 text-green-800"
                              : grade.status === "INCOMPLETE"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                              }`}
                          >
                            {grade.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Raw Marks Tab */}
            {activeTab === "raw" && (
              <div className="bg-green-dark/10  rounded-2xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-green-darkest">
                    Raw Assessment Marks
                  </h3>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="text-center px-4 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-white-pure rounded-lg rounded-bl-none rounded-tl-none hover:scale-105 hover:from-green-700 hover:to-emerald-800 font-bold  disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"
                  >
                    Add / Edit Missing Marks
                  </button>
                </div>
                {rawMarks.length === 0 ? (
                  <p className="text-xl text-green-darkest">
                    No raw marks uploaded yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-green-darkest to-green-dark text-sm text-lime-bright">
                        <tr>
                          <th className="p-4 font-semibold text-left">Year</th>
                          <th className="p-4 font-semibold text-left">Unit</th>
                          <th className="p-4 font-semibold text-center">
                            CAT 1
                          </th>
                          <th className="p-4 font-semibold text-center">
                            CAT 2
                          </th>
                          <th className="p-4 font-semibold text-center">
                            CAT 3
                          </th>
                          <th className="p-4 font-semibold text-center">
                            Assign
                          </th>
                          <th className="p-4 font-semibold text-center">
                            Total CAT, ASSIGNMENT
                          </th>
                          <th className="p-4 font-semibold text-center">
                            Exam Total
                          </th>
                          <th className="p-4 text-center font-bold">
                            Agreed Mark
                          </th>
                          <th className="p-4 font-semibold text-center">
                            Supp?
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rawMarks.map((m) => (
                          <tr
                            key={m._id}
                            onClick={() => {
                              setEditingMark(m);
                              setShowEditModal(true);
                            }}
                            className="border-t border-green-dark/20 hover:bg-green-dark/20 cursor-pointer transition font-mono font-medium text-sm text-green-darkest/50"
                          >
                            <td className="p-3">{m.academicYear.year}</td>
                            <td className="p-3 font-mono">
                              {m.programUnit?.unit?.code}
                            </td>
                            <td className="p-3 text-center">
                              {m.cat1Raw ?? "-"}
                            </td>
                            <td className="p-3 text-center">
                              {m.cat2Raw ?? "-"}
                            </td>
                            <td className="p-3 text-center">
                              {m.cat3Raw ?? "-"}
                            </td>
                            <td className="p-3 text-center">
                              {m.assgnt1Raw ?? "-"}
                            </td>
                            {/* Display the calculated totals for quick reference */}
                            <td className="p-3 text-center font-bold">
                              {m.caTotal30 ?? 0}
                            </td>
                            <td className="p-3 text-center  font-bold">
                              {m.examTotal70 ?? 0}
                            </td>
                            <td className="p-3 text-center font-black">
                              {m.agreedMark ?? 0}
                            </td>
                            <td className="p-3 text-center ">
                              {m.isSupplementary ? "YES" : ""}
                            </td>
                            <td className="p-3 text-center font-bold  text-green-darkest">
                              Edit
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* EDIT MODAL */}
        {showEditModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-3xl max-w-3xl w-full max-h-[95vh] overflow-y-auto relative">
              <div className="sticky top-0 bg-white border-b px-10 py-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-green-dark">
                  {editingMark ? "Edit Marks" : "Add New Marks"}
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMark(null);
                  }}
                  className="text-gray-500 hover:text-red-600"
                >
                  <X size={32} />
                </button>
              </div>

              <div className="p-10">
                <div className="bg-green-50 p-4 rounded-xl mb-6">
                  <p className="font-bold text-green-darkest">
                    {selectedStudent.student.name} (
                    {selectedStudent.student.regNo})
                  </p>
                  {editingMark && (
                    <p className="text-sm text-green-dark">
                      Unit: {editingMark.programUnit?.unit?.code} | Year:{" "}
                      {editingMark.academicYear.year}
                    </p>
                  )}
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSavingMarks(true);
                    const formData = new FormData(e.currentTarget);

                    // Construct payload with explicit types to avoid 'any'
                    const payload: SaveMarksPayload = {
                      regNo: selectedStudent.student.regNo,
                      unitCode:
                        editingMark?.programUnit?.unit?.code ||
                        (formData.get("unitCode") as string),
                      academicYear:
                        editingMark?.academicYear.year ||
                        (formData.get("academicYear") as string),
                      cat1: Number(formData.get("cat1")) || 0,
                      cat2: Number(formData.get("cat2")) || 0,
                      cat3: Number(formData.get("cat3")) || 0,
                      assignment1: Number(formData.get("assignment1")) || 0,
                      examQ1: Number(formData.get("examQ1")) || 0,
                      examQ2: Number(formData.get("examQ2")) || 0,
                      examQ3: Number(formData.get("examQ3")) || 0,
                      examQ4: Number(formData.get("examQ4")) || 0,
                      examQ5: Number(formData.get("examQ5")) || 0,
                    };

                    try {
                      await saveRawMarks(payload); // No more 'as any'
                      addToast("Marks updated successfully!", "success");
                      await fetchRawMarks();
                      if (selectedStudent) {
                        await viewStudent(selectedStudent.student.regNo);
                      }
                      setShowEditModal(false);

                      setEditingMark(null);
                    } catch (err) {
                      addToast(getErrorMessage(err), "error");
                    } finally {
                      setSavingMarks(false);
                    }
                  }}
                >
                  {!editingMark && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <input
                        name="unitCode"
                        required
                        placeholder="Unit Code (e.g. ICS 2101)"
                        className="p-3 border rounded-lg"
                      />
                      <input
                        name="academicYear"
                        required
                        placeholder="Year (e.g. 2023/2024)"
                        className="p-3 border rounded-lg"
                      />
                    </div>
                  )}

                  {/* Coursework Section */}
                  <div className="mb-8 p-4 border-l-4 border-green-600 bg-green-50/50">
                    <h4 className="font-bold text-green-800 mb-4">
                      Coursework (CATs /20, Assignment /10)
                    </h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500">
                          CAT 1
                        </label>
                        <input
                          name="cat1"
                          type="number"
                          step="0.1"
                          max="20"
                          className="w-full p-2 border rounded text-gray-400"
                          defaultValue={editingMark?.cat1Raw ?? ""}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500">
                          CAT 2
                        </label>
                        <input
                          name="cat2"
                          type="number"
                          step="0.1"
                          max="20"
                          className="w-full p-2 border rounded text-gray-400"
                          defaultValue={editingMark?.cat2Raw ?? ""}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500">
                          CAT 3
                        </label>
                        <input
                          name="cat3"
                          type="number"
                          step="0.1"
                          max="20"
                          className="w-full p-2 border rounded text-gray-400"
                          defaultValue={editingMark?.cat3Raw ?? ""}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500">
                          ASSGN 1
                        </label>
                        <input
                          name="assignment1"
                          type="number"
                          step="0.1"
                          max="10"
                          className="w-full p-2 border rounded text-gray-400"
                          defaultValue={editingMark?.assgnt1Raw ?? ""}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Exam Section */}
                  <div className="mb-8 p-4 border-l-4 border-blue-600 bg-blue-50/50">
                    <h4 className="font-bold text-blue-800 mb-4">
                      Final Exam (Q1 /10, Q2-5 /20)
                    </h4>
                    <div className="grid grid-cols-5 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500">
                          Q1 (/10)
                        </label>
                        <input
                          name="examQ1"
                          required
                          type="number"
                          step="0.1"
                          max="10"
                          className="w-full p-2 border border-blue-300 rounded text-gray-400"
                          defaultValue={editingMark?.examQ1Raw ?? ""}
                        />
                      </div>
                      {[2, 3, 4, 5].map((q) => {
                        // Explicitly map the number to the correct RawMark key
                        const key = `examQ${q}Raw` as keyof RawMark;
                        const defaultValue = editingMark
                          ? (editingMark[key] as number)
                          : "";

                        return (
                          <div key={q}>
                            <label className="text-xs font-bold text-gray-500">
                              Q{q} (/20)
                            </label>
                            <input
                              name={`examQ${q}`}
                              type="number"
                              step="0.1"
                              max="20"
                              className="w-full p-2 border border-blue-300 rounded text-gray-400"
                              defaultValue={defaultValue}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={savingMarks}
                      className="flex-1 py-4 bg-green-800 text-white font-bold rounded-xl hover:bg-green-900 transition disabled:opacity-50"
                    >
                      {savingMarks ? "Saving Marks..." : "Confirm & Save Marks"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingMark(null);
                      }}
                      className="px-8 py-4 bg-gray-600 rounded-xl font-bold text-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}



        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-green-dark border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-green-darkest">
              Loading student record...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
