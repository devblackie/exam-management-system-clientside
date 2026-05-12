// clientside/src/components/admin/Programs/ProgramTable.tsx
"use client";

import { useState } from "react";
import type { Program, School, Department, AxiosExpectedError } from "@/api/types";
import { BookOpen, Calendar, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { updateProgram, deleteProgram } from "@/api/programsApi";
import { useInstitutionSettings } from "@/hooks/queries/useInstitutionSettings";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";

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

export default function ProgramTable({ programs, onRefresh }: ProgramTableProps) {
  const { addToast } = useToast();
  const { data: settings } = useInstitutionSettings();
  const schools: School[] = settings?.schools ?? [];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<EditData>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
      await updateProgram(id, {
        ...editData,
        code: editData.code?.toUpperCase(),
      });
      addToast("Program updated successfully", "success");
      setEditingId(null);
      setEditData({});
      onRefresh();
    } catch (err: unknown) {
      const axiosErr = err as AxiosExpectedError;
      addToast(getErrorMessage(axiosErr), "error");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteProgram(id);
      addToast("Program deleted successfully", "success");
      setConfirmDeleteId(null);
      onRefresh();
    } catch (err: unknown) {
      const axiosErr = err as AxiosExpectedError;
      addToast(getErrorMessage(axiosErr), "error");
    } finally {
      setDeletingId(null);
    }
  };

  const selectedSchool = schools.find((s: School) => s.code === editData.schoolCode);
  const departments: Department[] = selectedSchool?.departments ?? [];

  const inputStyle =
    "w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-700 text-xs outline-none focus:ring-1 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all";
  const selectStyle = `${inputStyle} cursor-pointer`;

  if (programs.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
        <BookOpen className="mx-auto text-slate-200 mb-3" size={40} />
        <p className="text-sm text-slate-400">No programs found</p>
        <p className="text-xs text-slate-300 mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Program</th>
            <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Code</th>
            <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">School</th>
            <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Department</th>
            <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
            <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Degree</th>
            <th className="px-4 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {programs.map((program) => {
            const isEditing = editingId === program._id;
            const isSaving = savingId === program._id;
            const isDeleting = deletingId === program._id;
            const confirmingDelete = confirmDeleteId === program._id;

            const schoolInfo = schools.find((s) => s.code === program.schoolCode);
            const departmentInfo = schoolInfo?.departments?.find((d) => d.code === program.departmentCode);

            if (isEditing) {
              return (
                <tr key={program._id} className="bg-slate-50/50">
                  <td className="px-4 py-2">
                    <input
                      className={inputStyle}
                      value={editData.name ?? ""}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      placeholder="Program name"
                    />
                    <input
                      className={`${inputStyle} mt-1`}
                      value={editData.description ?? ""}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      placeholder="Description (optional)"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className={`${inputStyle} uppercase`}
                      value={editData.code ?? ""}
                      onChange={(e) => setEditData({ ...editData, code: e.target.value.toUpperCase() })}
                      placeholder="CODE"
                      maxLength={10}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      className={selectStyle}
                      value={editData.schoolCode ?? ""}
                      onChange={(e) => {
                        setEditData({
                          ...editData,
                          schoolCode: e.target.value,
                          departmentCode: "",
                        });
                      }}
                    >
                      <option value="">Select school</option>
                      {schools.map((s) => (
                        <option key={s.code} value={s.code}>{s.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <select
                      className={selectStyle}
                      value={editData.departmentCode ?? ""}
                      onChange={(e) => setEditData({ ...editData, departmentCode: e.target.value })}
                      disabled={!editData.schoolCode}
                    >
                      <option value="">Select department</option>
                      {departments.map((d) => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <select
                      className={selectStyle}
                      value={editData.durationYears ?? 5}
                      onChange={(e) => setEditData({ ...editData, durationYears: Number(e.target.value) })}
                    >
                      {[3, 4, 5, 6, 7].map((y) => (
                        <option key={y} value={y}>{y}y</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <select
                      className={selectStyle}
                      value={editData.degreeType ?? "BSc"}
                      onChange={(e) => setEditData({ ...editData, degreeType: e.target.value })}
                    >
                      {["BSc", "BEd", "BTech", "BEng", "BArch", "MBBS", "LLB", "BPharm", "Other"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <select
                      className={selectStyle}
                      value={editData.isActive ? "active" : "inactive"}
                      onChange={(e) => setEditData({ ...editData, isActive: e.target.value === "active" })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleSave(program._id)}
                        disabled={isSaving}
                        className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50"
                        title="Save"
                      >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }

            if (confirmingDelete) {
              return (
                <tr key={program._id} className="bg-red-50/30">
                  <td colSpan={8} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                    <span className="text-xs text-red-600">Delete &quot;{program.name}&quot;?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(program._id)}
                          disabled={isDeleting}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-medium rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          {isDeleting ? "Deleting..." : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            }

            return (
              <tr key={program._id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-slate-800">{program.name}</p>
                  {program.description && (
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">{program.description}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <code className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-mono rounded">{program.code}</code>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-slate-600">{schoolInfo?.name || program.schoolCode || "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-slate-600">{departmentInfo?.name || program.departmentCode || "—"}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="inline-flex items-center gap-1 text-xs text-slate-600">
                    <Calendar size={12} className="text-slate-400" />
                    {program.durationYears}y
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">
                    {program.degreeType}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle ${program.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <span className="text-xs text-slate-500">{program.isActive ? "Active" : "Inactive"}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(program)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                      title="Edit program"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(program._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete program"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}