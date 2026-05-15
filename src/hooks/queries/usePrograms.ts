
// clientside/src/hooks/queries/usePrograms.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from "@/api/programsApi";
import type { Program } from "@/api/types";

export const PROGRAM_KEYS = {
  all: ["programs"] as const,
};

export const usePrograms = () =>
  useQuery({
    queryKey: PROGRAM_KEYS.all,
    queryFn: getPrograms,
    staleTime: 5 * 60 * 1000,
  });

export const useCreateProgram = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProgram,
    onSuccess: () => qc.invalidateQueries({ queryKey: PROGRAM_KEYS.all }),
  });
};

export const useUpdateProgram = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Program> }) =>
      updateProgram(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROGRAM_KEYS.all }),
  });
};

export const useDeleteProgram = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProgram,
    onSuccess: () => qc.invalidateQueries({ queryKey: PROGRAM_KEYS.all }),
  });
};
