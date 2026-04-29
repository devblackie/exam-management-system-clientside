// clientside/src/hooks/queries/useAcademicYears.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  setCurrentYear,
} from "@/api/academicYearsApi";
import type { AcademicYearData } from "@/api/academicYearsApi";

export const ACADEMIC_YEAR_KEYS = {
  all: ["academicYears"] as const,
};

export const useAcademicYears = () =>
  useQuery({
    queryKey: ACADEMIC_YEAR_KEYS.all,
    queryFn: getAcademicYears,
    staleTime: 10 * 60 * 1000,
  });

export const useCreateAcademicYear = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AcademicYearData) => createAcademicYear(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACADEMIC_YEAR_KEYS.all }),
  });
};

export const useUpdateAcademicYear = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AcademicYearData>;
    }) => updateAcademicYear(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ACADEMIC_YEAR_KEYS.all }),
  });
};

export const useSetCurrentYear = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: setCurrentYear,
    onSuccess: () => qc.invalidateQueries({ queryKey: ACADEMIC_YEAR_KEYS.all }),
  });
};

export const useDeleteAcademicYear = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAcademicYear,
    onSuccess: () => qc.invalidateQueries({ queryKey: ACADEMIC_YEAR_KEYS.all }),
  });
};
