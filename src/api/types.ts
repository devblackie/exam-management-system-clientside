// src/api/types.ts
export type Role = "admin" | "lecturer" | "coordinator";
// export type Status = "active" | "suspended";
export type Status =  "active" | "inactive" | "graduated" | "suspended" | "deferred" | "disciplinary_suspension" | "discontinued" | "readmitted";
export type DisciplinaryOutcome = "PENDING" | "WARNING" | "SENT_HOME" | "REINSTATED" | "DISCONTINUED" | "DISMISSED";
export interface UnitHurdle {
  code:     string;         // unit code, e.g. "ECE 301"
  name?:    string;         // full unit name
  attempt?: number;         // 1 = first, 2 = supp, 3 = CF, 4-5 = risk zone
  grounds?: string;         // specials only: "FINANCIAL" | "COMPASSIONATE" | "MEDICAL"
  reason?:  string;         // deferred only: "supp_deferred" | "special_deferred"
  status?:  string;         // CF/deferred: "pending" | "passed" | "failed"
}
 
// Keep backward compat alias so existing code importing HurdleUnit still compiles
export type HurdleUnit = UnitHurdle | string;

export interface BackendErrorResponse {
  message?: string;
}

// Define the shape of the full error object returned by Axios
export interface AxiosExpectedError {
  response?: { data?: BackendErrorResponse; status: number; statusText: string; };
  message: string; // The standard JS/Axios error message
  isAxiosError: boolean;
}

export interface User {
  _id:         string;
  name:        string;
  email:       string;
  role:        Role;
  status:      Status;
  institution: string;
  createdAt:   string;
}
 
export type Lecturer    = User & { role: "lecturer" };
export type Coordinator = User & { role: "coordinator" };
export type Admin       = User & { role: "admin" };

export interface EmailCheckResult {
  nextStep:    "password";
  maskedName?: string;
}
 
export interface PasswordVerifyResult {
  requiresOTP: true;
  maskedEmail: string;
}

export interface UnitStats {
  totalUnits: number; 
}

export interface Invite {
  _id:         string;
  name:        string;
  email:       string;
  role:        "lecturer" | "coordinator";
  used:        boolean;
  expiresAt:   string;
  createdAt:   string;
  institution: string;
}

export interface UnitAssignment {
  _id: string;
  lecturer: string | Lecturer;
  programUnit: string | ProgramUnit;
  assignedBy: string; // adminId
  createdAt: string;
}

export interface Program {
  _id: string;
  name: string;
  code: string;
  description?: string;
  durationYears?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgramUnit {
  _id: string;
  programId: string;
  requiredYear: number;
  requiredSemester: 1 | 2;
  isElective: boolean;  
  unit: { _id: string; code: string; name: string; };
  program: { _id: string; name: string; };
  createdAt?: string;
  updatedAt?: string;
}

export interface Unit {
  _id: string;
  code: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CurriculumFormState {
  programId: string;
  unitId: string;
  requiredYear: string;
  requiredSemester: string;
  isElective?: boolean;
}

export interface StudentFromAPI {
  _id?: string;
  regNo: string;
  name: string;
  program: { _id: string; name: string; code: string; } | string;       
  programId: string;
  currentYearOfStudy: number; // Corrected field name
  currentSemester: number;    // Added field
  admissionAcademicYear: string;
  status: "active" | "inactive" | "graduated" | "suspended" | "deferred";
}

export interface AcademicYear {
  _id: string;
  year: string;    
  intakes: string[];
  startDate?: string;      // ISO string "2024-08-01"
  endDate?: string;        // ISO string "2025-07-31"
  isActive: boolean;
  isCurrent?: boolean;
  session: "ORDINARY" | "SUPPLEMENTARY" | "CLOSED"; // Added for ENG 13/18
  isRegistrationOpen: boolean; // Added for Unit Registration period
  createdAt?: string;
  updatedAt?: string;
}

export interface GradingScale {
  min: number;
  grade: string;
  points?: number;
}

export interface Institution {
  _id: string;
  name: string;
  code: string;
}

export interface InstitutionSettings {
  _id?: string;
  institution?: string;

  // MAX MARKS — Real-world values
  cat1Max: number;
  cat2Max: number;
  cat3Max: number;        // 0 = not used
  assignmentMax: number;  // 0 = not used
  practicalMax: number;   // 0 = not used

  examMax: 70; // Always fixed

  passMark: number;
  supplementaryThreshold: number;
  retakeThreshold: number;

  gradingScale?: GradingScale[];

