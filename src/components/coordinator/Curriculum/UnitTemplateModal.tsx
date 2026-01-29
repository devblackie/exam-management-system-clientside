"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import CommonButton from "@/components/ui/CommonButton";

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
    // Reset form only on success (handled by parent or reset here)
    setTemplateForm({ code: "", name: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white p-2 rounded-lg shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center border-b-2 border-green-darkest/40 p-4 mb-6">
          <h2 className="text-lg font-bold text-green-darkest">Create New Unit</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition"
            disabled={submitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4 px-4">
            <label className="block text-sm text-green-darkest font-bold mb-1">Unit Code</label>
            <input
              type="text"
              placeholder="e.g. ICS 2107"
              value={templateForm.code}
              onChange={(e) =>
                setTemplateForm({ ...templateForm, code: e.target.value.toUpperCase() })
              }
              className="w-full rounded-md border border-green-darkest/50 px-3 py-2 text-sm text-green-dark outline-0 "
              required
              disabled={submitting}
            />
          </div>

          <div className="mb-6 px-4">
            <label className="block text-sm text-green-darkest font-bold mb-1">Unit Name</label>
            <input
              type="text"
              placeholder="e.g. Database Systems"
              value={templateForm.name}
              onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              className="w-full rounded-md border border-green-darkest/50 px-3 py-2 text-green-dark outline-0 "
              required
              disabled={submitting}
            />
          </div>

          <div className="px-4 mb-4">
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
                "Create Unit"
              )}
            </CommonButton>
          </div>
        </form>
      </div>
    </div>
  );
};