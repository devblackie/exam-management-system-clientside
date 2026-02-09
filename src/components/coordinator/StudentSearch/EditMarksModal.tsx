// clienside/src/components/coordinator/StudentSearch/EditMarksModal.tsx
"use client";

import { X, ShieldCheck, FileSignature, Info, Fingerprint } from "lucide-react";
import { RawMark, StudentFullRecord, SaveMarksPayload } from "@/api/types";
import { useState } from "react";

// --- Type Definitions ---

interface EditMarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentFullRecord;
  editingMark: RawMark | null;
  onSave: (payload: SaveMarksPayload) => Promise<void>;
  availableUnits: Array<{ code: string; name: string }>;
  availableYears: Array<{ year: string }>;
}

interface SelectFieldProps {
  name: string;
  label: string;
  options: Array<{ code?: string; name?: string; year?: string }>;
  placeholder: string;
}

interface MarkInputProps {
  name: keyof SaveMarksPayload;
  label: string;
  defaultValue?: number | null;
  
}

export default function EditMarksModal({
  isOpen,
  onClose,
  student,
  editingMark,
  onSave,
  availableUnits,
  availableYears,
}: EditMarksModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSpecial, setIsSpecial] = useState(editingMark?.isSpecial || false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    const payload: SaveMarksPayload = {
      regNo: student.student.regNo,
      unitCode: (
        editingMark?.programUnit?.unit?.code ||
        (formData.get("unitCode") as string)
      )
        .toUpperCase()
        .trim(),
      academicYear: (
        editingMark?.academicYear.year ||
        (formData.get("academicYear") as string)
      ).trim(),
      cat1: Number(formData.get("cat1")) || 0,
      cat2: Number(formData.get("cat2")) || 0,
      cat3: Number(formData.get("cat3")) || 0,
      assignment1: Number(formData.get("assignment1")) || 0,
      examQ1: Number(formData.get("examQ1")) || 0,
      examQ2: Number(formData.get("examQ2")) || 0,
      examQ3: Number(formData.get("examQ3")) || 0,
      examQ4: Number(formData.get("examQ4")) || 0,
      examQ5: Number(formData.get("examQ5")) || 0,
      isSpecial: isSpecial,
      attempt: isSpecial ? "special" : editingMark?.attempt || "1st",
    };

    try {
      await onSave(payload);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-green-darkest/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] max-w-4xl w-full max-h-[92vh] overflow-hidden border border-white/20 flex flex-col">
        {/* HEADER: Institutional Ledger Header */}
        <div className="bg-green-darkest px-8 py-6 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
            <Fingerprint size={120} className="text-yellow-gold" />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-yellow-gold/20 flex items-center justify-center border border-yellow-gold/30">
              <FileSignature className="text-yellow-gold" size={24} />
            </div>
            <div>
              <h2 className="text-white text-xl font-black uppercase tracking-tighter leading-none mb-1">
                {editingMark ? "Edit Unit Marks" : "Add Missing Marks"}
              </h2>
              <p className="text-yellow-gold text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                Data Integrity Protocol: Mark Revision
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="relative z-10 text-white/50 hover:text-white transition-all bg-white/5 p-2 rounded-full border border-white/10"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {/* STUDENT DATA CARD */}
          <div className="flex items-center justify-between mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1">
                Student Identity
              </span>

              <p className="text-sm font-mono font-bold text-slate-500">
                {student.student.regNo}
              </p>
              <p className="font-black text-green-darkest/80 text-[10px] uppercase tracking-tight">
                {student.student.name}
              </p>
            </div>
            <div className="text-right border-l pl-8 border-slate-100">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1">
                Context Reference
              </span>
              {editingMark ? (
                <p className="text-sm font-black text-green-700 font-mono tracking-tighter">
                  {editingMark.programUnit?.unit?.code}{" "}
                  <span className="mx-2 text-slate-300">|</span>{" "}
                  {editingMark.academicYear.year}
                </p>
              ) : (
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-black uppercase tracking-widest">
                  New Entry
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} id="marksForm">
            {!editingMark && (
              <div className="grid grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-top-4">
                <SelectField
                  name="unitCode"
                  label="Authorized Unit"
                  placeholder="-- Select Unit --"
                  options={availableUnits}
                />
                <SelectField
                  name="academicYear"
                  label="Active Academic Year"
                  placeholder="-- Select Session --"
                  options={availableYears}
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* COURSEWORK SECTION */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Section A: Coursework Components
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <MarkInput
                    name="cat1"
                    label="CAT 01 (/20)"
                    defaultValue={editingMark?.cat1Raw}
                  />
                  <MarkInput
                    name="cat2"
                    label="CAT 02 (/20)"
                    defaultValue={editingMark?.cat2Raw}
                  />
                  <MarkInput
                    name="cat3"
                    label="CAT 03 (/20)"
                    defaultValue={editingMark?.cat3Raw}
                  />
                  <MarkInput
                    name="assignment1"
                    label="ASGN 01 (/10)"
                    defaultValue={editingMark?.assgnt1Raw}
                  />
                </div>
              </div>
 {/* FINAL EXAM SECTION */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Section B: Final Assessment
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {([1, 2, 3, 4, 5] as const).map((num) => (
                    <MarkInput
                      key={num}
                      name={`examQ${num}` as keyof SaveMarksPayload}
                      label={`Q${num}`}
                      defaultValue={
                        editingMark
                          ? (editingMark[
                              `examQ${num}Raw` as keyof RawMark
                            ] as number)
                          : null
                      }
                    />
                  ))}
                </div>
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-start gap-3 mt-4">
                  <Info className="text-blue-500 flex-shrink-0" size={14} />
                  <p className="text-[10px] text-blue-700 leading-tight">
                    Ensure marks do not exceed the set threshold for individual
                    questions.
                  </p>
                </div>
              </div>
            </div>
{/* STATUS OVERRIDE */}
            <div className="border-t border-slate-200 pt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSpecial}
                    onChange={(e) => setIsSpecial(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                </label>
                <div>
                  <p className="text-[10px] font-black text-slate-700 uppercase leading-none mb-1">
                    Special Examination Protocol
                  </p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">
                    Enable for supplementary/special attempt authorization
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
{/* FOOTER ACTION */}
        <div className="p-8 bg-white border-t border-slate-100 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
          >
            Cancel 
          </button>
          <button
            form="marksForm"
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-3 px-8 py-3 bg-green-darkest text-yellow-gold rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <span className="animate-pulse">Updating Records...</span>
            ) : (
              <>
                <ShieldCheck size={18} />
                Save & Re-Calculate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function SelectField({ name, label, options, placeholder }: SelectFieldProps) {
  return (
    <div className="relative group">
      <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest group-focus-within:text-green-600 transition-colors">
        {label}
      </label>
      <div className="relative">
        <select
          name={name}
          required
          className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-green-darkest outline-none  appearance-none cursor-pointer transition-all"
        >
          <option value="">{placeholder}</option>
          {options.map((opt, idx) => (
            <option
              key={opt.code || opt.year || idx}
              value={opt.code || opt.year}
            >
              {opt.code ? `${opt.code} — ${opt.name}` : opt.year}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m3 4.5 3 3 3-3" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function MarkInput({ name, label, defaultValue }: MarkInputProps) {
  return (
    <div className="bg-white p-2 rounded-xl border border-slate-200">
      <label className="text-[9px] font-black text-slate-400 block mb-1 px-1 uppercase">
        {label}
      </label>
      <input
        name={name}
        type="number"
        step="0.1"
        className="w-full p-1 text-center bg-transparent text-green-900 font-mono font-black text-sm outline-none"
        defaultValue={defaultValue ?? ""}
      />
    </div>
  );
}