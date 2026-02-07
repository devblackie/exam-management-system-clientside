// clientside/src/api/programUnitsApi.ts (NEW FILE for Curriculum Links)
import api from "@/config/axiosInstance";
import type { ProgramUnit } from "./types";

// Data for creating a curriculum link
export interface ProgramUnitLinkFormData {
  programId: string;
  unitId: string; // The ID of the Unit Template
  requiredYear: number;
  requiredSemester: 1 | 2;
  isElective: boolean; // Optional, default to false
}

// Data for updating a curriculum link
export interface ProgramUnitUpdateData {
  requiredYear?: number;
  requiredSemester?: 1 | 2;
  isElective?: boolean;
}


// 1. CREATE Program Unit Link
export const createProgramUnitLink = async (data: ProgramUnitLinkFormData) => {
  const res = await api.post<ProgramUnit>("/program-units", data);
  return res.data;
};

// 2. GET Curriculum for a Program
export const getProgramUnits = async (programId: string): Promise<ProgramUnit[]> => {
  const res = await api.get<ProgramUnit[]>("/program-units", {
    params: { programId },
  });
  return res.data;
};

// 3. UPDATE Program Unit Link
export const updateProgramUnitLink = async (id: string, data: ProgramUnitUpdateData) => {
  const res = await api.put<ProgramUnit>(`/program-units/${id}`, data);
  return res.data;
};

// 4. DELETE Program Unit Link
export const deleteProgramUnitLink = async (id: string) => {
  await api.delete(`/program-units/${id}`);
};

export const getProgramUnitLookup = async (programId: string) => {
  // Regex to check if string is a valid MongoDB ObjectId
  const isValidId = /^[0-9a-fA-F]{24}$/.test(programId);
  
  if (!isValidId) {
    console.error("Aborting API call: programId is not a valid ObjectId:", programId);
    return [];
  }

  const res = await api.get("/program-units/lookup", { 
    params: { programId } 
  });
  return res.data;
};