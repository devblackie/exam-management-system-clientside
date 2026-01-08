"use client";

import { useEffect, useState } from "react";
import { getAuditLogs, AuditLog,exportAuditLogsCSV, exportAuditLogsExcel } from "@/api/auditLogs";
import { getUsers, User } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

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

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch {
      setError("Failed to load users");
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
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
      setError("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [page, sort]);

  const handleFilter = () => {
    setPage(1);
    fetchLogs();
  };

  const clearFilters = () => {
    setActionFilter("");
    setActorFilter("");
    setFromDate("");
    setToDate("");
    setSort("desc");
    setPage(1);
    fetchLogs();
  };

const handleExportCSV = async () => {
  const blob = await exportAuditLogsCSV({
    action: actionFilter || undefined,
    actorId: actorFilter || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    sort,
  });
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "audit-logs.csv");
  document.body.appendChild(link);
  link.click();
};

const handleExportExcel = async () => {
  const blob = await exportAuditLogsExcel({
    action: actionFilter || undefined,
    actorId: actorFilter || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    sort,
  });
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "audit-logs.xlsx");
  document.body.appendChild(link);
  link.click();
};


  return (
    <ProtectedRoute allowed={["admin"]}>
      <div className="p-6 min-h-screen bg-yellow-gold">
        <h1 className="text-2xl font-bold text-green-darkest mb-4">Audit Logs</h1>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {/* Actor filter */}
          <select
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className=" px-3 py-2 border border-green-darkest rounded-md focus:outline-none focus:ring-0 text-green-darkest mb-4"
          >
            <option value="">All Actors</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>

          {/* Action filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="  px-3 py-2 border border-green-darkest rounded-md focus:outline-none focus:ring-0 text-green-darkest mb-4"
          >
            <option value="">All Actions</option>
            <option value="role_changed">Role Changed</option>
            <option value="status_toggled">Status Toggled</option>
            <option value="user_deleted">User Deleted</option>
          </select>

          {/* Date range */}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-3 py-2 border border-green-darkest rounded-md focus:outline-none focus:ring-0 text-green-darkest mb-4"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-3 py-2 border border-green-darkest rounded-md focus:outline-none focus:ring-0 text-green-darkest mb-4"
          />

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "asc" | "desc")}
            className="px-3 py-2 border border-green-darkest rounded-md focus:outline-none focus:ring-0 text-green-darkest mb-4"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          {/* Buttons */}
          <button
            onClick={handleFilter}
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            Apply
          </button>
          <button
            onClick={clearFilters}
            className="px-3 py-2 bg-gray-400 text-white rounded"
          >
            Clear
          </button>
        </div>
        <div className="flex gap-3 mb-4">
    <button onClick={handleExportCSV} className="bg-blue-500 text-white px-4 py-2 rounded">Export CSV</button>
    <button onClick={handleExportExcel} className="bg-green-500 text-white px-4 py-2 rounded">Export Excel</button>
  </div>

        {/* Table */}
        <div className="overflow-x-auto  rounded">
          {loading ? (
            <p className="p-4">Loading...</p>
          ) : error ? (
            <p className="p-4 text-red-600">{error}</p>
          ) : logs.length === 0 ? (
            <p className="p-4 text-gray-500">No logs found.</p>
          ) : (
            <table className="w-full border-collapse border border-green-darkest text-left text-sm">
              <thead className="bg-green-darkest text-white">
                <tr>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Actor</th>
                  <th className="px-4 py-2">Target User</th>
                  <th className="px-4 py-2">Details</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="border-t border-green-dark text-green-darkest">
                    <td className="px-4 py-2">{log.action}</td>
                    <td className="px-4 py-2">
                      {log.actor?.name} ({log.actor?.email})
                    </td>
                    <td className="px-4 py-2">
                      {log.targetUser
                        ? `${log.targetUser.name} (${log.targetUser.email})`
                        : "-"}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-green-darkest rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-green-darkest font-bold">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-1 bg-green-darkest rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
