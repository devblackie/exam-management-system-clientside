// clienside/src/components/coordinator/StudentSearch/EditMarksModal.tsx
// "use client";

// import { X } from "lucide-react";
// import { RawMark, StudentFullRecord, SaveMarksPayload } from "@/api/types";
// import { useState } from "react";

// // 1. Define specific interfaces for sub-component props
// interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
//   name: string;
//   label: string;
// }

// interface MarkInputProps {
//   name: keyof SaveMarksPayload; // Ensures name matches payload keys
//   label: string;
//   defaultValue?: number | null;
// }

// interface EditMarksModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   student: StudentFullRecord;
//   editingMark: RawMark | null;
//   onSave: (payload: SaveMarksPayload) => Promise<void>;
// }

// export default function EditMarksModal({
//   isOpen,
//   onClose,
//   student,
//   editingMark,
//   onSave,
// }: EditMarksModalProps) {
//   const [isSaving, setIsSaving] = useState(false);
//   const [isSpecial, setIsSpecial] = useState(editingMark?.isSpecial || false);

//   if (!isOpen) return null;

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsSaving(true);
//     const formData = new FormData(e.currentTarget);

//     const payload: SaveMarksPayload = {
//       regNo: student.student.regNo,
//       unitCode: editingMark?.programUnit?.unit?.code || (formData.get("unitCode") as string),
//       academicYear: editingMark?.academicYear.year || (formData.get("academicYear") as string),
//       cat1: Number(formData.get("cat1")) || 0,
//       cat2: Number(formData.get("cat2")) || 0,
//       cat3: Number(formData.get("cat3")) || 0,
//       assignment1: Number(formData.get("assignment1")) || 0,
//       examQ1: Number(formData.get("examQ1")) || 0,
//       examQ2: Number(formData.get("examQ2")) || 0,
//       examQ3: Number(formData.get("examQ3")) || 0,
//       examQ4: Number(formData.get("examQ4")) || 0,
//       examQ5: Number(formData.get("examQ5")) || 0,
//       isSpecial: isSpecial, // Pass this to the backend
//       attempt: isSpecial ? "special" : (editingMark?.attempt || "1st")
//     };

//     try {
//       await onSave(payload);
//       onClose();
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//       <div className="bg-white rounded-l shadow-3xl max-w-3xl w-full max-h-[95vh] overflow-y-auto relative">
//         <div className="sticky top-0 bg-white border-b px-10 py-6 flex justify-between items-center z-10">
//           <h2 className="text-xl font-bold text-green-dark">
//             {editingMark ? "Edit Unit Marks" : "Add Missing Marks"}
//           </h2>
//           <button onClick={onClose} className="text-gray-400 hover:text-red-600 transition-colors">
//             <X size={32} />
//           </button>
//         </div>

//         <div className="p-10">
//           <div className="bg-green-50 p-4 rounded-xl mb-6 border border-green-100">
//             <p className="font-bold text-green-darkest">
//               {student.student.name} ({student.student.regNo})
//             </p>
//             {editingMark && (
//               <p className="text-sm text-green-dark font-mono">
//                 {editingMark.programUnit?.unit?.code} | {editingMark.academicYear.year}
//               </p>
//             )}
//           </div>

//           <form onSubmit={handleSubmit}>
//             {!editingMark && (
//               <div className="grid grid-cols-2 gap-4 mb-6">
//                 <InputField name="unitCode" label="Unit Code" placeholder="e.g. HSP 2101" required />
//                 <InputField name="academicYear" label="Academic Year" placeholder="e.g. 2024/2025" required />
//               </div>
//             )}

//             <fieldset className="mb-8 p-4 border-l-4 border-green-600 bg-green-50/30 rounded-r-xl">
//               <legend className="px-2 font-bold text-green-800 text-sm uppercase tracking-wider">Coursework</legend>
//               <div className="grid grid-cols-4 gap-4 mt-2">
//                 <MarkInput name="cat1" label="CAT 1 (/20)" defaultValue={editingMark?.cat1Raw} />
//                 <MarkInput name="cat2" label="CAT 2 (/20)" defaultValue={editingMark?.cat2Raw} />
//                 <MarkInput name="cat3" label="CAT 3 (/20)" defaultValue={editingMark?.cat3Raw} />
//                 <MarkInput name="assignment1" label="Assgn (/10)" defaultValue={editingMark?.assgnt1Raw} />
//               </div>
//             </fieldset>

