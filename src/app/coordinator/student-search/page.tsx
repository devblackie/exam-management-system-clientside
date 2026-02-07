// // clientside/src/app/coordinator/student-search/page.tsx
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
  ProgramUnit,
  Unit,
} from "@/api/types";
import { getAcademicYears } from "@/api/marksApi";
import { AcademicYear } from "@/api/types";
import { useToast } from "@/context/ToastContext";

// Components
import SearchBar from "@/components/coordinator/StudentSearch/SearchBar";
import ResultsTable from "@/components/coordinator/StudentSearch/ResultsTable";
import GradesTable from "@/components/coordinator/StudentSearch/GradesTable";
import RawMarksTable from "@/components/coordinator/StudentSearch/RawMarksTable";
import AcademicStatusBox from "@/components/coordinator/StudentSearch/AcademicStatusBox";
import StudentProfileHeader from "@/components/coordinator/StudentSearch/StudentProfileHeader";
import EditMarksModal from "@/components/coordinator/StudentSearch/EditMarksModal";
import PageHeader from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { getProgramUnitLookup } from "@/api/programUnitsApi";

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
  const [selectedYearOfStudy, setSelectedYearOfStudy] = useState<number>(1);

  // States for metadata
  const [availableUnits, setAvailableUnits] = useState<
    Array<{ code: string; name: string }>
  >([]);
  const [availableYears, setAvailableYears] = useState<AcademicYear[]>([]);

  const { addToast } = useToast();

  // 1. Sync student record when Year of Study changes
  useEffect(() => {
    if (selectedStudent?.student.regNo) {
      viewStudent(selectedStudent.student.regNo);
    }
  }, [selectedYearOfStudy]);

  // 2. Fetch Raw Marks when switching to Raw Assessment Data tab
  useEffect(() => {
    const fetchMarks = async () => {
      if (!selectedStudent || activeTab !== "raw") return;
      try {
        const marks = await getRawMarks(
          selectedStudent.student.regNo,
          selectedYearOfStudy,
        );
        setRawMarks(marks);
      } catch {
        addToast("Failed to fetch assessment results", "error");
      }
    };
    fetchMarks();
  }, [selectedStudent, activeTab, selectedYearOfStudy]);

  // 3. Fetch Metadata (Units & Academic Years) for the Program

  useEffect(() => {
    // Use the explicit programId we just added to the backend
    const programId = selectedStudent?.student?.programId;

    // Defensive check: Ensure it's a valid 24-character hex ID
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(programId || "");

    if (!isValidObjectId) return;

    const fetchMetadata = async () => {
      try {
        const [years, units] = await Promise.all([
          getAcademicYears(),
          getProgramUnitLookup(programId!),
        ]);

        setAvailableYears(years);
        setAvailableUnits(units);
        console.log("✅ Curriculum loaded for ID:", programId);
      } catch (err) {
        console.error("❌ Metadata fetch failed:", err);
        addToast("Failed to load program units", "error");
      }
    };

    fetchMetadata();
  }, [selectedStudent?.student?._id]); // Trigger on student change

  const isReadOnly =
    selectedStudent?.academicStatus?.status === "IN GOOD STANDING" &&
    selectedYearOfStudy < selectedStudent.student.currentYear;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const results = await searchStudents(query);
      setSearchResults(results);
      setSelectedStudent(null);
    } catch {
      addToast("Student search failed", "error");
    } finally {
      setSearching(false);
    }
  };

  const viewStudent = async (regNo: string) => {
    setLoading(true);
    try {
      const record = await getStudentRecord(
        encodeURIComponent(regNo),
        selectedYearOfStudy,
      );

      if (!record.student) throw new Error("Invalid record structure");

      setSelectedStudent(record);
      setActiveTab("grades");
    } catch (err) {
      console.error("View Student Error:", err);
      addToast(
        `Failed to load Year ${selectedYearOfStudy} records.`,
        // "Failed to load records for Year " + selectedYearOfStudy,
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMarks = async (payload: SaveMarksPayload) => {
    try {
      await saveRawMarks(payload);
      addToast("Marks updated successfully!", "success");
      // Refresh the view to show newly calculated totals/grades
      if (selectedStudent) await viewStudent(selectedStudent.student.regNo);
      setShowEditModal(false);
    } catch {
      addToast("Failed to save marks", "error");
    }
  };

  return (
    <div className="max-w-8xl ml-48 my-10">
      <div className="bg-[#F8F9FA] rounded-lg shadow-2xl p-10 min-h-screen">
        <PageHeader
          title="Student Academic"
          highlightedTitle="Records"
          systemLabel=" "
        />

        <SearchBar
          query={query}
          setQuery={setQuery}
          onSearch={handleSearch}
          searching={searching}
          selectedYearOfStudy={selectedYearOfStudy}
          setSelectedYearOfStudy={setSelectedYearOfStudy}
        />

        <ResultsTable
          results={searchResults}
          onSelect={viewStudent}
          visible={!selectedStudent && !loading}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingState message="Fetching academic data..." />
          </div>
        ) : (
          selectedStudent && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="flex flex-col lg:flex-row gap-6 mb-8">
                <div className="flex-1">
                  <StudentProfileHeader student={selectedStudent.student} />
                </div>
                <div className="lg:w-1/2">
                  <AcademicStatusBox
                    status={selectedStudent.academicStatus}
                    currentYearOfStudy={selectedStudent.student.currentYear}
                    viewingYear={selectedYearOfStudy}
                    studentId={selectedStudent.student._id}
                    academicYearName={
                      selectedStudent.academicStatus.academicYearName
                    }
                    onPromoteSuccess={() =>
                      viewStudent(selectedStudent.student.regNo)
                    }
                  />
                </div>
              </div>

              {/* TABS CONTEXT */}
              <div className="flex gap-12 border-b border-green-darkest/10 mb-5 px-4">
                {(["grades", "raw"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${
                      activeTab === tab
                        ? "text-green-darkest"
                        : "text-slate-400 hover:text-green-darkest/60"
                    }`}
                  >
                    {tab === "grades"
                      ? "Official Grades"
                      : "Raw Assessment Data"}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-gold rounded-t-full animate-in fade-in zoom-in" />
                    )}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-lg border border-green-darkest/5 shadow-sm overflow-hidden">
                {activeTab === "grades" ? (
                  <GradesTable grades={selectedStudent.grades} />
                ) : (
                  <RawMarksTable
                    marks={rawMarks}
                    studentName={selectedStudent.student.name}
                    onRefresh={() => viewStudent(selectedStudent.student.regNo)}
                    onEdit={(m) => {
                      setEditingMark(m);
                      setShowEditModal(true);
                    }}
                    onAddNew={() => {
                      setEditingMark(null);
                      setShowEditModal(true);
                    }}
                    isReadOnly={isReadOnly}
                  />
                )}
              </div>
            </div>
          )
        )}

        {selectedStudent && (
          <EditMarksModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            student={selectedStudent}
            editingMark={editingMark}
            onSave={handleSaveMarks}
            availableUnits={availableUnits}
            availableYears={availableYears}
          />
        )}
      </div>
    </div>
  );
}
