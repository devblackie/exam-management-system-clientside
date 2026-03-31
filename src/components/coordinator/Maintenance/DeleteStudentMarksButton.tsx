// clientside/src/components/coordinator/maintenance/DeleteStudentMarks
"use client";
import { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { maintenanceApi } from "@/api/maintenanceApi";

interface Props {
  studentId: string;
  programUnitId: string;
  academicYearId: string;
  onSuccess: () => void; // Callback to refresh data after deletion
}

export default function DeleteStudentMarksButton({
  studentId,
  programUnitId,
  academicYearId,
  onSuccess,
}: Props) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await maintenanceApi.deleteStudentMarks(
        studentId,
        programUnitId,
        academicYearId,
      );
      addToast("Student marks moved to trash.", "success");
      onSuccess();
    } catch  {
      addToast("Failed to delete marks", "error" );
    } finally {
      setLoading(false);
      setConfirm(false);
    }
  };

  if (confirm) {
    return (
      <div className="flex items-center gap-2 bg-red-50 p-2 rounded-lg border border-red-200">
        <AlertTriangle className="text-red-600 size-4" />
        <span className="text-xs text-red-700 font-bold">Are you sure?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs bg-red-600 text-white px-3 py-1 rounded font-bold hover:bg-red-700 flex items-center gap-1"
        >
          {loading ? (
            <Loader2 className="animate-spin size-3" />
          ) : (
            "Yes, Delete"
          )}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="Delete student marks"
    >
      <Trash2 size={16} />
    </button>
  );
}
