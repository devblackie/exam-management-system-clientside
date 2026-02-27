// clientside/src/app/coordinator/maintenance/page.tsx
// "use client";
// import { useEffect, useState } from "react";
// import { Unit, Program, AcademicYear } from "@/api/types";
// import MarkManager from "@/components/coordinator/Maintenance/MarkManager";
// import { getAcademicYears } from "@/api/academicYearsApi";
// import { getPrograms } from "@/api/programsApi";
// import { getUnitTemplates } from "@/api/unitsApi";

// export default function MaintenancePage() {
//   const [data, setData] = useState<{ u: Unit[]; p: Program[]; y: AcademicYear[];}>({ u: [], p: [], y: [] });

//   useEffect(() => {
//     // Load your dropdown data here
//     const load = async () => {
//       const [u, p, y] = await Promise.all([getUnitTemplates(), getPrograms(), getAcademicYears()]);
//       setData({ u, p, y });
//     };
//     load();
//   }, []);

//   return (
//     <div className="max-w-5xl mx-auto py-12 px-4">
//       <div className="mb-10 text-center">
//         <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
//           Maintenance Console
//         </h1>
//         <p className="text-slate-500">
//           Manage database records, bulk cleanup, and data recovery.
//         </p>
//       </div>

//       <MarkManager units={data.u} programs={data.p} years={data.y} />
//     </div>
//   );
// }

// clientside/src/app/coordinator/maintenance/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Unit, Program, AcademicYear } from "@/api/types";
import MarkManager from "@/components/coordinator/Maintenance/MarkManager";
import { getAcademicYears } from "@/api/academicYearsApi";
import { getPrograms } from "@/api/programsApi";
import { getUnitTemplates } from "@/api/unitsApi";
import PageHeader from "@/components/ui/PageHeader";

export default function MaintenancePage() {
  const [data, setData] = useState<{ u: Unit[]; p: Program[]; y: AcademicYear[];}>({ u: [], p: [], y: [] });

  useEffect(() => {
    const load = async () => {
      const [u, p, y] = await Promise.all([getUnitTemplates(), getPrograms(), getAcademicYears()]);
      setData({ u, p, y });
    };
    load();
  }, []);

  return (
    <div className="ml-48 my-10 min-h-screen bg-[#F8F9FA] overflow-hidden">
          <div className="bg-[#F8F9FA] min-h-screen rounded-lg shadow-2xl p-9 border border-white">
        <PageHeader
          title="Database"
          highlightedTitle="Maintenance"
          systemLabel=""
          subtitle="Manage database records, bulk cleanup, and data recovery."
        />

        <div className="mt-12">
            <MarkManager units={data.u} programs={data.p} years={data.y} />
        </div>
      </div>
    </div>
  );
}