  createdAt?: string;
  updatedAt?: string;
}

// For saving/updating
export interface InstitutionSettingsInput {
  cat1Max?: number;
  cat2Max?: number;
  cat3Max?: number;
  assignmentMax?: number;
  practicalMax?: number;
  passMark?: number;
  supplementaryThreshold?: number;
  retakeThreshold?: number;
  gradingScale?: GradingScale[];
}

export type IntakeType = "JAN" | "MAY" | "SEPT";
export interface StudentFormRow {
  regNo: string;
  name: string;
  program: string; // The ID from selectedProgramId or the Name from Paste
  currentYearOfStudy: number;
  academicYearId?: string;
  intake: IntakeType;
  admissionAcademicYearString?: string;
}

export interface BulkRegisterResponse {
  message: string;
  alreadyRegistered?: string[];
  duplicates?: string[];
  registered?: string[];
}

export interface StudentStats {
  active: number;
  inactive: number;
  total: number;
}

export interface StudentSearchResult {
  _id: string;
  regNo: string;
  name: string;
  program?: {
    name: string;
  };
}

export interface AcademicSummary {
  totalExpected: number;
  passed: number;
  failed: number;
  missing: number;
}

export interface FailedUnit {
  displayName: string;
  attempt: number;
  programUnitId: string; // Add this
}

export interface SpecialUnit {
  displayName: string;
  attempt: number;
  programUnitId: string; // Add this
}

export interface AcademicStatus {
  status: string;
  variant: "success" | "warning" | "error" | "info";
  details: string;
  weightedMean: string; 
  sessionState?: "ORDINARY" | "SUPPLEMENTARY" | "CLOSED";
  summary: AcademicSummary;
  missingList: string[];
  failedList: { displayName: string; attempt: number; programUnitId: string; }[];  
  specialList: { displayName: string; grounds: string; programUnitId: string; }[];
  deferredList:  { displayName: string; programUnitId: string; reason: string }[];
  incompleteList: string[];
  academicYearName: string;
}

export interface GradeRecord {
  _id: string;
  unit: { code: string; name: string };
  semester: string | number;
  status: string;
  totalMark: number;
  agreedMark: number;
  grade: string;
  academicYear: { year: string };
  deletedAt?: Date;
}

export interface StudentFullRecord {
  student: {
    _id: string;
    name: string;
    regNo: string;
    programName: string;
    programId?: string;
    currentYear: number;
    currentSemester: number;
    status: string;
  };
  grades: GradeRecord[];
  currentStatus: string;
  academicStatus: AcademicStatus; 
  summary: {    
    totalUnits: number;
    passed: number;
    supplementary: number;
    retake: number;
  };
}

export interface RawMark {
  _id: string;
  student: {
    _id: string;
    // name: string;
    // regNumber: string;
  };
  academicYear: {
    _id: string;
    year: string;
  };
  examMode?: "standard" | "mandatory_q1";
  // Matches the backend population logic: mark.programUnit.unit
  programUnit: {
    _id: string;
    unit: {
      _id: string;
      code: string;
      name: string;
    };
  };
  // Coursework Raw Scores
  cat1Raw: number;
  cat2Raw: number;
  cat3Raw?: number;
  assgnt1Raw: number;
  assgnt2Raw?: number;
  assgnt3Raw?: number;
  practicalRaw?: number;

  // Exam Question Raw Scores
  examQ1Raw: number; // Max 10
  examQ2Raw: number; // Max 20
  examQ3Raw: number; // Max 20
  examQ4Raw: number; // Max 20
  examQ5Raw?: number; // Max 20

  // Computed Totals (Audit)
  caTotal30: number;
  examTotal70: number;
  agreedMark: number;
  
  // Metadata
  attempt: "1st" | "re-take" | "supplementary" | "special";
  isSupplementary: boolean;
  isRetake: boolean;
  isSpecial: boolean;
  isMissingCA: boolean;
  remarks?: string;
}

export interface SaveMarksPayload {
  regNo: string;
  unitCode: string;
  academicYear: string;
  examMode?: "standard" | "mandatory_q1";
  // Coursework
  cat1?: number;
  cat2?: number;
  cat3?: number;
  assignment1?: number;
  assignment2?: number;
  practicalRaw?: number;
  // Exam Questions
  examQ1?: number;
  examQ2?: number;
  examQ3?: number;
  examQ4?: number;
  examQ5?: number;
  caDirect?: number; 
  examDirect?: number;
  caTotal30?: number;    // Added for backend compatibility
  examTotal70?: number;  // Added for backend compatibility
  agreedMark?: number;
  isSpecial: boolean;
  attempt: "1st" | "re-take" | "supplementary" | "special";
}

export interface TrashedMark {
  _id: string;
  source: "detailed" | "direct";
  deletedAt: string;
  student: {
    _id: string;
    regNo: string;
    name: string;
  };
  programUnit: {
    unit: {
      code: string;
      name: string;
    };
  };
  academicYear: {
    year: string;
  };
}

export interface JourneyChallenges {
  supplementary: HurdleUnit[]; // ENG.13 — fail ≤ ⅓ units → supp eligible
  retakes: HurdleUnit[]; // ENG.15a/b — retake units
  stayouts: HurdleUnit[]; // ENG.15h — fail >⅓ <½ → sit next ordinary
  specials: HurdleUnit[]; // ENG.18 — special exams (grounds included)
  carryForwards: HurdleUnit[]; // ENG.14 — units carried to next year
  deferred: HurdleUnit[]; // ENG.13b/18c — deferred to next ordinary
  incomplete: HurdleUnit[]; // Missing CA or exam
  discontinuationRisk: HurdleUnit[]; // ENG.22 — attempt ≥ 4 on any unit
}

// ── Leave info (attached to STATUS_CHANGE nodes for leave/deferral events) ──
export interface JourneyLeaveInfo {
  type: "ACADEMIC LEAVE" | "DEFERMENT";
  reason: string; // "FINANCIAL" | "COMPASSIONATE" | "OTHER"
  duration: string; // e.g. "14 months"
  endDate?: string; // ISO date string if known
}

// ── Single timeline node ───────────────────────────────────────────────────
export interface StudentJourneyTimeline {
  // ── Present on ALL node types ────────────────────────────────────────────
  type:
    | "ACADEMIC"
    | "STATUS_CHANGE"
    | "CARRY_FORWARD" // ENG.14 — explicit CF grant event
    | "DEFERRED_SUPP" // ENG.13b / ENG.18c — deferred to next ordinary
    | "DISCIPLINARY" // DisciplinaryCase document surfaced
    | "GRADUATION"; // Final year completed → degree awarded
  academicYear: string; // e.g. "2019/2020"
  date?: string; // ISO timestamp for sorting
  isCurrent?: boolean; // true on the current active ACADEMIC node