//             <fieldset className="mb-8 p-4 border-l-4 border-blue-600 bg-blue-50/30 rounded-r-xl">
//               <legend className="px-2 font-bold text-blue-800 text-sm uppercase tracking-wider">Final Examination</legend>
//               <div className="grid grid-cols-5 gap-3 mt-2">
//                 {([1, 2, 3, 4, 5] as const).map((num) => {
//                   const fieldName = `examQ${num}` as keyof SaveMarksPayload;
//                   const rawFieldName = `examQ${num}Raw` as keyof RawMark;
//                   return (
//                     <MarkInput
//                       key={num}
//                       name={fieldName}
//                       label={`Q${num}`}
//                       defaultValue={editingMark ? (editingMark[rawFieldName] as number) : null}
//                     />
//                   );
//                 })}
//               </div>
//             </fieldset>

//             <button
//               type="submit"
//               disabled={isSaving}
//               className="w-full py-4 bg-gradient-to-r from-green-darkest to-green-dark text-white font-bold rounded-xl shadow-lg transition-all hover:brightness-110 disabled:opacity-50"
//             >
//               {isSaving ? "Updating Records..." : "Save Marks & Re-calculate Grade"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Fixed InputField using React.HTMLProps for standard input attributes
// function InputField({ name, label, ...props }: InputFieldProps) {
//   return (
//     <div>
//       <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">{label}</label>
//       <input
//         name={name}
//         className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//         {...props}
//       />
//     </div>
//   );
// }

// // Fixed MarkInput with strict name typing
// function MarkInput({ name, label, defaultValue }: MarkInputProps) {
//   return (
//     <div>
//       <label className="text-[10px] font-bold text-gray-400 block mb-1">{label}</label>
//       <input
//         name={name}
//         type="number"
//         step="0.1"
//         className="w-full p-2 border rounded text-green-900 font-mono font-bold focus:border-green-500 outline-none"
//         defaultValue={defaultValue ?? ""}
//       />
//     </div>
//   );
// }

// "use client";

// import { X, ShieldCheck, FileSignature, Info, Fingerprint } from "lucide-react";
// import { RawMark, StudentFullRecord, SaveMarksPayload } from "@/api/types";
// import { useState } from "react";

// interface EditMarksModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   student: StudentFullRecord;
//   editingMark: RawMark | null;
//   onSave: (payload: SaveMarksPayload) => Promise<void>;
//   availableUnits: Array<{ code: string; name: string }>;
//   availableYears: Array<{ year: string }>;
// }

// interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
//   name: string;
//   label: string;
//   uppercase?: boolean;
// }

// interface SelectFieldProps {
//   name: string;
//   label: string;
//   options: Array<{ code?: string; name?: string; year?: string }>;
//   placeholder: string;
// }

// interface MarkInputProps {
//   name: keyof SaveMarksPayload;
//   label: string;
//   defaultValue?: number | null;
// }

// export default function EditMarksModal({
//   isOpen,
//   onClose,
//   student,
//   editingMark,
//   onSave,
//   availableUnits,
//   availableYears,
// }: EditMarksModalProps) {
//   const [isSaving, setIsSaving] = useState(false);
//   const [isSpecial, setIsSpecial] = useState(editingMark?.isSpecial || false);

//   if (!isOpen) return null;

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setIsSaving(true);
//     const formData = new FormData(e.currentTarget);

//     const payload: SaveMarksPayload = {
//       regNo: student.student.regNo,
//       unitCode: (
//         editingMark?.programUnit?.unit?.code ||
//         (formData.get("unitCode") as string)
//       )
//         .toUpperCase()
//         .trim(),
//       academicYear: (
//         editingMark?.academicYear.year ||
//         (formData.get("academicYear") as string)
//       ).trim(),
//       cat1: Number(formData.get("cat1")) || 0,
//       cat2: Number(formData.get("cat2")) || 0,
//       cat3: Number(formData.get("cat3")) || 0,
//       assignment1: Number(formData.get("assignment1")) || 0,
//       examQ1: Number(formData.get("examQ1")) || 0,
//       examQ2: Number(formData.get("examQ2")) || 0,
//       examQ3: Number(formData.get("examQ3")) || 0,
//       examQ4: Number(formData.get("examQ4")) || 0,
//       examQ5: Number(formData.get("examQ5")) || 0,
//       isSpecial: isSpecial,
//       attempt: isSpecial ? "special" : editingMark?.attempt || "1st",
//     };

