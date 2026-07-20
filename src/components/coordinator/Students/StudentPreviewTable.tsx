// clientside/src/components/coordinator/Students/StudentPreviewTable.tsx
"use client";

import { AlertCircle, CheckCircle2, XCircle, Trash2 } from "lucide-react";

export interface ParsedStudentRow {
  rowNum: number;
  regNo: string;
  name: string;
  program: string;
  year: number;
  intake: string;
  error?: string;
}

interface Props {
  rows: ParsedStudentRow[];
  onRemoveRow: (index: number) => void;
}

export default function StudentPreviewTable({ rows, onRemoveRow }: Props) {
  const valid = rows.filter((r) => !r.error).length;
  const invalid = rows.filter((r) => r.error).length;

  return (
    <div>
      {/* Summary chips */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          <CheckCircle2 size={11} /> {valid} valid
        </span>
        {invalid > 0 && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            <XCircle size={11} /> {invalid} with errors — will be skipped
          </span>
        )}
        <span className="text-[10px] text-slate-400 font-mono ml-auto">
          {rows.length} rows parsed
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/60 shadow-sm">
        <table className="w-full min-w-[700px] text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {[
                "Row",
                "Reg No",
                "Full Name",
                "Program",
                "Year",
                "Intake",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`text-xs transition-colors ${
                  row.error
                    ? "bg-red-50/50 border-l-2 border-l-red-400"
                    : "bg-white hover:bg-slate-50/50"
                }`}
              >
                <td className="px-4 py-2.5 font-mono text-[10px] text-slate-400">
                  {row.rowNum}
                </td>
                <td className="px-4 py-2.5 font-mono font-bold text-green-darkest">
                  {row.regNo || <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-2.5 text-slate-700">
                  {row.name || <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-2.5 text-slate-500 max-w-[180px] truncate">
                  {row.program || <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-2.5 text-center text-slate-500">
                  {row.year}
                </td>
                <td className="px-4 py-2.5 text-slate-500">{row.intake}</td>
                <td className="px-4 py-2.5 text-right">
                  {row.error ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-500">
                      <AlertCircle size={10} /> {row.error}
                    </span>
                  ) : (
                    <button
                      onClick={() => onRemoveRow(i)}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
