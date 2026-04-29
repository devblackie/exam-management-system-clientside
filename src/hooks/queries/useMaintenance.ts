// clientside/src/hooks/queries/useMaintenance.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  maintenanceApi,
  CleanupFilters,
  TrashActionPayload,
} from "@/api/maintenanceApi";
import { runDatabaseCleanup } from "@/api/coordinatorApi";

export const MAINTENANCE_KEYS = {
  trash: ["maintenance", "trash"] as const,
};

export const useTrash = () =>
  useQuery({
    queryKey: MAINTENANCE_KEYS.trash,
    queryFn: maintenanceApi.getTrash,
  });

export const useBulkTrash = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (filters: CleanupFilters) => maintenanceApi.bulkTrash(filters),
    onSuccess: () => qc.invalidateQueries({ queryKey: MAINTENANCE_KEYS.trash }),
  });
};

export const useTrashAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TrashActionPayload) =>
      maintenanceApi.handleTrashAction(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MAINTENANCE_KEYS.trash });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useDeleteStudentMarks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      studentId,
      programUnitId,
      academicYearId,
    }: {
      studentId: string;
      programUnitId: string;
      academicYearId: string;
    }) =>
      maintenanceApi.deleteStudentMarks(
        studentId,
        programUnitId,
        academicYearId,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
};

export const useRunDatabaseCleanup = () =>
  useMutation({ mutationFn: runDatabaseCleanup });
