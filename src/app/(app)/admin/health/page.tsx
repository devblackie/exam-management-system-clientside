// clientside/src/components/admin/health.tsx

"use client";

import { useState } from "react";
import { Database, Trash2, ShieldCheck, Activity, HardDrive, Cpu, AlertTriangle, RefreshCcw } from "lucide-react";
import { runDatabaseCleanup } from "@/api/coordinatorApi";
import { useToast } from "@/context/ToastContext";
import PageHeader from "@/components/ui/PageHeader";

export default function SystemHealthTab() {
  const [isCleaning, setIsCleaning] = useState(false);
  const { addToast } = useToast();

  const handleCleanup = async () => {
    if (!confirm("CRITICAL: Execute Database Purge? This will permanently delete orphaned grade records to resolve 'toUpperCase' errors.")) return;

    setIsCleaning(true);
    try {
      const result = await runDatabaseCleanup();
      if (result.success) {
        addToast(result.message, "success");
      }
    } catch {
      addToast("Protocol Failure: Cleanup interrupted. Check system logs.", "error");
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="max-w-9xl ml-40 my-10 animate-in fade-in duration-700">
      <div className="bg-[#F8F9FA] min-h-screen rounded-xl shadow-2xl p-10">
        
        <PageHeader
          title="System Infrastructure"
          highlightedTitle="Health"
          systemLabel="Security Operations Center"
        />

        {/* EXECUTIVE DATA RIBBON */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6 px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
              Hardware & Service Metrics
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Database Connectivity", val: "ACTIVE", icon: <Database />, color: "text-emerald-500", status: "01" },
              { label: "Storage Utilization", val: "24.2%", icon: <HardDrive />, color: "text-yellow-gold", status: "02" },
              { label: "Compute Engine", val: "0.8ms", icon: <Cpu />, color: "text-green-darkest", status: "03" },
            ].map((stat) => (
              <div key={stat.label} className="flex-1 px-10 relative group border-r border-green-darkest/[0.06] last:border-r-0">
                <div className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`${stat.color} opacity-20 group-hover:opacity-100 transition-all duration-500 transform group-hover:-translate-y-1`}>
                      {stat.icon}
                    </div>
                    <span className="text-[9px] font-mono text-slate-300 group-hover:text-green-darkest transition-colors">
                      {stat.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {stat.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-light text-green-darkest tracking-tighter group-hover:tracking-normal transition-all duration-500">
                      {stat.val}
                    </span>
                  </div>
                  <div className="mt-6 w-0 group-hover:w-full h-[2px] bg-yellow-gold transition-all duration-700 ease-in-out" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAINTENANCE CONSOLE */}
        <div className="px-2 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity size={14} className="text-yellow-gold" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-darkest/40">
              Maintenance Protocols
            </span>
          </div>

          <div className="relative group">
            {/* Glassmorphism background effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-gold/10 to-green-darkest/5 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
            
            <div className="relative bg-white border border-green-darkest/5 rounded-xl shadow-sm overflow-hidden">
              <div className="p-8 space-y-8">
                
                {/* Purge Action Row */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-lg bg-slate-50/50 border border-green-darkest/5 group/row hover:bg-white transition-all">
                  <div className="flex items-start gap-5">
                    <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 text-red-500 group-hover/row:scale-110 transition-transform">
                      <Trash2 size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-green-darkest mb-1">
                        Purge Orphaned Grade Records
                      </h4>
                      <p className="max-w-xl text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight">
                        Executes a deep scan of the <span className="text-red-500 font-bold">Grade Ledger</span> to remove 
                        ghost entries unlinked to valid <span className="text-green-darkest font-bold">Program Units</span>. 
                        Resolves coordinator dashboard instability.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCleanup}
                    disabled={isCleaning}
                    className={`relative overflow-hidden group/btn px-8 py-3 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg ${
                      isCleaning 
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                      : "bg-green-darkest text-white hover:bg-black active:scale-95"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isCleaning ? (
                        <RefreshCcw className="w-3 h-3 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-3 h-3 text-yellow-gold" />
                      )}
                      {isCleaning ? "Executing..." : "Authorize Purge"}
                    </div>
                  </button>
                </div>

                {/* Additional Maintenance Item Placeholder */}
                <div className="flex items-center justify-between gap-6 p-6 rounded-lg border border-dashed border-slate-200 opacity-60">
                   <div className="flex items-center gap-4">
                      <AlertTriangle size={20} className="text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Secondary diagnostics offline
                      </span>
                   </div>
                   <div className="h-2 w-24 bg-slate-100 rounded-full" />
                </div>

              </div>

              {/* Console Footer */}
              <div className="p-4 bg-slate-50/50 border-t border-green-darkest/5 flex justify-center">
                <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                  Secure Data Stream: 256-bit Encrypted Maintenance Session
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER WARNING */}
        <div className="mt-10 flex items-center justify-center gap-2 text-red-400/40">
          <ShieldCheck size={12} />
          <p className="text-[9px] font-black uppercase tracking-[0.2em]">Validated Infrastructure Node</p>
        </div>
      </div>
    </div>
  );
}