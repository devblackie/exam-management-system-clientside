// clientside/src/hooks/queries/useAwardList.ts
import { useQuery } from "@tanstack/react-query";
import { getAwardList } from "@/api/awardListApi";

export const AWARD_KEYS = {
  list: (programId: string, academicYear?: string) =>
    ["awardList", programId, academicYear] as const,
};

export const useAwardList = (programId: string, academicYear?: string) =>
  useQuery({
    queryKey: AWARD_KEYS.list(programId, academicYear),
    queryFn: () => getAwardList(programId, academicYear),
    enabled: !!programId,
    staleTime: 5 * 60 * 1000,
  });
