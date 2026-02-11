// clientside/src/app/coordinator/upload/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { uploadMarks, downloadTemplate } from "@/api/marksApi";
import { useToast } from "@/context/ToastContext";
import { branding } from "@/config/branding";
import { getPrograms } from "@/api/programsApi";
import { getAcademicYears } from "@/api/academicYearsApi";
import { getProgramUnits } from "@/api/programUnitsApi";
import type { Program, AcademicYear, ProgramUnit } from "@/api/types";
import { CloudCheck, FileDown, UploadCloud, CheckCircle2, AlertTriangle, Cpu, Database } from 'lucide-react';
import PageHeader from "@/components/ui/PageHeader";

interface UploadResult {
  message: string;
  total: number;
  success: number;
  errors: string[];
}

const YEARS_OF_STUDY = [1, 2, 3, 4, 5, 6];
const SEMESTERS = [1, 2];

export default function UploadMarks() {
  const { addToast } = useToast();

  // --- State for Data Fetching ---
  const [programs, setPrograms] = useState<Program[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [programUnits, setProgramUnits] = useState<ProgramUnit[]>([]);

  // --- State for Template Selection ---
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>("");
  const [selectedYearOfStudy, setSelectedYearOfStudy] = useState<number | undefined>(undefined);
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(undefined);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [examMode, setExamMode] = useState<"standard" | "mandatory_q1">("standard");

  // --- State for Upload ---
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    getPrograms().then(setPrograms).catch(() => addToast("Failed to load programs.", "error"));
    getAcademicYears().then(setAcademicYears).catch(() => addToast("Failed to load academic years.", "error"));
  }, [addToast]);

  useEffect(() => {
    if (selectedProgramId) {
      getProgramUnits(selectedProgramId).then(setProgramUnits).catch(() => addToast("Failed to load units.", "error"));
    } else {
      setProgramUnits([]);
    }
    setSelectedUnitId("");
  }, [selectedProgramId, addToast]);

  const filteredProgramUnits = useMemo(() => {
    if (!selectedYearOfStudy || !selectedSemester) return programUnits;
    return programUnits.filter(pu => pu.requiredYear === selectedYearOfStudy && pu.requiredSemester === selectedSemester);
  }, [programUnits, selectedYearOfStudy, selectedSemester]);

  // Logic to determine if Unit Selection should be unlocked
  const isUnitUnlocked = !!selectedProgramId && !!selectedYearOfStudy && !!selectedSemester;

  const isDownloadEnabled = useMemo(() => {
    return !!selectedProgramId && !!selectedUnitId && !!selectedAcademicYearId && !!selectedYearOfStudy && !!selectedSemester;
  }, [selectedProgramId, selectedUnitId, selectedAcademicYearId, selectedYearOfStudy, selectedSemester]);

  const handleDownloadTemplate = async () => {
    if (!isDownloadEnabled) return;
    try {
      await downloadTemplate(selectedProgramId, selectedUnitId, selectedAcademicYearId, selectedYearOfStudy!, selectedSemester!, examMode);
      addToast("Scoresheet template generated.", "success");
    } catch {
      addToast("Template generation failed.", "error");
    }
  };

  const handleFile = (selectedFile: File) => {
    const valid = selectedFile.name.endsWith(".csv") || selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls");
    if (valid) {
      setFile(selectedFile);
      setResult(null);
    } else {
      addToast("Invalid file format. Use .xlsx or .csv", "error");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadMarks(file);
      setResult(data);
      addToast(data.success === data.total ? "All records synced." : "Upload processed with remarks.", "success");
    } catch {
      addToast("Server failed to process file.", "error");
    } finally {
      setUploading(false);
    }
  };

  const inputClass = "w-full p-3 bg-white border border-slate-200 text-green-darkest font-semibold text-xs rounded-lg transition-all outline-none appearance-none";
  const disabledStyles = "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60";

  return (
    // <div className="max-w-8xl ml-48 my-10">
    <div className="ml-48 my-10 min-h-screen bg-[#F8F9FA] overflow-hidden">

      <div className="bg-[#F8F9FA] min-h-screen rounded-lg shadow-2xl p-9 border border-white">

        <PageHeader
          title="Upload"
          highlightedTitle="Student Marks"
          systemLabel=""
          subtitle={`Select the Academic Context and download the official ${branding.school} scoresheet template.`}
        />

        {/* STEP 1: CONTEXT SELECTION */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4 px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
              01. Define Academic Context
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 bg-white p-8 rounded-lg border border-green-darkest/5 shadow-sm">
            {/* Program Selection - Full Name */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Program</label>
              <select className={inputClass} value={selectedProgramId} onChange={(e) => setSelectedProgramId(e.target.value)}>
                <option value="">Select Program</option>
                {programs.map((p: Program) => (
                  <option key={p._id} value={p._id}>{p.code} — {p.name}</option>
                ))}
              </select>
            </div>

            {/* Academic Year Selection */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Academic Year</label>
              <select className={inputClass} value={selectedAcademicYearId} onChange={(e) => setSelectedAcademicYearId(e.target.value)}>
                <option value="">Academic Year...</option>
                {academicYears.map((y: AcademicYear) => (
                  <option key={y._id} value={y._id}>{y.year} {y.isActive ? "(Current)" : ""}</option>
                ))}
              </select>
            </div>

            {/* Year of Study Selection */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Year of Study</label>
              <select className={inputClass} value={selectedYearOfStudy || ""} onChange={(e) => setSelectedYearOfStudy(parseInt(e.target.value))}>
                <option value="">Year of Study...</option>
                {YEARS_OF_STUDY.map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>

            {/* Semester Selection */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Semester</label>
              <select className={inputClass} value={selectedSemester || ""} onChange={(e) => setSelectedSemester(parseInt(e.target.value))}>
                <option value="">Semester...</option>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            {/* Unit - ENFORCED LOCKING LOGIC */}
            <div className="space-y-2 relative">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Unit Module</label>
              <select
                className={`${inputClass} ${!isUnitUnlocked ? disabledStyles : ""}`}
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                disabled={!isUnitUnlocked}
              >
                <option value="">{isUnitUnlocked ? "Choose Unit..." : "Select Context First..."}</option>
                {filteredProgramUnits.map((pu) => (
                  <option key={pu._id} value={pu.unit._id}>{pu.unit.code}: {pu.unit.name}</option>
                ))}
              </select>
            </div>

            {/* Exam Mode Selection */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Exam Format</label>
              <select className={inputClass} value={examMode} onChange={(e) => setExamMode(e.target.value as "standard" | "mandatory_q1")}>
                <option value="standard">Standard Grading</option>
                <option value="mandatory_q1">Compulsory Q1 Strategy</option>
              </select>
            </div>

          </div>
        </div>

        {/* STEP 2: TEMPLATE & UPLOAD */}
        <div className="grid grid-cols-12 gap-10">

          {/* Download Template Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-green-darkest/5 rounded-lg p-8 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black text-green-darkest uppercase tracking-tight mb-2">Protocol Template</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Download the pre-formatted scoresheet. System validation requires this exact structure.
                </p>
              </div>
              <button
                onClick={handleDownloadTemplate}
                disabled={!isDownloadEnabled}
                className="mt-8 w-full py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-green-darkest font-black text-[11px] uppercase tracking-widest hover:bg-yellow-gold hover:border-yellow-gold transition-all disabled:opacity-30"
              >
                <FileDown size={18} />
                Generate Scoresheet
              </button>         
            </div>
          </div>           
      
          {/* Drag & Drop Zone */}
          <div className="col-span-12 lg:col-span-8">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
              className={`relative border-2 border-dashed rounded-lg p-12 transition-all duration-500 flex flex-col items-center justify-center min-h-[300px] ${dragActive ? "border-yellow-gold bg-yellow-gold/5 scale-[1.01]" : "border-slate-200 bg-white"
                }`}
            >
              {!file ? (
                <>
                  <div className="h-16 w-16 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 mb-6">
                    <UploadCloud size={32} />
                  </div>
                  <p className="text-[11px] font-black text-green-darkest uppercase tracking-[0.3em] mb-4">Awaiting Document Upload</p>
                  <label className="px-8 py-3 bg-green-darkest text-yellow-gold font-black text-[10px] uppercase tracking-widest rounded-lg cursor-pointer hover:shadow-xl transition-all">
                    Browse Files
                    <input type="file" accept=".csv,.xlsx" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
                  </label>
                </>
              ) : (
                <div className="text-center animate-in fade-in zoom-in duration-300">
                  <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
                    <Database size={32} />
                  </div>
                  <p className="text-sm font-black text-green-darkest mb-1">{file.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mb-8 uppercase">{(file.size / 1024).toFixed(1)} KB Ready for Processing</p>
                  <div className="flex gap-4 justify-center">
                    <button onClick={() => setFile(null)} className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition">Remove</button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="px-8 py-3 bg-green-darkest text-yellow-gold font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center gap-3 shadow-2xl"
                    >
                      {uploading ? <Cpu className="animate-spin" size={14} /> : <CloudCheck size={16} />}
                      {uploading ? "Processing..." : "Process Results"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RESULTS SECTION */}
         {result && (
          <div className="mt-12 animate-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center gap-4 mb-6 px-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
                03. Ingestion Summary
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
            </div>

            <div className={`p-1 bg-white border rounded-lg overflow-hidden ${result.success === result.total ? 'border-emerald-500/20' : 'border-yellow-gold/20'}`}>
              <div className="flex items-center p-4 gap-10">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${result.success === result.total ? 'bg-emerald-50 text-emerald-600' : 'bg-yellow-50 text-yellow-600'}`}>
                  {result.success === result.total ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                </div>

                <div className="flex-1 grid grid-cols-3 gap-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-sm font-black text-green-darkest uppercase tracking-tighter">
                      {result.success === result.total ? "Success" : "Partial Success"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Records</p>
                    <p className="text-xl font-black text-green-darkest">
                      {result.success} <span className="text-slate-500">/ {result.total}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Integrity</p>
                    <p className="text-xl font-black text-emerald-600">
                      {((result.success / result.total) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="border-t border-slate-100 p-8 bg-slate-50/50">
                  <summary className="cursor-pointer text-[10px] font-black text-red-500 tracking-[0.3em] mb-4 hover:underline">Conflict Resolution Log ({result.errors.length} error(s))</summary>
                  <div className="space-y-2">
                    {result.errors.map((error, i) => (
                      <div key={i} className="flex gap-3 text-xs font-medium text-slate-600 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                        <span className="text-red-400">•</span> {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )} 
      </div>
    </div>
  );
}



