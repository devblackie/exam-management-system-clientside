// clientside/src/components/coordinator/Upload/UploadContextSelector.tsx
"use client";

import React from "react";
import type { Program, AcademicYear, ProgramUnit } from "@/api/types";
import type { ExamMode, UnitType, TemplateMode } from "@/app/coordinator/upload/page";

const YEARS_OF_STUDY = [1, 2, 3, 4, 5] as const;
const SEMESTERS = [1, 2] as const;

interface UploadContextSelectorProps {
  programs: Program[];
  academicYears: AcademicYear[];
  programUnits: ProgramUnit[];
  selectedProgramId: string;
  setSelectedProgramId: (value: string) => void;
  selectedAcademicYearId: string;
  setSelectedAcademicYearId: (value: string) => void;
  selectedYearOfStudy: number | undefined;
  setSelectedYearOfStudy: (value: number | undefined) => void;
  selectedSemester: number | undefined;
  setSelectedSemester: (value: number | undefined) => void;
  selectedUnitId: string;
  setSelectedUnitId: (value: string) => void;
  unitType: UnitType;
  setUnitType: (value: UnitType) => void;
  examMode: ExamMode;
  setExamMode: (value: ExamMode) => void;
  templateMode: TemplateMode;
  setTemplateMode: (value: TemplateMode) => void;
  isUnitUnlocked: boolean;
  loading: boolean;
}

const inputClass =
  "w-full p-3 bg-white border border-slate-200 text-green-darkest font-semibold text-xs rounded-lg transition-all outline-none";
const disabledStyles = "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60";
const labelStyle = "text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1";

const UploadContextSelector: React.FC<UploadContextSelectorProps> = ({
  programs,
  academicYears,
  programUnits,
  selectedProgramId,
  setSelectedProgramId,
  selectedAcademicYearId,
  setSelectedAcademicYearId,
  selectedYearOfStudy,
  setSelectedYearOfStudy,
  selectedSemester,
  setSelectedSemester,
  selectedUnitId,
  setSelectedUnitId,
  unitType,
  setUnitType,
  examMode,
  setExamMode,
  templateMode,
  setTemplateMode,
  isUnitUnlocked,
  loading,
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4 px-2">
        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
          01. Define Academic Context
        </h2>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-6 bg-white p-8 rounded-lg border border-green-darkest/5 shadow-sm">
        {/* Program */}
        <div className="space-y-2">
          <label className={labelStyle}>Program</label>
          <select
            className={inputClass}
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            disabled={loading}
          >
            <option value="">Select Program</option>
            {programs.map((p) => (
              <option key={p._id} value={p._id}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Academic Year */}
        <div className="space-y-2">
          <label className={labelStyle}>Academic Year</label>
          <select
            className={inputClass}
            value={selectedAcademicYearId}
            onChange={(e) => setSelectedAcademicYearId(e.target.value)}
            disabled={loading}
          >
            <option value="">Academic Year...</option>
            {academicYears.map((y) => (
              <option key={y._id} value={y._id}>
                {y.year} {y.isCurrent ? "(Current)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Year of Study */}
        <div className="space-y-2">
          <label className={labelStyle}>Year of Study</label>
          <select
            className={inputClass}
            value={selectedYearOfStudy ?? ""}
            onChange={(e) => setSelectedYearOfStudy(parseInt(e.target.value))}
            disabled={loading}
          >
            <option value="">Year of Study...</option>
            {YEARS_OF_STUDY.map((y) => (
              <option key={y} value={y}>
                Year {y}
              </option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div className="space-y-2">
          <label className={labelStyle}>Semester</label>
          <select
            className={inputClass}
            value={selectedSemester ?? ""}
            onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
            disabled={loading}
          >
            <option value="">Semester...</option>
            {SEMESTERS.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        {/* Template Mode */}
        <div className="space-y-3">
          <label className={labelStyle}>Complexity</label>
          <div className="flex bg-white rounded-lg p-1 border border-slate-200">
            {(["detailed", "direct"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTemplateMode(mode)}
                disabled={loading}
                className={`flex-1 py-2 rounded-md text-[10px] font-black transition-all ${
                  templateMode === mode
                    ? "bg-green-darkest text-yellow-gold shadow-md"
                    : "text-slate-400 hover:text-green-darkest"
                }`}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Unit Module */}
        <div className="space-y-2 relative">
          <label className={labelStyle}>Unit Module</label>
          <select
            className={`${inputClass} ${!isUnitUnlocked ? disabledStyles : ""}`}
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            disabled={!isUnitUnlocked || loading}
          >
            <option value="">
              {isUnitUnlocked ? "Choose Unit..." : "Select Context First..."}
            </option>
            {programUnits.map((pu) => (
              <option key={pu._id} value={pu.unit._id}>
                {pu.unit.code}: {pu.unit.name}
              </option>
            ))}
          </select>
        </div>

        {/* Unit Type & Exam Mode — only for detailed */}
        {templateMode === "detailed" && (
          <>
            <div className="space-y-2">
              <label className={labelStyle}>Unit Type</label>
              <select
                className={inputClass}
                value={unitType}
                onChange={(e) => setUnitType(e.target.value as UnitType)}
                disabled={loading}
              >
                <option value="theory">Theory (20/10)</option>
                <option value="lab">Lab (15/5/10)</option>
                <option value="workshop">Workshop (40/60)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={labelStyle}>Exam Format</label>
              <select
                className={inputClass}
                value={examMode}
                onChange={(e) => setExamMode(e.target.value as ExamMode)}
                disabled={loading}
              >
                <option value="standard">Standard Grading</option>
                <option value="mandatory_q1">Compulsory Q1</option>
              </select>
            </div>
          </>
        )}

        {templateMode === "direct" && (
          <div className="col-span-2 flex items-center px-4">
            <p className="text-[10px] text-slate-400 italic">
              * Direct mode imports final CA (30) and Exam (70) totals directly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadContextSelector;