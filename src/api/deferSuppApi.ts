// clientside/src/api/deferSuppApi.ts

import api from "@/config/axiosInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DeferredUnit {
  programUnitId: string;
  unitCode: string;
  unitName: string;
  fromYear: number;
  fromAcademicYear: string;
  reason: "supp_deferred" | "special_deferred";
  status: "pending" | "passed" | "failed";
  addedAt: string;
}

export interface DeferSuppPayload {
  studentId: string;
  programUnitIds: string[];
  academicYear: string;
  reason: "supp_deferred" | "special_deferred";
}

export interface DeferSuppResponse {
  success: boolean;
  message: string;
  deferred: DeferredUnit[];
}

export interface DeferredUnitsResponse {
  success: boolean;
  data: DeferredUnit[];
}

// ─── deferSuppUnits ───────────────────────────────────────────────────────────

export async function deferSuppUnits(
  payload: DeferSuppPayload,
): Promise<DeferSuppResponse> {
  const res = await api.post<DeferSuppResponse>("/student/defer-supp", payload);
  return res.data;
}

// ─── undoDeferral ─────────────────────────────────────────────────────────────

export async function undoDeferral(
  studentId: string,
  programUnitId: string,
): Promise<void> {
  await api.delete(`/student/defer-supp/${studentId}/${programUnitId}`);
}

// ─── getDeferredUnits ─────────────────────────────────────────────────────────

export async function getDeferredUnits(
  studentId: string,
): Promise<DeferredUnit[]> {
  const res = await api.get<DeferredUnitsResponse>(
    `/student/deferred-units/${studentId}`,
  );
  return res.data.data || [];
}
