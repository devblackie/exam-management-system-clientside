// // src/components/coordinator/Maintenance/MarkTrashBin.tsx
// "use client";
// import { useEffect, useState } from "react";
// import { RotateCcw, Trash2, Loader2 } from "lucide-react";
// import { maintenanceApi } from "@/api/maintenanceApi";
// import { TrashedMark } from "@/api/types";

// export default function MarkTrashBin() {
//   const [trashed, setTrashed] = useState<TrashedMark[]>([]);
//   const [loading, setLoading] = useState(false);
//   // --- ADDED: State for bulk selection ---
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

//   const fetchTrash = async () => {
//     setLoading(true);
//     try {
//       const data = await maintenanceApi.getTrash();
//       setTrashed(data);
//       setSelectedIds(new Set()); // Clear selection on refresh
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTrash();
//   }, []);

//   // const handleAction = async (ids: string[], action: "restore" | "purge") => {
//   //   if (action === "purge" && !confirm(`Permanent delete ${ids.length} marks?`)) return;
//   //   await maintenanceApi.handleTrashAction({ markIds: ids, action });
//   //   fetchTrash();
//   // };

//   const handleAction = async (
//     marks: TrashedMark[],
//     action: "restore" | "purge",
//   ) => {
//     if (
//       action === "purge" &&
//       !confirm(`Permanent delete ${marks.length} marks?`)
//     )
//       return;

//     // Map the TrashedMark objects to the format the server expects
//     const payload = {
//       markIds: marks.map((m) => ({ id: m._id, source: m.source })),
//       action,
//     };

//     await maintenanceApi.handleTrashAction(payload);
//     fetchTrash();
//   };

//   // --- ADDED: Bulk selection handler ---
//   const toggleSelect = (id: string) => {
//     const newSelected = new Set(selectedIds);
//     if (newSelected.has(id)) newSelected.delete(id);
//     else newSelected.add(id);
//     setSelectedIds(newSelected);
//   };

//   if (loading)
//     return (
//       <div className="py-20 text-center">
//         <Loader2 className="animate-spin mx-auto text-green-dark" size={32} />
//       </div>
//     );

//   return (
//     <div className="bg-white rounded-lg p-6 border border-green-dark/10">
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-lg font-bold text-green-darkest">Trash Bin</h3>

//         {/* --- ADDED: Bulk Action Buttons --- */}
//         {selectedIds.size > 0 && (
//           <div className="flex gap-2">
//             <button
//               // onClick={() => handleAction(Array.from(selectedIds), "restore")}
//               onClick={() => handleAction(trashed.filter(m => selectedIds.has(m._id)), "restore")}
//               className="px-4 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-bold flex items-center gap-1"
//             >
//               <RotateCcw size={14} /> Restore ({selectedIds.size})
//             </button>
//             <button
//               // onClick={() => handleAction(Array.from(selectedIds), "purge")}
//               onClick={() => handleAction(trashed.filter(m => selectedIds.has(m._id)), "purge")}
//               className="px-4 py-2 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-bold flex items-center gap-1"
//             >
//               <Trash2 size={14} /> Purge ({selectedIds.size})
//             </button>
//           </div>
//         )}
//       </div>

