// clientside/src/components/coordinator/AcademicYears/YearTable.tsx
"use client";

import {
  Calendar,
  CheckCircle2,
  Lock,
  Unlock,
  ArrowRightCircle,
  Trash2,
  Edit3,
} from "lucide-react";
import { AcademicYear } from "@/api/types";
import { deleteAcademicYear } from "@/api/academicYearsApi";
import { useToast } from "@/context/ToastContext";

interface YearTableProps {
  years: AcademicYear[];
  onUpdate: (id: string, data: Partial<AcademicYear>) => void;
}

type SessionType = "ORDINARY" | "SUPPLEMENTARY" | "CLOSED";

export const YearTable = ({ years, onUpdate }: YearTableProps) => {
  const { addToast } = useToast();

  if (years.length === 0)
    return (
      <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
        <Calendar className="mx-auto text-slate-200 mb-4" size={48} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          No Sessions Found
        </p>
      </div>
    );

  const handleDelete = async (id: string, isCurrent?: boolean) => {
    if (isCurrent) {
      addToast("Cannot delete the active session", "error");
      return;
    }
    if (
      !confirm(
        "Are you sure? All data linked to this calendar cycle will be affected.",
      )
    )
      return;

    try {
      await deleteAcademicYear(id);
      addToast("Session deleted", "success");
      window.location.reload();
    } catch (err) {
      addToast("Delete failed", "error");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-100">
            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
              Academic Cycle & Intake
            </th>
            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
              Conclusion Date 
            </th>
            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
              Session Phase
            </th>
            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {years.map((y) => (
            <tr key={y._id} className="hover:bg-slate-50/80 transition-all">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-black text-green-darkest text-sm">
                    {y.year}
                  </span>
                  <span className="text-[9px] font-bold text-yellow-gold uppercase tracking-tighter">
                    {y.intakes?.[0] || "JAN"} INTAKE
                  </span>
                </div>
              </td>

              {/* EDITING PROCESS: The Inline Date Editor */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={
                      y.endDate
                        ? new Date(y.endDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      onUpdate(y._id, { endDate: e.target.value })
                    }
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-[10px] font-bold text-slate-600 outline-none focus:border-yellow-gold transition-all"
                  />
                  <Edit3 size={12} className="text-slate-300" />
                </div>
              </td>

              <td className="px-6 py-4">
                <select
                  value={y.session}
                  onChange={(e) =>
                    onUpdate(y._id, { session: e.target.value as SessionType })
                  }
                  className="bg-slate-100 border-none rounded-lg px-3 py-2 text-[10px] font-black text-green-darkest uppercase tracking-widest outline-none"
                >
                  <option value="ORDINARY">Ordinary Exams</option>
                  <option value="SUPPLEMENTARY">Supps & Specials</option>
                  <option value="CLOSED">Archived / Closed</option>
                </select>
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() =>
                      onUpdate(y._id, {
                        isRegistrationOpen: !y.isRegistrationOpen,
                      })
                    }
                    className={`p-2 rounded-lg transition-all ${y.isRegistrationOpen ? "text-emerald-500 bg-emerald-50" : "text-red-400 bg-red-50"}`}
                    title={
                      y.isRegistrationOpen
                        ? "Registration Open"
                        : "Registration Locked"
                    }
                  >
                    {y.isRegistrationOpen ? (
                      <Unlock size={16} />
                    ) : (
                      <Lock size={16} />
                    )}
                  </button>

                  {y.isCurrent ? (
                    <span className="text-emerald-500">
                      <CheckCircle2 size={18} />
                    </span>
                  ) : (
                    <button
                      onClick={() => onUpdate(y._id, { isCurrent: true })}
                      className="text-slate-300 hover:text-green-darkest"
                    >
                      <ArrowRightCircle size={18} />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(y._id, y.isCurrent)}
                    className="text-slate-300 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
