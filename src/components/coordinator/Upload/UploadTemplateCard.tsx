// clientside/src/components/coordinator/Upload/UploadTemplateCard.tsx
"use client";

import React, { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { downloadTemplate } from "@/api/marksApi";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import { UnitType, ExamMode, TemplateMode } from "@/api/types";


interface UploadTemplateCardProps {
  isDownloadEnabled: boolean;
  selectedProgramId: string;
  selectedUnitId: string;
  selectedAcademicYearId: string;
  selectedYearOfStudy: number | undefined;
  selectedSemester: number | undefined;
  examMode: ExamMode;
  unitType: UnitType;
  templateMode: TemplateMode;
  disabled: boolean;
}

const UploadTemplateCard: React.FC<UploadTemplateCardProps> = ({
  isDownloadEnabled,
  selectedProgramId,
  selectedUnitId,
  selectedAcademicYearId,
  selectedYearOfStudy,
  selectedSemester,
  examMode,
  unitType,
  templateMode,
  disabled,
}) => {
  const { addToast } = useToast();
  const [isTemplateDownloading, setIsTemplateDownloading] = useState(false);

  const handleDownload = async () => {
    if (!isDownloadEnabled || isTemplateDownloading) return;
    setIsTemplateDownloading(true);
    try {
      await downloadTemplate(
        selectedProgramId,
        selectedUnitId,
        selectedAcademicYearId,
        selectedYearOfStudy!,
        selectedSemester!,
        examMode,
        unitType,
        templateMode,
      );
      addToast("Template generated successfully.", "success");
    } catch (err: unknown) {
      addToast(getErrorMessage(err), "error");
    } finally {
      setIsTemplateDownloading(false);
    }
  };

  const isDisabled = !isDownloadEnabled || disabled || isTemplateDownloading;

  return (
    <div className="bg-white border border-green-darkest/5 rounded-lg p-8 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-black text-green-darkest uppercase tracking-tight mb-2">
          Protocol Template
        </h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
          Download the pre-formatted scoresheet. System validation requires this exact structure.
        </p>
      </div>
      <button
        onClick={handleDownload}
        disabled={isDisabled}
        className="mt-8 w-full py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-green-darkest font-black text-[11px] uppercase tracking-widest hover:bg-yellow-gold hover:border-yellow-gold transition-all disabled:opacity-30"
      >
        {isTemplateDownloading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Generating...
          </>
        ) : (
          <>
            <FileDown size={18} /> Generate Scoresheet
          </>
        )}
      </button>
    </div>
  );
};

export default UploadTemplateCard;