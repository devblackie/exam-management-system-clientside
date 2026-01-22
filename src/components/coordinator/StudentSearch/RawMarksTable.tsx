"use client";

import { approveSpecialExam } from "@/api/marksApi";
import { RawMark } from "@/api/types";
import { useState } from "react";

interface RawMarksTableProps {
  marks: RawMark[];
  studentName: string; // Added to make the UI dynamic
  onEdit: (mark: RawMark) => void;
  onAddNew: () => void;
  onRefresh: () => void; // Added to trigger parent data reload
}

export default function RawMarksTable({ marks, studentName, onEdit, onAddNew, onRefresh }: RawMarksTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleGrantSpecial = async (markId: string, unitCode: string) => {
  if (!confirm(`Grant ${studentName} a Special Exam for ${unitCode}?`)) return;
  
  setProcessingId(markId);
  try {
    const response = await approveSpecialExam(markId);
    
    if (response.success) {
      onRefresh(); 
    }
  } catch (err: unknown) {
    // 1. Log the full error for debugging
    console.error("Grant Special Error:", err);

    // 2. Extract the message safely
    let errorMessage = "Failed to grant special exam.";

    // Check if it's an Axios-style error with a response body
    if (err && typeof err === 'object' && 'response' in err) {
       const axiosError = err as { response?: { data?: { error?: string, message?: string } } };
       errorMessage = axiosError.response?.data?.error || 
                      axiosError.response?.data?.message || 
                      errorMessage;
    } else if (err instanceof Error) {
       // Standard JS error
       errorMessage = err.message;
    }

    alert(errorMessage);
  } finally {
    setProcessingId(null);
  }
};

  return (
    <div className="bg-green-dark/5 rounded-2xl p-6 border border-green-dark/10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-green-darkest">Raw Assessment Marks</h3>
          <p className="text-xs text-green-dark/70 uppercase tracking-tighter">Detailed CAT and Examination breakdown</p>
        </div>
        <button
          onClick={onAddNew}
          className="px-6 py-2 bg-green-darkest text-lime-bright rounded-lg hover:bg-black transition-colors font-bold shadow-md"
        >
          Add / Edit Missing Marks
        </button>
      </div>

      {marks.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-xl text-green-darkest/40 font-medium italic">No raw marks uploaded for this academic cycle.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-green-dark/20">
          <table className="w-full">
            <thead className="bg-green-darkest text-xs text-lime-bright uppercase">
              <tr>
                <th className="p-4 text-left">Year</th>
                <th className="p-4 text-left">Unit</th>
                <th className="p-4 text-center">CA /30</th>
                <th className="p-4 text-center">Exam /70</th>
                <th className="p-4 text-center">Agreed</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {marks.map((m) => {
                const unitCode = m.programUnit?.unit?.code || "N/A";
               
               // NEW LOGIC: Only show button if CA is present but Exam is missing/zero
              const hasCA = (m.caTotal30 || 0) > 0;
              const hasNoExam = (m.examTotal70 || 0) === 0;
              const isEligibleForSpecial = hasCA && hasNoExam && !m.isSpecial;
                return (
                  <tr key={m._id} className="border-t border-green-dark/10 hover:bg-green-50 transition-colors font-mono text-sm text-green-darkest">
                    <td className="p-4 font-sans">{m.academicYear.year}</td>
                    <td className="p-4 font-bold">{unitCode}</td>
                    <td className="p-4 text-center font-bold text-blue-700">{m.caTotal30 ?? 0}</td>
                    <td className="p-4 text-center font-bold text-indigo-700">{m.examTotal70 ?? 0}</td>
                    <td className="p-4 text-center font-black bg-green-50/50">{m.agreedMark ?? 0}</td>
                    <td className="p-4 text-center text-[10px]">
                      {m.attempt === "special" || m.isSpecial ? (
                        <span className="bg-blue-600 text-white px-2 py-1 rounded font-bold">SPECIAL</span>
                      ) : m.isSupplementary ? (
                        <span className="text-red-600 font-bold">SUPP</span>
                      ) : (
                        <span className="text-gray-400">1st</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => onEdit(m)} className="text-[10px] font-bold uppercase text-green-dark hover:underline">
                          Edit Marks
                        </button>
                        {isEligibleForSpecial && (
                          <button
                            disabled={processingId === m._id}
                            onClick={() => handleGrantSpecial(m._id, unitCode)}
                            className="text-[10px] font-bold uppercase text-blue-600 hover:text-blue-800 hover:underline disabled:opacity-50"
                          >
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                          {processingId === m._id ? "Processing..." : "Grant Special"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}