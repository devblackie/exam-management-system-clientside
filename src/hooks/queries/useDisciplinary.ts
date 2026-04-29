// clientside/src/hooks/queries/useDisciplinary.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listDisciplinaryCases,
  getDisciplinaryCase,
  getStudentDisciplinaryCases,
  raiseCase,
  recordOutcome,
  reinstateStudent,
  recordAppeal,
  ListCasesParams,
  RaiseCasePayload,
  RecordOutcomePayload,
  ReinstatePayload,
  RecordAppealPayload,
} from "@/api/disciplinaryApi";

export const DISCIPLINARY_KEYS = {
  list: (params: ListCasesParams) => ["disciplinary", "list", params] as const,
  detail: (caseId: string) => ["disciplinary", "case", caseId] as const,
  byStudent: (studentId: string) =>
    ["disciplinary", "student", studentId] as const,
};

export const useDisciplinaryCases = (params: ListCasesParams = {}) =>
  useQuery({
    queryKey: DISCIPLINARY_KEYS.list(params),
    queryFn: () => listDisciplinaryCases(params),
    placeholderData: (prev) => prev,
  });

export const useDisciplinaryCase = (caseId: string) =>
  useQuery({
    queryKey: DISCIPLINARY_KEYS.detail(caseId),
    queryFn: () => getDisciplinaryCase(caseId),
    enabled: !!caseId,
  });

export const useStudentDisciplinaryHistory = (studentId: string) =>
  useQuery({
    queryKey: DISCIPLINARY_KEYS.byStudent(studentId),
    queryFn: () => getStudentDisciplinaryCases(studentId),
    enabled: !!studentId,
  });

export const useRaiseCase = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RaiseCasePayload) => raiseCase(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["disciplinary"] });
      qc.invalidateQueries({ queryKey: ["students"] }); // student status changed
    },
  });
};

export const useRecordOutcome = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      caseId,
      payload,
    }: {
      caseId: string;
      payload: RecordOutcomePayload;
    }) => recordOutcome(caseId, payload),
    onSuccess: (_, { caseId }) => {
      qc.invalidateQueries({ queryKey: ["disciplinary"] });
      qc.invalidateQueries({ queryKey: DISCIPLINARY_KEYS.detail(caseId) });
    },
  });
};

export const useReinstateStudent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      caseId,
      payload,
    }: {
      caseId: string;
      payload: ReinstatePayload;
    }) => reinstateStudent(caseId, payload),
    onSuccess: (_, { caseId }) => {
      qc.invalidateQueries({ queryKey: ["disciplinary"] });
      qc.invalidateQueries({ queryKey: DISCIPLINARY_KEYS.detail(caseId) });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useRecordAppeal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      caseId,
      payload,
    }: {
      caseId: string;
      payload: RecordAppealPayload;
    }) => recordAppeal(caseId, payload),
    onSuccess: (_, { caseId }) => {
      qc.invalidateQueries({ queryKey: ["disciplinary"] });
      qc.invalidateQueries({ queryKey: DISCIPLINARY_KEYS.detail(caseId) });
    },
  });
};
