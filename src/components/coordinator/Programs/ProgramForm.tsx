// clientside/src/components/programs/ProgramForm.tsx
"use client";

import { useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import { createProgram } from "@/api/programsApi";

export default function ProgramForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ code: "", name: "", description: "", durationYears: "4" });

  const inputStyle = "w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-green-darkest font-bold text-sm  transition-all outline-none";
  const labelStyle = "text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2 mb-2 block";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createProgram({ ...formData, code: formData.code.trim().toUpperCase(), durationYears: Number(formData.durationYears) });
      onSuccess(); onClose();
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-lg border border-green-darkest/5 shadow-2xl overflow-hidden animate-in slide-in-from-top-6 duration-500">
      <div className="p-8 flex justify-between items-center border-b border-slate-50">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-green-darkest tracking-tight">Register Program</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Formal Curriculum Entry</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-2xl transition-all">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-10 grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-4">
          <label className={labelStyle}>Program Code</label>
          <input type="text" className={inputStyle} value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g. BSE" required />
        </div>
        <div className="col-span-12 md:col-span-8">
          <label className={labelStyle}>Program Name</label>
          <input type="text" className={inputStyle} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Bachelor of Software Engineering" required />
        </div>
        <div className="col-span-12 md:col-span-8">
          <label className={labelStyle}>Description (Optional)</label>
          <textarea rows={1} className={inputStyle} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        </div>
        <div className="col-span-12 md:col-span-4">
          <label className={labelStyle}>Course Duration</label>
          <select className={inputStyle} value={formData.durationYears} onChange={(e) => setFormData({ ...formData, durationYears: e.target.value })}>
            {[3, 4, 5, 6].map((y) => <option key={y} value={y}>{y} Academic Years</option>)}
          </select>
        </div>
        <div className="col-span-12 pt-4">
          <button type="submit" disabled={loading} className="w-full py-5 bg-gradient-to-r from-green-darkest to-green-dark text-yellow-gold font-black text-xs uppercase tracking-[0.3em] rounded-xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50">
            {loading ? "Registering..." : "Register Program"}
          </button>
        </div>
      </form>
    </div>
  );
}