// clientside/src/hooks/queries/useUnits.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUnitTemplates,
  createUnitTemplate,
  updateUnitTemplate,
  deleteUnitTemplate,
} from "@/api/unitsApi";
import type { UnitTemplateFormData } from "@/api/unitsApi";

export const UNIT_KEYS = {
  all: ["units"] as const,
};

export const useUnits = () =>
  useQuery({
    queryKey: UNIT_KEYS.all,
    queryFn: getUnitTemplates,
    staleTime: 10 * 60 * 1000,
  });

export const useCreateUnit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UnitTemplateFormData) => createUnitTemplate(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: UNIT_KEYS.all }),
  });
};

export const useUpdateUnit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<UnitTemplateFormData>;
    }) => updateUnitTemplate(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: UNIT_KEYS.all }),
  });
};

export const useDeleteUnit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUnitTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: UNIT_KEYS.all }),
  });
};
