
// clientside/src/app/coordinator/upload/page.tsx
"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { usePrograms } from "@/hooks/queries/usePrograms";
import { useAcademicYears } from "@/hooks/queries/useAcademicYears";
import { useProgramUnits } from "@/hooks/queries/useProgramUnits";
import { useUploadMarks } from "@/hooks/queries/useMarks";
import { useToast } from "@/context/ToastContext";
import { branding } from "@/config/branding";
import {   UploadCloud, BarChart3, Loader2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import UploadContextSelector from "@/components/coordinator/Upload/UploadContextSelector";
import UploadTemplateCard from "@/components/coordinator/Upload/UploadTemplateCard";
import UploadDropZone from "@/components/coordinator/Upload/UploadDropZone";
import UploadResultSummary from "@/components/coordinator/Upload/UploadResultSummary";
import UploadRecordsTab from "@/components/coordinator/Upload/UploadRecordsTab";
import { UnitType, ExamMode, TemplateMode } from "@/api/types";



export default function UploadMarksPage() {
  const { addToast } = useToast();
  const uploadMarks = useUploadMarks();

  // Data hooks
  const { data: programs = [] } = usePrograms();
  const { data: academicYears = [] } = useAcademicYears();

  // Selection state
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
  const [selectedYearOfStudy, setSelectedYearOfStudy] = useState<number | undefined>();
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>();
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [unitType, setUnitType] = useState<UnitType>("theory");
  const [examMode, setExamMode] = useState<ExamMode>("standard");
  const [templateMode, setTemplateMode] = useState<TemplateMode>("direct");

  // File & result state
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{
    message: string;
    total: number;
    success: number;
    errors: string[];
  } | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<"upload" | "records">("upload");

  // Derived data
  const { data: programUnits = [] } = useProgramUnits(selectedProgramId);

  const filteredProgramUnits = programUnits.filter(
    (pu) =>
      (!selectedYearOfStudy || pu.requiredYear === selectedYearOfStudy) &&
      (!selectedSemester || pu.requiredSemester === selectedSemester),
  );

  const isUnitUnlocked = !!selectedProgramId && !!selectedYearOfStudy && !!selectedSemester;
  const isDownloadEnabled =
    !!selectedProgramId &&
    !!selectedUnitId &&
    !!selectedAcademicYearId &&
    !!selectedYearOfStudy &&
    !!selectedSemester;

  // Handlers
  const handleFile = useCallback(
    (f: File) => {
      if (f.name.match(/\.(csv|xlsx|xls)$/i)) {
        setFile(f);
        setResult(null);
      } else {
        addToast("Invalid file format. Use .xlsx or .csv", "error");
      }
    },
    [addToast],
  );

  const handleUpload = useCallback(async () => {
    if (!file || uploadMarks.isPending) return;
    try {
      const data = await uploadMarks.mutateAsync({ file });
      setResult(data);
      addToast(
        data.success === data.total ? "Upload complete." : "Upload processed with remarks.",
        data.success === data.total ? "success" : "warning",
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      addToast(message, "error");
    }
  }, [file, uploadMarks, addToast]);

  const isLoading = uploadMarks.isPending;

  return (
    <div className="lg:ml-48 my-14 min-h-screen bg-[#F8F9FA] overflow-hidden">
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-green-darkest/30 backdrop-blur-sm z-[200] flex items-center justify-center">
          <div className="bg-white rounded-2xl px-10 py-8 shadow-2xl flex items-center gap-6">
            <Loader2 size={24} className="animate-spin text-green-darkest" />
            <div>
              <p className="text-xs font-black text-green-darkest uppercase tracking-widest">
                Processing Upload
              </p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">
                Please wait — do not close this window
              </p>
            </div>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="bg-[#F8F9FA] min-h-screen rounded-lg shadow-2xl p-9 border border-white"
      >
        <PageHeader
          title="Upload"
          highlightedTitle="Student Marks"
          subtitle={`Select the Academic Context and download the official ${branding.school} scoresheet template.`}
        />

        {/* Tab switcher */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-8 max-w-sm">
          {(["upload", "records"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? "bg-green-darkest text-yellow-gold shadow-md"
                  : "text-slate-400 hover:text-green-darkest"
              }`}
            >
              {tab === "upload" ? (
                <>
                  <UploadCloud size={14} /> Upload
                </>
              ) : (
                <>
                  <BarChart3 size={14} /> Records
                </>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "upload" && (
          <>
            <UploadContextSelector
              programs={programs}
              academicYears={academicYears}
              programUnits={filteredProgramUnits}
              selectedProgramId={selectedProgramId}
              setSelectedProgramId={setSelectedProgramId}
              selectedAcademicYearId={selectedAcademicYearId}
              setSelectedAcademicYearId={setSelectedAcademicYearId}
              selectedYearOfStudy={selectedYearOfStudy}
              setSelectedYearOfStudy={setSelectedYearOfStudy}
              selectedSemester={selectedSemester}
              setSelectedSemester={setSelectedSemester}
              selectedUnitId={selectedUnitId}
              setSelectedUnitId={setSelectedUnitId}
              unitType={unitType}
              setUnitType={setUnitType}
              examMode={examMode}
              setExamMode={setExamMode}
              templateMode={templateMode}
              setTemplateMode={setTemplateMode}
              isUnitUnlocked={isUnitUnlocked}
              loading={false}
            />

            <div className="grid grid-cols-12 gap-10">
              <div className="col-span-12 lg:col-span-4">
                <UploadTemplateCard
                  isDownloadEnabled={isDownloadEnabled}
                  selectedProgramId={selectedProgramId}
                  selectedUnitId={selectedUnitId}
                  selectedAcademicYearId={selectedAcademicYearId}
                  selectedYearOfStudy={selectedYearOfStudy}
                  selectedSemester={selectedSemester}
                  examMode={examMode}
                  unitType={unitType}
                  templateMode={templateMode}
                  disabled={isLoading}
                />
              </div>

              <div className="col-span-12 lg:col-span-8">
                <UploadDropZone
                  file={file}
                  onFile={handleFile}
                  onUpload={handleUpload}
                  uploading={isLoading}
                  onRemove={() => setFile(null)}
                />
              </div>
            </div>

            {result && <UploadResultSummary result={result} />}
          </>
        )}

        {activeTab === "records" && <UploadRecordsTab />}
      </motion.div>
    </div>
  );
}
