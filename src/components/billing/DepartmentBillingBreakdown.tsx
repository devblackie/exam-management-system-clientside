// clientside/src/components/billing/DepartmentBillingBreakdown.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/config/axiosInstance";
import { Building2, Users, AlertTriangle } from "lucide-react";

interface DepartmentBillingStat {
  _id: string;
  name: string;
  activeStudents: number;
  includedSeats?: number;
  overage?: number;
  extraSeatCost?: number;
}

interface DepartmentStatsResponse {
  departments: DepartmentBillingStat[];
  institutionIncludedSeats: number;
  institutionPerSeatRate: number;
}

const fetchDepartmentStats = async (): Promise<DepartmentStatsResponse> => {
  const res = await api.get<DepartmentStatsResponse>(
    "/billing/department-stats",
  );
  return res.data;
};

export default function DepartmentBillingBreakdown() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["billing", "department-stats"],
    queryFn: fetchDepartmentStats,
    staleTime: 5 * 60 * 1000,
  });

  // Loading state with simple pulse placeholders
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="h-5 w-48 bg-slate-200 animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 bg-slate-50 rounded-xl"
            >
              <div className="space-y-2 flex-1">
                <div className="h-4 w-40 bg-slate-200 animate-pulse rounded" />
                <div className="h-3 w-28 bg-slate-200 animate-pulse rounded" />
              </div>
              <div className="h-5 w-20 bg-slate-200 animate-pulse rounded mt-2 sm:mt-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={16} className="text-slate-400" />
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-wide">
            Department Usage
          </h3>
        </div>
        <p className="text-sm text-slate-400">
          Could not load department stats.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Building2 size={18} className="text-slate-400" />
        <h3 className="text-sm font-black text-green-darkest uppercase tracking-wide">
          Department Seat Usage
        </h3>
        <span className="ml-auto text-[10px] font-mono text-slate-400">
          Institution included: {data.institutionIncludedSeats.toLocaleString()}{" "}
          seats · {data.institutionPerSeatRate} KES/seat extra
        </span>
      </div>

      {data.departments.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">
          No departments found with students.
        </p>
      ) : (
        <div className="space-y-4">
          {data.departments.map((dept) => (
            <div
              key={dept._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 bg-slate-50 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200"
            >
              <div className="mb-2 sm:mb-0">
                <p className="text-sm font-bold text-green-darkest">
                  {dept.name}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {dept.activeStudents} active students
                  {dept.includedSeats != null && (
                    <> · {dept.includedSeats} included</>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {dept.overage != null && dept.overage > 0 ? (
                  <div className="flex items-center gap-1.5 text-red-600">
                    <AlertTriangle size={14} />
                    <span className="text-xs font-bold">
                      +{dept.overage} over ·{" "}
                      {dept.extraSeatCost?.toLocaleString()} KES/mo
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <Users size={14} />
                    Within limit
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}