 // clientside/src/components/coordinator/StudentSearch/GradesTable.tsx
"use client";

import { GradeRecord } from "@/api/types";

interface GradesTableProps {
  grades: GradeRecord[];
}

export default function GradesTable({ grades }: GradesTableProps) {
  if (grades.length === 0) {
    return (
      <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-xl">
        <p className="text-gray-400 font-medium">
          No grade records found for this year of study.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl shadow-sm border border-green-dark/10">
      <table className="w-full border-collapse">
        <thead className="bg-gradient-to-r from-green-darkest to-green-dark font-semibold text-white">
          <tr>
            <th className="p-4 text-left text-xs uppercase tracking-wider">
              Session
            </th>
            <th className="p-4 text-left text-xs uppercase tracking-wider">
              Semester
            </th>
            <th className="p-4 text-left text-xs uppercase tracking-wider">
              Code
            </th>
            <th className="p-4 text-left text-xs uppercase tracking-wider">
              Unit Name
            </th>
            <th className="p-4 text-center text-xs uppercase tracking-wider">
              Mark
            </th>
            <th className="p-4 text-center text-xs uppercase tracking-wider">
              Grade
            </th>
            <th className="p-4 text-center text-xs uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {grades.map((grade) => (
            <tr
              key={grade._id}
              className="border-t border-gray-100 text-xs text-green-darkest hover:bg-green-50/50 transition-colors"
            >
              <td className="p-4 font-medium text-gray-500">
                {grade.academicYear?.year || "N/A"}
              </td>
              <td className="p-4">
                <span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold text-gray-600">
                  {grade.semester && grade.semester !== "N/A" ? `SEM ${grade.semester}` : "N/A"}
                </span>
              </td>
              <td className="p-4 font-mono font-bold text-blue-700">
                {grade.unit?.code || "N/A"}
              </td>
              <td className="p-4 font-medium">
                {grade.unit?.name || "Unit details missing"}
              </td>
              <td className="p-4 text-center font-bold">
                {/* {grade.totalMark?.toFixed(1) || "--"} */}
                {(grade.totalMark || grade.agreedMark)?.toFixed(1) || "--"}
              </td>
              <td className="p-4 text-center font-black text-sm">
                {grade.grade || "--"}
              </td>
              <td className="p-4 text-center">
                <StatusBadge status={grade.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  // Normalise legacy "FAIL" → "SUPPLEMENTARY"
  // The system never stores FAIL as an intended final status — a failed
  // first attempt is always eligible for supplementary (ENG.13)
  const normalised = status === "FAIL" || status === "F" ? "SUPPLEMENTARY" : status;

  const styles: Record<string, string> = {
    PASS:          " text-green-800 ",
    INCOMPLETE:    "text-amber-800 ",
    SUPPLEMENTARY: "text-purple-800 ",
    RETAKE:        "text-orange-800 ",
    SPECIAL:       " text-blue-800 font-black",
  };

  return (
    <span
      className={`py-1 px-3 text-[10px] font-bold uppercase  ${
        styles[normalised] ?? "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {normalised}
    </span>
  );
}

