// clientside/src/components/coordinator/AcademicYears/YearFormModal.tsx
"use client";

import React from "react";
import { X, Sparkles, CalendarDays } from "lucide-react";

interface AcademicYearFormFields { year: string; startDate: string; endDate: string; }

interface YearFormProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  autoFill: () => void;
  submitting: boolean;
  formData: AcademicYearFormFields;
  setFormData: (data: AcademicYearFormFields) => void;
}

export const YearFormModal = ({ onClose, onSubmit, autoFill, submitting, formData, setFormData }: YearFormProps) => {
  const inputBase = "w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-green-darkest font-bold text-sm transition-all outline-none";
  const labelBase = "text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2 mb-2 block";

  return (
    <div className="fixed inset-0 bg-green-darkest/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-lg shadow-3xl max-w-2xl w-full overflow-hidden border border-white">
        
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-yellow-gold/10 text-yellow-gold rounded-2xl flex items-center justify-center">
              <CalendarDays size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-green-darkest tracking-tight">Add New Session</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Session Entry</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:rotate-90 transition-all text-slate-300 hover:text-red-500">
            <X size={28} strokeWidth={1} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-7">
              <label className={labelBase}>Academic Cycle (Year/Year)</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                placeholder="2025/2026"
                className={inputBase}
                required
              />
            </div>
            <div className="col-span-12 md:col-span-5 flex items-end">
              <button 
                type="button" 
                onClick={autoFill} 
                className="w-full h-[54px] flex items-center justify-center gap-2 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-yellow-gold hover:text-green-darkest hover:border-yellow-gold transition-all"
              >
                <Sparkles size={14} />
                Auto Fill, Current Year
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-6">
              <label className={labelBase}>Commencement Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className={inputBase}
                required
              />
            </div>
            <div className="col-span-6">
              <label className={labelBase}>Conclusion Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className={inputBase}
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              disabled={submitting} 
              className="flex-1 py-5 bg-gradient-to-r from-green-darkest to-green-dark text-yellow-gold font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl transition-all"
            >
              {submitting ? "Processing..." : "Authorize Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};