// clientside/src/api/maintenanceApi.ts
import api from "@/config/axiosInstance";
import { Unit, Program, AcademicYear, TrashedMark } from "./types";

export interface CleanupFilters { unitCode: string; programId: string; academicYear: string; }

export interface TrashActionPayload {markIds: string[]; action: "restore" | "purge";}

export const maintenanceApi = {
  // Move to trash
  bulkTrash: async (filters: CleanupFilters) => {
    const res = await api.post<{ count: number; message: string }>( "/maintenance/bulk-cleanup", filters );
    return res.data;
  },
  // Get trash contents
  getTrash: async () => {
    const res = await api.get<TrashedMark[]>("/maintenance/trash-bin");
    return res.data;
  },
  // Restore or Delete forever
  handleTrashAction: async (payload: TrashActionPayload) => {
    const res = await api.post<{ success: boolean }>("/maintenance/trash-action", payload );
    return res.data;
  },
  deleteStudentMarks: async (studentId: string, programUnitId: string, academicYearId: string) => {
    const { data } = await api.post(`/maintenance/delete-student-marks`, {
      studentId,
      programUnitId,
      academicYearId
    });
    return data;
  }
};
