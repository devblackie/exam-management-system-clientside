// src/components/coordinator/PromotionControlCard.tsx
"use client";

import { useState, useEffect } from "react";
import { Play, ClipboardList, Loader2 } from "lucide-react";
import { getPrograms } from "@/api/programsApi";
import { getAcademicYears } from "@/api/academicYearsApi"; // Your API
import { Program, AcademicYear } from "@/api/types";

interface SelectionProps {
  onRunPreview: (params: { programId: string; yearToPromote: number; academicYearName: string }) => void;
  isLoading: boolean;
}

export default function PromotionControlCard({ onRunPreview, isLoading }: SelectionProps) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [fetchingOptions, setFetchingOptions] = useState(true);
  
  const [formData, setFormData] = useState({
    programId: "",
    yearToPromote: 1,
    academicYearName: ""
  });

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [progRes, yearRes] = await Promise.all([
          getPrograms(),
          getAcademicYears()
        ]);
        setPrograms(progRes);
        setAcademicYears(yearRes);
        
        // Auto-select active academic year if available
        const activeYear = yearRes.find(y => y.isActive)?.year;
        if (activeYear) {
          setFormData(prev => ({ ...prev, academicYearName: activeYear }));
        }
      } catch (e) {
        console.error("Failed to load promotion options:", e);
      } finally {
        setFetchingOptions(false);
      }
    };
    loadOptions();
  }, []);

  const isFormValid = formData.programId && formData.academicYearName;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 transition-all">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
          <ClipboardList size={24} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Class Promotion Manager</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Program Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-400 ml-1">Program</label>
          <select 
            disabled={fetchingOptions}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition disabled:opacity-50"
            value={formData.programId}
            onChange={(e) => setFormData({...formData, programId: e.target.value})}
          >
            <option value="">Choose Program...</option>
            {programs.map(p => <option key={p._id} value={p._id}>{p.code} - {p.name}</option>)}
          </select>
        </div>

        {/* Year of Study Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-400 ml-1">From Year of Study</label>
          <select 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition"
            value={formData.yearToPromote}
            onChange={(e) => setFormData({...formData, yearToPromote: Number(e.target.value)})}
          >
            {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
        </div>

        {/* Academic Year Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-400 ml-1">Processing Academic Year</label>
          <select 
            disabled={fetchingOptions}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition disabled:opacity-50"
            value={formData.academicYearName}
            onChange={(e) => setFormData({...formData, academicYearName: e.target.value})}
          >
            <option value="">Select Year...</option>
            {academicYears.map(ay => (
              <option key={ay._id} value={ay.year}>
                {ay.year} {ay.isActive ? "(Current)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          disabled={!isFormValid || isLoading || fetchingOptions}
          onClick={() => onRunPreview(formData)}
          className="bg-purple-600 text-white px-10 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50 transition shadow-lg shadow-purple-200"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Play size={18} />}
          Analyze Class Eligibility
        </button>
      </div>
    </div>
  );
}