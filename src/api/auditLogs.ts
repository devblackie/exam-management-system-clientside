import api from "@/config/axiosInstance";

export interface AuditLogDetails {
  from?: string;
  to?: string;
  reason?: string;
  [key: string]: unknown;
}

export interface AuditLog {
  _id: string;
  actor?: { name: string; email: string };
  targetUser?: { name: string; email: string };
  action: string;
  details?: AuditLogDetails;
  createdAt: string;
}

export interface GetAuditLogsParams {
  action?: string;
  actorId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
}

// ✅ Fetch paginated logs
export const getAuditLogs = async (params?: GetAuditLogsParams) => {
  const res = await api.get("/audit-logs", { params });
  return res.data as {
    data: AuditLog[];
    total: number;
    page: number;
    pages: number;
  };
};

// ✅ Export CSV with filters
export const exportAuditLogsCSV = async (params?: GetAuditLogsParams) => {
  const res = await api.get("/audit-logs/export/csv", {
    params,
    responseType: "blob",
  });
  return res.data;
};

// ✅ Export Excel with filters
export const exportAuditLogsExcel = async (params?: GetAuditLogsParams) => {
  const res = await api.get("/audit-logs/export/excel", {
    params,
    responseType: "blob",
  });
  return res.data;
};

// Add these three functions to your existing @/api/auditLogs.ts

// Single delete
export async function deleteAuditLog(id: string): Promise<{ message: string }> {
  const res = await api.delete(`/audit-logs/${id}`);
  return res.data;
}

// Bulk delete by ID array
export async function bulkDeleteAuditLogs(
  ids: string[]
): Promise<{ message: string; deletedCount: number; notFound: string[] }> {
  const res = await api.delete("/audit-logs/bulk", { data: { ids } });
  return res.data;
}

// Purge everything before a given date
export async function purgeAuditLogsByDate(
  before: string
): Promise<{ message: string; deletedCount: number }> {
  const res = await api.delete("/audit-logs/purge/by-date", {
    data: { before },
  });
  return res.data;
}
