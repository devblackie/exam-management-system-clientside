// clientside/src/app/admin/programs/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getPrograms } from "@/api/programsApi";
import type { Program } from "@/api/types";
import ProgramTable from "@/components/coordinator/Programs/ProgramTable";
import ProgramForm from "@/components/coordinator/Programs/ProgramForm";
import PageHeader from "@/components/ui/PageHeader";
import { LayoutGrid } from "lucide-react";

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
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-8xl ml-48 my-10 ">
      {/* <div className="bg-white rounded-xl shadow-2xl p-10 min-h-screen"> */}
      <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 min-h-[100vh]">
        {/* Header */}
        <PageHeader
          title="Academic Programs"
          highlightedTitle="Management"
          actions={
            <>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-darkest to-green-dark text-yellow-gold rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                >
                  + Add New Program
                </button>
              )}
            </>
          }
        />

        {showForm && (
          <div className="mb-12">
            <ProgramForm
              onClose={() => setShowForm(false)}
              onSuccess={loadPrograms}
            />
          </div>
        )}
        {/* Programs List */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6 px-4">
            <div className="flex items-center gap-3 text-green-darkest/40">
              <LayoutGrid size={18} />
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">
                Active Programs Catalog
              </h2>
            </div>
            <span className="bg-white px-4 py-1 rounded-full border border-green-darkest/10 text-[10px] font-bold text-green-darkest">
              {programs.length} Records Found
            </span>
          </div>
          <ProgramTable programs={programs} />
        </div>
      </div>
    </div>
  );
}
