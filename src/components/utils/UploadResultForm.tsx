// "use client";

// import { useState, useEffect } from "react";
// import { getAssignedUnits, uploadResults } from "@/api/apiLecturer";
// import { useRouter, useSearchParams } from "next/navigation";
// import { IResultPreviewRow, IUnit } from "@/types/lecturer";

// export default function UploadResultForm() {
//   const [units, setUnits] = useState<IUnit[]>([]);
//   const [unitId, setUnitId] = useState<string | null>(null);
//   const [file, setFile] = useState<File | null>(null);
//   const [preview, setPreview] = useState<IResultPreviewRow[] | null>(null);
//   const [loading, setLoading] = useState(false);

//   const search = useSearchParams();
//   const router = useRouter();

//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await getAssignedUnits();
//         setUnits(res.data as IUnit[]);
//         const qunit = search.get("unit");
//         if (qunit) setUnitId(qunit);
//       } catch (err) {
//         console.error(err);
//       }
//     }
//     load();
//   }, [search]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!unitId) return alert("Choose unit");
//     if (!file) return alert("Choose file");

//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append("file", file);
//       fd.append("unitId", unitId);
//       const res = await uploadResults(fd);

//       setPreview(res.data.preview as IResultPreviewRow[] || []);
//       alert(res.data.message);
//       router.push("/lecturer");
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         console.error(err);
//         alert(err.message);
//       } else {
//         console.error("Unknown error", err);
//         alert("Upload failed");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-semibold mb-3">Upload Results</h2>

//       <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-lg">
//         <select
//           value={unitId || ""}
//           onChange={(e) => setUnitId(e.target.value)}
//           className="border p-2 rounded"
//         >
//           <option value="">Select unit</option>
//           {units.map((u) => (
//             <option key={u._id} value={u._id}>
//               {u.code} — {u.title}
//             </option>
//           ))}
//         </select>

//         <input
//           type="file"
//           accept=".xlsx,.xls,.csv"
//           onChange={(e) => setFile(e.target.files?.[0] || null)}
//         />
//         <button disabled={loading} className="bg-green-600 text-white p-2 rounded">
//           {loading ? "Uploading..." : "Upload & Preview"}
//         </button>
//       </form>

//       {preview && (
//         <div className="mt-6">
//           <h3 className="font-semibold">Preview (first rows)</h3>
//           <div className="overflow-x-auto mt-2">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr>
//                   <th className="p-2">RegNo</th>
//                   <th className="p-2">Name</th>
//                   <th className="p-2">Cat1</th>
//                   <th className="p-2">Cat2</th>
//                   <th className="p-2">Cat3</th>
//                   <th className="p-2">Assign</th>
//                   <th className="p-2">Practical</th>
//                   <th className="p-2">Exam</th>
//                   <th className="p-2">Total (preview)</th>
//                   <th className="p-2">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {preview.map((r, idx) => (
//                   <tr key={idx}>
//                     <td className="p-2">{r.registrationNo}</td>
//                     <td className="p-2">{r.studentName || "-"}</td>
//                     <td className="p-2">{r.cat1 ?? "-"}</td>
//                     <td className="p-2">{r.cat2 ?? "-"}</td>
//                     <td className="p-2">{r.cat3 ?? "-"}</td>
//                     <td className="p-2">{r.assignment ?? "-"}</td>
//                     <td className="p-2">{r.practical ?? "-"}</td>
//                     <td className="p-2">{r.exam ?? "-"}</td>
//                     <td className="p-2">{r.computedTotal ?? "-"}</td>
//                     <td className="p-2">{r.status}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
