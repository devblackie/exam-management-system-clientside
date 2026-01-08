// clientside/src/api/academicYearsApi.ts
import api from "@/config/axiosInstance";
import type { AcademicYear } from "./types";

export interface AcademicYearData {
  year: string;
  startDate: string;
  endDate: string;
}

export const createAcademicYear = async (data: AcademicYearData): Promise<AcademicYear> => {
  const res = await api.post<AcademicYear>("/academic-years", data);
  return res.data;
};

export const getAcademicYears = async (): Promise<AcademicYear[]> => {
  const res = await api.get<AcademicYear[]>("/academic-years");
  return res.data;
};