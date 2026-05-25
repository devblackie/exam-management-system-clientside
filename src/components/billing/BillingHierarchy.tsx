
// clientside/src/components/billing/BillingHierarchy.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Building2, Users, Pencil, Check, X } from "lucide-react";
import { useBillingHierarchy, useUpdateDepartmentSeats } from "@/hooks/queries/useBilling";
import { useToast } from "@/context/ToastContext";

// ── CollapsibleGroup (reusable container with hardware-accelerated tracking) ──
function CollapsibleGroup({
  title, subtitle, count, badge, children, defaultOpen = false,
}: { title: string; subtitle?: string; count: number; badge?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 bg-white rounded-xl overflow-hidden shadow-xs">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50/60 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="text-slate-400 flex-shrink-0">
            <ChevronRight size={14} />
          </motion.div>
          <div className="text-left min-w-0">
            <span className="text-[11px] font-black text-green-darkest uppercase tracking-tight block truncate">{title}</span>
            {subtitle && <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{subtitle}</p>}
          </div>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-100 rounded-md px-2 py-0.5 ml-2 whitespace-nowrap">
          {count.toLocaleString()} active unit{count !== 1 ? "s" : ""}
        </span>
      </button>
      
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ type: "spring", stiffness: 400, damping: 35 }} className="overflow-hidden bg-slate-50/40 border-t border-slate-100">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Seat Limit Editor Inline Layout Block ─────────────────────────────────────
function SeatLimitEditor({ deptCode, currentLimit, onClose }: { deptCode: string; currentLimit: number | null; onClose: () => void }) {
  const [newLimit, setNewLimit] = useState(currentLimit ?? 100);
  const { addToast } = useToast();
  const mutation = useUpdateDepartmentSeats();

  const handleSave = async () => {
    if (newLimit < 1) { addToast("Seat parameters minimum threshold is 1.", "error"); return; }
    try {
      await mutation.mutateAsync({ departmentCode: deptCode, seatLimit: newLimit });
      addToast("Allocation parameter boundaries updated.", "success");
      onClose();
    } catch {
      addToast("Operation system error during limits injection.", "error");
    }
  };

  return (
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1.5 bg-white border border-slate-200 shadow-sm rounded-lg p-1">
      <input type="number" className="w-16 bg-slate-50 rounded px-2 py-1 text-xs font-mono font-bold text-green-darkest outline-none focus:bg-white" value={newLimit} onChange={e => setNewLimit(Number(e.target.value))} min={1} />
      <button onClick={handleSave} disabled={mutation.isPending} className="p-1 bg-green-darkest text-white rounded hover:bg-green-900 transition-colors flex items-center justify-center">
        <Check size={12} />
      </button>
      <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
        <X size={12} />
      </button>
    </motion.div>
  );
}

// ── Main Balanced Component Architecture ───────────────────────────────────────
export default function BillingHierarchy() {
  const { data, isLoading, isError } = useBillingHierarchy();
  const [editingDept, setEditingDept] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
        <div className="h-4 w-52 bg-slate-100 animate-pulse rounded-md" />
        <div className="space-y-2.5">
          {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-50/60 animate-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 text-center">
        <Building2 size={24} className="text-slate-200 mx-auto mb-2" />
        <p className="text-xs font-mono text-slate-400">Hierarchy resolution matrix disconnected.</p>
      </div>
    );
  }

  if (data.schools.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 text-center">
        <Building2 size={24} className="text-slate-200 mx-auto mb-2" />
        <p className="text-xs font-mono text-slate-400">Zero active allocation vectors traced inside structure.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-400">
              <Building2 size={16} />
            </div>
            <div>
              <h3 className="text-xs font-black text-green-darkest uppercase tracking-wider">Dynamic Topology Allocations</h3>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">Real-time system seat consumption telemetry across institutional pipelines</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 self-start sm:self-center">
            {data.schools.reduce((acc, s) => acc + s.totalStudents, 0).toLocaleString()} Total Units Assigned
          </span>
        </div>

        {/* Schools Map Node Layer */}
        <div className="space-y-3">
          {data.schools.map(school => (
            <CollapsibleGroup key={school.schoolCode} title={school.schoolName} subtitle={`${school.departments.length} active sub-department nodes unified`} count={school.totalStudents} defaultOpen>
              <div className="p-3 space-y-2 bg-slate-50/40">
                
                {/* Department Node Layer */}
                {school.departments.map(dept => (
                  <CollapsibleGroup
                    key={dept.deptCode}
                    title={dept.deptName}
                    subtitle={
                      dept.seatLimit
                        ? `Limit Bound: ${dept.seatLimit} · ${dept.overage > 0 ? `+${dept.overage} allocated over limit` : "within strict boundary parameters"}`
                        : "Open parameter limits"
                    }
                    count={dept.totalStudents}
                    badge={
                      dept.overage > 0 ? (
                        <span className="text-[8px] font-black font-mono px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full uppercase tracking-wider">Overage Trace</span>
                      ) : dept.seatLimit ? (
                        <span className="text-[8px] font-black font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full uppercase tracking-wider">Secure</span>
                      ) : null
                    }
                  >
                    <div className="p-3 space-y-3 bg-white">
                      
                      {/* Department Seat Modification Controls */}
                      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border border-slate-100/80 rounded-xl min-h-[46px]">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Operational Boundary Constraints
                        </span>
                        <div className="flex items-center gap-2">
                          <AnimatePresence mode="wait">
                            {editingDept === dept.deptCode ? (
                              <SeatLimitEditor key="editor" deptCode={dept.deptCode} currentLimit={dept.seatLimit} onClose={() => setEditingDept(null)} />
                            ) : (
                              <motion.button key="editBtn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingDept(dept.deptCode)} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-green-darkest hover:text-green-700 transition-colors" >
                                <Pencil size={11} className="text-yellow-gold" />
                                {dept.seatLimit ? "Override Bounds" : "Provision Boundary"}
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Deep Nested Programs Target Sub-Array */}
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                        {dept.programs.map(prog => (
                          <div key={prog.programId} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/50 transition-colors" >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Users size={13} className="text-slate-300 flex-shrink-0" />
                              <span className="text-[11px] font-medium text-green-darkest truncate">
                                {prog.programName}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 whitespace-nowrap ml-2">
                              {prog.activeStudents.toLocaleString()} records
                            </span>
                          </div>
                        ))}
                      </div>

                    </div>
                  </CollapsibleGroup>
                ))}
                
              </div>
            </CollapsibleGroup>
          ))}
        </div>
      </div>
    </div>
  );
}
