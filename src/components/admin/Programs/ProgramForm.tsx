// clientside/src/components/admin/Programs/ProgramForm.tsx
"use client";

import { useState } from "react";
import { X, ShieldCheck, Loader2 } from "lucide-react";
import { createProgram } from "@/api/programsApi";
import { useInstitutionSettings } from "@/hooks/queries/useInstitutionSettings";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import type { School, Department, AxiosExpectedError } from "@/api/types";

interface FormData {
  code: string;
  name: string;
  description: string;
  durationYears: string;
  degreeType: string;
  schoolCode: string;
  departmentCode: string;
}

interface ProgramFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProgramForm({ onClose, onSuccess }: ProgramFormProps) {
  const { addToast } = useToast();
  const { data: settings, isLoading: settingsLoading } = useInstitutionSettings();
  const schools: School[] = settings?.schools ?? [];

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    code: "",
    name: "",
    description: "",
    durationYears: "5",
    degreeType: "BSc",
    schoolCode: "",
    departmentCode: "",
  });

  const selectedSchool = schools.find((s: School) => s.code === formData.schoolCode);
  const departments: Department[] = selectedSchool?.departments ?? [];

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "schoolCode") {
      updateField("departmentCode", "");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.schoolCode || !formData.departmentCode) {
      addToast("Please select both a school and department", "error");
      return;
    }

    if (!formData.code.trim() || !formData.name.trim()) {
      addToast("Program code and name are required", "error");
      return;
    }

    setLoading(true);
    try {
      await createProgram({
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        durationYears: Number(formData.durationYears),
        degreeType: formData.degreeType,
        schoolCode: formData.schoolCode,
        departmentCode: formData.departmentCode,
      });
      addToast("Program created successfully", "success");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as AxiosExpectedError;
      addToast(getErrorMessage(axiosErr), "error");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm outline-none focus:ring-2 focus:ring-yellow-gold/30 focus:border-yellow-gold/50 transition-all placeholder:text-slate-300";
  const labelStyle =
    "text-[10px] font-medium uppercase text-slate-500 tracking-wider mb-1.5 block";
  const selectStyle = `${inputStyle} cursor-pointer`;

  if (settingsLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden">
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Register New Program</h2>
            <p className="text-[10px] text-slate-400">Create a new academic program</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* School */}
          <div>
            <label className={labelStyle}>School</label>
            <select
              className={selectStyle}
              value={formData.schoolCode}
              onChange={(e) => updateField("schoolCode", e.target.value)}
              required
            >
              <option value="">Select school...</option>
              {schools.map((s: School) => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
            {schools.length === 0 && (
              <p className="text-[10px] text-amber-600 mt-1">
                No schools configured. Set up schools first.
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className={labelStyle}>Department</label>
            <select
              className={selectStyle}
              value={formData.departmentCode}
              onChange={(e) => updateField("departmentCode", e.target.value)}
              disabled={!formData.schoolCode}
              required
            >
              <option value="">Select department...</option>
              {departments.map((d: Department) => (
                <option key={d.code} value={d.code}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Code */}
          <div>
            <label className={labelStyle}>Program Code</label>
            <input
              type="text"
              className={inputStyle}
              value={formData.code}
              onChange={(e) => updateField("code", e.target.value.toUpperCase())}
              placeholder="e.g., BSCE"
              maxLength={10}
              required
            />
            <p className="text-[9px] text-slate-400 mt-0.5">Unique identifier, max 10 characters</p>
          </div>

          {/* Degree Type */}
          <div>
            <label className={labelStyle}>Degree Type</label>
            <select
              className={selectStyle}
              value={formData.degreeType}
              onChange={(e) => updateField("degreeType", e.target.value)}
            >
              {(["BSc", "BEd", "BTech", "BEng", "BArch", "MBBS", "LLB", "BPharm", "Other"] as const).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className={labelStyle}>Duration (Years)</label>
            <select
              className={selectStyle}
              value={formData.durationYears}
              onChange={(e) => updateField("durationYears", e.target.value)}
            >
              {[3, 4, 5, 6, 7].map((y) => (
                <option key={y} value={y}>{y} Year{y !== 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>

          {/* Name - Full width */}
          <div className="col-span-2">
            <label className={labelStyle}>Program Full Name</label>
            <input
              type="text"
              className={inputStyle}
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g., Bachelor of Science in Civil Engineering"
              required
            />
          </div>

          {/* Description - Full width */}
          <div className="col-span-2">
            <label className={labelStyle}>Description (Optional)</label>
            <textarea
              rows={2}
              className={`${inputStyle} resize-none`}
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Brief description of the program..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              "Create Program"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}



