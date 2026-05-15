// clientside/src/components/coordinator/Upload/UploadResultSummary.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface UploadResultSummaryProps {
  result: {
    message: string;
    total: number;
    success: number;
    errors: string[];
  };
}

const UploadResultSummary: React.FC<UploadResultSummaryProps> = ({ result }) => {
  const isPerfect = result.success === result.total;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
      className="mt-12"
    >
      <div className="flex items-center gap-4 mb-6 px-2">
        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
          03. Ingestion Summary
        </h2>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
      </div>
      <div
        className={`p-1 bg-white border rounded-lg overflow-hidden ${
          isPerfect ? "border-emerald-500/20" : "border-yellow-gold/20"
        }`}
      >
        <div className="flex items-center p-4 gap-10">
          <div
            className={`h-12 w-12 rounded-lg flex items-center justify-center ${
              isPerfect ? "bg-emerald-50 text-emerald-600" : "bg-yellow-50 text-yellow-600"
            }`}
          >
            {isPerfect ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
          </div>
          <div className="flex-1 grid grid-cols-3 gap-8">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Status
              </p>
              <p className="text-sm font-black text-green-darkest uppercase">
                {isPerfect ? "Success" : "Partial"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Records
              </p>
              <p className="text-xl font-black text-green-darkest">
                {result.success} <span className="text-slate-500">/ {result.total}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Integrity
              </p>
              <p className="text-xl font-black text-emerald-600">
                {((result.success / result.total) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
        {result.errors.length > 0 && (
          <div className="border-t border-slate-100 p-8 bg-slate-50/50">
            <p className="text-[10px] font-black text-red-500 tracking-[0.3em] mb-4">
              Conflict Log ({result.errors.length} error{result.errors.length !== 1 ? "s" : ""})
            </p>
            <div className="space-y-2">
              {result.errors.map((error, i) => (
                <div
                  key={i}
                  className="flex gap-3 text-xs font-medium text-slate-600 bg-white p-3 rounded-lg border border-slate-100 shadow-sm"
                >
                  <span className="text-red-400">•</span> {error}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UploadResultSummary;