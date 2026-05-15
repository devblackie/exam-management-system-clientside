// // clientside/src/hooks/queries/useMarks.ts
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { uploadMarks, approveSpecialExam } from "@/api/marksApi";

// export const MARKS_KEYS = {
//   academicYears: ["marks", "academicYears"] as const,
//   programs: ["marks", "programs"] as const,
// };

// export const useUploadMarks = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({ file }: { file: File }) => uploadMarks(file),
//     onSuccess: () => {
//       // Marks changed — invalidate anything that shows mark data
//       qc.invalidateQueries({ queryKey: ["students"] });
//       qc.invalidateQueries({ queryKey: ["promote"] });
//     },
//   });
// };

// export const useApproveSpecialExam = () => {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: ({
//       markId,
//       reason,
//       undo,
//     }: {
//       markId: string;
//       reason?: string;
//       undo?: boolean;
//     }) => approveSpecialExam(markId, reason, undo),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ["students"] }),
//   });
// };






// clientside/src/hooks/queries/useMarks.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  uploadMarks,
  approveSpecialExam,
  getBatchMarks,
  deleteBatch,
  deleteBatches,
} from "@/api/marksApi";
import type {
  DeleteBatchResponse,
  DeleteBatchesResponse,
  BatchDetailResponse,
} from "@/api/marksApi";

export const MARKS_KEYS = {
  all: ["marks"] as const,
  uploadStats: ["marks", "uploadStats"] as const,
  batch: (batchId: string) => ["marks", "batch", batchId] as const,
};

// ── Upload marks file ────────────────────────────────────────────────────────
export const useUploadMarks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file }: { file: File }) => uploadMarks(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["students"] });
      qc.invalidateQueries({ queryKey: ["promote"] });
      qc.invalidateQueries({ queryKey: MARKS_KEYS.uploadStats });
    },
  });
};

// ── Approve special exam ─────────────────────────────────────────────────────
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

// ── View batch marks ─────────────────────────────────────────────────────────
export const useBatchMarks = (batchId: string) =>
  useQuery<BatchDetailResponse>({
    queryKey: MARKS_KEYS.batch(batchId),
    queryFn: () => getBatchMarks(batchId),
    enabled: !!batchId && batchId.length >= 10,
    staleTime: 2 * 60 * 1000,
  });

// ── Delete single batch ──────────────────────────────────────────────────────
export const useDeleteBatch = () => {
  const qc = useQueryClient();
  return useMutation<DeleteBatchResponse, Error, string>({
    mutationFn: (batchId: string) => deleteBatch(batchId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MARKS_KEYS.uploadStats });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

// ── Delete multiple batches ──────────────────────────────────────────────────
export const useDeleteBatches = () => {
  const qc = useQueryClient();
  return useMutation<DeleteBatchesResponse, Error, string[]>({
    mutationFn: (batchIds: string[]) => deleteBatches(batchIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MARKS_KEYS.uploadStats });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};
