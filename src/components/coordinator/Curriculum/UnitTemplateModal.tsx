"use client";

import { X } from "lucide-react";
import CommonButton from "@/components/ui/CommonButton";

interface UnitTemplateModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  templateForm: { code: string; name: string };
  setTemplateForm: (form: { code: string; name: string }) => void;
}

export const UnitTemplateModal = ({
  show,
  onClose,
  onSubmit,
  submitting,
  templateForm,
  setTemplateForm,
}: UnitTemplateModalProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-green-darkest">Create New Unit Template</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors"
            disabled={submitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-green-darkest font-bold mb-2">Unit Code</label>
            <input
              type="text"
              placeholder="e.g. ICS 2107"
              value={templateForm.code}
              onChange={(e) =>
                setTemplateForm({ ...templateForm, code: e.target.value.toUpperCase() })
              }
              className="w-full rounded-md border border-green-darkest px-3 py-3 text-green-dark outline-none focus:ring-2 ring-green-dark/20"
              required
              disabled={submitting}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-green-darkest font-bold mb-2">Unit Name</label>
            <input
              type="text"
              placeholder="e.g. Database Systems"
              value={templateForm.name}
              onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              className="w-full rounded-md border border-green-darkest px-3 py-3 text-green-dark outline-none focus:ring-2 ring-green-dark/20"
              required
              disabled={submitting}
            />
          </div>

          <CommonButton
            type="submit"
            disabled={submitting}
            className="font-bold w-full"
            textColor="text-white-pure"
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating...
              </div>
            ) : (
              "Create Template"
            )}
          </CommonButton>
        </form>
      </div>
    </div>
  );
};