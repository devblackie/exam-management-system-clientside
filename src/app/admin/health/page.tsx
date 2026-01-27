// clientside/src/components/admin/SystemHealthTab.tsx
"use client";

import { useState } from "react";
import { Database, Trash2, ShieldCheck } from "lucide-react";
import { runDatabaseCleanup } from "@/api/coordinatorApi";
import { useToast } from "@/context/ToastContext";

export default function SystemHealthTab() {
  const [isCleaning, setIsCleaning] = useState(false);
  const { addToast } = useToast();

  const handleCleanup = async () => {
    if (!confirm("Are you sure? This will permanently delete grades that are not linked to any valid Course Unit. This fixes transcript 'toUpperCase' errors.")) return;

    setIsCleaning(true);
    try {
      const result = await runDatabaseCleanup();
      if (result.success) {
        addToast(result.message, "success");
      }
    } catch  {
      addToast("Failed to complete cleanup. Check server logs.", "error");
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    // <ProtectedRoute allowed={["admin", "coordinator"]}></ProtectedRoute>
    <div className="max-w-8xl ml-48 my-10 ">
        <div className="bg-white min-h-screen rounded-3xl shadow-2xl p-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-4">
          <div className="bg-green-500 p-2 rounded-lg text-white">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs text-green-600 font-bold uppercase">DB Status</p>
            <p className="text-lg font-bold text-green-900">Connected</p>
          </div>
        </div>
        {/* Add more health cards as needed (e.g., Disk Space, Memory) */}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-800">Database Maintenance</h3>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-red-50 border border-red-100">
            <div className="flex gap-4">
              <div className="mt-1 text-red-600">
                <Trash2 size={24} />
              </div>
              <div>
                <h4 className="font-bold text-red-900">Purge Orphaned Grades</h4>
                <p className="text-sm text-red-700">
                  Removes ghost grade records that have no associated Program Unit. 
                  Run this if Coordinators report crashes while generating transcripts.
                </p>
              </div>
            </div>
            <button
              onClick={handleCleanup}
              disabled={isCleaning}
              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-md ${
                isCleaning 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-red-600 text-white hover:bg-red-700 active:scale-95"
              }`}
            >
              {isCleaning ? "Processing..." : "Run Cleanup"}
            </button>
          </div>
        </div>
      </div>
    </div></div>
  );
}