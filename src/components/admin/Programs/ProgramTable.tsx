// clientside/src/components/admin/Programs/ProgramTable.tsx
"use client";

import { useState } from "react";
import type { Program } from "@/api/types";
import { BookOpen, Calendar, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { updateProgram, deleteProgram } from "@/api/programsApi";

interface Props {
  programs: Program[];
  onRefresh: () => void;
}

export default function ProgramTable({ programs, onRefresh }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Program>>({});
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
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async (id: string) => {
    setSavingId(id);
    try {
      await updateProgram(id, {
        ...editData,
        code: editData.code?.toUpperCase(),
      });
      setEditingId(null);
      setEditData({});
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteProgram(id);
      setConfirmDeleteId(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const inputStyle =
    "w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-green-darkest font-bold text-xs outline-none focus:ring-1 focus:ring-yellow-gold/40 transition-all";

  if (programs.length === 0) {
    return (
      <div className="text-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
        <BookOpen className="mx-auto text-slate-200 mb-4" size={48} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          No Academic Programs Identified
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-green-darkest/5 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Program Identity
            </th>
            <th className="px-8 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Institutional Code
            </th>
            <th className="px-8 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Duration
            </th>
            <th className="px-8 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {programs.map((program) => {
            const isEditing = editingId === program._id;
            const isSaving = savingId === program._id;
            const isDeleting = deletingId === program._id;
            const confirmingDelete = confirmDeleteId === program._id;

            return (
              <tr
                key={program._id}
                className={`group transition-all ${isEditing ? "bg-slate-50/80" : "hover:bg-slate-50/50"}`}
              >
                {/* Program Name */}
                <td className="px-8 py-4">
                  {isEditing ? (
                    <input
                      className={inputStyle}
                      value={editData.name ?? ""}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      placeholder="Program name"
                    />
                  ) : (
                    <p className="text-sm font-bold text-green-darkest tracking-tight">
                      {program.name}
                    </p>
                  )}
                </td>

                {/* Code */}
                <td className="px-8 py-4 text-center">
                  {isEditing ? (
                    <input
                      className={`${inputStyle} text-center uppercase`}
                      value={editData.code ?? ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="CODE"
                      maxLength={10}
                    />
                  ) : (
                    <span className="px-4 py-2 bg-green-darkest text-yellow-gold text-xs font-mono font-bold rounded-lg shadow-sm">
                      {program.code}
                    </span>
                  )}
                </td>

                {/* Duration */}
                <td className="px-8 py-4 text-center">
                  {isEditing ? (
                    <select
                      className={inputStyle}
                      value={editData.durationYears ?? program.durationYears}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          durationYears: Number(e.target.value),
                        })
                      }
                    >
                      {[3, 4, 5, 6].map((y) => (
                        <option key={y} value={y}>
                          {y} Years
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-green-darkest font-black text-xs">
                      <Calendar size={14} className="text-slate-300" />
                      {program.durationYears} Years
                    </div>
                  )}
                </td>

                {/* Actions */}
                <td className="px-8 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {isEditing ? (
                      <>
                        {/* Save */}
                        <button
                          onClick={() => handleSave(program._id)}
                          disabled={isSaving}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-darkest text-yellow-gold text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-green-800 transition-all disabled:opacity-50"
                        >
                          {isSaving ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Check size={12} />
                          )}
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                        {/* Cancel */}
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : confirmingDelete ? (
                      <>
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-wider">
                          Confirm?
                        </span>
                        <button
                          onClick={() => handleDelete(program._id)}
                          disabled={isDeleting}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-[9px] font-black uppercase tracking-wider rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Edit */}
                        <button
                          onClick={() => startEdit(program)}
                          className="p-2 text-slate-300 hover:text-green-darkest hover:bg-green-darkest/5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Edit program"
                        >
                          <Pencil size={14} />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => setConfirmDeleteId(program._id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Delete program"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
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