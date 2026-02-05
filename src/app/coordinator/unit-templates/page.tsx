"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getUnitTemplates,
  updateUnitTemplate,
  deleteUnitTemplate,
  UnitTemplateFormData,
} from "@/api/unitsApi";
import type { Unit } from "@/api/types";
import { useToast } from "@/context/ToastContext";
import {
  X,
  Trash2,
  PenLine,
  ChevronLeft,
  ChevronRight,
  Search,
  Database,
  Save,
  Command,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";

const UNITS_PER_PAGE = 7;

export default function UnitTemplateManagementPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editForm, setEditForm] = useState<UnitTemplateFormData>({
    code: "",
    name: "",
  });

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    setLoading(true);
    try {
      const data = await getUnitTemplates();
      setUnits(data);
    } catch {
      addToast("Failed to load unit templates.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredUnits = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (currentPage !== 1 && term !== "") setCurrentPage(1);
    if (!term) return units;
    return units.filter(
      (u) =>
        u.code.toLowerCase().includes(term) ||
        u.name.toLowerCase().includes(term),
    );
  }, [units, searchTerm]);

  const totalPages = Math.ceil(filteredUnits.length / UNITS_PER_PAGE);
  const currentUnits = filteredUnits.slice(
    (currentPage - 1) * UNITS_PER_PAGE,
    currentPage * UNITS_PER_PAGE,
  );

  const startEdit = (unit: Unit) => {
    setEditingId(unit._id);
    setEditForm({ code: unit.code, name: unit.name });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editForm.code.trim() || !editForm.name.trim()) return;

    setSubmitting(true);
    try {
      await updateUnitTemplate(editingId!, editForm);
      addToast("Registry updated.", "success");
      setEditingId(null);
      await loadUnits();
    } catch {
      addToast("Update failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (unitId: string, code: string) => {
    if (!confirm(`Permanently remove ${code} from registry?`)) return;
    setSubmitting(true);
    try {
      await deleteUnitTemplate(unitId);
      addToast("Entry purged.", "success");
      await loadUnits();
    } catch {
      addToast("Purge failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading Units..." />;

  return (
    <div className="max-w-8xl ml-48 my-10">
      <div className="bg-[#F8F9FA] min-h-screen rounded-lg shadow-2xl p-10 border border-white">
        <PageHeader title="Unit" highlightedTitle="Templates" />

        {/* COMMAND BAR: Search & Meta */}
        <div className="flex flex-col md:flex-row gap-6 -mt-3 mb-4">
          <div className="relative flex-1 items-center">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by module code or unit name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-lg text-green-darkest font-bold text-sm  transition-all outline-none placeholder:text-slate-300 placeholder:font-medium"
            />
          </div>
          <div className="px-8 py-4 bg-slate-200 border border-slate-200 rounded-lg flex items-center gap-4">
            <Command size={16} className="text-yellow-gold" />
            <span className="text-[10px] font-black text-green-darkest uppercase tracking-widest">
              Total Modules: {filteredUnits.length}
            </span>
          </div>
        </div>

        {/* LEDGER TABLE */}
        <div className="bg-white rounded-lg border border-green-darkest/5 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Unit Code
                </th>
                <th className="px-10 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Unit Name
                </th>
                <th className="px-10 py-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Management Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentUnits.map((unit) => (
                <tr
                  key={unit._id}
                  className={`group transition-all ${editingId === unit._id ? "bg-yellow-gold/5" : "hover:bg-slate-50/50"}`}
                >
                  {editingId === unit._id ? (
                    /* INLINE EDIT MODE */
                    <td colSpan={3} className="px-10 py-6">
                      <form
                        onSubmit={handleUpdate}
                        className="flex gap-4 items-center animate-in fade-in zoom-in-95 duration-300"
                      >
                        <input
                          type="text"
                          value={editForm.code}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              code: e.target.value.toUpperCase(),
                            })
                          }
                          className="w-32 p-3 bg-white border-2 border-yellow-gold rounded-lg font-mono font-bold text-green-darkest text-xs outline-none"
                          required
                        />
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="flex-1 p-3 bg-white border-2 border-yellow-gold rounded-lg font-bold text-green-darkest text-xs outline-none"
                          required
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="p-2 bg-green-darkest text-yellow-gold rounded-lg hover:shadow-lg transition-all"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </form>
                    </td>
                  ) : (
                    /* VIEW MODE */
                    <>
                      <td className="px-10 py-1">
                        <span className="px-4 py-1 bg-green-darkest text-yellow-gold text-xs font-mono font-bold rounded-lg shadow-sm">
                          {unit.code}
                        </span>
                      </td>
                      <td className="px-10 py-1">
                        <p className="text-xs text-green-darkest tracking-tight">
                          {unit.name}
                        </p>
                      </td>
                      <td className="px-10 py-1 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(unit)}
                            className="p-3 text-slate-400 hover:text-green-darkest hover:bg-white rounded-xl shadow-none hover:shadow-md transition-all"
                          >
                            <PenLine size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(unit._id, unit.code)}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl shadow-none hover:shadow-md transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION: Command Style */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-between items-center px-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Context: {currentPage} of {totalPages} Modules
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-yellow-gold hover:border-yellow-gold transition-all disabled:opacity-30 shadow-sm"
              >
                <ChevronLeft size={18} className="text-green-darkest" />
              </button>
              <div className="px-6 py-3 bg-green-darkest text-yellow-gold rounded-xl font-mono text-xs font-bold">
                PAGE {currentPage}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-yellow-gold hover:border-yellow-gold transition-all disabled:opacity-30 shadow-sm"
              >
                <ChevronRight size={18} className="text-green-darkest" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
