// clientside/src/hooks/queries/useProgramUnits.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProgramUnits,
  getProgramUnitStats,
  getProgramUnitLookup,
  createProgramUnitLink,
  updateProgramUnitLink,
  deleteProgramUnitLink,
} from "@/api/programUnitsApi";
import type {
  ProgramUnitLinkFormData,
  ProgramUnitUpdateData,
} from "@/api/programUnitsApi";

export const PROGRAM_UNIT_KEYS = {
  all: ["programUnits"] as const,
  stats: ["programUnits", "stats"] as const,
  byProgram: (programId: string) =>
    ["programUnits", "program", programId] as const,
  lookup: (programId: string) => ["programUnits", "lookup", programId] as const,
};

export const useProgramUnitStats = () =>
  useQuery({
    queryKey: PROGRAM_UNIT_KEYS.stats,
    queryFn: getProgramUnitStats,
  });

export const useProgramUnits = (programId: string) =>
  useQuery({
    queryKey: PROGRAM_UNIT_KEYS.byProgram(programId),
    queryFn: () => getProgramUnits(programId),
    enabled: !!programId,
    staleTime: 5 * 60 * 1000,
  });

export const useProgramUnitLookup = (programId: string) =>
  useQuery({
    queryKey: PROGRAM_UNIT_KEYS.lookup(programId),
    queryFn: () => getProgramUnitLookup(programId),
    enabled: /^[0-9a-fA-F]{24}$/.test(programId), // same guard as the API fn
    staleTime: 10 * 60 * 1000,
  });

export const useCreateProgramUnit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProgramUnitLinkFormData) => createProgramUnitLink(data),
    onSuccess: (_, { programId }) => {
      qc.invalidateQueries({
        queryKey: PROGRAM_UNIT_KEYS.byProgram(programId),
      });
      qc.invalidateQueries({ queryKey: PROGRAM_UNIT_KEYS.stats });
    },
  });
};

export const useUpdateProgramUnit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProgramUnitUpdateData }) =>
      updateProgramUnitLink(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROGRAM_UNIT_KEYS.all }),
  });
};

export const useDeleteProgramUnit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProgramUnitLink,
    onSuccess: () => qc.invalidateQueries({ queryKey: PROGRAM_UNIT_KEYS.all }),
  });
};
