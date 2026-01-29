"use client";

import React from "react";
import { Trash2, PenLine } from "lucide-react";
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

export const CurriculumTable: React.FC<CurriculumTableProps> = ({
  curriculum,
  programs,
  selectedProgramId,
  loading,
  submitting,
  onEdit,
  onDelete,
}) => {
  const selectedProgram = programs.find((p) => p._id === selectedProgramId);

  const sortedCurriculum = [...curriculum].sort((a, b) => {
  if (a.requiredYear !== b.requiredYear) return a.requiredYear - b.requiredYear;
  return a.requiredSemester - b.requiredSemester;
});

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-8 overflow-hidden">
      {/* Table Header/Title */}
      <div className="px-4 py-2 border-b border-green-dark bg-green-dark/10">
        <h2 className="text-md font-semibold text-green-darkest">
          Curriculum List for: {selectedProgram?.code || "N/A"}
        </h2>
      </div>

      {curriculum.length === 0 && !loading ? (
        <div className="col-span-full text-center py-20">
          <p className="text-lg font-bold text-gray-400">
            No units linked to this program yet.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Use the &apos;Link Unit to Program&apos; button above to define the curriculum.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gradient-to-r from-green-darkest to-green-dark text-lime-bright">
              <tr>
                <th className="px-4 py-2 text-left font-bold">Unit Code</th>
                <th className="px-4 py-2 text-left font-bold">Unit Name</th>
                <th className="px-4 py-2 text-center font-bold">Year</th>
            <th className="px-4 py-2 text-center font-bold">Semester</th>
                <th className="px-4 py-2 text-center font-bold">Edit/Delete</th>
              </tr>
            </thead>
            <tbody>
              {sortedCurriculum.map((link) => (
                <tr key={link._id} className="text-green-darkest hover:bg-green-50/50 transition-colors">
                  <td className="px-2 py-3 border border-green-darkest/30">{link.unit.code}</td>
                  <td className="px-2 py-3 border border-green-darkest/30">{link.unit.name}</td>
                  <td className="border border-green-darkest/30 text-center">{link.requiredYear}</td>
                  <td className="border border-green-darkest/30 text-center">{link.requiredSemester}</td>

                  {/* Action Buttons */}
                  <td className="border border-green-darkest/30">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => onEdit(link)}
                        disabled={submitting}
                        title="Edit Unit"
                        className="py-1 text-green-dark hover:scale-110 transition-all disabled:opacity-50"
                      >
                        <PenLine size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(link._id)}
                        disabled={submitting}
                        title="Delete Unit"
                        className="py-1 text-red-600 hover:scale-110 transition-all disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};