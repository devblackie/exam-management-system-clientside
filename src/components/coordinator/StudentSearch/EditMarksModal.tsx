// clientside/src/components/coordinator/StudentSearch/EditMarksTable.tsx
"use client";

import { X, ShieldCheck, FileSignature, Fingerprint, Lock } from "lucide-react";
import { RawMark, StudentFullRecord, SaveMarksPayload, InstitutionSettings } from "@/api/types";
import { useState, useMemo } from "react";

interface EditMarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentFullRecord;
  editingMark: RawMark | null;
  onSave: (payload: SaveMarksPayload) => Promise<void>;
  availableUnits: Array<{ code: string; name: string; type?: "theory" | "lab" | "workshop"; }>;
  availableYears: Array<{ year: string }>;
  settings: InstitutionSettings | null;
}

interface SelectOption { code?: string; name?: string; year?: string; type?: string; }
interface SelectFieldProps { 
  name: string; 
  label: string; 
  options: SelectOption[]; 
  placeholder: string; 
  onChange?: (val: string) => void;
  defaultValue?: string; 
}
interface MarkInputProps { 
  name: keyof SaveMarksPayload; 
  label: string; 
  defaultValue?: number | null; 
  max: number; 
  disabled?: boolean; 
}

export default function EditMarksModal({ 
  isOpen, onClose, student, editingMark, onSave, availableUnits, availableYears, settings 
}: EditMarksModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSpecial, setIsSpecial] = useState(editingMark?.isSpecial || false);
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>(editingMark?.programUnit?.unit?.code || "");
  const [preview, setPreview] = useState<{ ca: number; exam: number; total: number; grade: string; mode: string }>({
    ca: 0, exam: 0, total: 0, grade: '—', mode: 'theory'
  });

  // Determine current unit type to handle UI locking
  const currentUnitType = useMemo(() => {
    const unit = availableUnits.find(u => u.code === selectedUnitCode);
    return unit?.type || "theory";
  }, [selectedUnitCode, availableUnits]);

  if (!isOpen || !settings) return null;

  const calculateLiveScore = (formData: FormData) => {
    const type = currentUnitType;
    
    // 1. Determine Weights based on Unit Type
    const weights = {
      practical: type === "lab" ? 15 : (type === "workshop" ? 40 : 0),
      assignment: type === "lab" ? 5 : (type === "theory" ? 10 : 0),
      tests: type === "lab" ? 10 : (type === "theory" ? 20 : 0),
      exam: type === "workshop" ? 60 : 70
    };

    // 2. CA Calculation
    const cats = [
      Number(formData.get("cat1")) || 0,
      Number(formData.get("cat2")) || 0,
      Number(formData.get("cat3")) || 0,
    ];
    const catAvg = cats.reduce((a, b) => a + b, 0) / (cats.filter(v => v > 0).length || 1);
    
    const catScore = type === "workshop" ? 0 : (catAvg / settings.cat1Max) * weights.tests;
    const assgnScore = type === "workshop" ? 0 : ((Number(formData.get("assignment1")) || 0) / settings.assignmentMax) * weights.assignment;
    const pracScore = type === "theory" ? 0 : ((Number(formData.get("practicalRaw")) || 0) / settings.practicalMax) * weights.practical;

    const caTotal = catScore + assgnScore + pracScore;

    // 3. Exam Calculation (Paper is always out of 70 in raw entries)
    const q1 = Number(formData.get("examQ1")) || 0;
    const others = [
      Number(formData.get("examQ2")) || 0,
      Number(formData.get("examQ3")) || 0,
      Number(formData.get("examQ4")) || 0,
      Number(formData.get("examQ5")) || 0,
    ].sort((a, b) => b - a);

    // Default to Best 3 others (total 4 questions)
    const rawExamPaper = q1 + others.slice(0, 3).reduce((a, b) => a + b, 0);
    const examWeighted = (rawExamPaper / 70) * weights.exam;

    const finalMark = Math.round(caTotal + examWeighted);
    const matched = [...(settings?.gradingScale || [])]
      .sort((a, b) => b.min - a.min)
      .find((s) => finalMark >= s.min);

    setPreview({
      ca: Number(caTotal.toFixed(2)),
      exam: Number(examWeighted.toFixed(2)),
      total: finalMark,
      grade: matched ? matched.grade : "E",
      mode: type
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    const payload: SaveMarksPayload = {
      regNo: student.student.regNo,
      unitCode: selectedUnitCode.toUpperCase().trim(),
      academicYear: (editingMark?.academicYear.year || (formData.get("academicYear") as string)).trim(),
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

    try { await onSave(payload); onClose(); } finally { setIsSaving(false); }
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
                {editingMark ? "Edit Marks" : "Add Missing Record"}
              </h2>
              <p className="text-yellow-gold text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                Unit Mode: {currentUnitType.toUpperCase()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-all bg-white/5 p-2 rounded-full border border-white/10">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <form onSubmit={handleSubmit} id="marksForm" onChange={(e) => calculateLiveScore(new FormData(e.currentTarget))}>
            {!editingMark && (
              <div className="grid grid-cols-2 gap-6 mb-8">
                <SelectField
                  name="unitCode"
                  label="Authorized Unit"
                  placeholder="-- Select Unit --"
                  options={availableUnits}
                  onChange={setSelectedUnitCode}
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
              {/* COURSEWORK SECTION */}
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  Section A: Continuous Assessment
                  {currentUnitType === "workshop" && <span className="text-red-500 flex items-center gap-1"><Lock size={10}/> CATs Disabled</span>}
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <MarkInput name="cat1" label="CAT 1" defaultValue={editingMark?.cat1Raw} max={settings.cat1Max} disabled={currentUnitType === "workshop"} />
                  <MarkInput name="cat2" label="CAT 2" defaultValue={editingMark?.cat2Raw} max={settings.cat2Max} disabled={currentUnitType === "workshop"} />
                  <MarkInput name="cat3" label="CAT 3" defaultValue={editingMark?.cat3Raw} max={settings.cat3Max} disabled={currentUnitType === "workshop" || settings.cat3Max === 0} />
                  <MarkInput name="assignment1" label="Assignments" defaultValue={editingMark?.assgnt1Raw} max={settings.assignmentMax} disabled={currentUnitType === "workshop"} />
                  <MarkInput name="practicalRaw" label="Practical" defaultValue={editingMark?.practicalRaw} max={settings.practicalMax} disabled={currentUnitType === "theory"} />
                </div>
              </div>

              {/* EXAM SECTION */}
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Section B: Final Assessment (/{preview.mode === 'workshop' ? 60 : 70} Weighted)
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <MarkInput
                      key={num}
                      name={`examQ${num}` as keyof SaveMarksPayload}
                      label={`Q${num}`}
                      defaultValue={editingMark ? (editingMark[`examQ${num}Raw` as keyof RawMark] as number) : null}
                      max={num === 1 ? 10 : 20}
                    />
                  ))}
                </div>
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <p className="text-[10px] text-blue-600/80 leading-tight">
                    Best 3 others + Q1 are summed and scaled to {preview.mode === 'workshop' ? '60%' : '70%'}.
                  </p>
                </div>
              </div>
            </div>

            {/* PREVIEW SCOREBOARD */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-green-darkest rounded-2xl border border-yellow-gold/20 shadow-inner">
              <div className="text-center border-r border-white/10">
                <p className="text-[9px] font-black text-yellow-gold/50 uppercase">CA Weighted</p>
                <p className="text-xl font-mono font-black text-white">{preview.ca}</p>
              </div>
              <div className="text-center border-r border-white/10">
                <p className="text-[9px] font-black text-yellow-gold/50 uppercase">Exam Weighted</p>
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

            {/* SPECIAL OVERRIDE */}
            <div className="mt-6 border-t border-slate-200 pt-6 flex items-center gap-4">
              <input type="checkbox" checked={isSpecial} onChange={(e) => setIsSpecial(e.target.checked)} className="w-5 h-5 accent-green-darkest" />
              <div>
                <p className="text-[10px] font-black text-slate-700 uppercase">Special Exam Protocol</p>
                <p className="text-[9px] text-slate-400 uppercase">Marks attempt as Special (ignores CA if applicable)</p>
              </div>
            </div>
          </form>
        </div>

        <div className="p-8 bg-white border-t border-slate-100 flex justify-end gap-4">
          <button onClick={onClose} type="button" className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">
            Discard
          </button>
          <button form="marksForm" type="submit" disabled={isSaving} className="flex items-center gap-3 px-8 py-3 bg-green-darkest text-yellow-gold rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition-all disabled:opacity-50">
            {isSaving ? "Archiving..." : <><ShieldCheck size={18} /> Commit & Recalculate</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function MarkInput({ name, label, defaultValue, max, disabled }: MarkInputProps) {
  return (
    <div className={`p-2 rounded-xl border transition-all ${disabled ? 'bg-slate-100 border-slate-100 opacity-50' : 'bg-white border-slate-200 focus-within:border-green-500'}`}>
      <label className="text-[9px] font-black text-slate-400 block mb-1 px-1 uppercase">
        {label} (/{max})
      </label>
      <input
        name={name} type="number" step="0.1" min="0" max={max} required={!disabled} disabled={disabled}
        className="w-full p-1 text-center bg-transparent text-green-900 font-mono font-black text-sm outline-none disabled:cursor-not-allowed"
        defaultValue={defaultValue ?? (disabled ? 0 : "")}
      />
    </div>
  );
}

function SelectField({ name, label, options, placeholder, onChange, defaultValue }: SelectFieldProps) {
  return (
    <div className="relative group">
      <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">{label}</label>
      <select
        name={name} required
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-green-darkest outline-none appearance-none cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((opt, idx) => (
          <option key={opt.code || opt.year || idx} value={opt.code || opt.year}>
            {opt.code ? `${opt.code} — ${opt.name}` : opt.year}
          </option>
        ))}
      </select>
    </div>
  );
}