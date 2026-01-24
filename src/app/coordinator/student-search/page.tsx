"use client";

import { useEffect, useState } from "react";
import {
  searchStudents,
  getStudentRecord,
  getRawMarks,
  saveRawMarks,
} from "@/api/studentsApi";
import type {
  StudentSearchResult,
  StudentFullRecord,
  RawMark,
  SaveMarksPayload,
} from "@/api/types";
import { useToast } from "@/context/ToastContext";

// New Components
import SearchBar from "@/components/coordinator/StudentSearch/SearchBar";
import ResultsTable from "@/components/coordinator/StudentSearch/ResultsTable";
import GradesTable from "@/components/coordinator/StudentSearch/GradesTable";
import RawMarksTable from "@/components/coordinator/StudentSearch/RawMarksTable";
import AcademicStatusBox from "@/components/coordinator/StudentSearch/AcademicStatusBox";
import StudentProfileHeader from "@/components/coordinator/StudentSearch/StudentProfileHeader";
import EditMarksModal from "@/components/coordinator/StudentSearch/EditMarksModal";

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
  const [selectedStudent, setSelectedStudent] = useState<StudentFullRecord | null>(null);
  const [rawMarks, setRawMarks] = useState<RawMark[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"grades" | "raw">("grades");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMark, setEditingMark] = useState<RawMark | null>(null);
 const [selectedYearOfStudy, setSelectedYearOfStudy] = useState<number>(1);
  const { addToast } = useToast();

useEffect(() => {
  if (selectedStudent?.student.regNo) {
    // This calls the updated API service with the new yearOfStudy
    viewStudent(selectedStudent.student.regNo);
  }
}, [selectedYearOfStudy]);

  // 2. Fetch raw marks when student or tab changes
  useEffect(() => {
    const fetchMarks = async () => {
      if (!selectedStudent || activeTab !== "raw") return;
      try {
        const marks = await getRawMarks(selectedStudent.student.regNo);
        setRawMarks(marks);
      } catch {
        addToast("Failed to fetch assessment results", "error");
      }
    };
    fetchMarks();
  }, [selectedStudent, activeTab, addToast]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const results = await searchStudents(query);
      setSearchResults(results);
      setSelectedStudent(null);
    } catch (err) {
      addToast("Student search failed", "error");
    } finally {
      setSearching(false);
    }
  };

 const viewStudent = async (regNo: string) => {
  setLoading(true);
  try {
    // API should now accept 'yearOfStudy' as a parameter instead of calendar year
    // const record = await getStudentRecord(encodeURIComponent(regNo), selectedYearOfStudy.toString());
    const record = await getStudentRecord(encodeURIComponent(regNo), selectedYearOfStudy);
    setSelectedStudent(record);
    setActiveTab("grades");
  } catch {
    addToast("Failed to load records for Year " + selectedYearOfStudy, "error");
  } finally {
    setLoading(false);
  }
};

  const handleSaveMarks = async (payload: SaveMarksPayload) => {
    try {
      await saveRawMarks(payload);
      addToast("Marks updated successfully!", "success");
      // Refresh current data
      if (selectedStudent) await viewStudent(selectedStudent.student.regNo);
    } catch {
      addToast("Failed to save marks", "error");
    }
  };

  return (
    <div className="max-w-8xl ml-48 my-10">
      <div className="bg-white rounded-3xl shadow-2xl p-10 min-h-screen">
        <div className="rounded-lg shadow-md border border-green-dark/20 p-4 mb-4">
          <h1 className="text-2xl font-bold text-green-darkest">Student Academic Records Portal</h1>
        </div>

       <SearchBar
  query={query}
  setQuery={setQuery}
  onSearch={handleSearch}
  searching={searching}
  selectedYearOfStudy={selectedYearOfStudy}
  setSelectedYearOfStudy={setSelectedYearOfStudy}
/>

        <ResultsTable results={searchResults} onSelect={viewStudent} visible={!selectedStudent && !loading} />

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-green-dark border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-green-darkest">Loading student record...</p>
          </div>
        )}

        {selectedStudent && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
              <div className="flex-1">
                <StudentProfileHeader student={selectedStudent.student} />

              </div>

              <div className="lg:w-1/2">
                {selectedStudent.academicStatus && (
                <AcademicStatusBox
  status={selectedStudent.academicStatus}
  currentYearOfStudy={selectedStudent.student.currentYear} // From Student DB Record
  viewingYear={selectedYearOfStudy}                       // From UI state
  studentId={selectedStudent.student._id}
  onPromoteSuccess={() => viewStudent(selectedStudent.student.regNo)}
/>
                )}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-10 border-b-2 border-green-darkest/10 mb-6">
              {(["grades", "raw"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all border-b-4 ${activeTab === tab ? "border-green-darkest text-green-darkest" : "border-transparent text-gray-400"
                    }`}
                >
                  {tab === "grades" ? "Official Grades" : "Raw Assessment Marks"}
                </button>
              ))}
            </div>

            {activeTab === "grades" ? (
              <GradesTable grades={selectedStudent.grades} />
            ) : (
              <RawMarksTable
                marks={rawMarks}
                studentName={selectedStudent.student.name}
    onRefresh={() => viewStudent(selectedStudent.student.regNo)}
                onEdit={(m) => { setEditingMark(m); setShowEditModal(true); }}
                onAddNew={() => { setEditingMark(null); setShowEditModal(true); }}
              />
            )}
          </div>
        )}

        {selectedStudent && (
          <EditMarksModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            student={selectedStudent}
            editingMark={editingMark}
            onSave={handleSaveMarks}
          />
        )}
      </div>
    </div>
  );
}