//       {trashed.length === 0 ? (
//         <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-xl">
//           <p className="text-xl text-green-darkest/40 font-medium italic">
//             Trash is empty.
//           </p>
//         </div>
//       ) : (
//         <div className="overflow-x-auto rounded-lg border border-green-dark/20">
//           <table className="w-full border-collapse">
//             <thead className="bg-green-darkest text-[10px] text-lime-bright uppercase tracking-[0.15em]">
//               <tr>
//                 {/* --- ADDED: Checkbox column --- */}
//                 <th className="p-4 text-left border-b border-white/10 w-10">
//                   <input
//                     type="checkbox"
//                     onChange={(e) => {
//                       if (e.target.checked)
//                         setSelectedIds(new Set(trashed.map((m) => m._id)));
//                       else setSelectedIds(new Set());
//                     }}
//                     checked={
//                       selectedIds.size === trashed.length && trashed.length > 0
//                     }
//                   />
//                 </th>
//                 <th className="p-4 text-left font-black border-b border-white/10">
//                   Student
//                 </th>
//                 <th className="p-4 text-left font-black border-b border-white/10">
//                   Unit
//                 </th>
//                 <th className="p-4 text-left font-black border-b border-white/10">
//                   Deleted At
//                 </th>
//                 <th className="p-4 text-center font-black border-b border-white/10">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white">
//               {trashed.map((m) => (
//                 <tr
//                   key={m._id}
//                   className="border-t border-green-dark/10 hover:bg-green-50/50 transition-colors font-mono text-xs text-green-darkest"
//                 >
//                   <td className="p-4">
//                     <input
//                       type="checkbox"
//                       checked={selectedIds.has(m._id)}
//                       onChange={() => toggleSelect(m._id)}
//                     />
//                   </td>
//                   <td className="p-4 font-sans font-bold">
//                     {m.student?.regNo}
//                   </td>
//                   <td className="p-4 font-bold">{m.programUnit?.unit?.code}</td>
//                   <td className="p-4 font-sans text-gray-500">
//                     {new Date(m.deletedAt!).toLocaleDateString()}
//                   </td>
//                   <td className="p-4 text-center">
//                     <div className="flex justify-center gap-3">
//                       <button
//                         onClick={() => handleAction([m], "restore")}
//                         className="p-2 text-blue-600 hover:bg-blue-200 rounded-lg"
//                         title="Restore"
//                       >
//                         <RotateCcw size={16} />
//                       </button>
//                       <button
//                         onClick={() => handleAction([m], "purge")}
//                         className="p-2 text-red-600 hover:bg-red-200 rounded-lg"
//                         title="Permanently Delete"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }



// src/components/coordinator/Maintenance/MarkTrashBin.tsx
"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Trash2, Loader2, Archive } from "lucide-react";
import { maintenanceApi } from "@/api/maintenanceApi";
import { TrashedMark } from "@/api/types";

export default function MarkTrashBin() {
  const [trashed,     setTrashed]     = useState<TrashedMark[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const data = await maintenanceApi.getTrash();
      setTrashed(data);
      setSelectedIds(new Set());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrash(); }, []);

  const handleAction = async (marks: TrashedMark[], action: "restore" | "purge") => {
    if (action === "purge" && !confirm(`Permanently delete ${marks.length} mark(s)?`)) return;
    const payload = { markIds: marks.map(m => ({ id: m._id, source: m.source })), action };
    await maintenanceApi.handleTrashAction(payload);
    fetchTrash();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="animate-spin mx-auto text-green-darkest/30" size={28} />
        <p className="text-[10px] font-mono text-slate-300 uppercase tracking-widest mt-3">Loading trash…</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header row with bulk actions */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Archive size={15} className="text-slate-400" />
          <h3 className="text-[11px] font-black text-green-darkest uppercase tracking-widest">Trash Bin</h3>
          {trashed.length > 0 && (
            <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {trashed.length} item{trashed.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(trashed.filter(m => selectedIds.has(m._id)), "restore")}
              className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <RotateCcw size={12} /> Restore ({selectedIds.size})
            </button>
            <button
              onClick={() => handleAction(trashed.filter(m => selectedIds.has(m._id)), "purge")}
              className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 size={12} /> Purge ({selectedIds.size})
            </button>
          </div>
        )}
      </div>

      {trashed.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-green-darkest/5 rounded-xl">
          <Archive size={32} className="text-slate-200 mx-auto mb-3" />
          <p className="text-[11px] font-mono text-slate-300 uppercase tracking-widest">Trash is empty</p>
        </div>
      ) : (
        <div className="bg-white border border-green-darkest/5 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-green-darkest/5">
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    className="rounded border-green-darkest/20 accent-green-darkest"
                    onChange={e => {
                      if (e.target.checked) setSelectedIds(new Set(trashed.map(m => m._id)));
                      else setSelectedIds(new Set());
                    }}
                    checked={selectedIds.size === trashed.length && trashed.length > 0}
                  />
                </th>
                {["Student", "Unit", "Deleted At", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-green-darkest/5">
              {trashed.map(m => (
                <tr key={m._id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-green-darkest/20 accent-green-darkest"
                      checked={selectedIds.has(m._id)}
                      onChange={() => toggleSelect(m._id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] font-bold text-green-darkest font-mono">{m.student?.regNo ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-[10px] font-bold text-slate-600 font-mono">
                    {m.programUnit?.unit?.code ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[10px] font-mono text-slate-400">
                    {m.deletedAt ? new Date(m.deletedAt).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleAction([m], "restore")}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Restore">
                        <RotateCcw size={13} />
                      </button>
                      <button onClick={() => handleAction([m], "purge")}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Permanently Delete">
                        <Trash2 size={13} />
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