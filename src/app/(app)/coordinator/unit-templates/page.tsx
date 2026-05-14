// clientside/src/app/coordinator/unit-templates/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useUnits, useUpdateUnit, useDeleteUnit } from "@/hooks/queries/useUnits";
import type { Unit } from "@/api/types";
import type { UnitTemplateFormData } from "@/api/unitsApi";
import { useToast } from "@/context/ToastContext";
import {
  X,
  Trash2,
  PenLine,
  ChevronLeft,
  ChevronRight,
  Search,
  Save,
  BookOpen,
  AlertTriangle,
  Library,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";

const UNITS_PER_PAGE = 7;

const tableRowVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] as const },
  }),
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export default function UnitTemplateManagementPage() {
  const { data: units = [], isLoading, isError } = useUnits();
  const updateUnit = useUpdateUnit();
  const deleteUnit = useDeleteUnit();
  const { addToast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editForm, setEditForm] = useState<UnitTemplateFormData>({ code: "", name: "" });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const filteredUnits = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return units;
    return units.filter(
      (u) => u.code.toLowerCase().includes(term) || u.name.toLowerCase().includes(term),
    );
  }, [units, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredUnits.length / UNITS_PER_PAGE));

  const currentUnits = useMemo(() => {
    const start = (currentPage - 1) * UNITS_PER_PAGE;
    return filteredUnits.slice(start, start + UNITS_PER_PAGE);
  }, [filteredUnits, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const startEdit = useCallback((unit: Unit) => {
    setEditingId(unit._id);
    setEditForm({ code: unit.code, name: unit.name });
  }, []);

  const handleUpdate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingId || !editForm.code.trim() || !editForm.name.trim()) return;
      try {
        await updateUnit.mutateAsync({ id: editingId, data: editForm });
        addToast("Unit updated successfully.", "success");
        setEditingId(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Update failed.";
        addToast(message, "error");
      }
    },
    [editingId, editForm, updateUnit, addToast],
  );

  const handleDelete = useCallback(
    async (unitId: string, code: string) => {
      try {
        await deleteUnit.mutateAsync(unitId);
        addToast(`${code} removed from registry.`, "success");
        setDeleteConfirmId(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Delete failed.";
        addToast(message, "error");
      }
    },
    [deleteUnit, addToast],
  );

  if (isLoading) return <LoadingState message="Loading Unit Registry..." />;
  if (isError) {
    return (
      <div className="max-w-8xl lg:ml-48 my-14 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
          <p className="text-slate-500 font-medium">Failed to load units. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl lg:ml-48 my-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="bg-[#F8F9FA] min-h-screen rounded-2xl shadow-2xl p-10 border border-white/60 backdrop-blur-sm"
      >
        <PageHeader title="Unit" highlightedTitle="Templates" />

        {/* EXECUTIVE CONSOLE — Search Bar */}
        <div className="flex items-center gap-3 mb-1 px-2 -mt-2">
          <Library size={14} className="text-yellow-gold" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-darkest/40">
            Template Registry Lookup
          </span>
        </div>

        <div className="rounded-lg shadow-md bg-white mb-8">
          <div className="flex">
            <input
              type="text"
              placeholder="Search by module code or unit name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearchTerm(e.currentTarget.value)}
              className="flex-1 px-4 py-3 text-xs font-medium text-green-darkest border-0 rounded-lg rounded-br-none rounded-tr-none placeholder-slate-300/50 outline-none"
            />
            <button
              onClick={() => setSearchTerm(searchTerm)}
              className="flex text-sm items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-darkest to-green-dark text-white rounded-lg rounded-bl-none rounded-tl-none hover:from-green-700 hover:to-emerald-800 font-bold disabled:opacity-50 transition shadow-xl"
            >
              <Search size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="flex items-center gap-6 mb-6 px-2">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="text-yellow-gold" />
            <span className="text-[10px] font-black text-green-darkest uppercase tracking-widest">
              {filteredUnits.length} Unit{filteredUnits.length !== 1 ? "s" : ""}
            </span>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-yellow-gold hover:border-yellow-gold transition-all disabled:opacity-30 shadow-sm"
              >
                <ChevronLeft size={16} className="text-green-darkest" />
              </button>
              <div className="px-4 py-1.5 bg-green-darkest text-yellow-gold rounded-lg font-mono text-xs font-bold shadow-lg">
                {currentPage} / {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-yellow-gold hover:border-yellow-gold transition-all disabled:opacity-30 shadow-sm"
              >
                <ChevronRight size={16} className="text-green-darkest" />
              </button>
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-green-darkest/5 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Unit Code</th>
                <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Unit Name</th>
                <th className="px-8 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="wait">
                {currentUnits.map((unit, index) => (
                  <motion.tr
                    key={unit._id}
                    custom={index}
                    variants={tableRowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`group transition-colors ${editingId === unit._id ? "bg-yellow-gold/5" : "hover:bg-slate-50/50"}`}
                  >
                    {editingId === unit._id ? (
                      <td colSpan={3} className="px-8 py-5">
                        <motion.form
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          onSubmit={handleUpdate}
                          className="flex gap-4 items-center"
                        >
                          <input
                            type="text"
                            value={editForm.code}
                            onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                            className="w-36 p-3 bg-white border-2 border-yellow-gold rounded-xl font-mono font-bold text-green-darkest text-xs outline-none focus:ring-2 focus:ring-yellow-gold/20"
                            required
                          />
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="flex-1 p-3 bg-white border-2 border-yellow-gold rounded-xl font-bold text-green-darkest text-xs outline-none focus:ring-2 focus:ring-yellow-gold/20"
                            required
                          />
                          <div className="flex gap-2">
                            <button type="submit" disabled={updateUnit.isPending} className="p-2.5 bg-green-darkest text-yellow-gold rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
                              <Save size={18} />
                            </button>
                            <button type="button" onClick={() => setEditingId(null)} className="p-2.5 bg-slate-100 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                              <X size={18} />
                            </button>
                          </div>
                        </motion.form>
                      </td>
                    ) : (
                      <>
                        <td className="px-8 py-4">
                          <span className="px-4 py-1.5 bg-green-darkest text-yellow-gold text-xs font-mono font-bold rounded-lg shadow-sm inline-block">
                            {unit.code}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          <p className="text-sm font-semibold text-green-darkest tracking-tight">{unit.name}</p>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button onClick={() => startEdit(unit)} className="p-2.5 text-slate-400 hover:text-green-darkest hover:bg-green-50 rounded-xl transition-all" title="Edit unit">
                              <PenLine size={16} />
                            </button>
                            <button onClick={() => setDeleteConfirmId(unit._id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete unit">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
              {currentUnits.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-16 text-center">
                    <Library size={32} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-400 font-medium text-sm">
                      {searchTerm ? "No units match your search." : "No unit templates yet."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-green-darkest/50 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
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
                  <h3 className="text-lg font-black text-green-darkest">Confirm Deletion</h3>
                  <p className="text-xs text-slate-500 font-medium">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Permanently delete{" "}
                <span className="font-bold text-green-darkest">
                  {units.find((u) => u._id === deleteConfirmId)?.code}
                </span>
                ?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const unit = units.find((u) => u._id === deleteConfirmId);
                    if (unit) void handleDelete(unit._id, unit.code);
                  }}
                  disabled={deleteUnit.isPending}
                  className="flex-1 py-3 bg-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {deleteUnit.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}