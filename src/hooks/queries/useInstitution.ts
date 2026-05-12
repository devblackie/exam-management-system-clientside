// clientside/src/hooks/queries/useInstitution.ts — NEW FILE
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyInstitution,
  updateMyInstitution,
  UpdateInstitutionInput,
} from "@/api/institutionsApi";

export const INSTITUTION_KEYS = {
  mine: ["institution", "mine"] as const,
};

export const useMyInstitution = () =>
  useQuery({
    queryKey: INSTITUTION_KEYS.mine,
    queryFn: getMyInstitution,
    staleTime: 10 * 60 * 1000,
  });

export const useUpdateInstitution = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateInstitutionInput) => updateMyInstitution(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: INSTITUTION_KEYS.mine }),
  });
};