  // ── ACADEMIC nodes ───────────────────────────────────────────────────────
  yearOfStudy?: number; // 1–5
  status?: string; // "PASS (PROMOTED)" | "REPEAT YEAR" | "STAYOUT" | "SUPP 2" | etc.
  weight?: number; // degree contribution in % (e.g. 15, 20, 25)
  totalUnits?: number; // prescribed units this year
  annualMean?: number; // year weighted mean — drives sparkline bars
  qualifierSuffix?: string; // reg number qualifier at time of this year: RP1, RP1C, RP1D etc.
  isRepeat?: boolean; // true if this is a repeat year entry (ENG.16)
  eng15bBlock?: boolean; // true if student was blocked from final year entry
  challenges?: JourneyChallenges;

  // ── STATUS_CHANGE nodes ──────────────────────────────────────────────────
  fromStatus?: string; // status before the event
  toStatus?: string; // status after the event
  reason?: string; // human-readable reason text
  leaveInfo?: JourneyLeaveInfo; // populated for leave/deferral events

  // ── CARRY_FORWARD nodes (ENG.14) ─────────────────────────────────────────
  cfUnits?: string[]; // unit codes granted CF
  qualifier?: string; // RP1C, RP2C, RP3C

  // ── DEFERRED_SUPP nodes (ENG.13b / ENG.18c) ─────────────────────────────
  unitCode?: string; // the specific unit deferred
  unitName?: string;

  // ── DISCIPLINARY nodes ────────────────────────────────────────────────────
  grounds?: string; // "exam_irregularity" | "misconduct" etc.
  outcome?: string; // "PENDING" | "SENT_HOME" | "WARNING" | "REINSTATED" etc.
  caseId?: string; // DisciplinaryCase._id (last 8 chars shown in UI)
  hearingDate?: string; // ISO date string

  // ── GRADUATION nodes ──────────────────────────────────────────────────────
  // annualMean is re-used here to carry the final WAA
  // status carries "GRADUATED"
  // reason carries the classification string
}

// ── Top-level journey response ─────────────────────────────────────────────
export interface StudentJourneyResponse {
  admissionYear: string; // e.g. "2016/2017"
  intake: string; // "JAN" | "MAY" | "SEPT"
  currentStatus: string; // student.status uppercased
  cumulativeMean: string; // projected WAA as "65.42"
  totalTimeOutYears?: number; // years spent on leave/deferred
  classification?: string; // projected classification label
  timeline: StudentJourneyTimeline[];
}

  export interface AwardListEntry {
    studentId: string;
    regNo: string;
    name: string;
    waa: number;
    classification: string;
    graduationYear: number;
  }

  export interface AwardListParams {
    programId: string;
    academicYear?: string;
  }

  export interface AwardDocParams extends AwardListParams {
    variant: "simple" | "classified";
  }

  export interface DisciplinaryCase {
    _id: string;
    student: { _id: string; name: string; regNo: string; currentYearOfStudy: number; status: Status; };
    raisedBy: { name: string; email: string };
    resolvedBy?: { name: string; email: string };
    grounds: string;
    description: string;
    outcome: DisciplinaryOutcome;
    hearingDate?: string;
    suspensionStart?: string;
    suspensionEnd?: string;
    outcomeNotes?: string;
    appealed?: boolean;
    appealOutcome?: "UPHELD" | "DISMISSED";
    appealNotes?: string;
    createdAt: string;
    academicYear?: string;
  }
  
  export interface RaiseCasePayload {
    studentId: string;
    grounds: string;
    description: string;
    hearingDate?: string;
  }
  
  export interface OutcomePayload {
    outcome: DisciplinaryOutcome;
    outcomeNotes?: string;
    hearingDate?: string;
    suspensionStart?: string;
    suspensionEnd?: string;
  }
