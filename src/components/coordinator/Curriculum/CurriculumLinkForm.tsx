"use client";

import React from "react";
import { X } from "lucide-react";
import CommonButton from "@/components/ui/CommonButton";
import type { Unit, ProgramUnit, CurriculumFormState } from "@/api/types";

// Define the specific shape of your form state here


interface CurriculumLinkFormProps {
  form: CurriculumFormState;
  // Replace 'any' with the specific state type
  setForm: React.Dispatch<React.SetStateAction<CurriculumFormState>>;
  unitTemplates: Unit[];
  editingId: string | null;
  curriculum: ProgramUnit[];
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const CurriculumLinkForm: React.FC<CurriculumLinkFormProps> = ({
  form,
  setForm,
  unitTemplates,
  editingId,
  curriculum,
  submitting,
  onSubmit,
  onClose,
}) => {
  const editingUnit = curriculum.find((c) => c._id === editingId);

  return (
    <div className="shadow-lg animate-in slide-in-from-top duration-300">
     
      <div className="flex justify-between px-8 border-b-2 ">
        <h2 className="text-md font-black text-center mb-8 text-green-darkest">
          {editingId ? "Edit Curriculum Slot" : "Link New Unit"}
        </h2>
        <button
          onClick={onClose}
          className="relative w-10 h-10 bg-green-dark hover:bg-red-400 hover:text-green-darkest text-yellow-gold rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200 z-10 group"
          disabled={submitting}
        >
          <X size={17} />
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            Close Form
          </span>
        </button>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto bg-white-pure p-6  border-gray-100"
      >
        {!editingId ? (
          <div>
            <label className="block text-green-darkest font-bold mb-2">Unit Template</label>
            <select
              value={form.unitId}
              onChange={(e) => setForm((prev) => ({ ...prev, unitId: e.target.value }))}
              className="w-full rounded-md border border-green-darkest bg-transparent px-3 py-3 text-green-dark outline-0 focus:ring-2 focus:ring-green-500"
              required
              disabled={submitting}
            >
              <option value="">Select Unit Template</option>
              {unitTemplates.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.code} - {u.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-green-darkest font-bold mb-2">Unit Being Edited</label>
            <div className="p-3 bg-gray-100 rounded-md font-semibold text-green-darkest border border-gray-200">
              {editingUnit?.unit.code} - {editingUnit?.unit.name}
            </div>
          </div>
        )}

        <div>
          <label className="block text-green-darkest font-bold mb-2">Required Year</label>
          <select
            value={form.requiredYear}
            onChange={(e) => setForm((prev) => ({ ...prev, requiredYear: e.target.value }))}
            className="w-full rounded-md border border-green-darkest bg-transparent px-3 py-3 text-green-dark outline-0"
            disabled={submitting}
          >
            {[1, 2, 3, 4, 5, 6].map((y) => (
              <option key={y} value={String(y)}>Year {y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-green-darkest font-bold mb-2">Required Semester</label>
          <select
            value={form.requiredSemester}
            onChange={(e) => setForm((prev) => ({ ...prev, requiredSemester: e.target.value }))}
            className="w-full rounded-md border border-green-darkest bg-transparent px-3 py-3 text-green-dark outline-0"
            disabled={submitting}
          >
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </div>

        <div className="flex gap-4 items-center mt-5 md:col-span-2 lg:col-span-3">
          <CommonButton
            type="submit"
            disabled={submitting}
            className="font-bold min-w-[200px]"
            textColor="text-white-pure"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : editingId ? "Update Curriculum Link" : "Create Curriculum Link"}
          </CommonButton>

          {editingId && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600 transition shadow-md"
              disabled={submitting}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};