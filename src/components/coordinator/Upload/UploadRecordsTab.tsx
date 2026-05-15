// clientside/src/components/coordinator/Upload/UploadRecordsTab.tsx
"use client";

import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/config/axiosInstance";
import { useDeleteBatch, useDeleteBatches, useBatchMarks } from "@/hooks/queries/useMarks";
import { useToast } from "@/context/ToastContext";
import { getErrorMessage } from "@/lib/api";
import {
  Loader2,
  ChevronDown,
  ChevronRight,
  BarChart3,
  FileSpreadsheet,
  BookOpen,
  FileText,
  Trash2,
  Eye,
  X,
  CheckSquare,
  Square,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface MarkEntry {
  _id: string;
  source: "detailed" | "direct";
  regNo: string;
  studentName: string;
  unitCode: string;
  unitName: string;
  programName: string;
  programCode: string;
  agreedMark: number;
  attempt: string;
  isSpecial: boolean;
  academicYear: string;
  session: string;
  uploadedAt: string;
  batchId: string;
}

interface StatsResponse {
  summary: {
    totalRecords: number;
    detailed: number;
    direct: number;
    academicYears: string[];
  };
  grouped: Record<
    string,
    Record<string, Record<string, { programName: string; entries: MarkEntry[] }>>
  >;
}

interface BatchInfo {
  unitCode: string;
  unitName: string;
  source: string;
  date: string;
  count: number;
  attempt: string;
  batchId: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const STATS_KEYS = {
  all: ["marks", "uploadStats"] as const,
};

const fetchStats = async (): Promise<StatsResponse> => {
  const res = await api.get<StatsResponse>("/marks/upload-stats");
  return res.data;
};

// ── Sub-components ───────────────────────────────────────────────────────────

const SessionBadge: React.FC<{ session: string }> = ({ session }) => {
  const styles: Record<string, string> = {
    ORDINARY: "text-blue-700",
    SUPPLEMENTARY: "text-amber-700",
    CLOSED: "text-slate-500",
  };
  return (
    <span
      className={`text-[9px] font-black px-2 py-0.5 uppercase tracking-widest ${styles[session] ?? styles.CLOSED}`}
    >
      {session}
    </span>
  );
};

interface CollapsibleGroupProps {
  title: React.ReactNode;
  badge?: React.ReactNode;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleGroup: React.FC<CollapsibleGroupProps> = ({
  title,
  badge,
  count,
  children,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDown size={14} className="text-slate-400" />
          ) : (
            <ChevronRight size={14} className="text-slate-400" />
          )}
          <span className="text-[11px] font-black text-green-darkest uppercase tracking-tight">
            {title}
          </span>
          {badge}
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {count.toLocaleString()} record{count !== 1 ? "s" : ""}
        </span>
      </button>
      {open && <div className="border-t border-slate-100">{children}</div>}
    </div>
  );
};

const deriveUploadBatches = (entries: MarkEntry[]): BatchInfo[] => {
  const batchMap = new Map<string, BatchInfo>();

  for (const e of entries) {
    const date = new Date(e.uploadedAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const key = e.batchId;
    if (!batchMap.has(key)) {
      batchMap.set(key, {
        unitCode: e.unitCode,
        unitName: e.unitName,
        source: e.source,
        date,
        count: 0,
        attempt: e.attempt,
        batchId: e.batchId,
      });
    }
    batchMap.get(key)!.count++;
  }

  return Array.from(batchMap.values()).sort((a, b) => b.date.localeCompare(a.date));
};

interface BatchRowProps {
  batch: BatchInfo;
  isSelected: boolean;
  onToggleSelect: (batchId: string) => void;
  onView: (batchId: string) => void;
  onDelete: (batchId: string) => void;
  isDeleting: boolean;
}

const BatchRow: React.FC<BatchRowProps> = ({
  batch,
  isSelected,
  onToggleSelect,
  onView,
  onDelete,
  isDeleting,
}) => {
  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50/80 transition-colors group">
      <button
        onClick={() => onToggleSelect(batch.batchId)}
        className="flex-shrink-0 text-slate-400 hover:text-green-darkest transition-colors"
      >
        {isSelected ? (
          <CheckSquare size={16} className="text-green-darkest" />
        ) : (
          <Square size={16} />
        )}
      </button>

      <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <FileText size={16} className="text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-black text-green-darkest truncate">
          Scoresheet_{batch.unitCode}_{batch.date.replace(/\s/g, "_")}.xlsx
        </p>
        <p className="text-[9px] text-slate-400 font-mono">
          {batch.unitCode} · {batch.unitName}
          {batch.attempt !== "1st" && (
            <span className="ml-2 uppercase font-bold text-purple-600">
              · {batch.attempt}
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className={`text-[9px] font-black px-2 py-0.5 uppercase ${
            batch.source === "direct" ? "text-yellow-gold" : "text-amber-600"
          }`}
        >
          {batch.source}
        </span>
        <span className="text-[9px] text-slate-400 font-mono">{batch.count} rows</span>
        <span className="text-[9px] text-slate-300 font-mono">{batch.date}</span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(batch.batchId)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View marks"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => onDelete(batch.batchId)}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
            title="Delete batch"
          >
            {isDeleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ViewBatchModalProps {
  batchId: string | null;
  onClose: () => void;
}

const ViewBatchModal: React.FC<ViewBatchModalProps> = ({ batchId, onClose }) => {
  const { data, isLoading } = useBatchMarks(batchId ?? "");

  if (!batchId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      >
        <div
          className="absolute inset-0 bg-green-darkest/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-white"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black text-green-darkest">Batch Details</h3>
              {data?.batch && (
                <p className="text-xs text-slate-500 mt-1">
                  {data.batch.unitCode} — {data.batch.unitName} ·{" "}
                  {data.batch.programCode} · {data.batch.academicYear}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : data?.entries ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Reg No
                  </th>
                  <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Student
                  </th>
                  <th className="px-4 py-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    CA/30
                  </th>
                  <th className="px-4 py-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Exam/70
                  </th>
                  <th className="px-4 py-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Agreed
                  </th>
                  <th className="px-4 py-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Attempt
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.entries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-mono rounded">
                        {entry.regNo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-green-darkest">
                      {entry.studentName}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-600">
                      {entry.caTotal30}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-600">
                      {entry.examTotal70}
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-bold text-green-darkest">
                      {entry.agreedMark}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          entry.isSpecial
                            ? "text-purple-600"
                            : entry.attempt !== "1st"
                              ? "text-amber-600"
                              : "text-slate-500"
                        }`}
                      >
                        {entry.attempt}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-slate-400 py-8">No data found.</p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────

const UploadRecordsTab: React.FC = () => {
  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: STATS_KEYS.all,
    queryFn: fetchStats,
    staleTime: 2 * 60 * 1000,
  });

  const deleteBatchMutation = useDeleteBatch();
  const deleteBatchesMutation = useDeleteBatches();
  const { addToast } = useToast();

  const [selectedBatches, setSelectedBatches] = useState<Set<string>>(new Set());
  const [viewingBatchId, setViewingBatchId] = useState<string | null>(null);

  const toggleSelect = useCallback((batchId: string) => {
    setSelectedBatches((prev) => {
      const next = new Set(prev);
      if (next.has(batchId)) {
        next.delete(batchId);
      } else {
        next.add(batchId);
      }
      return next;
    });
  }, []);

  const handleDeleteSingle = useCallback(
    async (batchId: string) => {
      try {
        await deleteBatchMutation.mutateAsync(batchId);
        addToast("Batch deleted successfully.", "success");
        void refetch();
      } catch (err: unknown) {
        addToast(getErrorMessage(err), "error");
      }
    },
    [deleteBatchMutation, addToast, refetch],
  );

  const handleDeleteBulk = useCallback(async () => {
    if (selectedBatches.size === 0) return;
    const batchIds = Array.from(selectedBatches);
    try {
      await deleteBatchesMutation.mutateAsync(batchIds);
      addToast(`${batchIds.length} batches deleted.`, "success");
      setSelectedBatches(new Set());
      void refetch();
    } catch (err: unknown) {
      addToast(getErrorMessage(err), "error");
    }
  }, [selectedBatches, deleteBatchesMutation, addToast, refetch]);

  // ── Loading State ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-[11px] font-black uppercase tracking-widest">
          Loading records...
        </span>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────
  if (isError || !stats) {
    return (
      <p className="text-center text-slate-400 py-20 text-sm">
        Failed to load records.
      </p>
    );
  }

  // ── Empty State ────────────────────────────────────────────────────────
  if (stats.summary.academicYears.length === 0) {
    return (
      <p className="text-center text-slate-400 py-20 text-sm">
        No mark records uploaded yet.
      </p>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="animate-in fade-in duration-300">
      {/* Summary ribbon */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Total Records",
            value: stats.summary.totalRecords,
            icon: <BarChart3 size={20} />,
          },
          {
            label: "Detailed Sheets",
            value: stats.summary.detailed,
            icon: <FileSpreadsheet size={20} />,
          },
          {
            label: "Direct Entry",
            value: stats.summary.direct,
            icon: <BookOpen size={20} />,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="flex-1 px-10 relative group border-r border-green-darkest/[0.06] last:border-r-0"
          >
            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-green-darkest/20 group-hover:text-yellow-gold transition-all duration-500 transform group-hover:-translate-y-1">
                  {s.icon}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  {s.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-light text-green-darkest tracking-tighter group-hover:tracking-normal transition-all duration-500">
                  {s.value.toLocaleString()}
                </span>
              </div>
              <div className="mt-6 w-0 group-hover:w-full h-[2px] bg-yellow-gold transition-all duration-700 ease-in-out" />
            </div>
          </div>
        ))}
      </div>

      {/* Bulk actions bar */}
      {selectedBatches.size > 0 && (
        <div className="flex items-center gap-4 mb-4 px-4 py-3 bg-yellow-gold/10 border border-yellow-gold/20 rounded-lg">
          <span className="text-[10px] font-black text-green-darkest uppercase tracking-widest">
            {selectedBatches.size} batch{selectedBatches.size !== 1 ? "es" : ""}{" "}
            selected
          </span>
          <button
            onClick={handleDeleteBulk}
            disabled={deleteBatchesMutation.isPending}
            className="px-4 py-2 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {deleteBatchesMutation.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Trash2 size={12} />
            )}
            Delete Selected
          </button>
          <button
            onClick={() => setSelectedBatches(new Set())}
            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Refresh button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => refetch()}
          className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-green-darkest transition-colors flex items-center gap-2"
        >
          Refresh
        </button>
      </div>

      {/* Grouped: Year → Session → Program → Batches */}
      <div className="space-y-4">
        {stats.summary.academicYears.map((yr) => {
          const yearData = stats.grouped[yr];
          const yearCount = Object.values(yearData)
            .flatMap((s) => Object.values(s).flatMap((p) => p.entries))
            .length;

          return (
            <CollapsibleGroup
              key={yr}
              title={yr}
              count={yearCount}
              defaultOpen={yr === stats.summary.academicYears[0]}
            >
              <div className="p-3 space-y-3 bg-slate-50/50">
                {Object.entries(yearData).map(([session, programs]) => {
                  const sessCount = Object.values(programs)
                    .flatMap((p) => p.entries)
                    .length;
                  return (
                    <CollapsibleGroup
                      key={session}
                      title={session}
                      badge={<SessionBadge session={session} />}
                      count={sessCount}
                      defaultOpen
                    >
                      <div className="p-3 space-y-3">
                        {Object.entries(programs).map(
                          ([progCode, { programName, entries }]) => {
                            const batches = deriveUploadBatches(entries);
                            return (
                              <CollapsibleGroup
                                key={progCode}
                                title={`${progCode} — ${programName}`}
                                count={entries.length}
                              >
                                <div className="divide-y divide-slate-50">
                                  {batches.map((batch, bi) => (
                                    <BatchRow
                                      key={bi}
                                      batch={batch}
                                      isSelected={selectedBatches.has(batch.batchId)}
                                      onToggleSelect={toggleSelect}
                                      onView={setViewingBatchId}
                                      onDelete={handleDeleteSingle}
                                      isDeleting={deleteBatchMutation.isPending}
                                    />
                                  ))}
                                </div>
                              </CollapsibleGroup>
                            );
                          },
                        )}
                      </div>
                    </CollapsibleGroup>
                  );
                })}
              </div>
            </CollapsibleGroup>
          );
        })}
      </div>

      {/* View Batch Modal */}
      <ViewBatchModal
        batchId={viewingBatchId}
        onClose={() => setViewingBatchId(null)}
      />
    </div>
  );
};

export default UploadRecordsTab;