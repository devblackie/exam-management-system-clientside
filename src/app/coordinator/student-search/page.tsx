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
} from "@/api/types";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/context/ToastContext";
import { X } from "lucide-react";

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
  const [message, setMessage] = useState("");
  const [lastComputed, setLastComputed] = useState<{
    grade: string;
    finalMark: number;
    status: string;
  } | null>(null);
    const { addToast } = useToast();
  

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
      // alert("Student not found or server error");
    } finally {
      setSearching(false);
    }
  };

  const viewStudent = async (regNo: string) => {
    const encoded = encodeURIComponent(regNo);
    setLoading(true);
    console.log("Fetching record for:", regNo);

    try {
      const record = await getStudentRecord(encoded);
      console.log("Full record loaded:", record);
      setSelectedStudent(record);
      setRawMarks([]);
      setActiveTab("grades");
    } catch (err) {
      console.error("Failed to load student record:", err);
      addToast("Failed to load student record", "error");

      // alert("Failed to load student record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" max-w-6xl h-full ml-48  my-10">
      <div className="bg-white rounded-3xl shadow-2xl p-10 min-h-screen">
        {/* ... header and search bar ... */}
        <div className=" rounded-lg shadow-md border border-green-dark/20 p-4 mb-4">
          <h1 className="text-2xl font-bold text-green-darkest">
            Student Academic Records Portal
          </h1>
        
        </div>

        {/* Search Bar */}
        <div className=" rounded-lg  mb-4">
          <div className="flex ">
            <input
              type="text"
              placeholder="e.g. ICS/001/2020"
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-4 py-2 text-green-darkest text-lg border border-green-darkest/40 rounded-br-none rounded-tr-none rounded-lg placeholder-green-dark/50 focus:outline-0 focus:border-green-darkest"

            />
            <button
              onClick={handleSearch}
              disabled={searching}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-white-pure rounded-lg rounded-bl-none rounded-tl-none  hover:from-green-700 hover:to-emerald-800 font-bold  disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"

              // className="px-10 py-4 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
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
                  <th className="text-left p-4 font-semibold ">
                    Reg No
                  </th>
                  <th className="text-left p-4 font-semibold ">
                    Full Name
                  </th>
                  <th className="text-left p-4 font-semibold">
                    Program
                  </th>
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
                  className={`inline-block px-4 py-2 rounded-full text-md font-bold ${
                    selectedStudent.currentStatus === "IN GOOD STANDING"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedStudent.currentStatus}
                </div>
                <div className="flex gap- mt-4">
                  {/* Full Transcript */}
                  <button
                    onClick={() =>
                      downloadTranscript(selectedStudent!.student.regNo)
                    }
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-white-pure rounded-lg rounded-br-none rounded-tr-none  hover:from-green-700 hover:to-emerald-800 font-bold  disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"

                    // className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-lg hover:shadow-xl transition"
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

                    // className="px-6 py-4 border-2 border-gray-300 rounded-lg text-gray-700 font-medium"
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
                className={`pb-4 px-2 text-xl font-bold border-b-4 transition ${
                  activeTab === "grades"
                    ? "border-green-darkest text-green-dark"
                    : "border-transparent text-green-darkest"
                }`}
              >
                Grades
              </button>
              <button
                onClick={() => setActiveTab("raw")}
                className={`pb-4 px-2 text-xl font-bold border-b-4 transition ${
                  activeTab === "raw"
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

                    <tr >
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
                      <tr key={grade._id} className="border-t text-green-darkest hover:bg-green-dark/30">
                        <td className="p-4">{grade.academicYear.year}</td>
                        <td className="p-4">{grade.semester}</td>
                        <td className="p-4 font-mono">
                          {grade.unit.code}
                        </td>
                        <td className="p-4">{grade.unit.name}</td>
                        <td className="p-4 text-center font-bold text-lg">
                          {grade.grade}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`py-1 px-4  rounded-full text-sm font-medium ${
                              grade.status === "PASS"
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
                    
                            <thead className="bg-gradient-to-r from-green-darkest to-green-dark text-lime-bright">

                        <tr>
                          <th className="p-4 font-semibold text-left">Year</th>
                          <th className="p-4 font-semibold text-left">Unit</th>
                          <th className="p-4 font-semibold text-center">CAT 1</th>
                          <th className="p-4 font-semibold text-center">CAT 2</th>
                          <th className="p-4 font-semibold text-center">CAT 3</th>
                          <th className="p-4 font-semibold text-center">Assign</th>
                          <th className="p-4 font-semibold text-center">Practical</th>
                          <th className="p-4 text-center font-bold">
                            EXAM
                          </th>
                          <th className="p-4 font-semibold text-center">Supp?</th>
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
                            className="border-t hover:bg-green-dark/20 cursor-pointer transition font-mono font-medium text-green-darkest/50"
                          >
                            <td className="p-4 text-green-dark/50">{m.academicYear.year}</td>
                            <td className="p-4 font-mono ">
                              {m.unit.code}
                            </td>
                            <td className="p-4 text-center ">
                              {m.cat1 ?? "-"}
                            </td>
                            <td className="p-4 text-center ">
                              {m.cat2 ?? "-"}
                            </td>
                            <td className="p-4 text-center">
                              {m.cat3 ?? "-"}
                            </td>
                            <td className="p-4 text-center ">
                              {m.assignment ?? "-"}
                            </td>
                            <td className="p-4 text-center ">
                              {m.practical ?? "-"}
                            </td>
                            <td className="p-4 text-center font-bold  ">
                              {m.exam ?? "MISSING"}
                            </td>
                            <td className="p-4 text-center ">
                              {m.isSupplementary ? "YES" : ""}
                            </td>
                            <td className="p-4 text-center font-bold  text-green-darkest">
                              Click to Edit
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
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-3xl max-w-3xl w-full max-h-[95vh] overflow-y-auto relative">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b-2 border-gray-200 px-10 py-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-green-dark">
                  {editingMark ? "Edit Marks" : "Add New Marks"}
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMark(null);
                    setLastComputed(null);
                  }}
                  className="text-gray-500 hover:text-red-600 text-4xl hover:rotate-90 transition"
                  disabled={savingMarks}
                >
                  <X />
                </button>
              </div>

              <div className="p-10">
                {/* Student Info */}
                <div className="bg-green-dark/10 border-2 border-b  p-4 mb-4">
                  <p className="text-md font-bold text-green-darkest">
                    {selectedStudent.student.name} •{" "}
                    {selectedStudent.student.regNo}
                  </p>
                  {editingMark && (
                    <div className="grid grid-cols-2 gap-8 text-md font-bold bg-gray-100 p-4  mt-3">
                      <div>
                        Unit: {editingMark.unit.code} - {editingMark.unit.name}
                      </div>
                      <div>Year: {editingMark.academicYear.year}</div>
                    </div>
                  )}
                </div>
                {/* Form */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSavingMarks(true);

                    const formData = new FormData(e.currentTarget);
                    const payload = {
                      regNo: selectedStudent.student.regNo,
                      unitCode:
                        editingMark?.unit.code ||
                        (formData.get("unitCode") as string),
                      academicYear:
                        editingMark?.academicYear.year ||
                        (formData.get("academicYear") as string),
                      cat1: formData.get("cat1")
                        ? Number(formData.get("cat1"))
                        : undefined,
                      cat2: formData.get("cat2")
                        ? Number(formData.get("cat2"))
                        : undefined,
                      cat3: formData.get("cat3")
                        ? Number(formData.get("cat3"))
                        : undefined,
                      assignment: formData.get("assignment")
                        ? Number(formData.get("assignment"))
                        : undefined,
                      practical: formData.get("practical")
                        ? Number(formData.get("practical"))
                        : undefined,
                      exam: formData.get("exam")
                        ? Number(formData.get("exam"))
                        : undefined,
                    };

                    try {
                      await saveRawMarks(payload);
      addToast("Marks updated successfully!", "success");

                      // alert("Marks updated successfully!");
                      await fetchRawMarks();
                      setShowEditModal(false);
                      setEditingMark(null);
                    } catch (error) {
      setMessage(getErrorMessage(error));
      addToast("Failed to save", "error");

                      // alert(err.response?.data?.error || "Failed to save");
                    } finally {
                      setSavingMarks(false);
                    }
                  }}
                >
                  {/* If editing existing → hide unit/year inputs */}
                  {editingMark ? (
                    <div className="grid grid-cols-2 gap-8 text-md font-bold bg-gray-100 p-4  mt-3">

                      <div>
                        Unit: {editingMark.unit.code} - {editingMark.unit.name}
                      </div>
                      <div>Year: {editingMark.academicYear.year}</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-6 mb-4">


                        <div>
                      <label className="block font-bold text-gray-700 mb-2">
                        CAT 1
                      </label>
                      <input
                        name="unitCode"
                        required
                        placeholder="Unit Code"
                                              className=" w-full rounded-md border border-green-darkest border-t-transparent bg-transparent px-3  py-3  text-green-dark  outline-0 transition-all  focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-green-base/40"
                        
                      /></div>

  <div>
                      <label className="block font-bold text-gray-700 mb-2">
                        CAT 1
                      </label>
                      <input
                        name="academicYear"
                        required
                        placeholder="Academic Year"
                      className=" w-full rounded-md border border-green-darkest border-t-transparent bg-transparent px-3  py-3  text-green-dark  outline-0 transition-all  focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-green-base/40"

                      /></div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">
                        CAT 1
                      </label>
                      <input
                        name="cat1"
                        type="number"
                        min="0"
                        max="30"
                      placeholder="Cat 1"

                        defaultValue={editingMark?.cat1 ?? ""}
                      className=" w-full rounded-md border border-green-darkest border-t-transparent bg-transparent px-3  py-3  text-green-dark  outline-0 transition-all  focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-green-base/40"

                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">
                        CAT 2
                      </label>
                      <input
                        name="cat2"
                        type="number"
                        min="0"
                        max="30"
                      placeholder="Cat 2"

                        defaultValue={editingMark?.cat2 ?? ""}
                      className=" w-full rounded-md border border-green-darkest border-t-transparent bg-transparent px-3  py-3  text-green-dark  outline-0 transition-all  focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-green-base/40"

                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-2">
                        Assignment
                      </label>
                      <input
                        name="assignment"
                        type="number"
                        min="0"
                        max="20"
                      placeholder="Assignment"

                        defaultValue={editingMark?.assignment ?? ""}
                      className=" w-full rounded-md border border-green-darkest border-t-transparent bg-transparent px-3  py-3  text-green-dark  outline-0 transition-all  focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-green-base/40"

                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <label className="block font-bold text-green-darkest text-xl mb-3">
                      EXAM MARK (0-70)
                    </label>
                    <input
                      name="exam"
                      type="number"
                      min="0"
                      max="70"
                      required={!editingMark || editingMark.exam === undefined}
                      defaultValue={editingMark?.exam ?? ""}
                      placeholder="Exam mark"
                      className=" w-full rounded-md border border-green-darkest border-t-transparent bg-transparent px-3  py-3  text-green-dark  outline-0 transition-all  focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-green-base/40"

                    />
                  </div>

                  <div className="flex gap-6 mt-4">
                    <button
                      type="submit"
                      disabled={savingMarks}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-white-pure rounded-lg  hover:from-green-700 hover:to-emerald-800 font-bold  disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"

                      // className="flex-1 py-6 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold text-2xl rounded-xl hover:shadow-2xl transition disabled:opacity-70 flex items-center justify-center gap-4"
                    >
                      {savingMarks ? (
                        <>
                          <span className="inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                          Saving...
                        </>
                      ) : (
                        "Save & Update Grade"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingMark(null);
                      }}
                      disabled={savingMarks}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-bold text-xl rounded-xl transition"
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
