// // clientside/src/app/coordinator/student-search/page.tsx
"use client";

import { useEffect, useState } from "react";
import { searchStudents, getStudentRecord, getRawMarks, saveRawMarks, getStudentJourney } from "@/api/studentsApi";
import type {
  StudentSearchResult,
  StudentFullRecord,
  RawMark,
  SaveMarksPayload,
  InstitutionSettings, 
  AcademicYear,
  StudentJourneyResponse,
} from "@/api/types";
import { getAcademicYears } from "@/api/marksApi"; 
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
import { getInstitutionSettings } from "@/api/institutionSettingsApi";
import JourneyTimeline from "@/components/coordinator/StudentSearch/JourneyTimeline";

type TabType = "grades" | "raw" | "journey";

export default function StudentSearchPage() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentFullRecord | null>(null);
  const [rawMarks, setRawMarks] = useState<RawMark[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMark, setEditingMark] = useState<RawMark | null>(null);
  const [selectedYearOfStudy, setSelectedYearOfStudy] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<TabType>("grades");  
  const [journeyData, setJourneyData] = useState<StudentJourneyResponse | null>(null);

  // States for metadata
  const [availableUnits, setAvailableUnits] = useState<Array<{ code: string; name: string }>>([]);
  const [availableYears, setAvailableYears] = useState<AcademicYear[]>([]);
  const [settings, setSettings] = useState<InstitutionSettings | null>(null); // Added settings state

  const { addToast } = useToast();

  // 1. Sync student record when Year of Study changes
  useEffect(() => {
    if (selectedStudent?.student.regNo) { viewStudent(selectedStudent.student.regNo); }
  }, [selectedYearOfStudy]);

  // 2. Fetch Raw Marks when switching tabs
  useEffect(() => {
    const fetchMarks = async () => {
      if (!selectedStudent || activeTab !== "raw") return;
      try {
        const marks = await getRawMarks(selectedStudent.student.regNo, selectedYearOfStudy);
        setRawMarks(marks);
      } catch {
        addToast("Failed to fetch assessment results", "error");
      }
    };
    fetchMarks();
  }, [selectedStudent, activeTab, selectedYearOfStudy]);

  // 3. Fetch Metadata AND Institution Settings
  useEffect(() => {
    const programId = selectedStudent?.student?.programId;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(programId || "");

    if (!isValidObjectId) return;

    const fetchMetadata = async () => {
      try {
        // We fetch Academic Years, Program Units, AND Institution Settings
        const [years, units, instSettings] = await Promise.all([
          getAcademicYears(),
          getProgramUnitLookup(programId!),
          getInstitutionSettings(), // Ensure this API helper exists
        ]);

        setAvailableYears(years);
        setAvailableUnits(units);
        setSettings(instSettings); // Store settings for the modal
        console.log("✅ Metadata & Policy Settings Loaded");
      } catch (err) {
        console.error("❌ Metadata fetch failed:", err);
        addToast("Failed to load program configurations", "error");
      }
    };

    fetchMetadata();
  }, [selectedStudent?.student?._id]); 

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

  const studentJourney = async (regNo: string) => {
    try {
      const data = await getStudentJourney(regNo);
      setJourneyData(data);
    } catch (err) { 
      addToast("Failed to load academic journey", "error");
      console.error(err); 
    }
  };

  const viewStudent = async (regNo: string) => {
    setLoading(true);
    try {
      const record = await getStudentRecord(encodeURIComponent(regNo), selectedYearOfStudy);
      setSelectedStudent(record);
      setActiveTab("grades");
    } catch {
      addToast(`Failed to load Year ${selectedYearOfStudy} records.`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMarks = async (payload: SaveMarksPayload) => {
    try {
      setLoading(true);
      await saveRawMarks(payload);
      addToast("Marks updated successfully!", "success");
      // if (selectedStudent) await viewStudent(selectedStudent.student.regNo);
      if (selectedStudent) {
        console.log("[UI] Re-fetching record for:", selectedStudent.student.regNo);
        await viewStudent(selectedStudent.student.regNo); 
      }
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
                  <StudentProfileHeader student={selectedStudent.student} onRefresh={() => viewStudent(selectedStudent.student.regNo)} />
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

              {/* TABS */}
              <div className="flex gap-12 border-b border-green-darkest/10 mb-5 px-4">
                {(["grades", "raw", "journey"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      if (tab === "journey") {
                        studentJourney(selectedStudent.student.regNo);
                      }
                    }}
                    className={`pb-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${
                      activeTab === tab
                        ? "text-green-darkest"
                        : "text-slate-400 hover:text-green-darkest/60"
                    }`}
                  >
                    {tab === "grades" ? "Official Grades" : tab === "raw" ? "Raw Data" : "Student Journey"}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-gold rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-lg border border-green-darkest/5 shadow-sm overflow-hidden">
                {activeTab === "grades" && (
                  <GradesTable grades={selectedStudent.grades} />
                )}
                {activeTab === "raw" && (
                  <RawMarksTable
                    marks={rawMarks}
                    studentName={selectedStudent.student.name}
                    onRefresh={() => viewStudent(selectedStudent.student.regNo)}
                    onEdit={(m) => { setEditingMark(m); setShowEditModal(true); }}
                    onAddNew={() => { setEditingMark(null); setShowEditModal(true); }}
                    isReadOnly={isReadOnly}
                  />
                )}
                {/* FIX 4: Types now overlap correctly */}
                {activeTab === "journey" && journeyData && (
                  <JourneyTimeline data={journeyData} />
                )}
              </div>
            </div>
          )
        )}

        {/* MODAL FIX: settings prop is now passed */}
        {selectedStudent && (
          <EditMarksModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            student={selectedStudent}
            editingMark={editingMark}
            onSave={handleSaveMarks}
            availableUnits={availableUnits}
            availableYears={availableYears}
            settings={settings}
          />
        )}
      </div>
    </div>
  );
}
