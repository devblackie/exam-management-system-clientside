// clientside/src/components/programs/ProgramTable.tsx
import type { Program } from "@/api/types";

export default function ProgramTable({ programs }: { programs: Program[] }) {
  if (programs.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 text-xl italic bg-white rounded-b-lg">
        No academic programs found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-b-lg shadow-sm border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gradient-to-r from-green-darkest to-green-dark text-lime-bright">
          <tr>
            <th className="px-6 py-4 text-left font-bold text-lg">Program Name</th>
            <th className="px-6 py-4 text-center font-bold text-lg">Code</th>
            <th className="px-6 py-4 text-center font-bold text-lg">Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-green-darkest/10 bg-white">
          {programs.map((program) => (
            <tr key={program._id} className="hover:bg-green-dark/5 transition-colors">
              <td className="px-6 py-4 font-medium text-green-darkest">{program.name}</td>
              <td className="px-6 py-4 text-center font-mono font-bold text-green-dark">{program.code}</td>
              <td className="px-6 py-4 text-center text-green-darkest">{program.durationYears} Years</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}