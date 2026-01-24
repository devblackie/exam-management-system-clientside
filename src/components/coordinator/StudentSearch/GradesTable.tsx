// clientside/src/components/coordinator/StudentSearch/GradesTable.tsx
// "use client";

// import { GradeRecord } from "@/api/types";

// interface GradesTableProps {
//   grades: GradeRecord[];
// }

// export default function GradesTable({ grades }: GradesTableProps) {
//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full">
//         <thead className="bg-gradient-to-r from-green-darkest to-green-dark font-semibold text-lime-bright">
//           <tr>
//             <th className="p-4 text-left">Year</th>
//             <th className="p-4 text-left">Semester</th>
//             <th className="p-4 text-left">Unit Code</th>
//             <th className="p-4 text-left">Unit Name</th>
//             <th className="p-4 text-center">Grade</th>
//             <th className="p-4 text-center">Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {grades.map((grade) => (
//             <tr
//               key={grade._id}
//               className="border-t border-green-darkest/20 text-sm text-green-darkest hover:bg-green-dark/5 transition-colors"
//             >
//               <td className="p-4">{grade.academicYear?.year || "N/A"}</td>
//               <td className="p-4">
//                 {grade.semester && grade.semester !== "N/A"
//                   ? `Semester ${grade.semester}`
//                   : "Not Set"}
//               </td>
//               <td className="p-4 font-mono font-bold">{grade.unit?.code || "N/A"}</td>
//               <td className="p-4">{grade.unit?.name || "Unit details missing"}</td>
//               <td className="p-4 text-center font-black text-lg">{grade.grade}</td>
//               <td className="p-4 text-center">
//                 <StatusBadge status={grade.status} />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// function StatusBadge({ status }: { status: string }) {
//   const styles: Record<string, string> = {
//     PASS: "bg-green-100 text-green-800 border-green-200",
//     INCOMPLETE: "bg-yellow-100 text-yellow-800 border-yellow-200",
//     FAIL: "bg-red-100 text-red-800 border-red-200",
//   };

//   return (
//     <span className={`py-1 px-4 rounded-full text-xs font-bold border ${styles[status] || "bg-gray-100"}`}>
//       {status}
//     </span>
//   );
// }

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
        <p className="text-gray-400 font-medium">No grade records found for this year of study.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl shadow-sm border border-green-dark/10">
      <table className="w-full border-collapse">
        <thead className="bg-gradient-to-r from-green-darkest to-green-dark font-semibold text-white">
          <tr>
            <th className="p-4 text-left text-xs uppercase tracking-wider">Session</th>
            <th className="p-4 text-left text-xs uppercase tracking-wider">Semester</th>
            <th className="p-4 text-left text-xs uppercase tracking-wider">Code</th>
            <th className="p-4 text-left text-xs uppercase tracking-wider">Unit Name</th>
            <th className="p-4 text-center text-xs uppercase tracking-wider">Grade</th>
            <th className="p-4 text-center text-xs uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {grades.map((grade) => (
            <tr
              key={grade._id}
              className="border-t border-gray-100 text-sm text-green-darkest hover:bg-green-50/50 transition-colors"
            >
              <td className="p-4 font-medium text-gray-500">
                {grade.academicYear?.year || "N/A"}
              </td>
              <td className="p-4">
                <span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold text-gray-600">
                  {grade.semester && grade.semester !== "N/A"
                    ? `SEM ${grade.semester}`
                    : "N/A"}
                </span>
              </td>
              <td className="p-4 font-mono font-bold text-blue-700">{grade.unit?.code || "N/A"}</td>
              <td className="p-4 font-medium">{grade.unit?.name || "Unit details missing"}</td>
              <td className="p-4 text-center font-black text-lg">
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
  const styles: Record<string, string> = {
    PASS: "bg-green-100 text-green-700 border-green-200",
    INCOMPLETE: "bg-amber-100 text-amber-700 border-amber-200",
    FAIL: "bg-red-100 text-red-700 border-red-200",
    RETAKE: "bg-orange-100 text-orange-700 border-orange-200",
    SUPPLEMENTARY: "bg-purple-100 text-purple-700 border-purple-200",
    SPECIAL: "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <span className={`py-1 px-3 rounded-md text-[10px] font-black uppercase border ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}