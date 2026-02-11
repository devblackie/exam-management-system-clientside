// clientside/src/components/coordinator/StudentSearch/EditMarksTable.tsx
"use client";

import { X, ShieldCheck, FileSignature, Info, Fingerprint } from "lucide-react";
import {RawMark, StudentFullRecord, SaveMarksPayload, InstitutionSettings} from "@/api/types";
import { useState } from "react";

interface EditMarksModalProps {isOpen: boolean; onClose: () => void; student: StudentFullRecord; editingMark: RawMark | null;
  onSave: (payload: SaveMarksPayload) => Promise<void>;
  availableUnits: Array<{ code: string; name: string }>;
  availableYears: Array<{ year: string }>; settings: InstitutionSettings | null;
}

interface SelectOption {code?: string; name?: string; year?: string;}

interface SelectFieldProps { name: string; label: string; options: SelectOption[]; placeholder: string;}

interface MarkInputProps { name: keyof SaveMarksPayload; label: string;  defaultValue?: number | null; max: number;}

export default function EditMarksModal({ isOpen, onClose, student, editingMark, onSave, availableUnits, availableYears, settings,
}: EditMarksModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSpecial, setIsSpecial] = useState(editingMark?.isSpecial || false);
  const [preview, setPreview] = useState<{ ca: number; exam: number; total: number; grade: string }>({
    ca: 0, exam: 0, total: 0, grade: '—'
  });

  if (!isOpen || !settings) return null;

  const calculateLiveScore = (formData: FormData) => {
    // CA Logic
    const cats = [
      Number(formData.get("cat1")) || 0,
      Number(formData.get("cat2")) || 0,
      Number(formData.get("cat3")) || 0,
    ].filter((v) => v > 0);

    const catAvg =
      cats.length > 0 ? cats.reduce((a, b) => a + b, 0) / cats.length : 0;

    const pWeight = (settings?.practicalMax ?? 0) > 0 ? 5 : 0;
    const aWeight = (settings?.assignmentMax ?? 0) > 0 ? 5 : 0;
    const cWeight = 30 - (pWeight + aWeight);

    const caTotal =
      (catAvg / (settings?.cat1Max || 20)) * cWeight +
      ((Number(formData.get("assignment1")) || 0) /
        (settings?.assignmentMax || 10)) *
        aWeight +
      ((Number(formData.get("practicalRaw")) || 0) /
        (settings?.practicalMax || 100)) *
        pWeight;

    // Exam Logic (Best of 3 + Q1)
    const q1 = Number(formData.get("examQ1")) || 0;
    const others = [
      Number(formData.get("examQ2")) || 0,
      Number(formData.get("examQ3")) || 0,
      Number(formData.get("examQ4")) || 0,
      Number(formData.get("examQ5")) || 0,
    ].sort((a, b) => b - a);

    const examTotal = q1 + others.slice(0, 3).reduce((a, b) => a + b, 0);
    const finalMark = Math.round(caTotal + examTotal);

    // Quick Grade Lookup
    const matched = [...(settings?.gradingScale || [])]
      .sort((a, b) => b.min - a.min)
      .find((s) => finalMark >= s.min);

    setPreview({
      ca: Number(caTotal.toFixed(2)),
      exam: examTotal,
      total: finalMark,
      grade: matched ? matched.grade : "E",
    });
  };

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
      practicalRaw: Number(formData.get("practicalRaw")) || 0,
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
        {/* HEADER */}
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
                Policy: {settings.passMark}% Pass Mark Enforced
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-all bg-white/5 p-2 rounded-full border border-white/10"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {/* STUDENT IDENTITY */}
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
                Context
              </span>
              <p className="text-sm font-black text-green-700 font-mono tracking-tighter">
                {editingMark?.programUnit?.unit?.code || "NEW RECORD"} |{" "}
                {editingMark?.academicYear.year || "PENDING"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} id="marksForm"
          onChange={(e) => calculateLiveScore(new FormData(e.currentTarget))}
          >
            {!editingMark && (
              <div className="grid grid-cols-2 gap-6 mb-8">
                <SelectField
                  name="unitCode"
                  label="Authorized Unit"
                  placeholder="-- Select Unit --"
                  options={availableUnits}
                />
                <SelectField
                  name="academicYear"
                  label="Academic Year"
                  placeholder="-- Select Session --"
                  options={availableYears}
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* COURSEWORK */}
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Section A: Continuous Assessment
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <MarkInput
                    name="cat1"
                    label={`CAT 1 (/${settings.cat1Max})`}
                    defaultValue={editingMark?.cat1Raw}
                    max={settings.cat1Max}
                  />
                  <MarkInput
                    name="cat2"
                    label={`CAT 2 (/${settings.cat2Max})`}
                    defaultValue={editingMark?.cat2Raw}
                    max={settings.cat2Max}
                  />
                  {settings.cat3Max > 0 && (
                    <MarkInput
                      name="cat3"
                      label={`CAT 3 (/${settings.cat3Max})`}
                      defaultValue={editingMark?.cat3Raw}
                      max={settings.cat3Max}
                    />
                  )}
                  {settings.assignmentMax > 0 && (
                    <MarkInput
                      name="assignment1"
                      label={`ASGN (/${settings.assignmentMax})`}
                      defaultValue={editingMark?.assgnt1Raw}
                      max={settings.assignmentMax}
                    />
                  )}
                  {settings.practicalMax > 0 && (
                    <MarkInput
                      name="practicalRaw"
                      label={`PRAC (/${settings.practicalMax})`}
                      defaultValue={editingMark?.practicalRaw}
                      max={settings.practicalMax}
                    />
                  )}
                </div>
              </div>

              {/* EXAM */}
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Section B: Final Assessment
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
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
                      max={20}
                    />
                  ))}
                </div>
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="text-blue-500" size={14} />
                    <span className="text-[9px] font-black text-blue-700 uppercase">
                      Logic
                    </span>
                  </div>
                  <p className="text-[10px] text-blue-600/80 leading-tight">
                    System applies 30/70 weighting.
                  </p>
                </div>
              </div>
            </div>

            {/* SPECIAL OVERRIDE */}
            <div className="border-t border-slate-200 pt-6 flex items-center gap-4">
              <input
                type="checkbox"
                checked={isSpecial}
                onChange={(e) => setIsSpecial(e.target.checked)}
                className="w-5 h-5 accent-green-darkest"
              />
              <div>
                <p className="text-[10px] font-black text-slate-700 uppercase">
                  Special Exam Protocol
                </p>
                <p className="text-[9px] text-slate-400 uppercase">
                  Authorized attempt override
                </p>
              </div>
            </div>
          </form>
        </div>


        <div className="p-8 bg-white border-t border-slate-100 flex justify-end gap-4">
        {/* Place this inside the modal body, before the action buttons */}
