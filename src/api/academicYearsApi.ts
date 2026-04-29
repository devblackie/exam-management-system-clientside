// clientside/src/api/academicYearsApi.ts
import api from "@/config/axiosInstance";
import type { AcademicYear } from "./types";

export interface AcademicYearData {
  year: string;
  startDate: string;
  endDate: string;
  session?: "ORDINARY" | "SUPPLEMENTARY" | "CLOSED";
  isRegistrationOpen?: boolean;
  isCurrent?: boolean;
}

export const createAcademicYear = async (
  data: AcademicYearData,
): Promise<AcademicYear> => {
  const res = await api.post<AcademicYear>("/academic-years", data);
  return res.data;
};

export const getAcademicYears = async (): Promise<AcademicYear[]> => {
  const res = await api.get<AcademicYear[]>("/academic-years");
  return res.data;
};

export const updateAcademicYear = async (
  id: string,
  data: Partial<AcademicYearData>,
): Promise<AcademicYear> => {
  const res = await api.patch<AcademicYear>(`/academic-years/${id}`, data);
  return res.data;
};

export const deleteAcademicYear = async (id: string): Promise<void> => {
  await api.delete(`/academic-years/${id}`);
};

export const setCurrentYear = async (id: string): Promise<AcademicYear> => {
  const res = await api.patch<AcademicYear>(`/academic-years/${id}`, {
    isCurrent: true,
  });
  return res.data;
};