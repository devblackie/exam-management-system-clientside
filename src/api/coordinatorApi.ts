// src/api/coordinatorApi.ts
import api from "@/config/axiosInstance";
import type { User } from "./types";

// 🧑‍🏫 Fetch lecturers (accessible by coordinator)
export async function getCoordinatorLecturers() {
  const res = await api.get<User[]>("/admin/lecturers");
  return res.data;
}

// ➕ Create lecturer (no invite flow)
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
