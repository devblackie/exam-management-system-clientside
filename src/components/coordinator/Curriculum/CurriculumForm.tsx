// clientside/src/app/coordinator/curriculum/components/CurriculumForm.tsx
import { Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";
import CommonButton from "@/components/ui/CommonButton";
import { Unit, ProgramUnit } from "@/api/types";

// 1. Define the shape of your form state
export interface CurriculumFormState {
  programId: string;
  unitId: string;
  requiredYear: string;
  requiredSemester: string;
  isElective?: boolean;
}

interface CurriculumFormProps {
  editingId: string | null;
  form: CurriculumFormState; // Use the specific interface
  setForm: Dispatch<SetStateAction<CurriculumFormState>>; // Correct type for useState setters
  unitTemplates: Unit[];
  curriculum: ProgramUnit[];
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const CurriculumForm = ({ 
  editingId, form, setForm, unitTemplates, curriculum, submitting, onSubmit, onCancel 
}: CurriculumFormProps) => {
  const currentUnit = editingId ? curriculum.find(c => c._id === editingId) : null;

  return (
    <div className="bg-white-pure p-6 rounded-lg shadow-xl mb-8 border border-green-dark/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-green-darkest">
          {editingId ? "Edit Curriculum Slot" : "Link New Unit"}
        </h2>
        <button onClick={onCancel} className="p-2 bg-green-dark text-yellow-gold rounded-full hover:bg-red-400 transition-colors">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={onSubmit} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!editingId ? (
          <div>
            <label className="block text-green-darkest font-bold mb-2">Unit Template</label>
            <select
              value={form.unitId}
              onChange={(e) => setForm({ ...form, unitId: e.target.value })}
              className="w-full rounded-md border border-green-darkest p-3 text-green-dark focus:ring-2 ring-green-dark/20 outline-none"
              required
            >
              <option value="">Select Unit Template</option>
              {unitTemplates.map((u) => <option key={u._id} value={u._id}>{u.code} - {u.name}</option>)}
            </select>
          </div>
        ) : (
          <div className="md:col-span-1">
            <label className="block text-green-darkest font-bold mb-2">Unit Being Edited</label>
            <div className="p-3 bg-gray-100 rounded-md font-semibold text-green-darkest">
              {currentUnit?.unit.code} - {currentUnit?.unit.name}
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-green-darkest font-bold mb-2">Required Year</label>
          <select
            value={form.requiredYear}
            onChange={(e) => setForm({ ...form, requiredYear: e.target.value })}
            className="w-full rounded-md border border-green-darkest p-3 text-green-dark"
          >
            {[1, 2, 3, 4, 5, 6].map((y) => <option key={y} value={String(y)}>Year {y}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-green-darkest font-bold mb-2">Required Semester</label>
          <select
            value={form.requiredSemester}
            onChange={(e) => setForm({ ...form, requiredSemester: e.target.value })}
            className="w-full rounded-md border border-green-darkest p-3 text-green-dark"
          >
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>
        </div>

        <div className="lg:col-span-3 flex gap-4 mt-2">
          <CommonButton type="submit" disabled={submitting} className="font-bold min-w-[200px]" textColor="text-white-pure">
            {submitting ? "Processing..." : editingId ? "Update Link" : "Create Link"}
          </CommonButton>
        </div>
      </form>
    </div>
  );
};