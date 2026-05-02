

// "use client";

// import { useEffect, useState } from "react";
// import { getLecturers } from "@/api/lecturersApi";
// import { Lecturer, Unit } from "@/api/types";
// import PageHeader from "@/components/ui/PageHeader";
// import { useToast } from "@/context/ToastContext";
// import { UserPlus, BookOpen, CheckCircle } from "lucide-react";

// export default function LecturersPage() {
//   const [lecturers, setLecturers] = useState<Lecturer[]>([]);
//   const [units] = useState<Unit[]>([]);
//   const [selectedLecturer, setSelectedLecturer] = useState<string>("");
//   const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const { addToast } = useToast();

//   useEffect(() => {
//     (async () => {
//       try {
//         const [lecRes ] = await Promise.all([getLecturers()]);
//         setLecturers(lecRes);
//         // setUnits(unitRes);
//       } catch {
//         addToast("Load Error: Failed to synchronize resources", "error");
//       }
//     })();
//   }, []);

//   const handleAssign = async () => {
//     if (!selectedLecturer || selectedUnits.length === 0) {
//       addToast("Incomplete Parameters: Select identity and assets", "error");
//       return;
//     }
//     setLoading(true);
//     try {
//       // const res = await assignLecturerToUnits(selectedLecturer, selectedUnits);
//       addToast(`Protocol Executed: ${res.assigned} units bound`, "success");
//       setSelectedUnits([]);
//     } catch {
//       addToast("Assignment Fault: Update rejected by server", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-9xl ml-40 my-10 px-2 animate-in fade-in duration-700">
//       <div className="bg-[#F8F9FA] min-h-screen rounded-xl shadow-2xl p-10">
        
//         <PageHeader 
//           title="Lecturer" 
//           highlightedTitle="Asset Mapping" 
//           systemLabel="Academic Resource Controller" 
//         />

//         <div className="grid grid-cols-12 gap-8">
//           {/* LEFT: Identity Selection */}
//           <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
//             <div className="bg-white border border-green-darkest/5 rounded-xl p-8 shadow-sm">
//               <div className="flex items-center gap-3 mb-6">
//                 <UserPlus size={16} className="text-yellow-gold" />
//                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-green-darkest/40">Identity Selection</h3>
//               </div>
              
//               <select
//                 value={selectedLecturer}
//                 onChange={(e) => setSelectedLecturer(e.target.value)}
//                 className="w-full bg-[#F8F9FA] border-0 rounded-lg p-4 text-xs font-bold text-green-darkest uppercase tracking-tight focus:ring-1 focus:ring-yellow-gold/20 outline-none"
//               >
//                 <option value="">-- Select Faculty Member --</option>
//                 {lecturers.map((lec) => (
//                   <option key={lec._id} value={lec._id}>{lec.name} ({lec.email})</option>
//                 ))}
//               </select>

//               <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
//                 <p className="text-[9px] font-medium text-slate-400 leading-relaxed uppercase tracking-widest">
//                   Assigning units grants full grading privileges and attendance monitoring for the selected academic cycle.
//                 </p>
//               </div>
//             </div>

//             <button
//               onClick={handleAssign}
//               disabled={loading}
//               className="group relative overflow-hidden bg-green-darkest py-4 rounded-xl text-white-pure text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-900 transition-all disabled:opacity-50"
//             >
//               {loading ? "Processing..." : "Commit Assignment"}
//               <div className="absolute bottom-0 left-0 h-1 w-0 bg-yellow-gold group-hover:w-full transition-all duration-500" />
//             </button>
//           </div>

//           {/* RIGHT: Unit Inventory */}
//           <div className="col-span-12 lg:col-span-7">
//             <div className="bg-white border border-green-darkest/5 rounded-xl p-8 shadow-sm h-full">
//               <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center gap-3">
//                   <BookOpen size={16} className="text-yellow-gold" />
//                   <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-green-darkest/40">Unit Inventory</h3>
//                 </div>
//                 <span className="text-[10px] font-mono text-slate-400 uppercase">{selectedUnits.length} Selected</span>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
//                 {units.map((unit) => (
//                   <label 
//                     key={unit._id} 
//                     className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
//                       selectedUnits.includes(unit._id) 
//                         ? 'bg-green-darkest text-white border-green-darkest shadow-md' 
//                         : 'bg-slate-50 border-transparent hover:border-green-darkest/10'
//                     }`}
//                   >
//                     <div className="flex flex-col">
//                       <span className="text-[11px] font-black uppercase tracking-tight">{unit.code}</span>
//                       <span className={`text-[9px] font-medium uppercase truncate w-40 ${selectedUnits.includes(unit._id) ? 'text-white/60' : 'text-slate-400'}`}>
//                         {unit.name}
//                       </span>
//                     </div>
//                     <input
//                       type="checkbox"
//                       className="hidden"
//                       checked={selectedUnits.includes(unit._id)}
//                       onChange={(e) => {
//                         if (e.target.checked) setSelectedUnits([...selectedUnits, unit._id]);
//                         else setSelectedUnits(selectedUnits.filter(id => id !== unit._id));
//                       }}
//                     />
//                     {selectedUnits.includes(unit._id) && <CheckCircle size={14} className="text-yellow-gold" />}
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