<div className="mt-8 grid grid-cols-4 gap-4 p-4 bg-green-darkest rounded-2xl border border-yellow-gold/20 shadow-inner">
  <div className="text-center border-r border-white/10">
    <p className="text-[9px] font-black text-yellow-gold/50 uppercase">CA /30</p>
    <p className="text-xl font-mono font-black text-white">{preview.ca}</p>
  </div>
  <div className="text-center border-r border-white/10">
    <p className="text-[9px] font-black text-yellow-gold/50 uppercase">Exam /70</p>
    <p className="text-xl font-mono font-black text-white">{preview.exam}</p>
  </div>
  <div className="text-center border-r border-white/10">
    <p className="text-[9px] font-black text-yellow-gold/50 uppercase">Total /100</p>
    <p className="text-xl font-mono font-black text-lime-bright">{preview.total}</p>
  </div>
  <div className="text-center">
    <p className="text-[9px] font-black text-yellow-gold/50 uppercase">Grade</p>
    <p className="text-xl font-black text-yellow-gold">{preview.grade}</p>
  </div>
</div>
         
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
          >
            Discard
          </button>
          <button
            form="marksForm"
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-3 px-8 py-3 bg-green-darkest text-yellow-gold rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition-all disabled:opacity-50"
          >
            {isSaving ? (
              "Archiving..."
            ) : (
              <>
                <ShieldCheck size={18} /> Commit & Recalculate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function MarkInput({ name, label, defaultValue, max }: MarkInputProps) {
  return (
    <div className="bg-white p-2 rounded-xl border border-slate-200 focus-within:border-green-500">
      <label className="text-[9px] font-black text-slate-400 block mb-1 px-1 uppercase">
        {label}
      </label>
      <input
        name={name}
        type="number"
        step="0.1"
        min="0"
        max={max}
        required
        className="w-full p-1 text-center bg-transparent text-green-900 font-mono font-black text-sm outline-none"
        defaultValue={defaultValue ?? ""}
        onBlur={(e) => {
          if (Number(e.target.value) > max) {
            alert(`Threshold Violation: Max is ${max}`);
            e.target.value = String(max);
          }
        }}
      />
    </div>
  );
}

function SelectField({ name, label, options, placeholder }: SelectFieldProps) {
  return (
    <div className="relative group">
      <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">
        {label}
      </label>
      <select
        name={name}
        required
        className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-green-darkest outline-none appearance-none cursor-pointer"
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
    </div>
  );
}