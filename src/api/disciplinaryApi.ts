// clientside/src/api/disciplinaryApi.ts

import api from "@/config/axiosInstance";

// ── Types ──────────────────────────────────────────────────────────────────────

export type DisciplinaryGrounds =
  | "exam_irregularity"
  | "academic_misconduct"
  | "misconduct"
  | "financial"
  | "other";

export type DisciplinaryOutcome =
  | "PENDING"
  | "WARNING"
  | "SENT_HOME"
  | "REINSTATED"
  | "DISCONTINUED"
  | "DISMISSED";

export type AppealOutcome = "UPHELD" | "DISMISSED";

export interface DisciplinaryStudent {
  _id:                string;
  name:               string;
  regNo:              string;
  currentYearOfStudy: number;
  status:             string;
}

export interface DisciplinaryActor {
  name:  string;
  email: string;
}

export interface DisciplinaryCase {
  _id:             string;
  student:         DisciplinaryStudent;
  raisedBy:        DisciplinaryActor;
  resolvedBy?:     DisciplinaryActor;
  academicYear:    string;
  yearOfStudy:     number;
  grounds:         DisciplinaryGrounds;
  description:     string;
  outcome:         DisciplinaryOutcome;
  outcomeNotes?:   string;
  hearingDate?:    string;
  suspensionStart?:string;
  suspensionEnd?:  string;
  priorStudentStatus: string;
  appealed:        boolean;
  appealDate?:     string;
  appealOutcome?:  AppealOutcome;
  appealNotes?:    string;
  createdAt:       string;
  updatedAt:       string;
}

export interface DisciplinaryCaseListResponse {
  total: number;
  page:  number;
  cases: DisciplinaryCase[];
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface RaiseCasePayload {
  studentId:    string;
  grounds:      DisciplinaryGrounds;
  description:  string;
  hearingDate?: string;   // ISO date string — optional
}

export interface RecordOutcomePayload {
  outcome:          DisciplinaryOutcome;
  outcomeNotes?:    string;
  hearingDate?:     string;
  suspensionStart?: string;
  suspensionEnd?:   string;
}

export interface ReinstatePayload {
  notes?: string;
}

export interface RecordAppealPayload {
  appealDate?:   string;
  appealOutcome: AppealOutcome;
  appealNotes?:  string;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface ListCasesParams {
  outcome?: DisciplinaryOutcome | "";
  page?:    number;
  limit?:   number;
}

// ── API functions ─────────────────────────────────────────────────────────────

/**
 * GET /disciplinary
 * List all cases for the institution with optional outcome filter.
 * Used by the main DisciplinaryPage table.
 */
export async function listDisciplinaryCases(
  params: ListCasesParams = {},
): Promise<DisciplinaryCaseListResponse> {
  const query: Record<string, string> = {
    page:  String(params.page  ?? 1),
    limit: String(params.limit ?? 15),
  };
  if (params.outcome) query.outcome = params.outcome;

  const res = await api.get<DisciplinaryCaseListResponse>("/disciplinary", { params: query });
  return res.data;
}

/**
 * GET /disciplinary/student/:studentId
 * All cases for a single student — used inside StudentSearch / JourneyTimeline
 * to show the student's disciplinary history inline.
 */
export async function getStudentDisciplinaryCases(
  studentId: string,
): Promise<DisciplinaryCase[]> {
  const res = await api.get<DisciplinaryCase[]>(`/disciplinary/student/${studentId}`);
  return res.data;
}

/**
 * GET /disciplinary/:caseId
 * Single case with full details. Used for a detail modal or dedicated case page.
 */
export async function getDisciplinaryCase(
  caseId: string,
): Promise<DisciplinaryCase> {
  const res = await api.get<DisciplinaryCase>(`/disciplinary/${caseId}`);
  return res.data;
}

/**
 * POST /disciplinary/raise
 * File a new disciplinary case. This immediately locks the student out of
 * the system — their status flips to "disciplinary_suspension" the moment
 * this resolves successfully.
 *
 * Use searchStudents() to resolve a regNo → studentId before calling this.
 */
export async function raiseCase(
  payload: RaiseCasePayload,
): Promise<{ message: string; caseId: string }> {
  const res = await api.post<{ message: string; caseId: string }>(
    "/disciplinary/raise",
    payload,
  );
  return res.data;
}

/**
 * PATCH /disciplinary/:caseId/outcome
 * Record the hearing outcome (admin only).
 * Outcome options and their effects:
 *   WARNING      → student stays enrolled, status reverts to priorStatus
 *   SENT_HOME    → suspension formalised, RP1D qualifier applied
 *   DISCONTINUED → full discontinuation per ENG.22
 *   DISMISSED    → case dropped, student status reverted to priorStatus
 */
export async function recordOutcome(
  caseId:  string,
  payload: RecordOutcomePayload,
): Promise<{ message: string; studentStatus: string }> {
  const res = await api.patch<{ message: string; studentStatus: string }>(
    `/disciplinary/${caseId}/outcome`,
    payload,
  );
  return res.data;
}

/**
 * PATCH /disciplinary/:caseId/reinstate
 * Admin lifts a SENT_HOME suspension. Student status reverts to priorStudentStatus.
 * Creates a new statusEvents entry so the JourneyTimeline shows the reinstatement.
 */
export async function reinstateStudent(
  caseId:  string,
  payload: ReinstatePayload = {},
): Promise<{ message: string; restoredStatus: string }> {
  const res = await api.patch<{ message: string; restoredStatus: string }>(
    `/disciplinary/${caseId}/reinstate`,
    payload,
  );
  return res.data;
}

/**
 * PATCH /disciplinary/:caseId/appeal
 * Record an appeal and its outcome.
 *   UPHELD    → student wins, system auto-reinstates them
 *   DISMISSED → original outcome stands
 */
export async function recordAppeal(
  caseId:  string,
  payload: RecordAppealPayload,
): Promise<{ message: string }> {
  const res = await api.patch<{ message: string }>(
    `/disciplinary/${caseId}/appeal`,
    payload,
  );
  return res.data;
}

// ── Label helpers (used in UI, no API call needed) ────────────────────────────

export const GROUNDS_LABELS: Record<DisciplinaryGrounds, string> = {
  exam_irregularity:   "Examination Irregularity (ENG.17)",
  academic_misconduct: "Academic Misconduct",
  misconduct:          "General Misconduct",
  financial:           "Financial Misconduct",
  other:               "Other",
};

export const OUTCOME_LABELS: Record<DisciplinaryOutcome, string> = {
  PENDING:      "Pending Hearing",
  WARNING:      "Warning Issued",
  SENT_HOME:    "Sent Home (Suspended)",
  REINSTATED:   "Reinstated",
  DISCONTINUED: "Discontinued (ENG.22)",
  DISMISSED:    "Case Dismissed",
};