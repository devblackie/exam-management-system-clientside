// clientside/src/components/coordinator/Students/StudentDropZone.tsx
"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Database, Loader2 } from "lucide-react";

interface Props {
  file: File | null;
  parsing: boolean;
  onFile: (f: File) => void;
  onClear: () => void;
}

export default function StudentDropZone({
  file,
  parsing,
  onFile,
  onClear,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const accept = (f: File) => {
    if (/\.(xlsx|xls|csv)$/i.test(f.name)) onFile(f);
  };

  return (
    <motion.div
      animate={{ scale: dragActive ? 1.01 : 1 }}
      transition={{ duration: 0.15 }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        const f = e.dataTransfer.files[0];
        if (f) accept(f);
      }}
      onClick={() => !file && inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center min-h-[240px] transition-all duration-300 ${
        dragActive
          ? "border-yellow-gold bg-yellow-gold/5 cursor-copy"
          : file
            ? "border-emerald-300 bg-emerald-50/30 cursor-default"
            : "border-slate-200 bg-white hover:border-green-darkest/30 hover:bg-slate-50/40 cursor-pointer"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) accept(f);
          e.target.value = "";
        }}
      />

      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex flex-col items-center gap-4 text-center pointer-events-none"
          >
            <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
              <UploadCloud size={28} />
            </div>
            <div>
              <p className="text-[11px] font-black text-green-darkest uppercase tracking-[0.3em] mb-1">
                Drop Registration Excel Here
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                .xlsx · .xls · .csv — use the downloaded template
              </p>
            </div>
            <span className="px-6 py-2 bg-green-darkest text-yellow-gold font-black text-[10px] uppercase tracking-widest rounded-xl pointer-events-none">
              Browse Files
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex flex-col items-center gap-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                parsing
                  ? "bg-yellow-gold/10 text-yellow-600"
                  : "bg-emerald-50 text-emerald-500"
              }`}
            >
              {parsing ? (
                <Loader2 size={28} className="animate-spin" />
              ) : (
                <Database size={28} />
              )}
            </div>
            <div>
              <p className="text-sm font-black text-green-darkest">
                {file.name}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {(file.size / 1024).toFixed(1)} KB
                {parsing ? " — Parsing…" : " — Ready"}
              </p>
            </div>
            {!parsing && (
              <button
                onClick={onClear}
                className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
              >
                Remove file
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