//     try {
//       await onSave(payload);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-green-darkest/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] max-w-4xl w-full max-h-[92vh] overflow-hidden border border-white/20 flex flex-col">
//         {/* HEADER: Institutional Ledger Header */}
//         <div className="bg-green-darkest px-8 py-6 flex justify-between items-center relative overflow-hidden">
//           <div className="absolute top-0 right-0 p-2 opacity-10">
//             <Fingerprint size={120} className="text-yellow-gold" />
//           </div>
//           <div className="relative z-10 flex items-center gap-4">
//             <div className="h-12 w-12 rounded-xl bg-yellow-gold/20 flex items-center justify-center border border-yellow-gold/30">
//               <FileSignature className="text-yellow-gold" size={24} />
//             </div>
//             <div>
//               <h2 className="text-white text-xl font-black uppercase tracking-tighter leading-none mb-1">
//                 {editingMark ? "Modifier Ledger" : "Entry Authorization"}
//               </h2>
//               <p className="text-yellow-gold text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
//                 Data Integrity Protocol: Mark Revision
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="relative z-10 text-white/50 hover:text-white transition-all bg-white/5 p-2 rounded-full border border-white/10"
//           >
//             <X size={24} />
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
//           {/* STUDENT DATA CARD */}
//           <div className="flex items-center justify-between mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
//             <div>
//               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
//                 Target Identity
//               </span>
//               <p className="font-black text-green-darkest text-lg uppercase tracking-tight">
//                 {student.student.name}
//               </p>
//               <p className="text-xs font-mono font-bold text-slate-500">
//                 {student.student.regNo}
//               </p>
//             </div>
//             <div className="text-right border-l pl-8 border-slate-100">
//               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
//                 Context Reference
//               </span>
//               {editingMark ? (
//                 <p className="text-sm font-black text-green-700 font-mono tracking-tighter">
//                   {editingMark.programUnit?.unit?.code}{" "}
//                   <span className="mx-2 text-slate-300">|</span>{" "}
//                   {editingMark.academicYear.year}
//                 </p>
//               ) : (
//                 <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-black uppercase tracking-widest">
//                   New Entry
//                 </span>
//               )}
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} id="marksForm">
//             {/* {!editingMark && (
//               <div className="grid grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-top-4">
//                 <InputField
//                   name="unitCode"
//                   label="Unit Code"
//                   placeholder="HSP 2101"
//                   required
//                   uppercase
//                 />
//                 <InputField
//                   name="academicYear"
//                   label="Academic Year"
//                   placeholder="2024/2025"
//                   required
//                 />
//               </div>

//             )} */}

//             {!editingMark && (
//               <div className="grid grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-top-4">
//                 <div>
//                   <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">
//                     Authorized Unit
//                   </label>
//                   <select
//                     name="unitCode"
//                     required
//                     className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-green-darkest outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100 appearance-none"
//                   >
//                     <option value="">-- Select Unit --</option>
//                     {availableUnits.map((u) => (
//                       <option key={u.code} value={u.code}>
//                         {u.code} : {u.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">
//                     Active Academic Year
//                   </label>
//                   <select
//                     name="academicYear"
//                     required
//                     className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-green-darkest outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100 appearance-none"
//                   >
//                     <option value="">-- Select Session --</option>
//                     {availableYears.map((y) => (
//                       <option key={y.year} value={y.year}>
//                         {y.year}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             )}

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//               {/* COURSEWORK SECTION */}
//               <div className="space-y-4">
//                 <div className="flex items-center gap-2 mb-2">
//                   <div className="h-2 w-2 rounded-full bg-green-500" />
//                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
//                     Section A: Coursework Components
//                   </span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <MarkInput
//                     name="cat1"
//                     label="CAT 01 (/20)"
//                     defaultValue={editingMark?.cat1Raw}
//                   />
//                   <MarkInput
//                     name="cat2"
//                     label="CAT 02 (/20)"
//                     defaultValue={editingMark?.cat2Raw}
//                   />
//                   <MarkInput
//                     name="cat3"
//                     label="CAT 03 (/20)"
//                     defaultValue={editingMark?.cat3Raw}
//                   />
//                   <MarkInput
//                     name="assignment1"
//                     label="ASGN 01 (/10)"
//                     defaultValue={editingMark?.assgnt1Raw}
//                   />
//                 </div>
//               </div>

