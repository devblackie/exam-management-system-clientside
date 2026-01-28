"use client";

import { Trash2, PenLine } from "lucide-react";
import { ProgramUnit } from "@/api/types";

interface CurriculumTableProps {
  curriculum: ProgramUnit[];
  programName: string;
  onEdit: (link: ProgramUnit) => void;
  onDelete: (id: string) => void;
  submitting: boolean;
}

export const CurriculumTable = ({ 
  curriculum, 
  programName, 
  onEdit, 
  onDelete, 
  submitting 
}: CurriculumTableProps) => {
  if (curriculum.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-lg border border-gray-200 mt-8">
        <p className="text-xl font-bold text-gray-400">No units linked to this program yet.</p>
        <p className="text-md text-gray-500 mt-4">Use the &apos;Link Unit to Program &apos; button above.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-8 overflow-hidden">
      <div className="px-8 py-2 border-b border-green-dark bg-green-dark/10">
        <h2 className="text-xl font-semibold text-green-darkest">Curriculum List: {programName}</h2>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-green-darkest to-green-dark text-lime-bright">
          <tr>
            <th className="px-4 py-2 text-left font-bold">Unit Code</th>
            <th className="px-4 py-2 text-left font-bold">Unit Name</th>
            <th className="px-4 py-2 text-center font-bold">Year</th>
            <th className="px-4 py-2 text-center font-bold">Semester</th>
            <th className="px-4 py-2 text-center font-bold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {curriculum.map((link) => (
            <tr key={link._id} className="text-green-darkest hover:bg-gray-50">
              <td className="px-2 border border-green-darkest/30">{link.unit.code}</td>
              <td className="px-2 border border-green-darkest/30">{link.unit.name}</td>
              <td className="border border-green-darkest/30 text-center">{link.requiredYear}</td>
              <td className="border border-green-darkest/30 text-center">{link.requiredSemester}</td>
              <td className="flex justify-center gap-4 border border-green-darkest/30 py-2">
                <button onClick={() => onEdit(link)} disabled={submitting} className="text-green-dark hover:scale-110 transition-all"><PenLine size={18} /></button>
                <button onClick={() => onDelete(link._id)} disabled={submitting} className="text-red-600 hover:scale-110 transition-all"><Trash2 size={18} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};