// clientside/src/hooks/queries/useMarks.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  uploadMarks,
  downloadTemplate,
  approveSpecialExam,
  
} from "@/api/marksApi";
import { useQuery } from "@tanstack/react-query";

// Note: getAcademicYears and getPrograms are duplicated in marksApi.ts
// They should only be called from useAcademicYears/usePrograms hooks.
// These are kept here only for marks-page convenience — prefer the
// canonical hooks in useAcademicYears.ts and usePrograms.ts.

export const MARKS_KEYS = {
  academicYears: ["marks", "academicYears"] as const,
  programs: ["marks", "programs"] as const,
};

export const useUploadMarks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      templateMode,
    }: {
      file: File;
      templateMode?: "detailed" | "direct";
    }) => uploadMarks(file, templateMode),
    onSuccess: () => {
      // Marks changed — invalidate anything that shows mark data
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["promote"] });
    },
  });
};

export const useApproveSpecialExam = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      markId,
      reason,
      undo,
    }: {
      markId: string;
      reason?: string;
      undo?: boolean;
    }) => approveSpecialExam(markId, reason, undo),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
  });
};
