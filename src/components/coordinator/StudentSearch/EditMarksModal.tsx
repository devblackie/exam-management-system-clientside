// clientside/src/components/coordinator/StudentSearch/EditMarksTable.tsx
"use client";

import { X, ShieldCheck, FileSignature, Fingerprint, Lock } from "lucide-react";
import { RawMark, StudentFullRecord, SaveMarksPayload, InstitutionSettings } from "@/api/types";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/context/ToastContext";
import { calculateFinalResult } from "@/components/utils/gradingCore";

interface EditMarksModalProps {
  isOpen: boolean; onClose: () => void; student: StudentFullRecord; editingMark: RawMark | null; 
  onSave: (payload: SaveMarksPayload) => Promise<void>;
  availableUnits: Array<{ code: string; name: string; type?: "theory" | "lab" | "workshop"; }>;
  availableYears: Array<{ year: string }>; settings: InstitutionSettings | null;
}

interface SelectOption { code?: string; name?: string; year?: string; type?: string; }
interface SelectFieldProps { 
  name: string; label: string; options: SelectOption[]; placeholder: string; 
  onChange?: (val: string) => void; defaultValue?: string; 
}
interface MarkInputProps { 
  name: keyof SaveMarksPayload; label: string; defaultValue?: number | null; 
  max: number; disabled?: boolean; 
}

