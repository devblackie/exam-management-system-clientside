// clientside/src/components/coordinator/Upload/UploadDropZone.tsx
"use client";

import React, { useState } from "react";
import { UploadCloud, Database, CloudCheck, Cpu } from "lucide-react";

interface UploadDropZoneProps {
  file: File | null;
  onFile: (file: File) => void;
  onUpload: () => void;
  uploading: boolean;
  onRemove: () => void;
}

const UploadDropZone: React.FC<UploadDropZoneProps> = ({
  file,
  onFile,
  onUpload,
  uploading,
  onRemove,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) {
      onFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-lg p-12 transition-all duration-500 flex flex-col items-center justify-center min-h-[300px] ${
        dragActive
          ? "border-yellow-gold bg-yellow-gold/5 scale-[1.01]"
          : "border-slate-200 bg-white"
      }`}
    >
      {!file ? (
        <>
          <div className="h-16 w-16 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 mb-6">
            <UploadCloud size={32} />
          </div>
          <p className="text-[11px] font-black text-green-darkest uppercase tracking-[0.3em] mb-4">
            Awaiting Document Upload
          </p>
          <label className="px-8 py-3 bg-green-darkest text-yellow-gold font-black text-[10px] uppercase tracking-widest rounded-lg cursor-pointer hover:shadow-xl transition-all">
            Browse Files
            <input
              type="file"
              accept=".csv,.xlsx"
              disabled={uploading}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </>
      ) : (
        <div className="text-center animate-in fade-in zoom-in duration-300">
          <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
            <Database size={32} />
          </div>
          <p className="text-sm font-black text-green-darkest mb-1">{file.name}</p>
          <p className="text-[10px] text-slate-400 font-mono mb-8 uppercase">
            {(file.size / 1024).toFixed(1)} KB — Ready for Processing
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={onRemove}
              disabled={uploading}
              className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition"
            >
              Remove
            </button>
            <button
              onClick={onUpload}
              disabled={uploading}
              className="px-8 py-3 bg-green-darkest text-yellow-gold font-black text-[10px] uppercase tracking-widest rounded-xl flex items-center gap-3 shadow-2xl disabled:opacity-50"
            >
              {uploading ? (
                <Cpu className="animate-spin" size={14} />
              ) : (
                <CloudCheck size={16} />
              )}
              {uploading ? "Processing..." : "Process Results"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadDropZone;