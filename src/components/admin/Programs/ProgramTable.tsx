
// clientside/src/components/admin/Programs/ProgramTable.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import type { Program, School, Department } from "@/api/types";
import { useUpdateProgram, useDeleteProgram } from "@/hooks/queries/usePrograms";
import { useInstitutionSettings } from "@/hooks/queries/useInstitutionSettings";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import {
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  GraduationCap,
} from "lucide-react";

interface ProgramTableProps {
  programs: Program[];
  onRefresh: () => void;
}

interface EditData {
  name: string;
  code: string;
  description?: string;
  durationYears: number;
  degreeType: string;
  schoolCode: string;
  departmentCode: string;
  isActive: boolean;
}

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] as const },
  }),
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

const inputStyle =
  "w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-700 text-xs outline-none focus:ring-1 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all";
const selectStyle = `${inputStyle} cursor-pointer`;

export default function ProgramTable({ programs, onRefresh }: ProgramTableProps) {
  const { addToast } = useToast();
  const updateProgram = useUpdateProgram();
  const deleteProgram = useDeleteProgram();
  const { data: settings } = useInstitutionSettings();
  const schools: School[] = settings?.schools ?? [];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<EditData>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const editSelectedSchool = schools.find((s: School) => s.code === editData.schoolCode);
  const editDepartments: Department[] = editSelectedSchool?.departments ?? [];

  const startEdit = (program: Program) => {
    setEditingId(program._id);
    setEditData({
      name: program.name,
      code: program.code,
      description: program.description,
      durationYears: program.durationYears,
      degreeType: program.degreeType,
      schoolCode: program.schoolCode,
      departmentCode: program.departmentCode,
      isActive: program.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async (id: string) => {
    if (!editData.schoolCode || !editData.departmentCode) {
      addToast("School and department are required", "error");
      return;
    }
    setSavingId(id);
    try {
      await updateProgram.mutateAsync({ id, data: editData });
      addToast("Program updated successfully", "success");
      setEditingId(null);
      setEditData({});
      onRefresh();
    } catch (err: unknown) {
      addToast(getErrorMessage(err), "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteProgram.mutateAsync(id);
      addToast("Program deleted successfully", "success");
      setConfirmDeleteId(null);
      onRefresh();
    } catch (err: unknown) {
      addToast(getErrorMessage(err), "error");
    } finally {
      setDeletingId(null);
    }
  };

  if (programs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-green-darkest/5 shadow-sm p-16 text-center">
        <GraduationCap size={40} className="mx-auto text-slate-200 mb-3" />
        <p className="text-sm text-slate-400 font-medium">No programs found</p>
        <p className="text-xs text-slate-300 mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-green-darkest/5 shadow-sm overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-100">
            <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Program</th>
            <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Code</th>
            <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">School</th>
            <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Department</th>
            <th className="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Duration</th>
            <th className="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Degree</th>
            <th className="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
            <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          <AnimatePresence mode="wait">
            {programs.map((program, index) => {
              const isEditing = editingId === program._id;
              const isSaving = savingId === program._id;
              const isDeleting = deletingId === program._id;
              const confirmingDelete = confirmDeleteId === program._id;
              const schoolInfo = schools.find((s: School) => s.code === program.schoolCode);
              const deptInfo = schoolInfo?.departments?.find((d: Department) => d.code === program.departmentCode);

              if (confirmingDelete) {
                return (
                  <motion.tr key={program._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50/30">
                    <td colSpan={8} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-red-600 font-medium">
                          Delete &quot;{program.name}&quot;? This cannot be undone.
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(program._id)}
                            disabled={isDeleting}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                            {isDeleting ? "Deleting..." : "Confirm"}
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                );
              }

              return (
                <motion.tr
                  key={program._id}
                  custom={index}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`group transition-colors ${isEditing ? "bg-yellow-gold/5" : "hover:bg-slate-50/50"}`}
                >
                  {isEditing ? (
                    <td colSpan={8} className="px-6 py-4">
                      <div className="grid grid-cols-7 gap-3 items-center">
                        <div className="col-span-2">
                          <input className={inputStyle} value={editData.name ?? ""} onChange={(e) => setEditData({ ...editData, name: e.target.value })} placeholder="Program name" />
                          <input className={`${inputStyle} mt-1`} value={editData.description ?? ""} onChange={(e) => setEditData({ ...editData, description: e.target.value })} placeholder="Description" />
                        </div>
                        <input className={`${inputStyle} uppercase`} value={editData.code ?? ""} onChange={(e) => setEditData({ ...editData, code: e.target.value.toUpperCase() })} placeholder="CODE" />
                        <select className={selectStyle} value={editData.schoolCode ?? ""} onChange={(e) => setEditData({ ...editData, schoolCode: e.target.value, departmentCode: "" })}>
                          <option value="">School</option>
                          {schools.map((s: School) => (<option key={s.code} value={s.code}>{s.name}</option>))}
                        </select>
                        <select className={selectStyle} value={editData.departmentCode ?? ""} onChange={(e) => setEditData({ ...editData, departmentCode: e.target.value })} disabled={!editData.schoolCode}>
                          <option value="">Dept</option>
                          {editDepartments.map((d: Department) => (<option key={d.code} value={d.code}>{d.name}</option>))}
                        </select>
                        <select className={selectStyle} value={editData.durationYears ?? 5} onChange={(e) => setEditData({ ...editData, durationYears: Number(e.target.value) })}>
                          {[3, 4, 5, 6, 7].map((y) => (<option key={y} value={y}>{y}y</option>))}
                        </select>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleSave(program._id)} disabled={isSaving} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Save">
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          </button>
                          <button onClick={cancelEdit} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Cancel">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-green-darkest tracking-tight">{program.name}</p>
                        {program.description && (
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">{program.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-darkest text-yellow-gold text-xs font-mono font-bold rounded-lg shadow-sm">
                          {program.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-600">{schoolInfo?.name || program.schoolCode || "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-600">{deptInfo?.name || program.departmentCode || "—"}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1 text-xs text-slate-600">
                          {program.durationYears} Years
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">
                          {program.degreeType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle ${program.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                        <span className="text-xs text-slate-500">{program.isActive ? "Active" : "Inactive"}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button onClick={() => startEdit(program)} className="p-2 text-slate-400 hover:text-green-darkest hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setConfirmDeleteId(program._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}