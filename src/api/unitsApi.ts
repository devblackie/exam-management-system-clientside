// // clientside/src/api/unitsApi.ts
// import api from "@/config/axiosInstance";
// import type { Unit } from "./types";

// export interface UnitFormData {
//   programId: string;
//   code: string;
//   name: string;
//   year: number;
//   semester: number;
// }

// export const createUnit = async (data: UnitFormData) => {
//   const res = await api.post<Unit>("/units", data);
//   return res.data;
// };

// export const getUnits = async (): Promise<Unit[]> => {
//   const res = await api.get<Unit[]>("/units");
//   return res.data;
// };

// export const updateUnit = async (id: string, data: Partial<UnitFormData & { code?: string; name?: string }>) => {
//   const res = await api.put<Unit>(`/units/${id}`, data);
//   return res.data;
// };

// export const deleteUnit = async (id: string) => {
//   await api.delete(`/units/${id}`);
// };

// clientside/src/api/unitsApi.ts (Refactored for Unit TEMPLATES)
import api from "@/config/axiosInstance";
import type { Unit } from "./types";

// 1. Data for creating/updating a base template (NO program/year/semester fields)
export interface UnitTemplateFormData {
  code: string;
  name: string;
}

// 2. CREATE Unit Template
export const createUnitTemplate = async (data: UnitTemplateFormData) => {
  const res = await api.post<Unit>("/units", data);
  return res.data;
};

// 3. GET All Unit Templates (for use in dropdowns)
export const getUnitTemplates = async (): Promise<Unit[]> => {
  const res = await api.get<Unit[]>("/units");
  return res.data;
};

// 4. UPDATE Unit Template (Only code/name allowed by backend)
export const updateUnitTemplate = async (id: string, data: Partial<UnitTemplateFormData>) => {
  const res = await api.put<Unit>(`/units/${id}`, data);
  return res.data;
};

// 5. DELETE Unit Template (Subject to backend constraints)
export const deleteUnitTemplate = async (id: string) => {
  await api.delete(`/units/${id}`);
};