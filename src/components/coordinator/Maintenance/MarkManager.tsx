// src/components/coordinator/Maintenance/MarkManager.tsx
"use client";
import { useState, useEffect } from "react";
import { AlertCircle, Trash2, Archive } from "lucide-react";
import { Unit, Program, AcademicYear } from "@/api/types";
import { useToast } from "@/context/ToastContext";
import MarkTrashBin from "./MarkTrashBin";
import { CleanupFilters, maintenanceApi } from "@/api/maintenanceApi";

interface MarkManagerProps {
  units: Unit[];
  programs: Program[];
  years: AcademicYear[];
}

const inputClass = "w-full p-3.5 border border-slate-200 text-green-darkest text-xs outline-none rounded-lg bg-white transition";

export default function MarkManager({ units, programs, years }: MarkManagerProps) {
  const { addToast } = useToast();
  const [view, setView] = useState<"clean" | "trash">("clean");
  const [confirmDelete, setConfirmDelete] = useState("");
  const [filters, setFilters] = useState<CleanupFilters>({
    unitCode: "",
    programId: "",
    academicYear: "",
  });

  useEffect(() => {
    if (years.length > 0 && !filters.academicYear) {
      const activeYear = years.find(y => y.isActive) || years[0];
      setFilters((prev) => ({ ...prev, academicYear: activeYear.year }));
    }
  }, [years, filters.academicYear]);

  const runCleanup = async () => {
    if (!filters.academicYear) {
      addToast("Please select an academic year", "error");
      return;
    }
    if (confirmDelete !== "DELETE") return;

    try {
      const res = await maintenanceApi.bulkTrash(filters);
      addToast(res.message, "success");
      setConfirmDelete("");
    } catch (e) {
      console.error(e);
      addToast("Failed to move marks to trash", "error");
    }
  };

  return (
    <div className="border border-green-darkest/5 rounded-lg bg-white shadow-2xl shadow-green-darkest/5 overflow-hidden">
      {/* TABS */}
      <div className="flex bg-slate-50 border-b border-slate-100">
        <button
          onClick={() => setView("clean")}
          className={`flex-1 flex items-center justify-center gap-3 px-6 py-5 text-sm font-black uppercase tracking-widest transition-colors ${view === "clean" ? "bg-white text-red-600 border-t-4 border-red-500" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Trash2 size={18} /> Cleanup Marks
        </button>
        <button
          onClick={() => setView("trash")}
          className={`flex-1 flex items-center justify-center gap-3 px-6 py-5 text-sm font-black uppercase tracking-widest transition-colors ${view === "trash" ? "bg-white text-green-darkest border-t-4 border-green-darkest" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Archive size={18} /> Trash Bin
        </button>
      </div>

      <div className="p-10">
        {view === "clean" ? (
          <div className="space-y-8">
            <div className="flex gap-4 p-5 bg-red-50 text-red-700 rounded-xl border border-red-100">
              <AlertCircle className="shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold">Dangerous Action</p>
                <p className="text-sm">
                  Moving marks to trash hides them from transcripts and grade
                  reports. They can be restored later from the Trash Bin tab.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Academic Year
                </label>
                <select
                  className={inputClass}
                  value={filters.academicYear}
                  onChange={(e) =>
                    setFilters({ ...filters, academicYear: e.target.value })
                  }
                >
                  <option value="">Select Year...</option>
                  {years.map((y) => (
                    <option key={y._id} value={y.year}>
                      {y.year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Unit
                </label>
                <select
                  className={inputClass}
                  onChange={(e) =>
                    setFilters({ ...filters, unitCode: e.target.value })
                  }
                >
                  <option value="">All Units</option>
                  {units.map((u) => (
                    <option key={u._id} value={u.code}>
                      {u.code} - {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Program
                </label>
                <select
                  className={inputClass}
                  onChange={(e) =>
                    setFilters({ ...filters, programId: e.target.value })
                  }
                >
                  <option value="">All Programs</option>
                  {programs.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Confirmation
                </label>
                <input
                  placeholder="Type DELETE to confirm"
                  className="w-full p-3.5 border border-slate-200 text-green-darkest  outline-none rounded-lg bg-white text-sm text-center font-mono transition uppercase"
                  value={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.value)}
                />
              </div>
              <button
                disabled={confirmDelete !== "DELETE"}
                onClick={runCleanup}
                className="w-full py-1 bg-red-600 hover:bg-red-700 disabled:bg-green-darkest/50 text-white rounded-xl font-black uppercase tracking-widest transition-all shadow-lg "
              >
                Move to Bin
              </button>
            </div>
          </div>
        ) : (
          <MarkTrashBin />
        )}
      </div>
    </div>
  );
}