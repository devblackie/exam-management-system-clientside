// src/api/unitsApi.ts
import api from "@/config/axiosInstance";
import type { Unit } from "./types";

// 📄 Get all units (global)
export async function getUnits() {
  const res = await api.get<Unit[]>("/units");
  return res.data;
}

// 📄 Get units of a program
export async function getUnitsByprogram(programId: string) {
  const res = await api.get<Unit[]>(`/units/program/${programId}`);
  return res.data;
}

// ➕ Create unit
export async function createUnit(payload: {
  name: string;
  code: string;
  program: string;
  yearOfStudy?: number;
  semester?: number;
}) {
  const { data } = await api.post<Unit>(`/units`, payload);
  return data;
}

// ✏️ Update unit
export async function updateUnit(id: string, payload: Partial<Unit>) {
  const { data } = await api.put<Unit>(`/units/${id}`, payload);
  return data;
}

// ❌ Delete unit
export async function deleteUnit(id: string) {
  const { data } = await api.delete<{ message: string }>(`/units/${id}`);
  return data;
}

// 👨‍🏫 Assign lecturer
export async function assignLecturerToUnit(unitId: string, lecturerId: string) {
  const { data } = await api.put<Unit>(`/units/${unitId}/assign`, {
    lecturerId,
  });
  return data;
}

// 🚫 Unassign lecturer
export async function unassignLecturerFromUnit(unitId: string) {
  const { data } = await api.put<Unit>(`/units/${unitId}/unassign`);
  return data;
}

// 🧮 Submit marks for a unit
export async function submitMarks(
  unitId: string,
  payload: {
    studentId: string;
    cat1?: number;
    cat2?: number;
    cat3?: number;
    assignment?: number;
    practical?: number;
    exam?: number;
  }[]
) {
  const { data } = await api.post<{ message: string }>(
    `/coordinator/units/${unitId}/marks`,
    { marks: payload }
  );
  return data;
}
