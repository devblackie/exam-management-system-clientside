"use client";

import { RawMark } from "@/api/types";

interface RawMarksTableProps {
  marks: RawMark[];
  onEdit: (mark: RawMark) => void;
  onAddNew: () => void;
}

export default function RawMarksTable({ marks, onEdit, onAddNew }: RawMarksTableProps) {
  return (
    <div className="bg-green-dark/5 rounded-2xl p-6 border border-green-dark/10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-green-darkest">Raw Assessment Marks</h3>
          <p className="text-xs text-green-dark/70 uppercase tracking-tighter">Detailed CAT and Examination breakdown</p>
        </div>
        <button
          onClick={onAddNew}
          className="px-6 py-2 bg-green-darkest text-lime-bright rounded-lg hover:bg-black transition-colors font-bold shadow-md"
        >
          Add / Edit Missing Marks
        </button>
      </div>

      {marks.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-xl text-green-darkest/40 font-medium italic">No raw marks uploaded for this academic cycle.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-green-dark/20">
          <table className="w-full">
            <thead className="bg-green-darkest text-xs text-lime-bright uppercase">
              <tr>
                <th className="p-4 text-left">Year</th>
                <th className="p-4 text-left">Unit</th>
                <th className="p-4 text-center">CAT (Avg)</th>
                <th className="p-4 text-center">Assgn</th>
                <th className="p-4 text-center">CA /30</th>
                <th className="p-4 text-center">Exam /70</th>
                <th className="p-4 text-center">Agreed</th>
                <th className="p-4 text-center">Supp?</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {marks.map((m) => (
                <tr
                  key={m._id}
                  className="border-t border-green-dark/10 hover:bg-green-50 transition-colors font-mono text-sm text-green-darkest"
                >
                  <td className="p-4 font-sans">{m.academicYear.year}</td>
                  <td className="p-4 font-bold">{m.programUnit?.unit?.code}</td>
                  <td className="p-4 text-center opacity-60">
                    {/* Shows average of available CATs */}
                    {m.cat1Raw || m.cat2Raw ? (( (m.cat1Raw || 0) + (m.cat2Raw || 0) ) / 2).toFixed(1) : "-"}
                  </td>
                  <td className="p-4 text-center opacity-60">{m.assgnt1Raw ?? "-"}</td>
                  <td className="p-4 text-center font-bold text-blue-700">{m.caTotal30 ?? 0}</td>
                  <td className="p-4 text-center font-bold text-indigo-700">{m.examTotal70 ?? 0}</td>
                  <td className="p-4 text-center font-black bg-green-50/50">{m.agreedMark ?? 0}</td>
                  <td className="p-4 text-center text-[10px]">
                    {m.isSupplementary ? <span className="text-red-600 font-bold">YES</span> : <span className="text-gray-300">NO</span>}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => onEdit(m)}
                      className="text-xs font-bold uppercase text-green-dark hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}