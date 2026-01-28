"use client";

import React from "react";

// Define the shape clearly
interface AcademicYearFormFields {
  year: string;
  startDate: string;
  endDate: string;
}

interface YearFormProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  autoFill: () => void;
  submitting: boolean;
  formData: AcademicYearFormFields;
  setFormData: (data: AcademicYearFormFields) => void;
}

export const YearFormModal = ({ 
  onClose, onSubmit, autoFill, submitting, formData, setFormData 
}: YearFormProps) => {
  return (
    <div className="fixed inset-0 bg-black/90 bg-opacity-60 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-lg shadow-3xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-2 flex justify-between items-center">
          <h2 className="text-xl font-bold text-green-darkest">Create New Academic Year</h2>
          <button onClick={onClose} className="text-green-darkest hover:text-red-600 text-4xl font-light hover:rotate-90 transition">×</button>
        </div>
        <div className="p-6">
          <form onSubmit={onSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-md font-bold text-green-darkest">Academic Year</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  placeholder="e.g. 2024/2025"
                  required
                  className="w-full px-6 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={autoFill} className="w-full px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-xl transition">
                  Auto-Fill Current Year
                </button>
              </div>
            </div>
            {/* Start and End Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-md font-bold text-green-darkest">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                  className="w-full px-6 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-md font-bold text-green-darkest">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  required
                  className="w-full px-6 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none"
                />
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-6">
              <button type="submit" disabled={submitting} className="flex-1 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-white font-bold text-sm rounded-lg flex items-center justify-center">
                {submitting ? "Creating..." : "Create Academic Year"}
              </button>
              <button type="button" onClick={onClose} className="px-12 py-2 bg-gray-500 text-white font-bold text-sm rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};