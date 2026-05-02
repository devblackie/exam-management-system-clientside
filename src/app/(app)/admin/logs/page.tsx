// clientside/src/app/admin/logs/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getAuditLogs,
  AuditLog,
  exportAuditLogsCSV,
  exportAuditLogsExcel,
  deleteAuditLog,
  bulkDeleteAuditLogs,
  purgeAuditLogsByDate,
} from "@/api/auditLogs";
import { User } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageHeader from "@/components/ui/PageHeader";
import {
  History, Download, Filter, User as UserIcon, Activity, Calendar,
  ChevronLeft, ChevronRight, ShieldAlert, FileSpreadsheet, RefreshCw,
  Trash2, X, Loader2, CheckSquare, Square,
} from "lucide-react";
import { getUsers } from "@/api/adminApi";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [actionFilter, setActionFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Selection state for bulk delete
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Purge-by-date state
  const [showPurge, setShowPurge] = useState(false);
  const [purgeDate, setPurgeDate] = useState("");
  const [purging, setPurging] = useState(false);
  const [purgeResult, setPurgeResult] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res);
    } catch {
      setError("Registry Access Error: Failed to load actors");
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    setSelected(new Set());
    try {
      const res = await getAuditLogs({
        action: actionFilter || undefined,
        actorId: actorFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        limit: 10,
        sort,
      });
      setLogs(res.data);
      setPages(res.pages);
    } catch {
      setError("Sequence Interrupted: Failed to fetch secure logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { fetchLogs(); }, [page, sort]);

  const handleFilter = () => { setPage(1); fetchLogs(); };

  const clearFilters = () => {
    setActionFilter(""); setActorFilter(""); setFromDate("");
    setToDate(""); setSort("desc"); setPage(1);
  };

  // ── Selection helpers ────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === logs.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(logs.map((l) => l._id)));
    }
  };

  const allSelected = logs.length > 0 && selected.size === logs.length;
  const someSelected = selected.size > 0;

  // ── Single delete ────────────────────────────────────────────────────
  const handleSingleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAuditLog(id);
      setConfirmDeleteId(null);
      fetchLogs();
    } catch {
      setError("Failed to delete log entry");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Bulk delete ──────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (!someSelected) return;
    setBulkDeleting(true);
    try {
      await bulkDeleteAuditLogs(Array.from(selected));
      setSelected(new Set());
      fetchLogs();
    } catch {
      setError("Bulk deletion failed");
    } finally {
      setBulkDeleting(false);
    }
  };

  // ── Purge by date ────────────────────────────────────────────────────
  const handlePurge = async () => {
    if (!purgeDate) return;
    setPurging(true);
    setPurgeResult(null);
    try {
      const result = await purgeAuditLogsByDate(purgeDate);
      setPurgeResult(`${result.deletedCount} log(s) purged before ${purgeDate}`);
      fetchLogs();
    } catch {
      setPurgeResult("Purge failed. Check the date and try again.");
    } finally {
      setPurging(false);
    }
  };

  // ── Export ───────────────────────────────────────────────────────────
  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExport = async (type: "csv" | "excel") => {
    const params = {
      action: actionFilter || undefined,
      actorId: actorFilter || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      sort,
    };
    const blob =
      type === "csv"
        ? await exportAuditLogsCSV(params)
        : await exportAuditLogsExcel(params);
    downloadFile(
      blob,
      `audit-logs-${new Date().toISOString().split("T")[0]}.${type === "csv" ? "csv" : "xlsx"}`
    );
  };

  return (
    <ProtectedRoute allowed={["admin"]}>
      <div className="max-w-9xl ml-40 my-10  animate-in fade-in duration-700">
        <div className="bg-[#F8F9FA] min-h-screen rounded-xl shadow-2xl p-10">

          <PageHeader
            title="System Audit"
            highlightedTitle="Forensics"
            systemLabel="Security Operations Center"
          />

          {/* STATS RIBBON */}
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6 px-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-green-darkest/30">
                Log Transmission Summary
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-green-darkest/10 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Total Events", val: logs.length * pages, icon: <History />, color: "text-green-darkest" },
                { label: "Critical Actions", val: logs.filter((l) => l.action.includes("delete")).length, icon: <ShieldAlert />, color: "text-red-500" },
                { label: "Active Actors", val: users.length, icon: <UserIcon />, color: "text-yellow-gold" },
                { label: "Data Integrity", val: "100%", icon: <Activity />, color: "text-emerald-600" },
              ].map((stat, index) => (
                <div key={stat.label} className="flex-1 px-6 relative group border-r border-green-darkest/[0.06] last:border-r-0">
                  <div className="relative">
                    <div className="mb-4 flex items-center justify-between">
                      <div className={`${stat.color} opacity-20 group-hover:opacity-100 transition-all duration-500 transform group-hover:-translate-y-1`}>
                        {stat.icon}
                      </div>
                      <span className="text-[9px] font-mono text-slate-300 group-hover:text-green-darkest transition-colors">
                        0{index + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-light text-green-darkest tracking-tighter">{stat.val}</span>
                    </div>
                    <div className="mt-6 w-0 group-hover:w-full h-[2px] bg-yellow-gold transition-all duration-700 ease-in-out" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FILTER CONSOLE */}
          <div className="bg-white border border-green-darkest/5 rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Filter size={14} className="text-yellow-gold" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-green-darkest/40">
                Filter Parameters
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <select
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                className="bg-slate-50 border-0 text-[11px] font-bold text-green-darkest uppercase tracking-tight rounded-lg px-4 py-3 outline-none ring-1 ring-green-darkest/5 focus:ring-yellow-gold/20"
              >
                <option value="">All Actors</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>

              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="bg-slate-50 border-0 text-[11px] font-bold text-green-darkest uppercase tracking-tight rounded-lg px-4 py-3 outline-none ring-1 ring-green-darkest/5 focus:ring-yellow-gold/20"
              >
                <option value="">All Actions</option>
                <option value="role_changed">Role Escalation</option>
                <option value="status_toggled">Status Override</option>
                <option value="user_deleted">Identity Purge</option>
              </select>

              <div className="flex items-center bg-slate-50 rounded-lg px-3 ring-1 ring-green-darkest/5">
                <Calendar size={14} className="text-slate-300 mr-2" />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-transparent text-[11px] font-mono text-green-darkest outline-none py-3 w-full"
                />
              </div>

              <div className="flex items-center bg-slate-50 rounded-lg px-3 ring-1 ring-green-darkest/5">
                <Calendar size={14} className="text-slate-300 mr-2" />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-transparent text-[11px] font-mono text-green-darkest outline-none py-3 w-full"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleFilter}
                  className="flex-1 bg-green-darkest text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-green-800 transition-all"
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="p-3 bg-slate-100 text-slate-400 rounded-lg hover:text-green-darkest transition-all"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            {/* Export + Purge controls */}
            <div className="mt-6 pt-6 border-t border-slate-50 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleExport("csv")}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-green-darkest/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-green-darkest hover:border-green-darkest/30 transition-all shadow-sm"
              >
                <Download size={14} /> Export CSV
              </button>
              <button
                onClick={() => handleExport("excel")}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-green-darkest/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-green-darkest hover:border-green-darkest/30 transition-all shadow-sm"
              >
                <FileSpreadsheet size={14} /> Export Excel
              </button>

              {/* Purge toggle */}
              <button
                onClick={() => { setShowPurge((v) => !v); setPurgeResult(null); }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 hover:border-red-400 transition-all shadow-sm ml-auto"
              >
                <Trash2 size={14} /> Purge by Date
              </button>
            </div>

            {/* Purge panel */}
            {showPurge && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex flex-wrap items-center gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-wider">
                  <ShieldAlert size={14} />
                  Delete all logs BEFORE:
                </div>
                <input
                  type="date"
                  value={purgeDate}
                  onChange={(e) => setPurgeDate(e.target.value)}
                  className="bg-white border border-red-200 rounded-lg px-3 py-2 text-[11px] font-mono text-red-700 outline-none focus:ring-1 focus:ring-red-300"
                />
                <button
                  onClick={handlePurge}
                  disabled={!purgeDate || purging}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-600 transition-all disabled:opacity-40"
                >
                  {purging ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  {purging ? "Purging..." : "Execute Purge"}
                </button>
                <button
                  onClick={() => { setShowPurge(false); setPurgeDate(""); setPurgeResult(null); }}
                  className="p-2 text-red-300 hover:text-red-500 transition-all"
                >
                  <X size={16} />
                </button>
                {purgeResult && (
                  <p className="w-full text-[10px] font-mono text-red-600 mt-1">{purgeResult}</p>
                )}
              </div>
            )}
          </div>

          {/* BULK DELETE BAR — appears when rows are selected */}
          {someSelected && (
            <div className="mb-4 px-6 py-3 bg-yellow-gold/10 border border-yellow-gold/30 rounded-xl flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
              <span className="text-[10px] font-black uppercase tracking-widest text-green-darkest">
                {selected.size} log{selected.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-[9px] font-bold text-slate-400 uppercase hover:text-slate-600 tracking-wider"
                >
                  Clear
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
                >
                  {bulkDeleting ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  {bulkDeleting ? "Deleting..." : `Delete ${selected.size} Selected`}
                </button>
              </div>
            </div>
          )}

          {/* LOG TABLE */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-gold/10 to-green-darkest/5 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
            <div className="relative bg-white border border-green-darkest/5 rounded-xl shadow-sm overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-green-darkest/5 bg-slate-50/50">
                    {/* Select-all checkbox */}
                    <th className="px-4 py-4 w-10">
                      <button onClick={toggleSelectAll} className="text-slate-400 hover:text-green-darkest transition-colors">
                        {allSelected
                          ? <CheckSquare size={16} className="text-green-darkest" />
                          : <Square size={16} />}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Action Type</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Authorizing Actor</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Target Identity</th>
                    <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Details</th>
                    <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Timestamp</th>
                    <th className="px-4 py-4 w-16 text-right text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-darkest/5">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-xs font-mono text-slate-400 animate-pulse">
                        Scanning Secure Channels...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-xs text-red-500">{error}</td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const isConfirming = confirmDeleteId === log._id;
                      const isDeleting = deletingId === log._id;
                      const isSelected = selected.has(log._id);

                      return (
                        <tr
                          key={log._id}
                          className={`group transition-colors ${isSelected ? "bg-yellow-gold/5" : "hover:bg-slate-50/80"}`}
                        >
                          {/* Row checkbox */}
                          <td className="px-4 py-4">
                            <button
                              onClick={() => toggleSelect(log._id)}
                              className="text-slate-300 hover:text-green-darkest transition-colors"
                            >
                              {isSelected
                                ? <CheckSquare size={15} className="text-green-darkest" />
                                : <Square size={15} />}
                            </button>
                          </td>

                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-green-darkest/5 text-[9px] font-black text-green-darkest uppercase tracking-tighter border border-green-darkest/5 rounded">
                              {log.action.replace(/_/g, " ")}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-400">
                                {log.actor?.name?.substring(0, 2).toUpperCase() ?? "??"}
                              </div>
                              <span className="text-[11px] font-bold text-green-darkest uppercase tracking-tight">
                                {log.actor?.name ?? "System"}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-[10px] font-mono text-slate-400">
                              {log.targetUser ? log.targetUser.email : "SYSTEM"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(log.details || {}).map(([key, val]) => (
                                <span
                                  key={key}
                                  className="text-[8px] font-mono bg-yellow-gold/10 text-yellow-700 px-1 rounded border border-yellow-gold/20"
                                >
                                  {key}:{String(val)}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right text-[10px] font-mono text-slate-400 uppercase">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>

                          {/* Per-row delete */}
                          <td className="px-4 py-4 text-right">
                            {isConfirming ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleSingleDelete(log._id)}
                                  disabled={isDeleting}
                                  className="px-2 py-1 bg-red-500 text-white text-[8px] font-black rounded hover:bg-red-600 transition-all disabled:opacity-50"
                                >
                                  {isDeleting ? <Loader2 size={10} className="animate-spin" /> : "Yes"}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-2 py-1 bg-slate-100 text-slate-500 text-[8px] font-black rounded hover:bg-slate-200 transition-all"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(log._id)}
                                className="p-1.5 text-slate-200 hover:text-red-400 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                                title="Delete this log"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="p-6 bg-slate-50/50 border-t border-green-darkest/5 flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-darkest disabled:opacity-20 hover:text-yellow-gold transition-colors"
                >
                  <ChevronLeft size={14} /> Back
                </button>
                <span className="text-[10px] font-mono text-slate-400">
                  Sequence{" "}
                  <span className="text-green-darkest font-bold">{page}</span> /{" "}
                  {pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-darkest disabled:opacity-20 hover:text-yellow-gold transition-colors"
                >
                  Forward <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-red-400/40">
            <ShieldAlert size={12} />
            <p className="text-[9px] font-black uppercase tracking-[0.2em]">
              Immutable Ledger Access Protocol
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}