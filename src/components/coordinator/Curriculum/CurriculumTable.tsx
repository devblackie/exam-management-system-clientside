
// clientside/src/components/coordinator/Curriculum/CurriculumTable.tsx

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Trash2, PenLine, AlertTriangle } from "lucide-react";
import type { Program, ProgramUnit } from "@/api/types";

interface CurriculumTableProps {
  curriculum: ProgramUnit[];
  programs: Program[];
  selectedProgramId: string;
  loading: boolean;
  submitting: boolean;
  onEdit: (link: ProgramUnit) => void;
  onDelete: (id: string) => void;
}

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] as const },
  }),
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

export const CurriculumTable: React.FC<CurriculumTableProps> = ({
  curriculum,
  programs,
  selectedProgramId,
  loading,
  submitting,
  onEdit,
  onDelete,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const selectedProgram = programs.find((p) => p._id === selectedProgramId);

  const sortedCurriculum = [...curriculum].sort((a, b) =>
    a.requiredYear !== b.requiredYear
      ? a.requiredYear - b.requiredYear
      : a.requiredSemester - b.requiredSemester,
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-green-darkest/5 shadow-sm p-16 text-center">
        <p className="text-slate-400 text-sm font-medium">Loading curriculum...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-green-darkest/5 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-green-darkest/60">
            Structure: {selectedProgram?.name || "Unselected"}
          </h2>
          <span className="text-[10px] font-bold text-slate-400">
            {sortedCurriculum.length} Unit{sortedCurriculum.length !== 1 ? "s" : ""}
          </span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Code
              </th>
              <th className="px-8 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Unit Name
              </th>
              <th className="px-8 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Level/Term
              </th>
              <th className="px-8 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence mode="wait">
              {sortedCurriculum.map((link, index) => (
                <motion.tr
                  key={link._id}
                  custom={index}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="group hover:bg-slate-50/50 transition-all"
                >
                  <td className="px-8 py-5">
                    <span className="px-3 py-1.5 bg-green-darkest text-yellow-gold text-xs font-mono font-bold rounded-lg shadow-sm">
                      {link.unit.code}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-green-darkest tracking-tight">
                      {link.unit.name}
                    </p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-green-darkest uppercase">
                      Y{link.requiredYear} • S{link.requiredSemester}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => onEdit(link)}
                        disabled={submitting}
                        className="p-2.5 text-slate-300 hover:text-green-dark hover:bg-green-50 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Edit link"
                      >
                        <PenLine size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(link._id)}
                        disabled={submitting}
                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Delete link"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>

            {sortedCurriculum.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-16 text-center">
                  <p className="text-slate-400 font-medium text-sm">
                    No units linked to this program yet.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-green-darkest/50 backdrop-blur-sm"
              onClick={() => setDeleteConfirmId(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-white"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-green-darkest">Delink Unit</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    This removes the unit from the curriculum.
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to delink{" "}
                <span className="font-bold text-green-darkest">
                  {curriculum.find((c) => c._id === deleteConfirmId)?.unit.code}
                </span>{" "}
                from this program?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={submitting}
                  className="flex-1 py-3 border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all disabled:opacity-30"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  disabled={submitting}
                  className="flex-1 py-3 bg-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  Delink
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};