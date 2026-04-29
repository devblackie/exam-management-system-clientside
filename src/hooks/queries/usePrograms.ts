// clientside/src/hooks/queries/usePrograms.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
} from "@/api/programsApi";
import type { Program } from "@/api/types";

export const PROGRAM_KEYS = {
  all: ["programs"] as const,
  detail: (id: string) => ["programs", id] as const,
};

export const usePrograms = () =>
  useQuery({
    queryKey: PROGRAM_KEYS.all,
    queryFn: getPrograms,
    staleTime: 10 * 60 * 1000, // programs rarely change
  });

export const useProgram = (id: string) =>
  useQuery({
    queryKey: PROGRAM_KEYS.detail(id),
    queryFn: () => getProgramById(id),
    enabled: !!id,
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
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: PROGRAM_KEYS.all });
      qc.invalidateQueries({ queryKey: PROGRAM_KEYS.detail(id) });
    },
  });
};

export const useDeleteProgram = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProgram,
    onSuccess: () => qc.invalidateQueries({ queryKey: PROGRAM_KEYS.all }),
  });
};
