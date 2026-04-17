// src/components/coordinator/Maintenance/MarkTrashBin.tsx
"use client";
import { useEffect, useState } from "react";
import { RotateCcw, Trash2, Loader2 } from "lucide-react";
import { maintenanceApi } from "@/api/maintenanceApi";
import { TrashedMark } from "@/api/types";

export default function MarkTrashBin() {
  const [trashed, setTrashed] = useState<TrashedMark[]>([]);
  const [loading, setLoading] = useState(false);
  // --- ADDED: State for bulk selection ---
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const data = await maintenanceApi.getTrash();
      setTrashed(data);
      setSelectedIds(new Set()); // Clear selection on refresh
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  // const handleAction = async (ids: string[], action: "restore" | "purge") => {
  //   if (action === "purge" && !confirm(`Permanent delete ${ids.length} marks?`)) return;
  //   await maintenanceApi.handleTrashAction({ markIds: ids, action });
  //   fetchTrash();
  // };

  const handleAction = async (
    marks: TrashedMark[],
    action: "restore" | "purge",
  ) => {
    if (
      action === "purge" &&
      !confirm(`Permanent delete ${marks.length} marks?`)
    )
      return;

    // Map the TrashedMark objects to the format the server expects
    const payload = {
      markIds: marks.map((m) => ({ id: m._id, source: m.source })),
      action,
    };

    await maintenanceApi.handleTrashAction(payload);
    fetchTrash();
  };

  // --- ADDED: Bulk selection handler ---
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  if (loading)
    return (
      <div className="py-20 text-center">
        <Loader2 className="animate-spin mx-auto text-green-dark" size={32} />
      </div>
    );

  return (
    <div className="bg-white rounded-lg p-6 border border-green-dark/10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-green-darkest">Trash Bin</h3>

        {/* --- ADDED: Bulk Action Buttons --- */}
        {selectedIds.size > 0 && (
          <div className="flex gap-2">
            <button
              // onClick={() => handleAction(Array.from(selectedIds), "restore")}
              onClick={() => handleAction(trashed.filter(m => selectedIds.has(m._id)), "restore")}
              className="px-4 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-bold flex items-center gap-1"
            >
              <RotateCcw size={14} /> Restore ({selectedIds.size})
            </button>
            <button
              // onClick={() => handleAction(Array.from(selectedIds), "purge")}
              onClick={() => handleAction(trashed.filter(m => selectedIds.has(m._id)), "purge")}
              className="px-4 py-2 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-bold flex items-center gap-1"
            >
              <Trash2 size={14} /> Purge ({selectedIds.size})
            </button>
          </div>
        )}
      </div>

      {trashed.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-xl text-green-darkest/40 font-medium italic">
            Trash is empty.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-green-dark/20">
          <table className="w-full border-collapse">
            <thead className="bg-green-darkest text-[10px] text-lime-bright uppercase tracking-[0.15em]">
              <tr>
                {/* --- ADDED: Checkbox column --- */}
                <th className="p-4 text-left border-b border-white/10 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelectedIds(new Set(trashed.map((m) => m._id)));
                      else setSelectedIds(new Set());
                    }}
                    checked={
                      selectedIds.size === trashed.length && trashed.length > 0
                    }
                  />
                </th>
                <th className="p-4 text-left font-black border-b border-white/10">
                  Student
                </th>
                <th className="p-4 text-left font-black border-b border-white/10">
                  Unit
                </th>
                <th className="p-4 text-left font-black border-b border-white/10">
                  Deleted At
                </th>
                <th className="p-4 text-center font-black border-b border-white/10">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {trashed.map((m) => (
                <tr
                  key={m._id}
                  className="border-t border-green-dark/10 hover:bg-green-50/50 transition-colors font-mono text-xs text-green-darkest"
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(m._id)}
                      onChange={() => toggleSelect(m._id)}
                    />
                  </td>
                  <td className="p-4 font-sans font-bold">
                    {m.student?.regNo}
                  </td>
                  <td className="p-4 font-bold">{m.programUnit?.unit?.code}</td>
                  <td className="p-4 font-sans text-gray-500">
                    {new Date(m.deletedAt!).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleAction([m], "restore")}
                        className="p-2 text-blue-600 hover:bg-blue-200 rounded-lg"
                        title="Restore"
                      >
                        <RotateCcw size={16} />
                      </button>
                      <button
                        onClick={() => handleAction([m], "purge")}
                        className="p-2 text-red-600 hover:bg-red-200 rounded-lg"
                        title="Permanently Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

