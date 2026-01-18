// src/components/coordinator/PromotionPreviewModal.tsx
"use client";

import { useState } from "react";
import { X, CheckCircle, AlertCircle, ArrowRight, FileText, Loader2, FileWarning } from "lucide-react";
import { PromotionPreviewResponse, downloadPromotionReport, PromotionPreviewRecord, downloadIneligibilityNotices } from "@/api/promoteApi";

interface PromotionParams {
  programId: string;
  yearToPromote: number;
  academicYearName: string;
}

interface PreviewModalProps {
  data: PromotionPreviewResponse;
  params: PromotionParams;
  onClose: () => void;
  onConfirm: () => void;
}

export default function PromotionPreviewModal({ data, params, onClose, onConfirm }: PreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"eligible" | "blocked">("eligible");
  const [isDownloading, setIsDownloading] = useState(false);

  const currentList: PromotionPreviewRecord[] = activeTab === "eligible" ? data.eligible : data.blocked;

  const formatStudentName = (fullName: string) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) return fullName.toUpperCase();

    const lastName = parts.pop()?.toUpperCase();
    return `${parts.join(" ")} ${lastName}`;
  };

 const handleDownloadSummaries = async () => {
    setIsDownloading(true);
    try {
      await downloadPromotionReport(params);
    } catch (error) {
      console.error("Summaries download error:", error);
      alert("Failed to generate summary reports.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Promotion Preview</h2>
            <p className="text-sm text-gray-500">Year {params.yearToPromote} &rarr; Year {params.yearToPromote + 1}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 hover:text-red-500 text-green-darkest rounded-full transition">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-4 p-6 bg-white">
          <button 
            onClick={() => setActiveTab("eligible")}
            className={`p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${activeTab === 'eligible' ? 'border-green-500 bg-green-50 hover:bg-green-200' : 'border-gray-100 hover:border-green-200'}`}
          >
            <div className="bg-green-500 p-3 rounded-xl text-white"><CheckCircle /></div>
            <div className="text-left">
              <p className="text-xs font-bold uppercase text-green-600">Ready to Promote</p>
              <p className="text-2xl font-black text-gray-800">{data.eligibleCount}</p>
            </div>
          </button>

          <button 
            onClick={() => setActiveTab("blocked")}
            className={`p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${activeTab === 'blocked' ? 'border-red-500 bg-red-50 hover:bg-red-200' : 'border-gray-100 hover:border-red-200'}`}
          >
            <div className="bg-red-500 p-3 rounded-xl text-white"><AlertCircle /></div>
            <div className="text-left">
              <p className="text-xs font-bold uppercase text-red-600">Action Required</p>
              <p className="text-2xl font-black text-gray-800">{data.blockedCount}</p>
            </div>
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-0">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-gray-400 text-xs uppercase tracking-widest border-b">
                <th className="py-3 px-4">Reg No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Status</th>
                {activeTab === 'blocked' && <th className="py-3 px-4">Reasons</th>}
              </tr>
            </thead>
            <tbody>
              {currentList.map((student) => (
                <tr key={student.id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-4 px-4 font-mono text-gray-600 text-sm">{student.regNo}</td>
                  <td className="py-4 px-4 font-semibold text-sm text-gray-700">{formatStudentName(student.name)}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      student.status === 'IN GOOD STANDING' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  {activeTab === 'blocked' && (
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {student.reasons.map((r, i) => (
                          <span key={i} className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded border border-red-100">
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

       
       {/* Footer */}
<div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center">
  <button 
    onClick={onClose} 
    className="px-6 py-2 font-semibold text-gray-500 hover:text-gray-800 transition"
  >
    Cancel
  </button>

  <div className="flex flex-wrap gap-4 justify-end">
    {/* Summary download (always available) */}
    <button
      disabled={isDownloading}
      onClick={handleDownloadSummaries}
      className="flex items-center gap-2 px-6 py-2 rounded-xl font-bold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition disabled:opacity-50"
    >
      {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText size={18} />}
      Download Summaries
    </button>

    {/* Notices download — only if there are blocked students */}
    {data.blockedCount > 0 && (
      <button
        disabled={isDownloading}
        onClick={async () => {
          setIsDownloading(true);
          try {
            await downloadIneligibilityNotices(params);
          } catch (error) {
            console.error("Notices download error:", error);
            alert("Failed to generate ineligibility notices. Try again or contact support.");
          } finally {
            setIsDownloading(false);
          }
        }}
        className="flex items-center gap-2 px-6 py-2 rounded-xl font-bold border-2 border-orange-600 text-orange-600 hover:bg-orange-50 transition disabled:opacity-50"
      >
        {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileWarning size={18} />}
        Download Notices (ZIP)
      </button>
    )}

    {/* Process promotions — only if eligible students exist */}
    <button 
      disabled={data.eligibleCount === 0 || isDownloading}
      onClick={onConfirm}
      className="bg-green-600 text-white px-8 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 disabled:opacity-50 transition shadow-lg shadow-green-200"
    >
      Process {data.eligibleCount} Promotions <ArrowRight size={18} />
    </button>
  </div>
</div>
      </div>
    </div>
  );
}