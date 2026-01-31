// clientside/src/app/admin/programs/page.tsx
"use client";


import { useEffect, useState } from "react";
import {  getPrograms } from "@/api/programsApi";
import type { Program } from "@/api/types";
import ProgramTable from "@/components/coordinator/Programs/ProgramTable";
import ProgramForm from "@/components/coordinator/Programs/ProgramForm";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const data = await getPrograms();
      setPrograms(data);
   } catch (err) { console.error(err); }
  };

  return (
    <div className="max-w-8xl  ml-48   my-10 ">
      {/* <div className="bg-white rounded-xl shadow-2xl p-10 min-h-screen"> */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 min-h-[100vh]">
        <div className="flex justify-between items-center rounded-lg shadow-md border border-green-dark/20 p-4 ">
                 <h1 className="text-xl font-bold text-green-darkest">
                   Academic Programs
                 </h1>
       
                 {!showForm && (
                   <div className="text-center ">
                     <button
                       onClick={() => setShowForm(true)}
                       className=" px-4 py-2 bg-gradient-to-r from-green-darkest to-green-dark text-white-pure rounded-xl hover:from-green-700 hover:to-emerald-800 hover:scale-105 font-bold  disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xl"
                     >
                       Add New Program
                     </button>
                   </div>
                 )}
               </div>

      {showForm && (
          <div className="mb-12">
            <ProgramForm 
               onClose={() => setShowForm(false)} 
               onSuccess={loadPrograms} 
            />
          </div>
        )}
  {/* Programs List */}
      <div className="mt-8">
          <div className="px-8 py-4 border-b border-green-dark bg-green-dark/10 rounded-t-lg">
            <h2 className="text-xl font-bold text-green-darkest">
              Active Programs ({programs.length})
            </h2>
          </div>
          <ProgramTable programs={programs} />
        </div>
      </div>
    </div>
  );
}
