// clientside/src/components/coordinator/StudentSearch/GradesTable.tsx
"use client";

import { GradeRecord } from "@/api/types";

interface GradesTableProps {
  grades: GradeRecord[];
}

export default function GradesTable({ grades }: GradesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-green-darkest to-green-dark font-semibold text-lime-bright">
          <tr>
            <th className="p-4 text-left">Year</th>
            <th className="p-4 text-left">Semester</th>
            <th className="p-4 text-left">Unit Code</th>
            <th className="p-4 text-left">Unit Name</th>
            <th className="p-4 text-center">Grade</th>
            <th className="p-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade) => (
            <tr
              key={grade._id}
              className="border-t border-green-darkest/20 text-sm text-green-darkest hover:bg-green-dark/5 transition-colors"
            >
              <td className="p-4">{grade.academicYear?.year || "N/A"}</td>
              <td className="p-4">
                {grade.semester && grade.semester !== "N/A"
                  ? `Semester ${grade.semester}`
                  : "Not Set"}
              </td>
              <td className="p-4 font-mono font-bold">{grade.unit?.code || "N/A"}</td>
              <td className="p-4">{grade.unit?.name || "Unit details missing"}</td>
              <td className="p-4 text-center font-black text-lg">{grade.grade}</td>
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
  const styles: Record<string, string> = {
    PASS: "bg-green-100 text-green-800 border-green-200",
    INCOMPLETE: "bg-yellow-100 text-yellow-800 border-yellow-200",
    FAIL: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span className={`py-1 px-4 rounded-full text-xs font-bold border ${styles[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
}