//               {/* FINAL EXAM SECTION */}
//               <div className="space-y-4">
//                 <div className="flex items-center gap-2 mb-2">
//                   <div className="h-2 w-2 rounded-full bg-blue-500" />
//                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
//                     Section B: Final Assessment
//                   </span>
//                 </div>
//                 <div className="grid grid-cols-5 gap-2">
//                   {([1, 2, 3, 4, 5] as const).map((num) => (
//                     <MarkInput
//                       key={num}
//                       name={`examQ${num}` as keyof SaveMarksPayload}
//                       label={`Q${num}`}
//                       defaultValue={
//                         editingMark
//                           ? (editingMark[
//                               `examQ${num}Raw` as keyof RawMark
//                             ] as number)
//                           : null
//                       }
//                     />
//                   ))}
//                 </div>
//                 <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex items-start gap-3 mt-4">
//                   <Info className="text-blue-500 flex-shrink-0" size={14} />
//                   <p className="text-[10px] text-blue-700 leading-tight">
//                     Ensure marks do not exceed the set threshold for individual
//                     questions according to unit specifications.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* STATUS OVERRIDE */}
//             <div className="border-t border-slate-200 pt-6 flex items-center justify-between">
//               <div className="flex items-center gap-4">
//                 <label className="relative inline-flex items-center cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={isSpecial}
//                     onChange={(e) => setIsSpecial(e.target.checked)}
//                     className="sr-only peer"
//                   />
//                   <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
//                 </label>
//                 <div>
//                   <p className="text-[10px] font-black text-slate-700 uppercase leading-none mb-1">
//                     Special Examination Protocol
//                   </p>
//                   <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tighter">
//                     Enable for supplementary/special attempt authorization
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </form>
//         </div>

//         {/* FOOTER ACTION */}
//         <div className="p-8 bg-white border-t border-slate-100 flex justify-end gap-4">
//           <button
//             onClick={onClose}
//             className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
//           >
//             Cancel Authorization
//           </button>
//           <button
//             form="marksForm"
//             type="submit"
//             disabled={isSaving}
//             className="flex items-center gap-3 px-8 py-3 bg-green-darkest text-yellow-gold rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
//           >
//             {isSaving ? (
//               <span className="animate-pulse">Writing to Ledger...</span>
//             ) : (
//               <>
//                 <ShieldCheck size={18} />
//                 Confirm & Re-Calculate
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Custom Input with forced uppercase support
// function InputField({ name, label, uppercase, ...props }: InputFieldProps) {
//   return (
//     <div>
//       <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">
//         {label}
//       </label>
//       <input
//         name={name}
//         className={`w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-green-darkest outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100 transition-all ${uppercase ? "uppercase" : ""}`}
//         {...props}
//       />
//     </div>
//   );
// }

// function SelectField({ name, label, options, placeholder }: SelectFieldProps) {
//   return (
//     <div className="relative group">
//       <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest group-focus-within:text-green-600 transition-colors">
//         {label}
//       </label>
//       <div className="relative">
//         <select
//           name={name}
//           required
//           className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-green-darkest outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100 appearance-none cursor-pointer transition-all"
//         >
//           <option value="">{placeholder}</option>
//           {options.map((opt, idx) => (
//             <option
//               key={opt.code || opt.year || idx}
//               value={opt.code || opt.year}
//             >
//               {opt.code ? `${opt.code} — ${opt.name}` : opt.year}
//             </option>
//           ))}
//         </select>
//         <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
//           <svg
//             width="12"
//             height="12"
//             viewBox="0 0 12 12"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//           >
//             <path d="m3 4.5 3 3 3-3" />
//           </svg>
//         </div>
//       </div>
//     </div>
//   );
// }

// function MarkInput({ name, label, defaultValue }: MarkInputProps) {
//   return (
//     <div className="bg-white p-2 rounded-xl border border-slate-200">
//       <label className="text-[9px] font-black text-slate-400 block mb-1 px-1 uppercase">
//         {label}
//       </label>
//       <input
//         name={name}
//         type="number"
//         step="0.1"
//         className="w-full p-1 text-center bg-transparent text-green-900 font-mono font-black text-sm outline-none"
//         defaultValue={defaultValue ?? ""}
//       />
//     </div>
//   );
// }

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
                {editingMark ? "Modifier Ledger" : "Entry Authorization"}
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
          <div className="flex items-center justify-between mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                Target Identity
              </span>
              <p className="font-black text-green-darkest text-lg uppercase tracking-tight">
                {student.student.name}
              </p>
              <p className="text-xs font-mono font-bold text-slate-500">
                {student.student.regNo}
              </p>
            </div>
            <div className="text-right border-l pl-8 border-slate-100">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
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

        <div className="p-8 bg-white border-t border-slate-100 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
          >
            Cancel Authorization
          </button>
          <button
            form="marksForm"
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-3 px-8 py-3 bg-green-darkest text-yellow-gold rounded-xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <span className="animate-pulse">Writing to Ledger...</span>
            ) : (
              <>
                <ShieldCheck size={18} />
                Confirm & Re-Calculate
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
          className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-green-darkest outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100 appearance-none cursor-pointer transition-all"
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