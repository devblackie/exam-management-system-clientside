// clientside/src/api/programsApi.ts
import api from "@/config/axiosInstance";
import type { Program } from "./types";

export interface CreateProgramData {
  name: string;
  code: string;
  description?: string;
  durationYears: number;
  degreeType: string;
  schoolCode: string;
  departmentCode: string;
}

export interface UpdateProgramData {
  name?: string;
  code?: string;
  description?: string;
  durationYears?: number;
  degreeType?: string;
  schoolCode?: string;
  departmentCode?: string;
  isActive?: boolean;
}

// Create program
export async function createProgram(data: CreateProgramData): Promise<Program> {
  const res = await api.post<Program>("/programs", data);
  return res.data;
}

// Get all programs
export async function getPrograms(): Promise<Program[]> {
  const res = await api.get<Program[]>("/programs");
  return res.data;
}

// Get single program by ID
export async function getProgramById(id: string): Promise<Program> {
  const res = await api.get<Program>(`/programs/${id}`);
  return res.data;
}

// Update program
export async function updateProgram(id: string, data: UpdateProgramData): Promise<Program> {
  const res = await api.put<Program>(`/programs/${id}`, data);
  return res.data;
}

// Delete program
export async function deleteProgram(id: string): Promise<{ message: string }> {
  const res = await api.delete<{ message: string }>(`/programs/${id}`);
  return res.data;
}