"use client";

import React, { useState } from "react";
import { X, Cpu, Fingerprint } from "lucide-react";

interface UnitTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string, name: string) => Promise<void>;
  submitting: boolean;
}

export const UnitTemplateModal: React.FC<UnitTemplateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  submitting,
}) => {
  const [templateForm, setTemplateForm] = useState({
    code: "",
    name: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(templateForm.code, templateForm.name);
    setTemplateForm({ code: "", name: "" });
  };

  const inputStyle = "w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-green-darkest font-bold text-sm transition-all outline-none placeholder:text-slate-300";
  const labelStyle = "text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2 mb-2 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with sophisticated blur */}
      <div 
        className="absolute inset-0 bg-green-darkest/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={!submitting ? onClose : undefined}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-md rounded-lg shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] border border-white overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Header Block */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-yellow-gold/10 text-yellow-gold rounded-2xl flex items-center justify-center">
              <Fingerprint size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-green-darkest tracking-tight">New Unit</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add New Unit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-2xl transition-all"
            disabled={submitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div>
            <label className={labelStyle}>Unit Code</label>
            <input
              type="text"
              placeholder="e.g. SIT 3102"
              value={templateForm.code}
              onChange={(e) =>
                setTemplateForm({ ...templateForm, code: e.target.value.toUpperCase() })
              }
              className={inputStyle}
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className={labelStyle}>Unit Designation (Name)</label>
            <input
              type="text"
              placeholder="e.g. Distributed Systems"
              value={templateForm.name}
              onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              className={inputStyle}
              required
              disabled={submitting}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-5 bg-gradient-to-r from-green-darkest to-green-dark text-yellow-gold font-black text-xs uppercase tracking-[0.3em] rounded-[1.5rem] shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <Cpu className="animate-spin" size={16} />
                  <span>Committing to Registry...</span>
                </>
              ) : (
                "Register Unit "
              )}
            </button>
            <p className="text-center mt-6 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
              Unit will be globally available for curriculum linking
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};