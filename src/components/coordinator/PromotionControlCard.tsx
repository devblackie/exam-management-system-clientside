// clientside/src/components/coordinator/PromotionControlCard.tsx
"use client";

import { useState, useEffect } from "react";
import { Play, ClipboardList, Loader2, Check, AlertCircle, Cpu } from "lucide-react";
import { getPrograms } from "@/api/programsApi";
import { getAcademicYears } from "@/api/academicYearsApi";
import { Program, AcademicYear } from "@/api/types";

interface SelectionProps {
  onRunPreview: (params: { programId: string; yearToPromote: number; academicYearName: string }) => Promise<void> | void;
  isLoading: boolean;
}

export default function PromotionControlCard({ onRunPreview, isLoading }: SelectionProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [fetchingOptions, setFetchingOptions] = useState(true);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [formData, setFormData] = useState({
    programId: "",
    yearToPromote: 1,
    academicYearName: ""
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [progRes, yearRes] = await Promise.all([getPrograms(), getAcademicYears()]);
        setPrograms(progRes);
        setAcademicYears(yearRes);
        const activeYear = yearRes.find(y => y.isActive)?.year;
        if (activeYear) setFormData(prev => ({ ...prev, academicYearName: activeYear }));
      } catch (e) {
        console.error("Promotion load error:", e);
      } finally {
        setFetchingOptions(false);
      }
    };
    loadOptions();
  }, []);

  const handleAnalysis = async () => {
    try {
      setStatus('idle');
      await onRunPreview(formData);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const isFormValid = formData.programId && formData.academicYearName;

  // Custom Input Styles for the Bespoke Look
  const inputBase = `
    w-full p-3.5 bg-slate-50/50 border border-slate-200 
    text-green-darkest font-semibold text-sm rounded-md
    transition-all duration-300 outline-none appearance-none
    disabled:opacity-40
  `;

  return (
    <div className="relative overflow-hidden group">
      {/* Abstract background decorative element */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 text-green-darkest/[0.02] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
        <Cpu size={180} />
      </div>

      <div className="relative">
        <header className="flex items-center gap-4 mb-14">
          <div className="h-12 w-12 bg-green-darkest rounded-2xl flex items-center justify-center shadow-lg shadow-green-darkest/20">
            <ClipboardList className="text-yellow-gold" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-green-darkest tracking-tight uppercase">
              Promotion <span className="text-yellow-gold font-light">Engine</span>
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Class Eligibility & Progression Analysis
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
          {/* Program Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Academic Program
            </label>
            <div className="relative">
              <select
                disabled={fetchingOptions}
                className={inputBase}
                value={formData.programId}
                onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
              >
                <option value="">Select Curriculum...</option>
                {programs.map(p => (
                  <option key={p._id} value={p._id}>{p.code} — {p.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
            </div>
          </div>

          {/* Year Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Year Level
            </label>
            <div className="relative">
              <select
                className={inputBase}
                value={formData.yearToPromote}
                onChange={(e) => setFormData({ ...formData, yearToPromote: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5, 6].map(y => (
                  <option key={y} value={y}>Year of Study {y}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
            </div>
          </div>

          {/* Academic Year Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Target Session
            </label>
            <div className="relative">
              <select
                disabled={fetchingOptions}
                className={inputBase}
                value={formData.academicYearName}
                onChange={(e) => setFormData({ ...formData, academicYearName: e.target.value })}
              >
                <option value="">Select Session...</option>
                {academicYears.map(ay => (
                  <option key={ay._id} value={ay.year}>
                    {ay.year} {ay.isActive ? "— (Active)" : ""}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">▼</div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex">
            <button
              disabled={!isFormValid || isLoading || fetchingOptions}
              onClick={handleAnalysis}
              className={`
                w-full h-[52px] rounded-md font-black text-[11px] uppercase tracking-[0.2em] 
                transition-all duration-500 flex items-center justify-center gap-3
                ${!isFormValid ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 
                  status === 'error' ? 'bg-red-600 text-white' :
                  status === 'success' ? 'bg-emerald-600 text-white' :
                  'bg-green-darkest text-yellow-gold hover:shadow-2xl hover:shadow-green-darkest/20 hover:-translate-y-0.5 active:translate-y-0'}
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Calculating...</span>
                </>
              ) : status === 'success' ? (
                <>
                  <Check size={16} />
                  <span>Ready to Promote</span>
                </>
              ) : status === 'error' ? (
                <>
                  <AlertCircle size={16} />
                  <span>Critical Error</span>
                </>
              ) : (
                <>
                  <Play size={16} fill="currentColor" />
                  <span>Initiate Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}