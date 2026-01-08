// src/api/programsApi.ts
import api from "@/config/axiosInstance";
import type { Program } from "./types";

// ➕ Create program
export async function createProgram(data: {
  name: string;
  code: string;
  description?: string;
  durationYears?: number;
}) {
  const res = await api.post<Program>("/programs", data);
  return res.data;
}

// 📄 Get all programs
export async function getPrograms() {
  const res = await api.get<Program[]>("/programs");
  return res.data;
}

// 🔎 fetch single program by ID
export async function getProgramById(id: string) {
  const res = await api.get<Program>(`/programs/${id}`);
  return res.data;
}

// ✏️ Update program
export async function updateProgram(id: string, data: Partial<Program>) {
  const res = await api.put<Program>(`/programs/${id}`, data);
  return res.data;
}

// ❌ Delete program
export async function deleteProgram(id: string) {
  const res = await api.delete<{ message: string }>(`/programs/${id}`);
  return res.data;
}
