// src/api/coordinatorApi.ts
import api from "@/config/axiosInstance";
import type { User } from "./types";

export interface CoordinatorDashboardStats {
  students: {
    total:          number;
    active:         number;
    repeat:         number;
    discontinued:   number;
    graduated:      number;
    suspended:      number;
  };
  marks: {
    totalUploads:   number;
    pendingReview:  number;
    lastUploadDate: string | null;
  };
  disciplinary: {
    openCases:      number;
    pendingOutcome: number;
  };
  programs: {
    total:          number;
    names:          string[];
  };
  promotion: {
    lastRunDate:    string | null;
    eligibleCount:  number;
  };
  academicYear: {
    current:        string | null;
    session:        string | null;
  };
}

//  Fetch lecturers (accessible by coordinator)
export async function getCoordinatorLecturers() {
  const res = await api.get<User[]>("/admin/lecturers");
  return res.data;
}

//  Create lecturer (no invite flow)
export async function createLecturer(data: {
  name: string;
  email: string;
  password?: string;
}) {
  const res = await api.post("/coordinator/lecturers", data);
  return res.data;
}

// --- Data Cleanup ---
export async function runDatabaseCleanup() {
  const res = await api.post<{ success: boolean; message: string }>("/coordinator/maintain/cleanup-grades");
  return res.data;
}

export async function getCoordinatorDashboardStats(): Promise<CoordinatorDashboardStats> {
  const res = await api.get<CoordinatorDashboardStats>(
    "/coordinator/dashboard-stats",
  );
  return res.data;
}
