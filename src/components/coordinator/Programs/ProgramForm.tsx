// clientside/src/components/programs/ProgramForm.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createProgram } from "@/api/programsApi";
import CommonButton from "@/components/ui/CommonButton";

interface ProgramFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProgramForm({ onClose, onSuccess }: ProgramFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    durationYears: "4",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createProgram({
        ...formData,
        code: formData.code.trim().toUpperCase(),
        durationYears: Number(formData.durationYears),
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex justify-between items-center px-8 py-4 border-b-4 border-green-dark/20 shadow-xl bg-white-pure rounded-t-lg">
        <h2 className="text-xl font-black text-green-darkest">Add New Program</h2>
        <button
          onClick={onClose}
          className="w-10 h-10 bg-green-dark hover:bg-red-400 text-yellow-gold hover:text-green-darkest rounded-full flex items-center justify-center shadow-lg transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8 bg-white-pure p-8 rounded-b-lg shadow-xl">
        <div className="space-y-2">
          <label className="block text-green-darkest font-bold">Program Code</label>
          <input
            type="text"
            className="w-full rounded-md border border-green-darkest p-3 text-green-dark outline-0 focus:ring-2 focus:ring-yellow-gold/20"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g. BIT"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-green-darkest font-bold">Program Name</label>
          <input
            type="text"
            className="w-full rounded-md border border-green-darkest p-3 text-green-dark outline-0 focus:ring-2 focus:ring-yellow-gold/20"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Bachelor of Science in IT"
            required
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="block text-green-darkest font-bold">Description (Optional)</label>
          <textarea
            className="w-full border border-green-darkest rounded p-3 text-green-darkest"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-green-darkest font-bold">Duration</label>
          <select
            className="w-full rounded-md border border-green-darkest p-3"
            value={formData.durationYears}
            onChange={(e) => setFormData({ ...formData, durationYears: e.target.value })}
          >
            {[3, 4, 5, 6].map((y) => (
              <option key={y} value={y}>{y} Years</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <CommonButton type="submit" disabled={loading} className="w-full py-4 font-bold" textColor="text-green-darkest">
            {loading ? "Processing..." : "Register Program"}
          </CommonButton>
        </div>
      </form>
    </div>
  );
}