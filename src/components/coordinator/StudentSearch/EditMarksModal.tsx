"use client";

import { X } from "lucide-react";
import { RawMark, StudentFullRecord, SaveMarksPayload } from "@/api/types";
import { useState } from "react";

// 1. Define specific interfaces for sub-component props
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
}

interface MarkInputProps {
  name: keyof SaveMarksPayload; // Ensures name matches payload keys
  label: string;
  defaultValue?: number | null;
}

interface EditMarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentFullRecord;
  editingMark: RawMark | null;
  onSave: (payload: SaveMarksPayload) => Promise<void>;
}

export default function EditMarksModal({
  isOpen,
  onClose,
  student,
  editingMark,
  onSave,
}: EditMarksModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    const payload: SaveMarksPayload = {
      regNo: student.student.regNo,
      unitCode: editingMark?.programUnit?.unit?.code || (formData.get("unitCode") as string),
      academicYear: editingMark?.academicYear.year || (formData.get("academicYear") as string),
      cat1: Number(formData.get("cat1")) || 0,
      cat2: Number(formData.get("cat2")) || 0,
      cat3: Number(formData.get("cat3")) || 0,
      assignment1: Number(formData.get("assignment1")) || 0,
      examQ1: Number(formData.get("examQ1")) || 0,
      examQ2: Number(formData.get("examQ2")) || 0,
      examQ3: Number(formData.get("examQ3")) || 0,
      examQ4: Number(formData.get("examQ4")) || 0,
      examQ5: Number(formData.get("examQ5")) || 0,
    };

    try {
      await onSave(payload);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-3xl max-w-3xl w-full max-h-[95vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white border-b px-10 py-6 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-green-dark">
            {editingMark ? "Edit Unit Marks" : "Add Missing Marks"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-600 transition-colors">
            <X size={32} />
          </button>
        </div>

        <div className="p-10">
          <div className="bg-green-50 p-4 rounded-xl mb-6 border border-green-100">
            <p className="font-bold text-green-darkest">
              {student.student.name} ({student.student.regNo})
            </p>
            {editingMark && (
              <p className="text-sm text-green-dark font-mono">
                {editingMark.programUnit?.unit?.code} | {editingMark.academicYear.year}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {!editingMark && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <InputField name="unitCode" label="Unit Code" placeholder="e.g. HSP 2101" required />
                <InputField name="academicYear" label="Academic Year" placeholder="e.g. 2024/2025" required />
              </div>
            )}

            <fieldset className="mb-8 p-4 border-l-4 border-green-600 bg-green-50/30 rounded-r-xl">
              <legend className="px-2 font-bold text-green-800 text-sm uppercase tracking-wider">Coursework</legend>
              <div className="grid grid-cols-4 gap-4 mt-2">
                <MarkInput name="cat1" label="CAT 1 (/20)" defaultValue={editingMark?.cat1Raw} />
                <MarkInput name="cat2" label="CAT 2 (/20)" defaultValue={editingMark?.cat2Raw} />
                <MarkInput name="cat3" label="CAT 3 (/20)" defaultValue={editingMark?.cat3Raw} />
                <MarkInput name="assignment1" label="Assgn (/10)" defaultValue={editingMark?.assgnt1Raw} />
              </div>
            </fieldset>

            <fieldset className="mb-8 p-4 border-l-4 border-blue-600 bg-blue-50/30 rounded-r-xl">
              <legend className="px-2 font-bold text-blue-800 text-sm uppercase tracking-wider">Final Examination</legend>
              <div className="grid grid-cols-5 gap-3 mt-2">
                {([1, 2, 3, 4, 5] as const).map((num) => {
                  const fieldName = `examQ${num}` as keyof SaveMarksPayload;
                  const rawFieldName = `examQ${num}Raw` as keyof RawMark;
                  return (
                    <MarkInput 
                      key={num} 
                      name={fieldName} 
                      label={`Q${num}`} 
                      defaultValue={editingMark ? (editingMark[rawFieldName] as number) : null} 
                    />
                  );
                })}
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-gradient-to-r from-green-darkest to-green-dark text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {isSaving ? "Synchronizing Records..." : "Save Marks & Re-calculate Grade"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Fixed InputField using React.HTMLProps for standard input attributes
function InputField({ name, label, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">{label}</label>
      <input 
        name={name} 
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" 
        {...props} 
      />
    </div>
  );
}

// Fixed MarkInput with strict name typing
function MarkInput({ name, label, defaultValue }: MarkInputProps) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-400 block mb-1">{label}</label>
      <input
        name={name}
        type="number"
        step="0.1"
        className="w-full p-2 border rounded text-green-900 font-mono font-bold focus:border-green-500 outline-none"
        defaultValue={defaultValue ?? ""}
      />
    </div>
  );
}