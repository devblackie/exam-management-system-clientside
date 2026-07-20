// clientside/src/components/coordinator/Students/StudentResultsPanel.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, RefreshCcw } from "lucide-react";

interface UploadResult {
  message: string;
  registered: string[];
  duplicates: string[];
  errors: string[];
  skipped: number;
}

interface Props {
  result: UploadResult;
  onReset: () => void;
}

export default function StudentResultsPanel({ result, onReset }: Props) {
  const sections = [
    {
      label: "Registered",
      items: result.registered,
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      header: "bg-emerald-50",
      text: "text-emerald-700",
      icon: <CheckCircle2 size={13} />,
    },
    {
      label: "Already Existed",
      items: result.duplicates,
      bg: "bg-amber-50",
      border: "border-amber-200",
      header: "bg-amber-50",
      text: "text-amber-700",
      icon: <AlertCircle size={13} />,
    },
    {
      label: "Errors",
      items: result.errors,
      bg: "bg-red-50",
      border: "border-red-200",
      header: "bg-red-50",
      text: "text-red-700",
      icon: <XCircle size={13} />,
    },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Registered",
            count: result.registered.length,
            color: "text-emerald-600",
          },
          {
            label: "Duplicates",
            count: result.duplicates.length,
            color: "text-amber-600",
          },
          {
            label: "Errors",
            count: result.errors.length,
            color: "text-red-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 text-center"
          >
            <p className={`text-4xl font-light mb-1 ${s.color}`}>{s.count}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Detail lists */}
      <div className="space-y-3">
        {sections.map(
          (sec) =>
            sec.items.length > 0 && (
              <div
                key={sec.label}
                className={`rounded-xl border ${sec.border} overflow-hidden`}
              >
                <div
                  className={`flex items-center gap-2 px-5 py-2.5 border-b ${sec.border} ${sec.header}`}
                >
                  <span className={sec.text}>{sec.icon}</span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${sec.text}`}
                  >
                    {sec.label} ({sec.items.length})
                  </span>
                </div>
                <div className="p-4 max-h-48 overflow-y-auto bg-white">
                  <div className="flex flex-wrap gap-2">
                    {sec.items.map((item, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-600"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ),
        )}
      </div>

      {result.skipped > 0 && (
        <p className="text-[10px] text-slate-400 font-mono mt-4 text-center">
          {result.skipped} blank row{result.skipped !== 1 ? "s" : ""} were
          skipped.
        </p>
      )}

      <div className="flex justify-center mt-8">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-7 py-3 bg-green-darkest hover:bg-green-800 text-yellow-gold text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg"
        >
          <RefreshCcw size={13} /> Register More Students
        </button>
      </div>
    </motion.div>
  );
}
