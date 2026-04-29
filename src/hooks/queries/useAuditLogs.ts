// clientside/src/hooks/queries/useAuditLogs.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAuditLogs,
  deleteAuditLog,
  bulkDeleteAuditLogs,
  purgeAuditLogsByDate,
  GetAuditLogsParams,
} from "@/api/auditLogs";

export const AUDIT_KEYS = {
  list: (params: GetAuditLogsParams) => ["auditLogs", params] as const,
};

export const useAuditLogs = (params: GetAuditLogsParams = {}) =>
  useQuery({
    queryKey: AUDIT_KEYS.list(params),
    queryFn: () => getAuditLogs(params),
    placeholderData: (prev) => prev,
  });

export const useDeleteAuditLog = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAuditLog,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auditLogs"] }),
  });
};

export const useBulkDeleteAuditLogs = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteAuditLogs,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auditLogs"] }),
  });
};

export const usePurgeAuditLogs = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (before: string) => purgeAuditLogsByDate(before),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["auditLogs"] }),
  });
};
