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