export default function EditMarksModal({ isOpen, onClose, student, editingMark, onSave, availableUnits, availableYears, settings }: EditMarksModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  // const [isSpecial, setIsSpecial] = useState(editingMark?.isSpecial || false);
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>(editingMark?.programUnit?.unit?.code || "");
  const [examMode, setExamMode] = useState<"standard" | "mandatory_q1">(editingMark?.examMode || "standard");
  
  const [isDirect, setIsDirect] = useState(true);
  const [preview, setPreview] = useState({  ca: 0, exam: 0, total: 0, grade: '—', mode: 'theory'});

  // Determine current unit type to handle UI locking
  const currentUnitType = useMemo(() => {
    const unit = availableUnits.find(u => u.code === selectedUnitCode);
    return unit?.type || "theory";
  }, [selectedUnitCode, availableUnits]);
  const isSpecial = editingMark?.isSpecial || false;
  const { addToast } = useToast();  

  const handleFormChange = useCallback(() => {
    if (!formRef.current || !settings) return;

    const formData = new FormData(formRef.current);
    const attempt = isSpecial ? "special" : editingMark?.attempt || "1st";

    let result = { caTotal: 0, examTotal: 0, finalMark: 0 };

    if (isDirect) {
      const ca = Number(formData.get("caDirect")) || 0;
      const exam = Number(formData.get("examDirect")) || 0;
      result = { caTotal: ca, examTotal: exam, finalMark: ca + exam };
    } else {
      result = calculateFinalResult({
        cat1: Number(formData.get("cat1")) || 0,
        cat2: Number(formData.get("cat2")) || 0,
        cat3: Number(formData.get("cat3")) || 0,
        ass1: Number(formData.get("assignment1")) || 0,
        practical: Number(formData.get("practicalRaw")) || 0,
        examQ1: Number(formData.get("examQ1")) || 0,
        examQ2: Number(formData.get("examQ2")) || 0,
        examQ3: Number(formData.get("examQ3")) || 0,
        examQ4: Number(formData.get("examQ4")) || 0,
        examQ5: Number(formData.get("examQ5")) || 0,
        unitType: currentUnitType,
        examMode: examMode,
        attempt: attempt,
        settings: {
          catMax: settings.cat1Max,
          assMax: settings.assignmentMax,
          practicalMax: settings.practicalMax,
          passMark: settings.passMark,
        },
      });
    }

    const matchedGrade = [...(settings.gradingScale || [])]
      .sort((a, b) => b.min - a.min)
      .find((s) => result.finalMark >= s.min);

    setPreview({
      ca: result.caTotal,
      exam: result.examTotal,
      total: result.finalMark,
      grade: matchedGrade ? matchedGrade.grade : "E",
      mode: currentUnitType,
    });
  }, [isDirect, isSpecial, editingMark, settings, currentUnitType, examMode]);

  useEffect(() => { 
    handleFormChange(); 
  }, [handleFormChange]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    // 1. Shared Base Data
    const baseData = {
      regNo: student.student.regNo,
      unitCode: editingMark
        ? editingMark.programUnit.unit.code
        : selectedUnitCode.toUpperCase().trim(),
      academicYear: editingMark
        ? editingMark.academicYear.year
        : (formData.get("academicYear") as string),
      isSpecial: isSpecial,
      attempt: (isSpecial ? "special" : editingMark?.attempt || "1st") as
        | "1st"
        | "re-take"
        | "supplementary"
        | "special",
    };

    if (!baseData.unitCode || !baseData.academicYear) {
      addToast("Missing Unit or Year configuration", "error");
      setIsSaving(false);
      return;
    }

    try {
      if (isDirect) {
        // 2a. Direct Entry Path
        const ca = Number(formData.get("caDirect")) || 0;
        const exam = Number(formData.get("examDirect")) || 0;

        const directPayload: SaveMarksPayload = {
          ...baseData,
          caDirect: ca,
          examDirect: exam,
          caTotal30: ca,
          examTotal70: exam,
          agreedMark: ca + exam,
        };

        await onSave(directPayload);
      } else {
        // 2b. Detailed Entry Path
        const detailedPayload: SaveMarksPayload = {
          ...baseData,
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
          examMode: examMode,
        };

        await onSave(detailedPayload);
      }

      addToast(
        `Marks ${editingMark ? "updated" : "archived"} successfully`,
        "success",
      );
      onClose();
    
    } catch (err: unknown) {
            const axiosErr = err as { response?: { status?: number; data?: { error?: string } } };
            const message = err instanceof Error ? err.message : axiosErr?.response?.data?.error ?? "Submission failed: check connection and values";
            addToast(`${axiosErr?.response?.status ?? ""} — ${message}`, "error");
        } finally {  
      setIsSaving(false);
    }
  };

  if (!isOpen || !settings) return null;


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
              {/* <p className="text-yellow-gold text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                Unit Mode: {currentUnitType.toUpperCase()}
              </p> */}
              <div className="flex gap-4 mt-1">
                <button 
                  type="button" 
                  onClick={() => setIsDirect(true)}
                  className={`text-[9px] font-bold uppercase flex items-center gap-1 transition-colors ${!isDirect ? 'text-yellow-gold' : 'text-white/40'}`}
                >
                  Detailed Mode
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsDirect(false)}
                  className={`text-[9px] font-bold uppercase flex items-center gap-1 transition-colors ${isDirect ? 'text-yellow-gold' : 'text-white/40'}`}
                >
                  Direct Entry
                </button>
              </div>
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
          <form ref={formRef} onSubmit={handleSubmit} onChange={handleFormChange} id="marksForm">

            {!editingMark && (
              <div className="grid grid-cols-2 gap-6 mb-8">
              <SelectField name="unitCode" label="Authorized Unit" placeholder="-- Select Unit --" options={availableUnits} onChange={setSelectedUnitCode} />
              <SelectField name="academicYear" label="Academic Year" placeholder="-- Select Session --" options={availableYears} />
            </div>
            )}

            {isDirect ? (
              /* SIMPLE MODE UI */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 animate-in fade-in slide-in-from-bottom-2">
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section A: CA Total</span>
                  <MarkInput name="caDirect" label="Continuous Assessment" max={30} defaultValue={editingMark?.caTotal30} />
                </div>
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section B: Exam Total</span>
                  <MarkInput name="examDirect" label="Examination Score" max={70} defaultValue={editingMark?.examTotal70} />
                </div>
              </div>
            ) : (

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* COURSEWORK SECTION */}
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  Section A: Continuous Assessment
                  {currentUnitType === "workshop" && (
                    <span className="text-red-500 flex items-center gap-1">
                      <Lock size={10} /> CATs Disabled
                    </span>
                  )}
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
                  Section B: Final Assessment (/{preview.mode === "workshop" ? 60 : 70} Weighted)
                </span>
                <div className="mb-4">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                    Exam Strategy
                  </label>
                  <div className="flex gap-2">
                    {(["standard", "mandatory_q1"] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setExamMode(mode)}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold border transition-all ${
                          examMode === mode
                            ? "bg-green-darkest text-white border-green-darkest"
                            : "bg-white text-slate-400 border-slate-200"
                        }`}
                      >
                        {mode === "standard" ? "Standard (Q1: 10pts)" : "Compulsory (Q1: 30pts)"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const fieldName = `examQ${num}` as keyof SaveMarksPayload;
                    const rawKey = `examQ${num}Raw` as keyof RawMark;
                    const defaultValue = editingMark ? (editingMark[rawKey] as number) : null;

                    return (
                      <MarkInput
                        key={num}
                        name={fieldName}
                        label={`Q${num}`}
                        defaultValue={defaultValue}
                        max={ num === 1 ? examMode === "mandatory_q1" ? 30 : 10 : 20 }
                      />
                    );
                  })}
                </div>

                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <p className="text-[10px] text-blue-600/80 leading-tight">
                    Best {examMode === "mandatory_q1" ? "2" : "3"} others + Q1 are summed and scaled to {preview.mode === "workshop" ? "60%" : "70%"}.
                  </p>
                </div>
              </div>
            </div>
          )}



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
            {/* <div className="mt-6 border-t border-slate-200 pt-6 flex items-center gap-4">
              <input
                type="checkbox"
                checked={isSpecial}
                onChange={(e) => setIsSpecial(e.target.checked)}
                className="w-5 h-5 accent-green-darkest"
              />
              <div>
                <p className="text-[10px] font-black text-slate-700 uppercase">Special Exam Protocol</p>
                <p className="text-[9px] text-slate-400 uppercase">Marks attempt as Special (ignores CA if applicable)</p>
              </div>
            </div> */}
          </form>
        </div>

        <div className="p-8 bg-white border-t border-slate-100 flex justify-end gap-4">
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
                {" "}
                <ShieldCheck size={18} /> Commit & Recalculate{" "}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}



// ─── Replace MarkInput component ──────────────────────────────────────
function MarkInput({
  name, label, defaultValue, max, disabled,
}: MarkInputProps) {
  const [value, setValue] = useState<string>(() => {
    if (disabled)              return "0";
    if (defaultValue != null)  return String(defaultValue);
    return "";
  });
  const [clamped, setClamped] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Allow typing intermediate states
    if (raw === "" || raw === ".") { setValue(raw); setClamped(false); return; }

    const num = parseFloat(raw);
    if (isNaN(num)) return;

    if (num > max) {
      setValue(String(max));
      setClamped(true);
      setTimeout(() => setClamped(false), 1500);
      return;
    }
    if (num < 0) { setValue("0"); return; }
    setValue(raw);
    setClamped(false);
  };

  return (
    <div
      className={`p-2 rounded-xl border transition-all ${
        disabled
          ? "bg-slate-100 border-slate-100 opacity-40"
          : clamped
          ? "bg-red-50 border-red-400 ring-1 ring-red-300"
          : "bg-white border-slate-200 focus-within:border-green-500"
      }`}
    >
      <label className="text-[9px] font-black text-slate-400 mb-1 px-1 uppercase flex justify-between">
        <span>{label}</span>
        <span className={clamped ? "text-red-500" : "text-slate-300"}>
          /{max}
        </span>
      </label>
      <input
        name={name}
        type="number"
        step="0.1"
        min="0"
        max={max}
        value={value}
        onChange={handleChange}
        required={!disabled}
        disabled={disabled}
        className="w-full p-1 text-center bg-transparent text-green-900
                   font-mono font-black text-sm outline-none
                   disabled:cursor-not-allowed"
      />
      {clamped && (
        <p className="text-[8px] text-red-500 text-center font-black mt-0.5 animate-pulse">
          Max: {max}
        </p>
      )}
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