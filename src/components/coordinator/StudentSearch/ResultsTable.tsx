"use client";

import { StudentSearchResult } from "@/api/types";
import { UserMinusIcon } from "@heroicons/react/24/outline";

interface ResultsTableProps {
  results: StudentSearchResult[];
  onSelect: (regNo: string) => void;
  visible: boolean;
  searching?: boolean;
}

export default function ResultsTable({ results, onSelect, visible, searching }: ResultsTableProps) {
  if (!visible || searching) return null;

  // 1. Handle Empty Results State
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <UserMinusIcon className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900">No students found</h3>
        <p className="text-sm text-gray-500 max-w-xs text-center">
          We could not find any student matching that registration number. Please check the format and try again.
        </p>
      </div>
    );
  }

  // 2. Handle Normal Results State
  return (
    <div className="rounded-xl overflow-hidden border border-green-dark/20 shadow-xl animate-in fade-in zoom-in-95 duration-300">
      <table className="w-full text-left">
        <thead className="bg-green-darkest text-lime-bright">
          <tr>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Reg No</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Full Name</th>
            <th className="p-4 font-bold uppercase text-xs tracking-wider">Program</th>
            <th className="p-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {results.map((student) => (
            <tr key={student._id} className="border-t border-gray-100 hover:bg-green-50 transition-colors">
              <td className="p-4 font-mono font-bold text-green-800">{student.regNo}</td>
              <td className="p-4 font-medium text-gray-900">{student.name}</td>
              <td className="p-4 text-sm text-gray-600 italic">{student.program?.name || "N/A"}</td>
              <td className="p-4 text-right">
                <button
                  onClick={() => onSelect(student.regNo)}
                  className="text-green-dark hover:text-green-darkest hover:scale-105 font-medium"
                >
                  View Record →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}