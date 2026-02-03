"use client";

import React from "react";
import { X } from "lucide-react";
import CommonButton from "@/components/ui/CommonButton";
import type { Unit, ProgramUnit, CurriculumFormState } from "@/api/types";

// Define the specific shape of your form state here


interface CurriculumLinkFormProps {
  form: CurriculumFormState;
  // Replace 'any' with the specific state type
  setForm: React.Dispatch<React.SetStateAction<CurriculumFormState>>;
  unitTemplates: Unit[];
  editingId: string | null;
  curriculum: ProgramUnit[];
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const CurriculumLinkForm: React.FC<CurriculumLinkFormProps> = ({
  form, setForm, unitTemplates, editingId, curriculum, submitting, onSubmit, onClose,
}) => {
  const inputStyle = "w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-green-darkest font-bold text-sm  transition-all outline-none";
  const labelStyle = "text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2 mb-2 block";

  return (
    <div className="bg-white rounded-lg border border-green-darkest/5 shadow-2xl overflow-hidden animate-in slide-in-from-top-6 duration-500 mb-10">
      <div className="p-8 flex justify-between items-center border-b border-slate-50">
        <h2 className="text-xl font-black text-green-darkest tracking-tight">
          {editingId ? "Modify Structure" : "Curriculum Linkage"}
        </h2>
        <button onClick={onClose} className="p-3 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-2xl transition-all">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="p-10 grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4">
          <label className={labelStyle}>Unit Template</label>
          {!editingId ? (
            <select
              value={form.unitId}
              onChange={(e) => setForm(prev => ({ ...prev, unitId: e.target.value }))}
              className={inputStyle}
              required
            >
              <option value="">Select Unit...</option>
              {unitTemplates.map(u => <option key={u._id} value={u._id}>{u.code} - {u.name}</option>)}
            </select>
          ) : (
            <div className="p-4 bg-slate-100 rounded-lg font-bold text-green-darkest/50 text-sm">
              {curriculum.find(c => c._id === editingId)?.unit.code}
            </div>
          )}
        </div>

        <div className="col-span-6 lg:col-span-4">
          <label className={labelStyle}>Academic Year</label>
          <select
            className={inputStyle}
            value={form.requiredYear}
            onChange={(e) => setForm(prev => ({ ...prev, requiredYear: e.target.value }))}
          >
            {[1,2,3,4,5,6].map(y => <option key={y} value={String(y)}>Year {y}</option>)}
          </select>
        </div>

        <div className="col-span-6 lg:col-span-4">
          <label className={labelStyle}>Semester</label>
          <select
            className={inputStyle}
            value={form.requiredSemester}
            onChange={(e) => setForm(prev => ({ ...prev, requiredSemester: e.target.value }))}
          >
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </div>

        <div className="col-span-12 flex gap-4 pt-4">
          <button type="submit" disabled={submitting} className="flex-1 py-5 bg-gradient-to-r from-green-darkest to-green-dark text-yellow-gold font-black text-xs uppercase tracking-[0.3em] rounded-[1.5rem] shadow-xl transition-all">
            {submitting ? "Processing..." : editingId ? "Update Link" : "Finalize Linkage"}
          </button>
          {editingId && (
            <button type="button" onClick={onClose} className="px-10 py-5 border border-slate-200 text-slate-400 font-black text-xs uppercase tracking-widest rounded-[1.5rem] hover:bg-slate-200 transition-all">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};